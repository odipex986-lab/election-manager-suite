import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { resultsVisible: boolean }) => {
      const validated = api.settings.update.input.parse(data);
      const res = await fetch(api.settings.update.path, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
    },
  });
}

export function usePositions() {
  return useQuery({
    queryKey: [api.positions.list.path],
    queryFn: async () => {
      const res = await fetch(api.positions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch positions");
      return api.positions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.positions.create.input>) => {
      const validated = api.positions.create.input.parse(data);
      const res = await fetch(api.positions.create.path, {
        method: api.positions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create position");
      return api.positions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.positions.list.path] });
    },
  });
}

export function useCandidates() {
  return useQuery({
    queryKey: [api.candidates.list.path],
    queryFn: async () => {
      const res = await fetch(api.candidates.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch candidates");
      return api.candidates.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.candidates.create.input>) => {
      // Coerce positionId to number just in case it comes from a string input
      const dataWithCoercedNum = { ...data, positionId: Number(data.positionId) };
      const validated = api.candidates.create.input.parse(dataWithCoercedNum);
      const res = await fetch(api.candidates.create.path, {
        method: api.candidates.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create candidate");
      return api.candidates.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.candidates.list.path] });
    },
  });
}

export function useResults() {
  return useQuery({
    queryKey: [api.votes.results.path],
    queryFn: async () => {
      const res = await fetch(api.votes.results.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized to view results");
      if (!res.ok) throw new Error("Failed to fetch results");
      return api.votes.results.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.votes.submit.input>) => {
      const validated = api.votes.submit.input.parse(data);
      const res = await fetch(api.votes.submit.path, {
        method: api.votes.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit vote");
      return api.votes.submit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate both me (to update hasVoted) and results
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      queryClient.invalidateQueries({ queryKey: [api.votes.results.path] });
    },
  });
}

export function useResetElection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.votes.reset.path, {
        method: api.votes.reset.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reset election");
      return api.votes.reset.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Clear out all related queries
      queryClient.invalidateQueries({ queryKey: [api.votes.results.path] });
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
    },
  });
}
