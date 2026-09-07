# Decisions

A running log of the choices behind the retrieval-grounded chat feature.
One entry per decision: what we chose, what we did not, and why.

---

## 001 - Retrieval-augmented generation over context stuffing

**Decision.** Answer questions by retrieving a few relevant chunks and passing
only those to the model, rather than putting the entire corpus in every prompt.

**Alternatives.** Context stuffing - send all documents with every question.
At today's corpus size (~1,200 words, ~1,600 tokens) this would work fine and
cost less to build.

**Why.** Retrieval is not load-bearing at 1,200 words and we know it. We are
choosing it anyway because the corpus is meant to grow well past the point
where stuffing stops being viable, and because the code is identical at both
scales. Accepted cost: until the corpus roughly triples, this pipeline is
buying learning and headroom rather than answer quality.

**Revisit when.** The corpus passes ~8,000 words - at which point retrieval
starts genuinely improving answers, not just enabling them.

---

## 002 - A committed JSON file, not a vector database

**Decision.** Embeddings live in a JSON file generated at build time and
committed to the repo. Similarity is computed in memory with brute-force
cosine.

**Alternatives.** pgvector, Pinecone, or another vector store.

**Why.** Vector databases earn their keep at roughly 100k+ chunks, where you
need approximate nearest-neighbour indexing to avoid scanning everything. At
six chunks - or six hundred - a linear scan over an array is faster than the
network hop to a hosted store, and it adds no service to run, pay for, or keep
in sync. Retrieval is isolated behind one function so swapping in pgvector
later changes that file and nothing else.

**Revisit when.** Chunk count reaches the low thousands, or the corpus needs to
update without a redeploy.

---

## 003 - Hand-written corpus, deeper than the site

**Decision.** The corpus is hand-written markdown in `content/`, written to go
past what `app/data.ts` already says.

**Alternatives.** (a) Derive chunks from `app/data.ts` programmatically - one
source of truth, zero drift, but the bot could only ever repeat the site.
(b) Hybrid - derive project chunks, hand-write the rest.

**Why.** The site and the bot do different jobs. Site copy is skimmable and
finished; the bot needs the reasoning underneath it - the numbers, the
tradeoffs rejected, what broke. Deriving from `data.ts` would cap the bot at
993 words of marketing-toned prose, which is not worth a retrieval pipeline.

**Accepted cost.** Two sources of truth. `content/` and `app/data.ts` will
drift, and nothing enforces consistency between them.

---

## 004 - Section-level chunks with a merge rule

**Decision.** One chunk per H2 heading. Sections under 150 words merge into a
neighbour; anything over 400 words splits on paragraph boundaries. The text
sent to the embedding model is prefixed with the document title and section
name, which is not the text shown to the reader.

**Alternatives.** Fixed-size sliding windows (~300 words, ~50 overlap) -
uniform chunks, no heuristics, the standard baseline.

**Why.** Headings are real semantic boundaries written by a human who knew
where one idea ended. That makes citations meaningful: "Key Decisions -
Matching Engine" is something a visitor can verify, where "chunk 7" is not.
Since every answer shows its sources, citation quality is a feature
requirement, not a nicety. Title-prefixing the embedded text is standard
practice - it gives the vector document context the body alone lacks, so a
question can reach a chunk that never repeats the project's name.

**Accepted cost.** Uneven chunk sizes, and two thresholds that will need
tuning as the corpus grows.

**Amended by 009** - citation labels, once merging made "one chunk, one
heading" untrue.

---

## 005 - Sanitized career history, because the repo is public

**Decision.** `content/resume.md` carries roles, dates, scope, and
achievements. No phone number, home address, or personal email.

**Alternatives.** Full resume detail; or no resume in the corpus at all.

**Why.** Chunk text ships inside the committed embeddings file, so anything in
`content/` is public on GitHub *and* extractable by asking the bot. Publishing
contact details there would quietly defeat the email gate on `/resume`.
Omitting career history entirely was the other option, but "has she managed
people?" is likely the most common question a recruiter asks, and the bot
should be able to answer it.

---

## 006 - A golden question set, written before retrieval exists

**Decision.** `evals/golden-questions.md` pairs realistic questions with the
source that should answer each one, including out-of-scope questions the bot
must decline.

**Alternatives.** Test by trying queries and eyeballing the output.

**Why.** It turns "does this work?" into a number - retrieval recall, the share
of questions where the right source reached the top-k. Without it, Phase 3
tuning is vibes, and there is no way to tell whether a change to chunk size or
k made things better. Writing the negative cases now also means the scope
guardrail in Phase 4 has a test to pass rather than being declared done.

**Cost.** Ten minutes, and it needs real questions to be worth anything -
invented ones measure the wrong thing.

---

## 007 - Corpus drafted from repo READMEs, then edited by hand

**Decision.** Project documents in `content/` are drafted from the READMEs of
the corresponding GitHub repositories, then edited for voice and depth. Each
drafted file carries a comment naming its source repo.

**Alternatives.** Write every document from a blank page; or point the corpus
at the READMEs directly and re-fetch them at build time.

**Why.** The READMEs are already Ni Ni's own writing and already contain the
specifics the corpus needs - the numbers, the architecture, the tradeoffs. A
blank page discards that. Fetching them live was rejected because a README is
written for a developer evaluating a repo, not a visitor asking about a career:
different audience, different emphasis, and it would put the corpus outside
version control with the site.

**Accepted cost.** A third source of truth, after `app/data.ts` and the
READMEs. Repo changes will not propagate; the corpus needs a manual pass when a
project changes materially.

**Note.** This surfaced two shipped projects - Kiki and RoomFit - that were in
the repos but on neither the site nor the corpus.

---

## 008 - Multi-source questions in the eval set, and the floor they put on k

**Decision.** The golden set separates single-source from multi-source
questions. A multi-source question passes only when *every* expected source is
retrieved.

**Alternatives.** Score every question the same way, counting a hit if any
expected source appears.

**Why.** "What AI skills does Ni Ni have?" cannot be answered from one chunk -
it needs the matching engine, Kiki, and this chat feature at once. Scoring it
as a hit when only one arrives would hide the exact failure that matters: the
bot sounding confident while describing a third of the work. Recruiters ask
skills questions first, so this is the highest-stakes case in the file.

**Consequence.** This sets a practical floor on **k** - the number of chunks
retrieval returns and hands to the model, the "k" in top-k retrieval. Only
those k reach the model; every other chunk may as well not exist for that
question. An answer needing three documents cannot be assembled from a top-3
retrieval unless all three place first, competing against the rest of the
corpus. It is the main argument for k=5 over k=3, and the reason a re-ranking
step is the most likely future refinement.
---

## 009 - Citation labels name the first heading, and chunk ids are unique

**Decision.** A chunk spanning several merged headings is cited by its first
heading alone - "Matching Engine - Key Decisions". The full heading path still
goes to the embedding model and is kept on a `headings` field for tuning.
Separately, chunk ids are unique within a document - a repeated slug gets a
`-2`, `-3` suffix - and `npm run chunk` exits non-zero if any id collides.

**Alternatives.** Label the chunk with the whole path - "Background / What She
Works On Now / How She Works / The Voice AI Agent". Or hold 004's assumption
and stop merging across headings at all, so one chunk is always one heading.

**Why.** 004 promised a citation a visitor can verify, and wrote its rule
assuming one chunk equals one heading. Merging broke that quietly: `about.md`
produced labels naming four sections, which names nothing. The first heading is
where the chunk starts and what the merged neighbours continue, so it is the
honest short name. The embedding still sees the full path, because more context
helps a vector where it only clutters a citation - two different jobs, and no
reason to force one string to do both.

Ids became load-bearing the moment Phase 2 keys embeddings by them. A collision
there is invisible at query time - the second chunk overwrites the first and
simply never gets retrieved - so it fails at build time instead. `splitLarge`
gives every part of an oversized section the same headings, so collisions are
guaranteed by construction rather than incidental.

**Accepted cost.** The label under-describes a merged chunk:
`roomfit#every-match-comes-with-a-receipt` also covers Architecture and Stack
and does not say so. And chunking is now described across two entries, so 004
carries a pointer here.

**Note.** Two bugs were fixed alongside this, both violations of 004's own rule
rather than decisions: sections whose body was only a TODO comment were treated
as "too short" and merged forward, dragging placeholder headings into the label
of whatever absorbed them; and a short trailing section folded backwards
unconditionally, pushing `about#background` to 406 words and forcing a split
that no longer aligned to any heading. `about.md` went from three chunks
sharing one id to two chunks named after their own sections.
