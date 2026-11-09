// Build-time chunking for the RAG corpus.
//
// Splits content/*.md into retrieval chunks on H2 headings, then normalises
// their size: neighbours under MIN_WORDS merge together, anything over
// MAX_WORDS splits on paragraph boundaries. Headings are the unit because a
// citation should name something a reader recognises ("Key Decisions -
// Matching Engine"), which a fixed-size window cannot do.
//
// Nothing here touches the network. It runs at build time only, so it stays in
// scripts/ rather than lib/ - only retrieval needs to ship to the server.

import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

// A section shorter than this is not a standalone answer, so it gets absorbed
// into a neighbour. Measured against the real corpus: sections written in
// Ni Ni's voice run 34-170 words, so without merging most chunks would be
// fragments.
export const MIN_WORDS = 150

// Beyond this a chunk covers too many ideas for one embedding to represent -
// the vector averages them out and retrieval gets vague.
export const MAX_WORDS = 400

export function countWords(text) {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Minimal `key: value` frontmatter reader. The corpus is ours and the schema is
// flat, so this stays dependency-free rather than pulling in gray-matter.
export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) {
    return { meta: {}, body: text }
  }

  const meta = {}
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':')
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
    if (key) meta[key] = value
  }

  return { meta, body: text.slice(match[0].length) }
}

// Authoring notes are for Ni Ni, not for the model. Stripping them means a TODO
// can never be retrieved and quoted back at a visitor.
function stripComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, '')
}

// Split on H2 only. H3 and deeper stay inside their parent section so a chunk
// keeps its sub-structure.
function splitOnHeadings(body) {
  const sections = []
  let current = { heading: null, lines: [] }

  for (const line of body.split('\n')) {
    const heading = line.match(/^##\s+(.*)$/)
    if (heading) {
      sections.push(current)
      current = { heading: heading[1].trim(), lines: [] }
    } else {
      current.lines.push(line)
    }
  }
  sections.push(current)

  return (
    sections
      .map((section) => ({
        headings: section.heading ? [section.heading] : [],
        text: section.lines.join('\n').trim(),
      }))
      // An empty section is a heading the corpus has not filled in yet - every
      // `## How She Works` whose body is still only a TODO comment. It has no
      // text to retrieve, so it is dropped here rather than treated as "too
      // short" and merged forward, which used to drag placeholder headings into
      // the label of the chunk that absorbed them.
      .filter((section) => countWords(section.text) > 0)
  )
}

function joinSections(a, b) {
  return {
    headings: [...a.headings, ...b.headings],
    text: [a.text, b.text].filter(Boolean).join('\n\n'),
  }
}

// Walk forwards absorbing anything too short into the section after it, so a
// stub heading rides along with the section it introduces. A trailing short
// section has no successor, so it folds backwards instead - but only when it
// fits.
function mergeSmall(sections) {
  const merged = []
  let pending = null

  for (const section of sections) {
    const next = pending ? joinSections(pending, section) : section
    if (countWords(next.text) < MIN_WORDS) {
      pending = next
    } else {
      merged.push(next)
      pending = null
    }
  }

  if (pending) {
    const last = merged.length ? merged[merged.length - 1] : null
    const folded = last ? joinSections(last, pending) : null

    if (folded && countWords(folded.text) <= MAX_WORDS) {
      merged[merged.length - 1] = folded
    } else {
      // Folding backwards would push the previous chunk past MAX_WORDS, and
      // splitLarge would only break it up again on a paragraph boundary that no
      // longer lines up with a heading. A short trailing chunk that still names
      // its own section is the better trade.
      merged.push(pending)
    }
  }

  return merged
}

// Break an oversized section into roughly equal parts, never mid-paragraph.
function splitLarge(section) {
  const words = countWords(section.text)
  if (words <= MAX_WORDS) return [section]

  const paragraphs = section.text.split(/\n{2,}/).filter((p) => p.trim())
  if (paragraphs.length < 2) return [section]

  const parts = Math.ceil(words / MAX_WORDS)
  const budget = Math.ceil(words / parts)

  const groups = [[]]
  let used = 0
  for (const paragraph of paragraphs) {
    const size = countWords(paragraph)
    if (used + size > budget && groups[groups.length - 1].length) {
      groups.push([])
      used = 0
    }
    groups[groups.length - 1].push(paragraph)
    used += size
  }

  return groups.map((group) => ({
    headings: section.headings,
    text: group.join('\n\n'),
  }))
}

export function chunkDocument(text, { file }) {
  const { meta, body } = parseFrontmatter(text)
  const title = meta.title || file.replace(/\.md$/, '')
  const source = meta.source || file.replace(/\.md$/, '')

  const sections = mergeSmall(splitOnHeadings(stripComments(body))).flatMap(
    splitLarge,
  )

  // Ids key the embeddings file, so two chunks sharing one is not cosmetic - the
  // second silently overwrites the first and drops out of the index. Sharing is
  // easy to hit: splitLarge gives every part of an oversized section the same
  // headings. Numbering repeats within a document keeps ids unique and stable.
  const seen = new Map()

  return sections
    .filter((section) => countWords(section.text) > 0)
    .map((section, index) => {
      // The first heading is the citation label. Merged neighbours are
      // continuations of the section that absorbed them, and a label listing
      // every heading in a document ("Background / What She Works On Now / How
      // She Works / ...") names nothing a visitor can go and verify.
      const heading = section.headings[0] || 'Overview'
      const path = section.headings.join(' / ') || 'Overview'
      const slug = slugify(heading) || String(index)

      const repeat = (seen.get(slug) ?? 0) + 1
      seen.set(slug, repeat)

      return {
        id: repeat === 1 ? `${source}#${slug}` : `${source}#${slug}-${repeat}`,
        // Metadata the answer cites back to the visitor.
        title,
        source,
        section: heading,
        // Every heading the chunk covers, for tuning and for embedText. Kept
        // separate from `section` so the citation stays short while the vector
        // still sees the whole path.
        headings: section.headings,
        url: meta.url || '',
        kind: meta.kind || '',
        // What a human reads.
        text: section.text,
        // What actually gets embedded. Prefixing the document title and section
        // is standard practice - it gives the vector context the body alone
        // lacks, so "what did she cut costs on?" can still reach a chunk that
        // never repeats the project's name. This uses the full heading path
        // rather than the citation label: more context helps the vector, where
        // it only clutters the citation.
        embedText: `${title} - ${path}\n\n${section.text}`,
        wordCount: countWords(section.text),
      }
    })
}

export async function loadCorpus(dir = 'content') {
  const entries = await readdir(dir)
  const files = entries.filter((file) => file.endsWith('.md')).sort()

  const chunks = []
  for (const file of files) {
    const text = await readFile(join(dir, file), 'utf8')
    chunks.push(...chunkDocument(text, { file }))
  }

  return chunks
}
