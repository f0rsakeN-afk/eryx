"use client";

import { useState, useCallback, useEffect } from "react";
import { MemoryHeader } from "@/components/main/memory/memory-header";
import { MemoryGrid } from "@/components/main/memory/memory-grid";
import { MemoryModal } from "@/components/main/memory/memory-modal";
import type { MemoryItem } from "@/components/main/memory/memory-modal";
import { useMemory } from "@/hooks/use-memory";

export default function MemoryPage() {
  const { memories, isLoading, error, addMemory, updateMemory, deleteMemory, searchMemories, total } = useMemory();
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);

  // Sync search query with API
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMemories(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchMemories]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteMemory(id);
  }, [deleteMemory]);

  const handleEdit = useCallback((memory: MemoryItem) => {
    setEditingMemory(memory);
    setEditModalOpen(true);
  }, []);

  const handleAdd = useCallback(
    async (data: { title: string; content: string; category: string }) => {
      await addMemory({
        title: data.title,
        content: data.content,
        category: data.category || undefined,
      });
      setAddModalOpen(false);
    },
    [addMemory],
  );

  const handleUpdate = useCallback(
    async (data: { title: string; content: string; category: string }) => {
      if (!editingMemory) return;
      await updateMemory(editingMemory.id, {
        title: data.title,
        content: data.content,
        category: data.category || undefined,
      });
      setEditingMemory(null);
      setEditModalOpen(false);
    },
    [editingMemory, updateMemory],
  );

  // Client-side filter for display since API returns all on empty query
  const filteredMemories = searchQuery.trim()
    ? memories.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : memories;

  return (
    <div className="flex flex-col h-full max-w-6xl w-full mx-auto">
      <MemoryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => setAddModalOpen(true)}
      />

      <MemoryGrid
        memories={filteredMemories}
        searchQuery={searchQuery}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <MemoryModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAdd}
      />
      <MemoryModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingMemory(null);
        }}
        onSubmit={handleUpdate}
        memory={editingMemory}
      />
    </div>
  );
}
