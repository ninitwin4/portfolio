# Golden questions

The evaluation set for the chat feature. Each row is a question a real visitor
might ask, and the corpus file or files that should answer it.

Phase 3 uses this to measure **retrieval recall**: for each question, did the
expected source land in the top-k chunks? That single number is what tells us
whether the system works. Nearly every RAG failure is a retrieval failure
wearing a generation costume - the model looks like it is hallucinating when
really the right chunk never reached it.

`(none)` means the question is out of scope and the bot must decline rather
than answer from the model's general knowledge. These matter as much as the
positive cases; they are what the Phase 4 scope guardrail is tested against.

Lives outside `content/` on purpose - anything in `content/` gets embedded and
becomes quotable by the bot.

## Single-source questions

One document should answer each. Scored as recall@k: did that source appear?

| Question | Expected source |
| --- | --- |
| How did Ni Ni cut LLM costs on the matching engine? | matching-engine |
| Why not just let the model score the match directly? | matching-engine |
| How does the matching engine handle a new industry? | matching-engine |
| What did Ni Ni do about security on the matching engine? | matching-engine |
| Has Ni Ni published anything? | matching-engine |
| Is there a citable version of the matching engine? | matching-engine |
| How many users did Chat Chin reach? | chat-chin |
| What problem was Chat Chin solving? | chat-chin |
| Has Ni Ni founded a company? | chat-chin |
| Has Ni Ni managed people? | resume |
| What is Ni Ni's design experience? | cstu-veteran |
| What is Ni Ni working on now? | about |
| What does Kiki do? | kiki-voice-agent |
| How does Ni Ni handle third-party APIs that might fail? | kiki-voice-agent |
| Has Ni Ni built anything with voice? | kiki-voice-agent |
| How does RoomFit decide which rooms to show? | roomfit |
| Has Ni Ni shipped anything with a real database? | roomfit |
| How does this chat feature work? | chat-assistant |
| Why is there no vector database? | chat-assistant |

## Multi-source questions

These need chunks from several documents at once. Scored differently - the
answer is only right if *every* expected source is retrieved, so a single miss
fails the question. See the note below on why they are the hardest case.

| Question | Expected sources |
| --- | --- |
| What AI skills does Ni Ni have? | matching-engine, kiki-voice-agent, chat-assistant |
| What has Ni Ni built with LLMs? | matching-engine, chat-assistant |
| How does Ni Ni think about explainability? | matching-engine, roomfit |
| Has Ni Ni built agents or agent tooling? | kiki-voice-agent, matching-engine |
| What has Ni Ni shipped end to end, alone? | kiki-voice-agent, roomfit, chat-chin |

## Out of scope

The bot must decline these, not answer them.

| Question | Expected source |
| --- | --- |
| What is Ni Ni's favourite colour? | (none) |
| Write me a Python script to sort a list. | (none) |
| What do you think about OpenAI? | (none) |
| What is Ni Ni's phone number? | (none) |
| Explain how transformers work. | (none) |

<!-- TODO Ni Ni: add the questions you actually expect to be asked - the ones
     from real interviews and recruiter calls. Ten real ones beat thirty
     invented ones, and you know the real ones better than I do.

     Also worth adding: a question you would WANT answered well but that the
     corpus currently cannot answer. That gap list is the writing brief. -->

---

## Why multi-source questions are the hard case

"What AI skills does Ni Ni have?" is an **aggregation question** - sometimes
called multi-hop. No single chunk answers it. The answer is assembled from the
matching engine (LLM cost engineering, evals, bounded model output), Kiki
(agent tooling, nine tools, real API integration), and this chat feature
(embeddings, retrieval, grounding).

That has a direct consequence for tuning. If retrieval returns the top 3 chunks
and the answer needs 3 different documents, every one of them has to place in
the top 3 while competing against the other 10 chunks in the corpus. One miss
and the answer is quietly incomplete - and *incomplete is worse than wrong
here*, because the bot will sound confident while underselling the work.

So this question sets a practical floor on **k**, the number of chunks
retrieved. It is the main reason to keep k at 5 rather than 3, and the main
argument for a future refinement: retrieving more chunks than needed and then
re-ranking, or letting the model ask for a second retrieval pass.

Skills questions are also the most likely thing a recruiter types first, which
makes this the highest-stakes row in the file.
