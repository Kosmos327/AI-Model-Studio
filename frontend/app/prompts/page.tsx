"use client";

import { useEffect, useState } from "react";
import { Plus, Star, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PromptEditor from "@/components/PromptEditor";
import { getPrompts, getCharacters, createPrompt, updatePrompt, deletePrompt } from "@/lib/api";
import type { PromptTemplate, Character, PromptFormData } from "@/types";

const TYPE_COLORS: Record<string, "default" | "info" | "success" | "warning" | "secondary"> = {
  photo: "default",
  reel: "info",
  caption: "success",
  negative: "warning",
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const [charFilter, setCharFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [favFilter, setFavFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [proms, chars] = await Promise.all([
        getPrompts({
          size: 200,
          character_id: charFilter ? Number(charFilter) : undefined,
          prompt_type: typeFilter || undefined,
          is_favorite: favFilter === "true" ? true : undefined,
        }),
        getCharacters({ size: 100 }),
      ]);
      setPrompts(proms.items);
      setCharacters(chars.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [charFilter, typeFilter, favFilter]);

  const handleCreate = async (data: PromptFormData) => {
    await createPrompt(data);
    setShowForm(false);
    fetchData();
  };

  const handleUpdate = async (data: PromptFormData) => {
    if (!editing) return;
    await updatePrompt(editing.id, data);
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this prompt?")) return;
    await deletePrompt(id);
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleFav = async (p: PromptTemplate) => {
    await updatePrompt(p.id, { is_favorite: !p.is_favorite });
    setPrompts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_favorite: !x.is_favorite } : x));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Prompts</h1>
          <p className="text-gray-400 mt-1">Prompt template library</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" />New Prompt</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={charFilter} onValueChange={setCharFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All characters" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All characters</SelectItem>
            {characters.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            <SelectItem value="photo">Photo</SelectItem>
            <SelectItem value="reel">Reel</SelectItem>
            <SelectItem value="caption">Caption</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
        <Select value={favFilter} onValueChange={setFavFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All prompts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All prompts</SelectItem>
            <SelectItem value="true">Favorites only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse">Loading prompts...</div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No prompts found</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" />Create Prompt</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((p) => (
            <Card key={p.id} className="hover:border-gray-600 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-200">{p.title}</h3>
                      <Badge variant={TYPE_COLORS[p.prompt_type] ?? "secondary"} className="text-xs">{p.prompt_type}</Badge>
                      <Badge variant="outline" className="text-xs">{p.category}</Badge>
                      {p.character_name && <span className="text-xs text-gray-500">{p.character_name}</span>}
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{p.prompt_text}</p>
                    {p.negative_prompt && (
                      <p className="text-xs text-red-400 mt-1 line-clamp-1">⊖ {p.negative_prompt}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleToggleFav(p)} className="p-1 hover:bg-gray-800 rounded">
                      <Star className={`h-4 w-4 ${p.is_favorite ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                    </button>
                    <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                      <Edit className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Prompt</DialogTitle></DialogHeader>
          <PromptEditor characters={characters} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Prompt</DialogTitle></DialogHeader>
          {editing && (
            <PromptEditor initial={editing} characters={characters} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
