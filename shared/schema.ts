import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  hasVoted: boolean("has_voted").default(false).notNull(),
});

export const electionSettings = pgTable("election_settings", {
  id: serial("id").primaryKey(),
  resultsVisible: boolean("results_visible").default(false).notNull(),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  positionId: integer("position_id").notNull(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  positionId: integer("position_id").notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
});

export const candidatesRelations = relations(candidates, ({ one }) => ({
  position: one(positions, {
    fields: [candidates.positionId],
    references: [positions.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  student: one(users, {
    fields: [votes.studentId],
    references: [users.id],
  }),
  candidate: one(candidates, {
    fields: [votes.candidateId],
    references: [candidates.id],
  }),
  position: one(positions, {
    fields: [votes.positionId],
    references: [positions.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, hasVoted: true });
export const insertElectionSettingsSchema = createInsertSchema(electionSettings).omit({ id: true });
export const insertPositionSchema = createInsertSchema(positions).omit({ id: true, createdAt: true });
export const insertCandidateSchema = createInsertSchema(candidates).omit({ id: true, createdAt: true });
export const insertVoteSchema = createInsertSchema(votes).omit({ id: true, votedAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertElectionSettings = z.infer<typeof insertElectionSettingsSchema>;
export type ElectionSettings = typeof electionSettings.$inferSelect;

export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
