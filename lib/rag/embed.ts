// The embedding call, used in two places: at build time to index the corpus,
// and at request time to embed the visitor's question. Both must use the same
// model - a vector is only comparable to vectors produced by the model that
// made it, so changing EMBEDDING_MODEL invalidates the whole committed index.
//
// Deliberately plain fetch rather than the openai package. This is one endpoint
// with one shape, it ships into a serverless function where bundle size is real,
// and the corpus chunker next door already hand-rolls its frontmatter parser for
// the same reason.

export const EMBEDDING_MODEL = 'text-embedding-3-small'

// text-embedding-3-small returns 1536 dimensions. Recorded so the indexer can
// fail loudly if the API ever returns something else, rather than writing a
// corpus that silently cannot be compared against a query.
export const EMBEDDING_DIMENSIONS = 1536

const ENDPOINT = 'https://api.openai.com/v1/embeddings'

type EmbeddingResponse = {
  data: { index: number; embedding: number[] }[]
  usage?: { prompt_tokens: number; total_tokens: number }
}

export type EmbedResult = {
  embeddings: number[][]
  tokens: number
}

export async function embedTexts(texts: string[]): Promise<EmbedResult> {
  if (!texts.length) return { embeddings: [], tokens: 0 }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'Missing OPENAI_API_KEY. Add it to .env.local to run locally, and to ' +
        'the Vercel project for production - the visitor question is embedded ' +
        'per request, so this is a runtime dependency, not a build-time one.',
    )
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(
      `OpenAI embeddings failed (${response.status}): ${detail.slice(0, 400)}`,
    )
  }

  const payload = (await response.json()) as EmbeddingResponse

  // The API does not promise the results come back in input order, and a
  // mis-ordered index would attach every vector to the wrong chunk - silent,
  // and indistinguishable from bad retrieval. Sort on the index it returns.
  const embeddings = payload.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((row) => row.embedding)

  for (const embedding of embeddings) {
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Expected ${EMBEDDING_DIMENSIONS} dimensions from ${EMBEDDING_MODEL}, ` +
          `got ${embedding.length}.`,
      )
    }
  }

  return { embeddings, tokens: payload.usage?.total_tokens ?? 0 }
}

export async function embedQuery(text: string): Promise<number[]> {
  const { embeddings } = await embedTexts([text])
  return embeddings[0]
}
