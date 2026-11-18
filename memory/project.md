# Project

> Starter note for the local memory, seeded by `reviewer-harness init`
> from what it detected in this project. Correct anything it got wrong.

## What this project is

Build an "AI office" web app that anyone can use with their own AI APIs: a Next.js + TypeScript + Tailwind PWA deployed on Vercel where each user signs up for their own account, connects their own API providers — direct provider APIs such as Gemini API, Groq, OpenRouter, NVIDIA NIM, or Cloudflare Workers AI, or any OpenAI-compatible router endpoint such as FreeLLMAPI or OmniRoute — and gets a personal office showing their own AI team at work. Each agent is assigned to one of the user's APIs, runs real tasks through it from a runner, and usage is tracked per user and per API. The office shows each agent's status and current one-line task, a pending-approvals queue the user can approve or reject from their phone, project activity, runner online/offline with an honest last-seen time, and a peek into the team's shared memory. Every user's office, data, and API keys are isolated by Supabase Auth + Row Level Security: nobody can see another user's office, use another user's API keys, or bypass the login to reach the data. It must never fake live status and never expose one user's data to another. For Edsiel himself, the first providers wired in are his own: FreeLLMAPI (working today) and OmniRoute (supported by the same config; needs revival on his PC first), and his office shows his named harness agents (Bantay, Tigplano, Tig-ayo) and CLI workers via a small Node.js reporter on his PC.

## Tech stack

TypeScript · Next.js

## Validation commands

- lint: `npm run lint`
- build: `npm run build`

## Decisions

_(why things were built this way — related: [[decisions]])_

## Do not touch

_(files or areas that are dangerous to change, and why)_
