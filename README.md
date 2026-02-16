# CallHandler - AI-Powered Clinic Phone Assistant

A mobile-first web app that analyzes phone call transcripts to extract structured patient information, flag urgency, and detect concerning patterns.

![Powered by ScribeMD](https://static.scribemd.ai/assets/prod/logo-b2c84ae1eb5833070341ede85b5c1f9bf2d8f5ca345b105d914f43a9a279242b.svg)

---

## Quick Start

```bash
git clone <repo-url> && cd callhandler
npm install
cp .env.example .env  # Add your OPENAI_API_KEY
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173)

---

## How I Approached It

**General Idea:**

On a small scale this is the type of project that is extremely easy for Claude Code to set up in an iterative process. I prompted it to the arcitecture I wanted, fed Claude the basic prompt, and said go from there. Beyond some small UI tweaks which I instructed Claude to make, I could really focus on the prompting. The goal here was to ensure two things: that the calls could be understood even if they were chaotic (as they could be in the real world), and that key information could be abstracted and categorized. The prompts vary in degrees of confusion and complexity and I invite the viewer to test them out one by one (they can be found in the data folder, under testTranscripts)

**Core requirements:** Extract name, DOB, phone, intent, urgency from transcripts.

**What I added:**
1. Backend API (API keys never exposed to browser)
2. SQLite persistence for call history
3. Patient search with autocomplete
4. Pattern detection (repeat callers, escalating symptoms)
5. 18 structured data fields beyond the basics

---

## AI Tools Used

| Tool | Purpose |
|------|---------|
| **Claude Code** | Built app through prompting - scaffolding, components, backend, CSS, docs |
| **GPT-4o-mini** | Production transcript analysis (temp: 0.1, JSON mode) |

---

## What It Extracts

| Category | Fields |
|----------|--------|
| **Core** | intent, name, DOB, phone, summary, urgency |
| **Medical** | medications, allergies, clinical terms |
| **Context** | provider requested, insurance, scheduling, billing |
| **Sensitive** | mental health flags, pregnancy, infectious disease |
| **Social** | SDOH (transportation, language, living situation) |
| **Contact** | alternate phones, email, emergency contact, pharmacy |
| **Quality** | extraction confidence score (0-100) |

---

## Pattern Detection

| Pattern | Trigger |
|---------|---------|
| Repeat Caller | Same person in 72h |
| Escalating | Low → High urgency |
| Rapid Callbacks | 3+ calls in 24h |
| Routine Caller | All calls low urgency (positive flag) |

---

## Test Transcripts (32 included)

Covers: urgent medical, routine, billing, ESL callers, elderly confused, mental health crisis, pregnancy, COVID/flu, domestic violence suspected, and more.

---

## What I'd Improve

- Finer tuned gradient of categories of emergencies
- Automatic response triggering / Emergency response notification 
- More categories of interest for receptionist (medical history, patient-doctor relationship, vaccinations etc.)
- Analytics dashboard

---

## Architecture

```
React + Vite  →  Express.js API  →  OpenAI GPT-4o-mini
                      ↓
                   SQLite (call history, pattern detection)
```

---

## License

MIT
