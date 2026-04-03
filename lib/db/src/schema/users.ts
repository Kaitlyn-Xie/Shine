import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  pseudonym: text("pseudonym"),
  country: text("country"),
  timezone: text("timezone"),
  concentration: text("concentration"),
  role: text("role").notNull().default("student"),
  phase: text("phase").notNull().default("pre_arrival"),
  comfortSpeaking: integer("comfort_speaking").notNull().default(3),
  comfortAsking: integer("comfort_asking").notNull().default(3),
  comfortMeeting: integer("comfort_meeting").notNull().default(3),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  totalPoints: integer("total_points").notNull().default(0),
  teamId: integer("team_id"),
  circleId: integer("circle_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
