import fs from "node:fs/promises";
import path from "node:path";
import type { User } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "users.json");

export async function listUsers(): Promise<User[]> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as User[];
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await listUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
