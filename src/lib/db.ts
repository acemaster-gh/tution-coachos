import fs from "node:fs/promises";
import path from "node:path";
import type { User } from "./types";

/**
 * Thrown when appendToCollectionUnique detects a duplicate — callers can
 * catch this specifically instead of parsing error messages.
 */
export class DuplicateError extends Error {
  constructor(message = "Duplicate entry.") {
    super(message);
    this.name = "DuplicateError";
  }
}

const DATA_DIR = path.join(process.cwd(), "data");

// A poor-man's per-file mutex. Plain JSON-file storage isn't safe under
// concurrent writes (two requests can interleave a read-modify-write and
// corrupt the file) — this serializes writes to the same file within a
// single server process. It does NOT help across multiple server
// instances/processes, which is exactly why this whole module gets
// swapped for a real database (Postgres) before this goes to production
// with real traffic.
const fileLocks = new Map<string, Promise<void>>();

async function withFileLock<T>(fileName: string, fn: () => Promise<T>): Promise<T> {
  const prior = fileLocks.get(fileName) ?? Promise.resolve();
  let release!: () => void;
  const mine = new Promise<void>((resolve) => {
    release = resolve;
  });
  fileLocks.set(fileName, prior.then(() => mine));

  await prior;
  try {
    return await fn();
  } finally {
    release();
  }
}

export async function readCollection<T>(fileName: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, fileName), "utf-8");
    return JSON.parse(raw) as T[];
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

export async function writeCollection<T>(fileName: string, data: T[]): Promise<void> {
  await withFileLock(fileName, async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, fileName), JSON.stringify(data, null, 2));
  });
}

export async function appendToCollection<T>(fileName: string, item: T): Promise<void> {
  await withFileLock(fileName, async () => {
    const raw = await fs.readFile(path.join(DATA_DIR, fileName), "utf-8").catch((err) => {
      if (err.code === "ENOENT") return "[]";
      throw err;
    });
    const existing = JSON.parse(raw) as T[];
    existing.push(item);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, fileName), JSON.stringify(existing, null, 2));
  });
}

/**
 * Like appendToCollection, but atomically checks a uniqueness predicate
 * inside the file lock before inserting. Throws DuplicateError if any
 * existing item matches `isDuplicate`. This eliminates the TOCTOU race
 * of a separate "check then insert" pattern.
 */
export async function appendToCollectionUnique<T>(
  fileName: string,
  item: T,
  isDuplicate: (existing: T) => boolean,
  duplicateMessage = "Duplicate entry."
): Promise<void> {
  await withFileLock(fileName, async () => {
    const raw = await fs.readFile(path.join(DATA_DIR, fileName), "utf-8").catch((err) => {
      if (err.code === "ENOENT") return "[]";
      throw err;
    });
    const existing = JSON.parse(raw) as T[];
    if (existing.some(isDuplicate)) {
      throw new DuplicateError(duplicateMessage);
    }
    existing.push(item);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, fileName), JSON.stringify(existing, null, 2));
  });
}

/**
 * Finds the first item matching `match` and replaces it with whatever
 * `updater` returns. Throws if no item matches. Locked the same way as
 * append/write, so this is safe to call concurrently with other writes
 * to the same file.
 */
export async function updateCollectionItem<T>(
  fileName: string,
  match: (item: T) => boolean,
  updater: (item: T) => T
): Promise<T> {
  return withFileLock(fileName, async () => {
    const raw = await fs.readFile(path.join(DATA_DIR, fileName), "utf-8").catch((err) => {
      if (err.code === "ENOENT") return "[]";
      throw err;
    });
    const existing = JSON.parse(raw) as T[];
    const index = existing.findIndex(match);
    if (index === -1) throw new Error("No matching item found to update.");
    const updated = updater(existing[index]);
    existing[index] = updated;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, fileName), JSON.stringify(existing, null, 2));
    return updated;
  });
}

export async function listUsers(): Promise<User[]> {
  return readCollection<User>("users.json");
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await listUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

