import { z } from "zod";

export const contactSubjects = ["projet", "freelance", "collab", "autre"] as const;
export type ContactSubject = (typeof contactSubjects)[number];

export const contactTimelines = ["urgent", "month", "quarter", "flexible"] as const;
export type ContactTimeline = (typeof contactTimelines)[number];

export const contactBudgets = ["under5k", "5to15k", "15to50k", "over50k", "todiscuss"] as const;
export type ContactBudget = (typeof contactBudgets)[number];

/**
 * Codes d'erreur (i18n-friendly).
 * Le composant client mappe vers une traduction via `Contact.errors.<code>`.
 */
export const contactErrorCodes = {
  nameTooShort: "nameTooShort",
  nameTooLong: "nameTooLong",
  emailInvalid: "emailInvalid",
  subjectInvalid: "subjectInvalid",
  messageTooShort: "messageTooShort",
  messageTooLong: "messageTooLong",
} as const;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, contactErrorCodes.nameTooShort)
    .max(80, contactErrorCodes.nameTooLong),
  email: z.string().trim().toLowerCase().email(contactErrorCodes.emailInvalid).max(160),
  subject: z.enum(contactSubjects, { message: contactErrorCodes.subjectInvalid }),
  message: z
    .string()
    .trim()
    .min(20, contactErrorCodes.messageTooShort)
    .max(4000, contactErrorCodes.messageTooLong),
  // Champs de contexte optionnels — uniquement transmis dans l'email,
  // pas persistés en DB (pas de migration nécessaire).
  timeline: z.enum(contactTimelines).optional().or(z.literal("")),
  stack: z.string().trim().max(200).optional().or(z.literal("")),
  budget: z.enum(contactBudgets).optional().or(z.literal("")),
  website: z.string().max(0, "spam").optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug : minuscules, chiffres, tirets uniquement"),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(500),
  longContent: z.string().trim().max(20000).optional().nullable(),
  coverImage: z.string().trim().min(1),
  gallery: z.array(z.string()).optional().nullable(),
  techStack: z.array(z.string().min(1)).min(1, "Au moins une techno"),
  category: z.string().trim().min(1).max(60),
  liveUrl: z.string().url().optional().or(z.literal("")).nullable(),
  githubUrl: z.string().url().optional().or(z.literal("")).nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(200),
});

export const blogPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug : minuscules, chiffres et tirets uniquement"),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(500),
  content: z.string().trim().min(10).max(200_000),
  coverImage: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(40)).max(15).optional(),

  metaTitle: z.string().trim().max(200).optional().nullable().or(z.literal("")),
  metaDescription: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  metaKeywords: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  ogImage: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  canonicalUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
  noIndex: z.boolean().optional(),

  published: z.boolean().optional(),
  /** ISO 8601 ou chaîne vide */
  publishedAt: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: "Date invalide" }),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

export const commentErrorCodes = {
  pseudoTooShort: "pseudoTooShort",
  pseudoTooLong: "pseudoTooLong",
  messageTooShort: "messageTooShort",
  messageTooLong: "messageTooLong",
  emailInvalid: "emailInvalid",
} as const;

export const blogCommentSchema = z.object({
  pseudo: z
    .string()
    .trim()
    .min(2, commentErrorCodes.pseudoTooShort)
    .max(80, commentErrorCodes.pseudoTooLong),
  message: z
    .string()
    .trim()
    .min(2, commentErrorCodes.messageTooShort)
    .max(2000, commentErrorCodes.messageTooLong),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(commentErrorCodes.emailInvalid)
    .max(160)
    .optional()
    .or(z.literal("")),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type BlogCommentInput = z.infer<typeof blogCommentSchema>;

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  locale: z.enum(["fr", "en"]).optional(),
  website: z.string().max(0).optional().or(z.literal("")),
});
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

export const newsletterBroadcastSchema = z.object({
  subject: z.string().trim().min(2).max(200),
  html: z.string().trim().min(10).max(100_000),
});
export type NewsletterBroadcastInput = z.infer<typeof newsletterBroadcastSchema>;
