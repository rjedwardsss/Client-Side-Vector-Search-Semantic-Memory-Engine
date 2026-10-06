export type Memory = {
  id: string;
  text: string;
  embedding: number[];
};

export type QueryResult = {
  id: string;
  text: string;
  score: number;
};

const DEFAULT_DIMENSIONS = 256;
const TOKEN_PATTERN = /[a-z0-9]+(?:'[a-z0-9]+)?/g;

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(TOKEN_PATTERN) ?? [];
}

function hashToken(token: string): number {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function embed(text: string, dimensions = DEFAULT_DIMENSIONS): number[] {
  if (dimensions < 2) throw new Error("dimensions must be at least 2");

  const vector = Array.from({ length: dimensions }, () => 0);
  const counts = new Map<string, number>();
  for (const token of tokenize(text)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  for (const [token, count] of counts) {
    const hash = hashToken(token);
    const index = hash % dimensions;
    const sign = hash & 1 ? 1 : -1;
    vector[index] += sign * (1 + Math.log(count));
  }

  const magnitude = Math.hypot(...vector);
  return magnitude === 0 ? vector : vector.map((value) => value / magnitude);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("vectors must have equal length");
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aNorm += a[i] * a[i];
    bNorm += b[i] * b[i];
  }
  if (aNorm === 0 || bNorm === 0) return 0;
  return dot / Math.sqrt(aNorm * bNorm);
}

export class MemoryStore {
  private readonly dimensions: number;
  private readonly memories = new Map<string, Memory>();
  private nextId = 1;

  constructor(dimensions = DEFAULT_DIMENSIONS) {
    this.dimensions = dimensions;
  }

  add(text: string, id = `mem-${this.nextId}`): Memory {
    const trimmed = text.trim();
    if (!trimmed) throw new Error("memory text cannot be empty");
    const memory: Memory = {
      id,
      text: trimmed,
      embedding: embed(trimmed, this.dimensions),
    };
    this.memories.set(id, memory);
    this.nextId += 1;
    return memory;
  }

  forget(id: string): boolean {
    return this.memories.delete(id);
  }

  all(): Memory[] {
    return Array.from(this.memories.values());
  }

  query(text: string, limit = 5): QueryResult[] {
    const queryEmbedding = embed(text, this.dimensions);
    return this.all()
      .map((memory) => ({
        id: memory.id,
        text: memory.text,
        score: cosineSimilarity(queryEmbedding, memory.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(0, limit));
  }
}
