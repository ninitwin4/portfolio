// The query path: a question in, ranked chunks out.
//
// This is the seam between the committed index and whatever renders an answer.
// The caller does not know that corpus.json exists, that ranking is brute-force
// cosine, or that embeddings come from OpenAI - it asks for the best k chunks
// for a question and gets them. That is what keeps 002's promise cheap to keep:
// moving to pgvector changes this file and retrieve.ts, and nothing upstream.
//
// The index is imported rather than read with fs. Both work on Vercel, but an
// import is resolved by the bundler at build time, so a missing or malformed
// index fails the build instead of the first visitor's question. It also gives
// the per-instance cache for free - module scope is evaluated once per lambda
// instance, so the 256KB parse is a cold-start cost, not a per-request one.

import corpus from './corpus.json'
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, embedQuery } from './embed'
import {
  DEFAULT_K,
  rank,
  type CorpusIndex,
  type RetrievedChunk,
} from './retrieve'

const index = corpus as CorpusIndex

// Checked once, on the first search rather than at module load. An import-time
// throw takes down the whole route with a stack trace from inside a bundle; a
// throw here is attributable to the call that caused it, and the message says
// what to run to fix it.
let checked = false

function assertUsable(): void {
  if (checked) return

  if (index.model !== EMBEDDING_MODEL) {
    throw new Error(
      `corpus.json was built with ${index.model}, but queries are embedded ` +
        `with ${EMBEDDING_MODEL}. Vectors from two models are not comparable. ` +
        'Run `npm run corpus` to rebuild the index.',
    )
  }

  if (index.dimensions !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `corpus.json declares ${index.dimensions} dimensions, expected ` +
        `${EMBEDDING_DIMENSIONS}. Run \`npm run corpus\` to rebuild the index.`,
    )
  }

  if (!index.chunks.length) {
    throw new Error(
      'corpus.json contains no chunks. Run `npm run corpus` to build the index.',
    )
  }

  checked = true
}

// An empty question is not an error and not worth an API call - the caller gets
// the same empty result it would get from a question that retrieves nothing.
export async function search(
  question: string,
  k: number = DEFAULT_K,
): Promise<RetrievedChunk[]> {
  assertUsable()

  const trimmed = question.trim()
  if (!trimmed) return []

  const embedding = await embedQuery(trimmed)
  return rank(embedding, index.chunks, k)
}

// For a health check or a debug view: what the server is actually holding,
// without shipping 16 embeddings to say it.
export function describeIndex(): {
  model: string
  dimensions: number
  generatedAt: string
  chunks: number
} {
  return {
    model: index.model,
    dimensions: index.dimensions,
    generatedAt: index.generatedAt,
    chunks: index.chunks.length,
  }
}
