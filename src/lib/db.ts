import fs from "node:fs/promises";
import path from "node:path";
import type { User } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

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
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, fileName), JSON.stringify(data, null, 2));
}

export async function appendToCollection<T>(fileName: string, item: T): Promise<void> {
  const existing = await readCollection<T>(fileName);
  existing.push(item);
  await writeCollection(fileName, existing);
}

export async function listUsers(): Promise<User[]> {
  return readCollection<User>("users.json");
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await listUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

