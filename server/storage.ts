import { db } from "./db";
import {
  users, positions, candidates, electionSettings, votes,
  type User, type InsertUser,
  type Position, type InsertPosition,
  type Candidate, type InsertCandidate,
  type Vote, type ElectionSettings
} from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPositions(): Promise<Position[]>;
  createPosition(position: InsertPosition): Promise<Position>;
  
  getCandidates(): Promise<Candidate[]>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  
  getSettings(): Promise<ElectionSettings>;
  updateSettings(resultsVisible: boolean): Promise<ElectionSettings>;
  
  submitVotes(studentId: number, userVotes: {positionId: number, candidateId: number}[]): Promise<void>;
  resetElection(): Promise<void>;
  getResults(): Promise<{positionId: number, candidateId: number, voteCount: number}[]>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPositions(): Promise<Position[]> {
    return await db.select().from(positions);
  }

  async createPosition(position: InsertPosition): Promise<Position> {
    const [newPosition] = await db.insert(positions).values(position).returning();
    return newPosition;
  }

  async getCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates);
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async getSettings(): Promise<ElectionSettings> {
    const settings = await db.select().from(electionSettings).limit(1);
    if (settings.length === 0) {
      const [newSettings] = await db.insert(electionSettings).values({ resultsVisible: false }).returning();
      return newSettings;
    }
    return settings[0];
  }

  async updateSettings(resultsVisible: boolean): Promise<ElectionSettings> {
    const settings = await this.getSettings();
    const [updated] = await db.update(electionSettings)
      .set({ resultsVisible })
      .where(eq(electionSettings.id, settings.id))
      .returning();
    return updated;
  }

  async submitVotes(studentId: number, userVotes: {positionId: number, candidateId: number}[]): Promise<void> {
    await db.transaction(async (tx) => {
      // Create vote records
      for (const vote of userVotes) {
        await tx.insert(votes).values({
          studentId,
          candidateId: vote.candidateId,
          positionId: vote.positionId
        });
      }
      
      // Update user hasVoted
      await tx.update(users).set({ hasVoted: true }).where(eq(users.id, studentId));
    });
  }

  async resetElection(): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(votes);
      await tx.update(users).set({ hasVoted: false });
      
      const settings = await tx.select().from(electionSettings).limit(1);
      if (settings.length > 0) {
        await tx.update(electionSettings)
          .set({ resultsVisible: false })
          .where(eq(electionSettings.id, settings[0].id));
      } else {
        await tx.insert(electionSettings).values({ resultsVisible: false });
      }
    });
  }

  async getResults(): Promise<{positionId: number, candidateId: number, voteCount: number}[]> {
    const results = await db.select({
      positionId: votes.positionId,
      candidateId: votes.candidateId,
      voteCount: sql<number>`cast(count(${votes.id}) as int)`
    })
    .from(votes)
    .groupBy(votes.positionId, votes.candidateId);
    
    return results;
  }
}

export const storage = new DatabaseStorage();