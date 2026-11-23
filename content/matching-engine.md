---
title: Matching Engine
source: matching-engine
kind: project
url: /projects/matching-engine
year: 2026
---

## The Problem

Most matching products are built for a single vertical - a roommate app, a dating app, a hiring tool - with the matching logic fused to that one use case. Change the industry and you rewrite the engine.

I wanted to separate the two: a generic scoring engine that knows only entities, attributes, constraints, and weights, and per-domain config files describing what those mean for a given industry. The engine is the product; each domain is a consumer.

Housing is the first reference implementation. Healthcare - patient to therapist - is the second, added as a config file and seed data with the engine running unchanged.

<!-- TODO Ni Ni: what made you pick housing first? What did adding healthcare
     actually take - how many hours, how many lines, what broke? Concrete
     numbers are what the bot can cite and a recruiter remembers. -->

## How It Works

Matching runs as a three-tier pipeline. Tier 0 filters on hard gates - location, licensure, gender requirements - so incompatible pairs are removed before scoring rather than ranked low. Tier 1 computes a deterministic 0-90 base score from structured attributes, combining hard constraints, similarity scoring where alike is better, and complementary scoring where one side's strength fills the other's need.

Tier 2 is a bounded LLM nuance layer. It reads free-text bios for signal the structured fields cannot capture and applies a bonus of at most plus or minus 10 - hard-capped in code, not by prompt - to top candidates only, with graceful fallback to deterministic-only scoring if the model call fails.

Scores are computed in both directions and the lower one is displayed. A match is only as strong as its least-enthusiastic side.

## Key Decisions

A deterministic core with a bounded AI bonus, not an LLM verdict. The tempting build is to hand both profiles to a model and let it return a score. That is unexplainable and unstable across runs. Constraining the model to a capped adjustment on top of a deterministic base meant every score could be decomposed and shown to the user - base, AI delta, final - and a bad model day could never invert a ranking.

Tiering the pipeline for cost, not just correctness. Running the LLM layer only on candidates that survive filtering and rank near the top cut LLM calls by 86% against a naive score-everything approach, with no measurable loss in match quality.

Evals before features. The scoring logic is validated by an eval harness with authored golden pairs plus an LLM-judged groundedness check on the AI bonus. Every significant decision is recorded as an ADR in the repo, which is what made it safe to add a second domain without fear of silently regressing the first.

<!-- TODO Ni Ni: this is the section a technical interviewer will dig into.
     Worth adding: how you measured "no measurable loss in match quality",
     how many golden pairs, and one decision you got WRONG and reversed.
     Reversals are the most credible thing you can put in a corpus. -->

## Security and Scope

I triaged security by risk rather than treating it as all-or-nothing. Handled: the API key lives in a gitignored environment file and is never committed, and the AI bonus is contained in code so it can never override a hard constraint.

Planned before any public deployment: rate limiting on the LLM-backed endpoint so a public link cannot run up API cost, and deliberate input separation for prompt-injection handling on user-authored bios - the plus or minus 10 cap already limits the blast radius.

Out of scope by design: authentication and PII. This is a portfolio demo on synthetic seed data. The healthcare domain demonstrates domain-agnosticism only - it is not a clinical product and makes no medical claims.

## Stack and Links

Built with Python, FastAPI, the Anthropic Claude API, React, Tailwind, Vite, and pytest.

Live site: https://ninitwin4.github.io/matching-engine/
Demo video: https://www.youtube.com/watch?v=FQaMMsk5KHk
Source: https://github.com/ninitwin4/matching-engine
The source is archived on Zenodo as a citable software record: https://doi.org/10.5281/zenodo.22699739 - see Publication and Citation below.

## Publication and Citation

The matching engine is archived on Zenodo as a citable software record: "MatchingEngine: Domain-Agnostic Compatibility Scoring with Bounded LLM Adjustment", by Ni Ni Tin Win, version 1.1.0, published 10 September 2026, MIT licensed.

Cite it as: Tin Win, N. (2026). MatchingEngine: Domain-Agnostic Compatibility Scoring with Bounded LLM Adjustment (1.1.0). Zenodo. https://doi.org/10.5281/zenodo.22699739

There are two DOIs and the difference matters. 10.5281/zenodo.22699739 is the all-versions DOI: it always resolves to the most recent release, so it is the one to cite for the project as a whole. 10.5281/zenodo.22699927 is the DOI for version 1.1.0 specifically, and it will always point at that exact snapshot.

I archived it because a portfolio link is not evidence. A repository can be force-pushed, renamed, or made private, and the version someone actually read is then gone. A DOI points at a frozen deposit of a specific version, so a reviewer six months from now sees exactly the code I am describing here.

To be exact about what this is: Zenodo mints DOIs for software and datasets, and no peer review is involved. I have not published a conference or journal paper. What exists is a permanent, versioned, citable archive of a working system - which is the honest meaning of "published" here, and the only one worth claiming.
