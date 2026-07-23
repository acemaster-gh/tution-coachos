import { z } from "zod";

export const leadSchema = z.object({
  parentName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
  grade: z.string().trim().min(1, "Grade is required").max(20),
  subject: z.string().trim().min(1, "Subject is required").max(100),
});

export const attendanceSchema = z.object({
  present: z.boolean(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD").optional(),
});

export const scoreSchema = z
  .object({
    subject: z.string().trim().min(1, "Subject is required").max(100),
    score: z.number().nonnegative("Score can't be negative"),
    maxScore: z.number().positive("maxScore must be greater than 0"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD").optional(),
  })
  .refine((data) => data.score <= data.maxScore, {
    message: "score can't exceed maxScore",
    path: ["score"],
  });

export const enrollSchema = z.object({
  leadId: z.string().optional(),
  studentName: z.string().trim().min(2, "Student name must be at least 2 characters").max(100),
  grade: z.string().trim().min(1, "Grade is required").max(20),
  subject: z.string().trim().min(1, "Subject is required").max(100),
  tutorId: z.string().min(1, "A tutor must be assigned"),
  parentName: z.string().trim().min(2, "Parent name must be at least 2 characters").max(100),
  parentEmail: z.string().trim().email("Enter a valid email address"),
});

export const resourceSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(200),
  subject: z.string().trim().min(1, "Subject is required").max(100),
  grade: z.string().trim().min(1, "Grade is required").max(20),
  type: z.enum(["notes", "video", "practice"]),
  url: z.string().trim().url("Enter a valid URL"),
});

/** Formats the first Zod issue as a plain string for a simple API error message. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
