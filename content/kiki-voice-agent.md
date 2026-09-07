---
title: Kiki - Ambient Voice Travel Agent
source: kiki-voice-agent
kind: project
url: https://github.com/ninitwin4/kiki-voice-agent
year: 2026
---

<!-- Drafted from the repo README (github.com/ninitwin4/kiki-voice-agent).
     Ni Ni: check the framing is how you would tell it out loud, and fill the
     TODOs - the README explains what it does, not what it was like to build. -->

## What Kiki Is

Kiki is an ambient voice travel agent. Two friends plan a Maui trip out loud, and Kiki listens quietly rather than waiting to be addressed - chiming in only when she has something genuinely useful to add.

The demo turns on one moment. Kiki checks the weather, finds that early November is Maui's rainy season, remembers that one traveller will not travel in the rain, and moves the whole trip to dry August in a single call that re-dates and re-prices flights, hotel, minivan, and activities together.

The design bet is restraint. An assistant that talks constantly is noise; one that stays silent until it can change the outcome is a colleague. That is a product decision, not a technical one, and it is the thing that makes the demo land.

## Architecture

A FastAPI backend exposes nine endpoints wired as agent tools, plus a token endpoint. The voice layer calls those tools; a React UI reads exactly one endpoint, `POST /trip/status`, and refetches after each of Kiki's signals.

That one-endpoint rule is the important part. Rather than letting the agent push state into the UI piece by piece, the backend holds the whole trip and the UI re-reads it. The agent can never leave the screen half-updated, because there is no partial update to make. The UI-to-backend contract is frozen in a `CONTRACT.md` and the nine agent-facing action names are frozen in a `client_actions.json`.

The nine tools: trip status, flight search, flight booking, hotel adjustment, transport update, activity booking, trip rebooking, trip reconfiguration, and payment confirmation.

## The Cascade

The interesting engineering is what happens when the trip moves months. `POST /trip/rebook` re-flows every vendor at once - flights, hotel, transport, activities - while anything already booked stays booked and carries its tier through the change.

That is a small distributed-state problem hiding inside a travel demo: an agent-triggered change has to fan out across several vendors without losing work already committed, and the UI has to stay coherent throughout.

## Real Integrations, Bounded Risk

Three third-party services are integrated for real rather than mocked: Vocal Bridge for voice, Sabre for live flight fares and travel seasonality, and PayPal sandbox for payment.

The Sabre integration is deliberately hybrid. The three bookable flight options stay curated so booking cannot break mid-demo, but in real mode the search also attaches live Sabre fares and seasonality data that Kiki reads aloud. A stale or expired token simply omits the live proof - it never breaks the flow.

That pattern is the same instinct as the matching engine's capped AI bonus: let the risky external thing add value on top of a path that works without it, so a bad day degrades the demo instead of ending it. Feature flags default everything to mock; real integrations are opt-in per service.

Secrets live in a gitignored `.env` locally and as unsynced Render environment variables in deployment - never committed.

<!-- TODO Ni Ni: the bio says this shipped in a single day. Confirm, and say
     what that actually meant - what you cut, what you decided not to build,
     what you would have done with a second day. The constraint is the story. -->

<!-- TODO Ni Ni: was this a hackathon? Which one, and how did it place? There
     is a private VoiceAI-Hackathon repo suggesting it was - say so plainly if
     it was, since a shipped hackathon project reads differently from a demo. -->

## Stack and Links

Python, FastAPI, Pydantic, pytest. Deployed on Render as two services from one codebase. React frontend. Voice via Vocal Bridge; flights and hotels via Sabre, including their MCP-Skills server; payment via PayPal Orders v2.

Demo video: https://www.youtube.com/watch?v=K8ZU7JA9WYs
Source: https://github.com/ninitwin4/kiki-voice-agent
