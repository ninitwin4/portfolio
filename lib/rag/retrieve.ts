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

// k=5 rather than 3, because a multi-source question needs every one of its
// documents to place - see DECISIONS.md 008. Three documents competing for a
// top-3 leaves no room for a near miss.
export const DEFAULT_K = 5

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
): RetrievedChunk[] {
  return chunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}
