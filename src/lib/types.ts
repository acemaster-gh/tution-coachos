export type Role = "admin" | "tutor" | "parent";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  // Demo-only field so the parent dashboard has something to point at
  // before Phase 3 wires this to real enrolment records.
  studentName?: string;
}

export interface SessionPayload {
  sub: string; // user id
  name: string;
  role: Role;
  [key: string]: unknown;
}
