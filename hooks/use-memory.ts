/**
 * useMemory - Hook for managing user memories via API
 */

import { useState, useCallback, useEffect } from "react";

export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

interface UseMemoryReturn {
  memories: MemoryItem[];
  isLoading: boolean;
  error: string | null;
  addMemory: (data: { title: string; content: string; category?: string; tags?: string[] }) => Promise<void>;
  updateMemory: (id: string, data: { title: string; content: string; category?: string }) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  searchMemories: (query: string) => Promise<void>;
  refreshMemories: () => Promise<void>;
  total: number;
}

export function useMemory(): UseMemoryReturn {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchMemories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/memory?limit=50");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMemories(data.memories.map((m: MemoryItem) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined,
      })));
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const addMemory = useCallback(async (data: { title: string; content: string; category?: string; tags?: string[] }) => {
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to add memory");
    }

    const memory = await res.json();
    setMemories(prev => [{
      ...memory,
      createdAt: new Date(memory.createdAt),
    }, ...prev]);
    setTotal(prev => prev + 1);
  }, []);

  const updateMemory = useCallback(async (id: string, data: { title: string; content: string; category?: string }) => {
    // Optimistic update
    setMemories(prev => prev.map(m =>
      m.id === id ? { ...m, ...data } : m
    ));

    const res = await fetch(`/api/memory?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      // Revert on error
      await fetchMemories();
      throw new Error("Failed to update memory");
    }
  }, [fetchMemories]);

  const deleteMemory = useCallback(async (id: string) => {
    // Optimistic update
    setMemories(prev => prev.filter(m => m.id !== id));

    const res = await fetch(`/api/memory?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      // Revert on error
      await fetchMemories();
      throw new Error("Failed to delete memory");
    }
    setTotal(prev => prev - 1);
  }, [fetchMemories]);

  const searchMemories = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchMemories();
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/memory?q=${encodeURIComponent(query)}&limit=50`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setMemories(data.memories.map((m: MemoryItem) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined,
      })));
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsLoading(false);
    }
  }, [fetchMemories]);

  const refreshMemories = useCallback(async () => {
    await fetchMemories();
  }, [fetchMemories]);

  return {
    memories,
    isLoading,
    error,
    addMemory,
    updateMemory,
    deleteMemory,
    searchMemories,
    refreshMemories,
    total,
  };
}