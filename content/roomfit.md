---
title: RoomFit
source: roomfit
kind: project
url: https://roomfit-peach.vercel.app
year: 2026
---

<!-- Drafted from the repo README (github.com/ninitwin4/roomfit). Ni Ni: this
     project is not on the portfolio site at all - worth deciding whether it
     should be, separately from whether the bot knows about it. -->

## The Problem

Every room listing tells you the rent and the neighbourhood. Almost none tell you the thing that actually decides whether you will be happy there: whether you would live well with the people already in the house.

Ni Ni ran into this personally. Finding a sublet in a big city is a hassle, and so is the reverse - finding the right person to fill a room when you are the one leaving. Most of it still happens in Facebook groups, where listings scroll past as plain text with no way to tell which would genuinely suit you.

Even the sites that claim to match hand back an opaque percentage with no reasoning. You cannot tell whether an 85% means the rent fits or the lifestyle fits, and those are very different things when you are signing a lease.

## How the Score Works

Five factors, 20 points each, for a 0-100 score: budget fit, location, cleanliness, social level, and sleep schedule.

Three hard filters drop a room entirely - more than 30% over budget, pets needed but not allowed, or a smoking home when you are not okay with that. The app reports how many were ruled out and why, rather than silently shrinking the list. Rooms slightly over budget are still shown, because people do stretch, but they score low and always rank below anything actually affordable.

Budget scoring is cheaper-is-better across a band: 30% under budget earns full marks, right at the limit scores about half, and 30% over scores nothing. Ties break toward cheaper rent.

## Every Match Comes With a Receipt

There is no LLM anywhere in the scoring path. The same input always produces the same result, and every result opens into a breakdown showing where each point came from, with a plain-language reason per factor.

The scoring is deliberately boring - bounded, capped, rule-based. That is the point. When a room ranks second instead of first, a user should see the reason in one glance rather than trusting a black box.

This is the same conviction as the matching engine, arrived at from the opposite direction: there, an LLM is allowed in but hard-capped; here, it is kept out of the ranking path entirely. Both come from treating explainability as the requirement and deciding how much model to admit afterwards.

## Architecture

The backend never touches the database. The frontend holds the Supabase session, reads rooms directly, and posts preferences plus rooms to a stateless `/rank` endpoint. The ranking service scores and explains - it holds no credentials and stores no user data. Row Level Security is what protects the data: signed-in users can read every listing but only ever write their own.

The dependency list is deliberately tiny and has not grown since week one - three packages on the frontend, three on the backend. No router, no state library, no UI kit, no image library. Photo downscaling, the swipeable gallery, avatars, messaging, and sharing are all built on stock browser APIs: canvas for resizing, crypto.randomUUID, CSS scroll-snap, navigator.share. Fewer moving parts to break, and nothing to keep patched.

## Relationship to the Matching Engine

RoomFit and the matching engine share a topic tag and a philosophy but no code. RoomFit reuses the concepts - hard filters first, then a bounded per-factor score, every factor emitting its own reason string, all driven by config rather than branching logic. Nothing is imported, vendored, or merged; the two repos stay independent by design.

<!-- TODO Ni Ni: which came first, and did one teach you something that
     changed the other? That answer is more interesting than either project
     alone, and a reader will ask it. -->

## Stack and Links

React 18, Vite 5, hand-written CSS. Python, FastAPI, Pydantic, Uvicorn. Supabase for Postgres, email auth, Row Level Security, and storage. Deployed on Vercel (frontend) and Render (API).

Live app: https://roomfit-peach.vercel.app
Source: https://github.com/ninitwin4/roomfit
