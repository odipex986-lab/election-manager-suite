import { z } from 'zod';
import { 
  insertUserSchema, 
  insertPositionSchema, 
  insertCandidateSchema,
  users,
  positions,
  candidates,
  electionSettings,
  votes
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: {
        200: z.custom<typeof electionSettings.$inferSelect>(),
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings' as const,
      input: z.object({ resultsVisible: z.boolean() }),
      responses: {
        200: z.custom<typeof electionSettings.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  positions: {
    list: {
      method: 'GET' as const,
      path: '/api/positions' as const,
      responses: {
        200: z.array(z.custom<typeof positions.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/positions' as const,
      input: insertPositionSchema,
      responses: {
        201: z.custom<typeof positions.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  candidates: {
    list: {
      method: 'GET' as const,
      path: '/api/candidates' as const,
      responses: {
        200: z.array(z.custom<typeof candidates.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/candidates' as const,
      input: insertCandidateSchema,
      responses: {
        201: z.custom<typeof candidates.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  votes: {
    submit: {
      method: 'POST' as const,
      path: '/api/votes' as const,
      input: z.object({
        votes: z.array(z.object({
          positionId: z.number(),
          candidateId: z.number()
        }))
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    reset: {
      method: 'POST' as const,
      path: '/api/votes/reset' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
      }
    },
    results: {
      method: 'GET' as const,
      path: '/api/votes/results' as const,
      responses: {
        200: z.array(z.object({
          positionId: z.number(),
          candidateId: z.number(),
          voteCount: z.number()
        })),
        401: errorSchemas.unauthorized,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
