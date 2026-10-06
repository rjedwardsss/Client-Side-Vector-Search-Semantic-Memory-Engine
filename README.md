# Client-Side Vector Search Semantic Memory Engine

A tiny TypeScript memory store that turns text into deterministic TF-style hashing embeddings, then ranks notes with cosine similarity. It is designed to run locally and does not call any external embedding API.

Portfolio demo: https://rjedwards.dev/projects/vector-search

## Run

```bash
npm install
npm start -- "browser semantic search"
```

Without an argument, the CLI uses a default query and prints the top ranked fixture notes.

## Project Shape

- `src/engine.ts` exposes `tokenize`, `embed`, `cosineSimilarity`, and `MemoryStore`.
- `src/cli.ts` loads `fixtures/docs.json`, indexes the notes, and prints ranked results.
- `fixtures/docs.json` contains a small note set for smoke testing and demos.
