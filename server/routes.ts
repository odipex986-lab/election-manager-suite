import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup Passport for authentication
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'super-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Check if admin
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  app.post(api.auth.login.path, passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get(api.auth.me.path, isAuth, (req, res) => {
    res.json(req.user);
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, isAdmin, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(input.resultsVisible);
      res.json(settings);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Positions
  app.get(api.positions.list.path, isAuth, async (req, res) => {
    const positions = await storage.getPositions();
    res.json(positions);
  });

  app.post(api.positions.create.path, isAdmin, async (req, res) => {
    try {
      const input = api.positions.create.input.parse(req.body);
      const position = await storage.createPosition(input);
      res.status(201).json(position);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Candidates
  app.get(api.candidates.list.path, isAuth, async (req, res) => {
    const candidates = await storage.getCandidates();
    res.json(candidates);
  });

  app.post(api.candidates.create.path, isAdmin, async (req, res) => {
    try {
      const input = api.candidates.create.input.parse(req.body);
      const candidate = await storage.createCandidate(input);
      res.status(201).json(candidate);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Votes
  app.post(api.votes.submit.path, isAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.hasVoted) {
        return res.status(400).json({ message: "User has already voted" });
      }

      const input = api.votes.submit.input.parse(req.body);
      
      // Basic validation: user can't vote for same position twice
      const positionIds = input.votes.map(v => v.positionId);
      if (new Set(positionIds).size !== positionIds.length) {
        return res.status(400).json({ message: "Duplicate position votes" });
      }

      await storage.submitVotes(user.id, input.votes);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.votes.reset.path, isAdmin, async (req, res) => {
    await storage.resetElection();
    res.json({ success: true });
  });

  app.get(api.votes.results.path, isAuth, async (req, res) => {
    const user = req.user as any;
    const settings = await storage.getSettings();
    
    // Only admins or if results are visible
    if (!user.isAdmin && !settings.resultsVisible) {
      return res.status(401).json({ message: "Results are not visible yet" });
    }
    
    const results = await storage.getResults();
    res.json(results);
  });

  // Seed DB with an admin and some test data if needed
  setTimeout(async () => {
    const admin = await storage.getUserByUsername('admin');
    if (!admin) {
      await storage.createUser({ username: 'admin', password: 'Nishal5676', isAdmin: true });
    }
    const student1 = await storage.getUserByUsername('student1');
    if (!student1) {
      await storage.createUser({ username: 'student1', password: 'password', isAdmin: false });
    }
    const student2 = await storage.getUserByUsername('student2');
    if (!student2) {
      await storage.createUser({ username: 'student2', password: 'password', isAdmin: false });
    }
    
    const positions = await storage.getPositions();
    if (positions.length === 0) {
      const pres = await storage.createPosition({ name: 'President' });
      const vp = await storage.createPosition({ name: 'Vice President' });
      
      await storage.createCandidate({ name: 'Alice', positionId: pres.id });
      await storage.createCandidate({ name: 'Bob', positionId: pres.id });
      await storage.createCandidate({ name: 'Charlie', positionId: pres.id });
      
      await storage.createCandidate({ name: 'Dave', positionId: vp.id });
      await storage.createCandidate({ name: 'Eve', positionId: vp.id });
      await storage.createCandidate({ name: 'Frank', positionId: vp.id });
    }
  }, 1000);

  return httpServer;
}
