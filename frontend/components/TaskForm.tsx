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
import type {
  Character,
  PromptTemplate,
  GenerationTask,
  TaskFormData,
  TaskType,
  Engine,
  TaskStatus,
} from "@/types";

interface TaskFormProps {
  initial?: GenerationTask;
  characters: Character[];
  prompts: PromptTemplate[];
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({ initial, characters, prompts, onSubmit, onCancel }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormData>({
    character_id: initial?.character_id,
    title: initial?.title ?? "",
    task_type: initial?.task_type ?? "generate_image",
    engine: initial?.engine ?? "midjourney",
    description: initial?.description ?? "",
    prompt_template_id: initial?.prompt_template_id,
    result_count_expected: initial?.result_count_expected ?? 4,
    status: initial?.status ?? "queued",
  });

  const set = (field: keyof TaskFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ ...form, result_count_expected: Number(form.result_count_expected) });
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
        <Input id="title" value={form.title} onChange={set("title")} placeholder="e.g. Sofia Beach Portraits" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Character</Label>
          <Select
            value={form.character_id ? String(form.character_id) : ""}
            onValueChange={(v) => setForm((f) => ({ ...f, character_id: v ? Number(v) : undefined }))}
          >
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {characters.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Task Type *</Label>
          <Select
            value={form.task_type}
            onValueChange={(v) => setForm((f) => ({ ...f, task_type: v as TaskType }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="generate_image">Generate Image</SelectItem>
              <SelectItem value="generate_reel">Generate Reel</SelectItem>
              <SelectItem value="generate_caption">Generate Caption</SelectItem>
              <SelectItem value="upscale">Upscale</SelectItem>
              <SelectItem value="edit">Edit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Engine *</Label>
          <Select
            value={form.engine}
            onValueChange={(v) => setForm((f) => ({ ...f, engine: v as Engine }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="midjourney">Midjourney</SelectItem>
              <SelectItem value="dalle">DALL·E</SelectItem>
              <SelectItem value="stable_diffusion">Stable Diffusion</SelectItem>
              <SelectItem value="runway">Runway</SelectItem>
              <SelectItem value="kling">Kling</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="result_count">Expected Results</Label>
          <Input
            id="result_count"
            type="number"
            min="1"
            max="100"
            value={form.result_count_expected}
            onChange={set("result_count_expected")}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Prompt Template</Label>
        <Select
          value={form.prompt_template_id ? String(form.prompt_template_id) : ""}
          onValueChange={(v) => setForm((f) => ({ ...f, prompt_template_id: v ? Number(v) : undefined }))}
        >
          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {prompts.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={form.description} onChange={set("description")} placeholder="Additional instructions..." rows={3} />
      </div>
      {initial && (
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm((f) => ({ ...f, status: v as TaskStatus }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initial ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
