import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";

export const shineUsersTable = pgTable("shine_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  sessionToken: text("session_token").unique(),
  name: text("name").notNull(),
  country: text("country"),
  year: text("year"),
  concentration: text("concentration"),
  dorm: text("dorm"),
  interests: text("interests").array().notNull().default([]),
  isOnCampus: boolean("is_on_campus").notNull().default(false),
  onboarded: boolean("onboarded").notNull().default(false),
  // Hidden journal — private to the user, used for scavenger-hunt matching
  hiddenJournal: text("hidden_journal"),
  // Scavenger-hunt matching opt-in
  isScavengerOptIn: boolean("is_scavenger_opt_in").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shineFeedPostsTable = pgTable("shine_feed_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  username: text("username").notNull(),
  text: text("text").notNull().default(""),
  img: text("img"),
  mediaType: text("media_type"),
  textContent: text("text_content"),
  gradientIdx: integer("gradient_idx"),
  locationName: text("location_name"),
  locationLat: real("location_lat"),
  locationLng: real("location_lng"),
  isHunt: boolean("is_hunt").notNull().default(false),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shineSunlightPostsTable = pgTable("shine_sunlight_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  username: text("username").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  locationLat: real("location_lat"),
  locationLng: real("location_lng"),
  locationLabel: text("location_label"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shineHuntCompletionsTable = pgTable("shine_hunt_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  missionId: text("mission_id").notNull(),
  missionTitle: text("mission_title").notNull(),
  ptsTotal: integer("pts_total").notNull().default(0),
  photoUrl: text("photo_url"),
  shareToFeed: boolean("share_to_feed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shineQuestionAnswersTable = pgTable("shine_question_answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  userId: integer("user_id").notNull(),
  username: text("username").notNull(),
  body: text("body").notNull(),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Scavenger Hunt Matching ───────────────────────────────────────────────────
// These "match missions" are separate from the gamification missions above.
// They represent real-world group activities that students opt into for matching.

export const shineMatchMissionsTable = pgTable("shine_match_missions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  minGroupSize: integer("min_group_size").notNull().default(4),
  maxGroupSize: integer("max_group_size"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Tracks which users have joined which match missions (waiting for grouping)
export const shineMissionParticipantsTable = pgTable("shine_mission_participants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  missionId: integer("mission_id").notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

// Stores the matched groups per mission
export const shineMatchGroupsTable = pgTable("shine_match_groups", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id").notNull(),
  // Stored as comma-separated user IDs for simplicity with Drizzle/pg
  memberIds: text("member_ids").notNull(),
  matchingSummary: text("matching_summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
