"use client";

import { useState } from "react";
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
import type { Character, CharacterFormData, CharacterStatus } from "@/types";

interface CharacterFormProps {
  initial?: Character;
  onSubmit: (data: CharacterFormData) => Promise<void>;
  onCancel: () => void;
}

const ARCHETYPES = [
  "Lifestyle Influencer",
  "Fitness Coach",
  "Fashion Model",
  "Travel Blogger",
  "Food Creator",
  "Tech Reviewer",
  "Beauty Guru",
  "Business Coach",
  "Artist",
  "Entertainer",
  "Other",
];

export default function CharacterForm({ initial, onSubmit, onCancel }: CharacterFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CharacterFormData>({
    name: initial?.name ?? "",
    archetype: initial?.archetype ?? "",
    age_style: initial?.age_style ?? "",
    nationality_style: initial?.nationality_style ?? "",
    tone_of_voice: initial?.tone_of_voice ?? "",
    bio_short: initial?.bio_short ?? "",
    bio_full: initial?.bio_full ?? "",
    core_traits: initial?.core_traits ?? "",
    forbidden_traits: initial?.forbidden_traits ?? "",
    style_notes: initial?.style_notes ?? "",
    status: initial?.status ?? "draft",
  });

  const set = (field: keyof CharacterFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.archetype.trim()) {
      setError("Archetype is required");
      return;
    }
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={form.name} onChange={set("name")} placeholder="e.g. Sofia" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="archetype">Archetype *</Label>
          <Select
            value={form.archetype}
            onValueChange={(v) => setForm((f) => ({ ...f, archetype: v }))}
          >
            <SelectTrigger id="archetype">
              <SelectValue placeholder="Select archetype" />
            </SelectTrigger>
            <SelectContent>
              {ARCHETYPES.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="age_style">Age Style</Label>
          <Input id="age_style" value={form.age_style} onChange={set("age_style")} placeholder="e.g. mid-20s" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nationality_style">Nationality Style</Label>
          <Input id="nationality_style" value={form.nationality_style} onChange={set("nationality_style")} placeholder="e.g. Mediterranean" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tone_of_voice">Tone of Voice</Label>
        <Input id="tone_of_voice" value={form.tone_of_voice} onChange={set("tone_of_voice")} placeholder="e.g. warm, witty, motivational" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio_short">Short Bio</Label>
        <Textarea id="bio_short" value={form.bio_short} onChange={set("bio_short")} placeholder="One-line description..." rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio_full">Full Bio</Label>
        <Textarea id="bio_full" value={form.bio_full} onChange={set("bio_full")} placeholder="Detailed background..." rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="core_traits">Core Traits</Label>
          <Textarea id="core_traits" value={form.core_traits} onChange={set("core_traits")} placeholder="confident, curious..." rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="forbidden_traits">Forbidden Traits</Label>
          <Textarea id="forbidden_traits" value={form.forbidden_traits} onChange={set("forbidden_traits")} placeholder="aggressive, vulgar..." rows={2} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="style_notes">Style Notes</Label>
        <Textarea id="style_notes" value={form.style_notes} onChange={set("style_notes")} placeholder="Visual style preferences..." rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Select
          value={form.status}
          onValueChange={(v) => setForm((f) => ({ ...f, status: v as CharacterStatus }))}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initial ? "Update Character" : "Create Character"}
        </Button>
      </div>
    </form>
  );
}
