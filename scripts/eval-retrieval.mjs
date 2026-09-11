// Measure retrieval recall against evals/golden-questions.md.
//
// Run: npm run eval  (add -- --k 3 to score a single k, -- --show to print the
// retrieved sources for every question.)
//
// This is the number decision 006 exists for. Without it, tuning chunk size or
// k is guesswork - and nearly every RAG failure is a retrieval failure wearing
// a generation costume, invisible unless something counts it.

import { readFile } from 'node:fs/promises'

import { loadEnvLocal } from './lib/env.mjs'
import { embedTexts } from '../lib/rag/embed.ts'
import { rank } from '../lib/rag/retrieve.ts'

const GOLDEN = 'evals/golden-questions.md'
const CORPUS = 'lib/rag/corpus.json'

// Scored at several k from one ranking, so the cost of a bigger k is visible
// next to what it buys. See DECISIONS.md 008 for why k=3 is the interesting
// lower bound.
const K_VALUES = [3, 5, 8]

// Which heading a question sits under decides how it is scored, so the parser
// keys off the section rather than guessing from the row.
const SECTIONS = {
  'Single-source questions': 'single',
  'Multi-source questions': 'multi',
  'Out of scope': 'none',
}

function parseGolden(markdown) {
  const questions = []
  let kind = null

  for (const line of markdown.split('\n')) {
    const heading = line.match(/^##\s+(.*)$/)
    if (heading) {
      kind = SECTIONS[heading[1].trim()] ?? null
      continue
    }

    if (!kind || !line.trim().startsWith('|')) continue

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())

    if (cells.length < 2) continue
    if (cells[0] === 'Question' || /^-+$/.test(cells[0])) continue

    const expected =
      cells[1] === '(none)'
        ? []
        : cells[1]
            .split(',')
            .map((source) => source.trim())
            .filter(Boolean)

    questions.push({ question: cells[0], expected, kind })
  }

  return questions
}

// A single-source question is a hit if its source appears at all. A multi-source
// question is a hit only if EVERY expected source appears - scoring it any other
// way would hide the failure that matters, an answer that sounds confident while
// covering a third of the work (DECISIONS.md 008).
function isHit(expected, retrievedSources) {
  return expected.every((source) => retrievedSources.includes(source))
}

function bar(value, width = 24) {
  const filled = Math.round(value * width)
  return '#'.repeat(filled) + '.'.repeat(width - filled)
}

async function main() {
  loadEnvLocal()

  const args = process.argv.slice(2)
  const show = args.includes('--show')
  const kFlag = args.indexOf('--k')
  const kValues =
    kFlag === -1 ? K_VALUES : [Number(args[kFlag + 1])].filter(Boolean)

  const index = JSON.parse(await readFile(CORPUS, 'utf8'))
  const golden = parseGolden(await readFile(GOLDEN, 'utf8'))

  const scored = golden.filter((row) => row.kind !== 'none')
  const outOfScope = golden.filter((row) => row.kind === 'none')

  console.log(
    `${index.chunks.length} chunks · ${scored.length} scored questions · ` +
      `${outOfScope.length} out-of-scope\n`,
  )

  const { embeddings } = await embedTexts(golden.map((row) => row.question))
  const maxK = Math.max(...kValues)

  const results = golden.map((row, i) => ({
    ...row,
    retrieved: rank(embeddings[i], index.chunks, maxK),
  }))

  for (const k of kValues) {
    const rows = results.filter((row) => row.kind !== 'none')
    const misses = []

    for (const row of rows) {
      const sources = row.retrieved.slice(0, k).map((hit) => hit.chunk.source)
      if (!isHit(row.expected, sources)) {
        misses.push({ ...row, got: sources })
      }
    }

    const recall = (rows.length - misses.length) / rows.length
    const single = rows.filter((row) => row.kind === 'single')
    const multi = rows.filter((row) => row.kind === 'multi')
    const singleMisses = misses.filter((row) => row.kind === 'single').length
    const multiMisses = misses.filter((row) => row.kind === 'multi').length

    console.log(
      `recall@${k}  ${bar(recall)}  ${(recall * 100).toFixed(0)}%  ` +
        `(${rows.length - misses.length}/${rows.length})   ` +
        `single ${single.length - singleMisses}/${single.length} · ` +
        `multi ${multi.length - multiMisses}/${multi.length}`,
    )

    for (const miss of misses) {
      const missing = miss.expected.filter(
        (source) => !miss.got.includes(source),
      )
      console.log(`    MISS  ${miss.question}`)
      console.log(`          wanted ${missing.join(', ')}`)
      console.log(`          got    ${[...new Set(miss.got)].join(', ')}`)
    }
  }

  // Out-of-scope questions cannot be scored on recall - there is no right chunk
  // to retrieve. What matters is the top score: the Phase 4 guardrail declines
  // below some threshold, and that threshold only works if it sits above these
  // and below the real questions.
  const topScore = (rows) => rows.map((row) => row.retrieved[0].score)
  const median = (values) =>
    [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

  const inScopeTop = topScore(results.filter((row) => row.kind !== 'none'))
  const outTop = topScore(results.filter((row) => row.kind === 'none'))

  console.log('\ntop-1 similarity, for the phase 4 scope threshold')
  console.log(
    `  in scope      min ${Math.min(...inScopeTop).toFixed(3)} · ` +
      `median ${median(inScopeTop).toFixed(3)}`,
  )
  console.log(
    `  out of scope  max ${Math.max(...outTop).toFixed(3)} · ` +
      `median ${median(outTop).toFixed(3)}`,
  )

  const gap = Math.min(...inScopeTop) - Math.max(...outTop)
  console.log(
    gap > 0
      ? `  separable: a threshold between ${Math.max(...outTop).toFixed(3)} and ${Math.min(...inScopeTop).toFixed(3)} splits them cleanly`
      : `  NOT separable on score alone - the guardrail will need the model to judge scope, not just a cutoff`,
  )

  if (show) {
    console.log('\nretrieved sources per question')
    for (const row of results) {
      const sources = row.retrieved
        .slice(0, Math.max(...kValues))
        .map((hit) => `${hit.chunk.source}(${hit.score.toFixed(2)})`)
      console.log(`\n  ${row.question}`)
      console.log(`    expected  ${row.expected.join(', ') || '(none)'}`)
      console.log(`    got       ${sources.join(' ')}`)
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
