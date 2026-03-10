"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Character, PromptTemplate, PromptFormData, PromptType } from "@/types";

interface PromptEditorProps {
  initial?: PromptTemplate;
  characters: Character[];
  onSubmit: (data: PromptFormData) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES = ["portrait", "fashion", "lifestyle", "fitness", "travel", "food", "beauty", "general"];

export default function PromptEditor({ initial, characters, onSubmit, onCancel }: PromptEditorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PromptFormData>({
    character_id: initial?.character_id,
    title: initial?.title ?? "",
    prompt_type: initial?.prompt_type ?? "photo",
    category: initial?.category ?? "general",
    prompt_text: initial?.prompt_text ?? "",
    negative_prompt: initial?.negative_prompt ?? "",
    notes: initial?.notes ?? "",
    is_favorite: initial?.is_favorite ?? false,
  });

  const set = (field: keyof PromptFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.prompt_text.trim()) { setError("Prompt text is required"); return; }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-700 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={form.title} onChange={set("title")} placeholder="e.g. Sofia Beach Portrait" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Character</Label>
          <Select
            value={form.character_id ? String(form.character_id) : "none"}
            onValueChange={(v) => setForm((f) => ({ ...f, character_id: v !== "none" ? Number(v) : undefined }))}
          >
            <SelectTrigger><SelectValue placeholder="Generic (no character)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Generic</SelectItem>
              {characters.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Type *</Label>
          <Select
            value={form.prompt_type}
            onValueChange={(v) => setForm((f) => ({ ...f, prompt_type: v as PromptType }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="photo">Photo</SelectItem>
              <SelectItem value="reel">Reel</SelectItem>
              <SelectItem value="caption">Caption</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="prompt_text">Prompt Text *</Label>
        <Textarea
          id="prompt_text"
          value={form.prompt_text}
          onChange={set("prompt_text")}
          placeholder="Detailed prompt for image generation..."
          rows={4}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="negative_prompt">Negative Prompt</Label>
        <Textarea
          id="negative_prompt"
          value={form.negative_prompt}
          onChange={set("negative_prompt")}
          placeholder="Elements to avoid..."
          rows={2}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" value={form.notes} onChange={set("notes")} placeholder="Internal notes..." />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_favorite}
          onChange={(e) => setForm((f) => ({ ...f, is_favorite: e.target.checked }))}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-600"
        />
        <Star className={`h-4 w-4 ${form.is_favorite ? "text-yellow-400" : "text-gray-500"}`} />
        <span className="text-sm text-gray-300">Mark as favorite</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initial ? "Update Prompt" : "Create Prompt"}
        </Button>
      </div>
    </form>
  );
}
