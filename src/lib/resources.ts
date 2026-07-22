import { readCollection, appendToCollection } from "./db";
import type { Resource } from "./types";

export async function listResources(): Promise<Resource[]> {
  const resources = await readCollection<Resource>("resources.json");
  return resources.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getResourcesForGrade(grade: string): Promise<Resource[]> {
  const resources = await listResources();
  return resources.filter((r) => r.grade === grade);
}

export async function addResource(input: Omit<Resource, "id" | "createdAt">): Promise<Resource> {
  const resource: Resource = {
    ...input,
    id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  await appendToCollection<Resource>("resources.json", resource);
  return resource;
}
