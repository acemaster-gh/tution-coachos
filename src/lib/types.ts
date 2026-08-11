export type Role = "admin" | "tutor" | "parent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface SessionPayload {
  sub: string; // user id
  name: string;
  role: Role;
  [key: string]: unknown;
}

export interface TestScore {
  date: string; // ISO date
  subject: string;
  score: number;
  maxScore: number;
}

export interface AttendanceRecord {
  date: string; // ISO date
  present: boolean;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  tutorId: string;
  parentId: string;
  scores: TestScore[];
  attendance: AttendanceRecord[];
}

export type FeeStatus = "paid" | "pending" | "overdue";
export type FeePlan = "monthly" | "installment";

export interface Fee {
  id: string;
  studentId: string;
  amount: number; // in INR
  dueDate: string; // ISO date
  status: FeeStatus;
  plan: FeePlan;
}

export interface Lead {
  id: string;
  parentName: string;
  phone: string;
  grade: string;
  subject: string;
  receivedAt: string;
  converted?: boolean;
}

export type ResourceType = "notes" | "video" | "practice";

export interface Resource {
  id: string;
  title: string;
  subject: string;
  grade: string;
  type: ResourceType;
  url: string;
  uploadedBy: string; // user id
  createdAt: string;
}

export type NotificationChannel = "email" | "whatsapp" | "sms";

export interface NotificationLogEntry {
  id: string;
  channel: NotificationChannel;
  to: string;
  subject?: string;
  body: string;
  sentAt: string;
  ok: boolean;
  error?: string;
}

