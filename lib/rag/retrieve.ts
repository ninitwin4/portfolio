// Retrieval: score every chunk against the question vector and keep the best k.
//
// This is the function decision 002 promised to isolate. It holds no I/O and no
// knowledge of where chunks come from - the caller loads corpus.json and passes
// them in - so replacing brute-force cosine with pgvector later means rewriting
// this file and nothing else.
//
// Brute force is not a placeholder. At 14 chunks, or 1,400, a linear scan over
// an array beats the network hop to a hosted vector store.

export type Chunk = {
  id: string
  title: string
  source: string
  section: string
  headings: string[]
  url: string
  kind: string
  text: string
  wordCount: number
  hash: string
  embedding: number[]
}

export type CorpusIndex = {
  model: string
  dimensions: number
  generatedAt: string
  chunks: Chunk[]
}

export type RetrievedChunk = {
  chunk: Chunk
  score: number
}

// k=8 rather than 5. 008 set the floor at 5 by reasoning about how many
// documents a multi-source answer needs; measuring showed 5 was not enough
// once two generalist documents started taking slots. See 012.
export const DEFAULT_K = 8

// At most this many chunks from any one document may hold the window.
//
// `about.md` and `chat-assistant.md` are hub documents - a biography and a
// description of this feature sit semantically near almost every question, so
// they placed in the top 5 for 83% and 77% of the golden set and crowded out
// the document that actually held the answer. "Has Ni Ni shipped anything with
// a real database?" filled five slots with two documents and never reached
// RoomFit.
//
// This is a cheap stand-in for MMR (maximal marginal relevance), which scores
// a candidate on relevance minus similarity to what is already picked. Capping
// per document gets most of that benefit for a fraction of the code, because
// here the redundancy that matters runs along document lines.
//
// Pass Infinity to turn it off.
export const DEFAULT_MAX_PER_SOURCE = 2

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Cannot compare vectors of different lengths (${a.length} vs ${b.length}). ` +
        'This usually means corpus.json was built with a different embedding model.',
    )
  }

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB)

  // OpenAI returns unit vectors, so this divisor is ~1 and the dot product
  // alone would do. It is computed properly anyway: the committed vectors are
  // rounded, which perturbs the norm slightly, and a future model may not
  // normalise at all.
  return magnitude === 0 ? 0 : dot / magnitude
}

export function rank(
  queryEmbedding: number[],
  chunks: Chunk[],
  k: number = DEFAULT_K,
  maxPerSource: number = DEFAULT_MAX_PER_SOURCE,
): RetrievedChunk[] {
  const scored = chunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)

  // Order-preserving, so capping and then slicing to k gives the same window as
  // capping while slicing - which is what lets the eval harness rank once and
  // score several k from one pass.
  const used = new Map<string, number>()
  const kept: RetrievedChunk[] = []

  for (const hit of scored) {
    const taken = used.get(hit.chunk.source) ?? 0
    if (taken >= maxPerSource) continue

    used.set(hit.chunk.source, taken + 1)
    kept.push(hit)
    if (kept.length === k) break
  }

  return kept
}
