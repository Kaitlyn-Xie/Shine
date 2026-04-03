import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const circlesTable = pgTable("circles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  currentPrompt: text("current_prompt"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCircleSchema = createInsertSchema(circlesTable).omit({ id: true, createdAt: true });
export type InsertCircle = z.infer<typeof insertCircleSchema>;
export type Circle = typeof circlesTable.$inferSelect;

export const circlePromptResponsesTable = pgTable("circle_prompt_responses", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull(),
  userId: integer("user_id").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCirclePromptResponseSchema = createInsertSchema(circlePromptResponsesTable).omit({ id: true, createdAt: true });
export type InsertCirclePromptResponse = z.infer<typeof insertCirclePromptResponseSchema>;
export type CirclePromptResponse = typeof circlePromptResponsesTable.$inferSelect;
