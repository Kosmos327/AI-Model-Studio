"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import CharacterForm from "@/components/CharacterForm";
import { getCharacters, createCharacter } from "@/lib/api";
import type { Character, CharacterFormData } from "@/types";

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const res = await getCharacters({ size: 100, status: statusFilter || undefined, search: search || undefined });
      setCharacters(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCharacters(); }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchCharacters(); };

  const handleCreate = async (data: CharacterFormData) => {
    await createCharacter(data);
    setShowCreate(false);
    fetchCharacters();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Characters</h1>
          <p className="text-gray-400 mt-1">Manage your AI personas</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Character
        </Button>
      </div>

      <div className="flex gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search characters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" variant="outline" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-700 px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse">Loading characters...</div>
      ) : characters.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No characters found</p>
          <p className="text-gray-600 text-sm mt-1">Create your first AI persona to get started</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />Create Character</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {characters.map((c) => (
            <CharacterCard key={c.id} character={c} />
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Character</DialogTitle>
          </DialogHeader>
          <CharacterForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CharacterCard({ character }: { character: Character }) {
  return (
    <Link href={`/characters/${character.id}`}>
      <Card className="hover:border-indigo-500/50 transition-colors cursor-pointer h-full">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg text-indigo-300 font-bold">
              {character.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-100 truncate">{character.name}</h3>
              <p className="text-xs text-gray-400 truncate">{character.archetype}</p>
            </div>
          </div>
          {character.bio_short && (
            <p className="text-xs text-gray-500 line-clamp-2">{character.bio_short}</p>
          )}
          <div className="flex items-center justify-between">
            <StatusBadge status={character.status} />
            {character.nationality_style && (
              <span className="text-xs text-gray-500">{character.nationality_style}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
