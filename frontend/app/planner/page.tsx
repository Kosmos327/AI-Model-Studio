"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar, List, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { getPlanItems, getCharacters, createPlanItem, updatePlanItem, deletePlanItem } from "@/lib/api";
import type { ContentPlanItem, Character, PlanItemFormData, PlanStatus } from "@/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter", "LinkedIn", "Facebook", "Pinterest", "Other"];

export default function PlannerPage() {
  const [items, setItems] = useState<ContentPlanItem[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContentPlanItem | null>(null);
  const [charFilter, setCharFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plan, chars] = await Promise.all([
        getPlanItems({ size: 200, character_id: charFilter !== "all" ? Number(charFilter) : undefined, status: statusFilter !== "all" ? statusFilter : undefined }),
        getCharacters({ size: 100 }),
      ]);
      setItems(plan.items);
      setCharacters(chars.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [charFilter, statusFilter]);

  const handleCreate = async (data: PlanItemFormData) => {
    await createPlanItem(data);
    setShowForm(false);
    fetchData();
  };

  const handleUpdate = async (data: PlanItemFormData) => {
    if (!editing) return;
    await updatePlanItem(editing.id, data);
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this plan item?")) return;
    await deletePlanItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Content Planner</h1>
          <p className="text-gray-400 mt-1">Schedule and manage content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView("list")} className={view === "list" ? "bg-gray-800" : ""}>
            <List className="h-4 w-4 mr-1" />List
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView("calendar")} className={view === "calendar" ? "bg-gray-800" : ""}>
            <Calendar className="h-4 w-4 mr-1" />Calendar
          </Button>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" />New Item</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={charFilter} onValueChange={setCharFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All characters" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All characters</SelectItem>
            {characters.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="skipped">Skipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse">Loading planner...</div>
      ) : view === "list" ? (
        <ListView items={items} onEdit={setEditing} onDelete={handleDelete} />
      ) : (
        <CalendarView
          items={items}
          days={calendarDays}
          currentMonth={currentMonth}
          onPrevMonth={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))}
          onNextMonth={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))}
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New Content Item</DialogTitle></DialogHeader>
          <PlanItemForm characters={characters} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Edit Content Item</DialogTitle></DialogHeader>
          {editing && (
            <PlanItemForm initial={editing} characters={characters} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ListView({ items, onEdit, onDelete }: { items: ContentPlanItem[]; onEdit: (i: ContentPlanItem) => void; onDelete: (id: number) => void; }) {
  if (items.length === 0) return <div className="text-center py-16 text-gray-500">No content items yet</div>;
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-200">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>{item.platform}</span>
                  {item.character_name && <span>{item.character_name}</span>}
                  {item.scheduled_date && <span>{format(parseISO(item.scheduled_date), "MMM d, yyyy")}</span>}
                </div>
                {item.caption && <p className="text-sm text-gray-400 mt-1 line-clamp-1">{item.caption}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Edit className="h-4 w-4 text-gray-400" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CalendarView({ items, days, currentMonth, onPrevMonth, onNextMonth }: {
  items: ContentPlanItem[];
  days: Date[];
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const getItemsForDay = (day: Date) =>
    items.filter((item) => item.scheduled_date && isSameDay(parseISO(item.scheduled_date), day));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onPrevMonth}>← Prev</Button>
        <h2 className="text-lg font-semibold text-gray-200">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button variant="outline" size="sm" onClick={onNextMonth}>Next →</Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 py-2">{d}</div>
        ))}
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dayItems = getItemsForDay(day);
          return (
            <div key={day.toISOString()} className={`min-h-[80px] rounded-md border p-1 text-xs ${dayItems.length > 0 ? "border-indigo-500/30 bg-indigo-500/5" : "border-gray-800"}`}>
              <p className="text-gray-400 mb-1">{format(day, "d")}</p>
              {dayItems.map((item) => (
                <div key={item.id} className="truncate rounded px-1 py-0.5 bg-indigo-600/20 text-indigo-300 mb-0.5">
                  {item.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlanItemForm({ initial, characters, onSubmit, onCancel }: {
  initial?: ContentPlanItem;
  characters: Character[];
  onSubmit: (data: PlanItemFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PlanItemFormData>({
    character_id: initial?.character_id,
    title: initial?.title ?? "",
    platform: initial?.platform ?? "Instagram",
    caption: initial?.caption ?? "",
    hashtags: initial?.hashtags ?? "",
    scheduled_date: initial?.scheduled_date ?? "",
    status: initial?.status ?? "planned",
    notes: initial?.notes ?? "",
  });

  const set = (field: keyof PlanItemFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
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
      {error && <div className="rounded-md bg-red-900/30 border border-red-700 px-4 py-2 text-sm text-red-300">{error}</div>}
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input value={form.title} onChange={set("title")} placeholder="e.g. Sofia Beach Post" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Character</Label>
          <Select value={form.character_id ? String(form.character_id) : "none"} onValueChange={(v) => setForm((f) => ({ ...f, character_id: v !== "none" ? Number(v) : undefined }))}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {characters.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Platform</Label>
          <Select value={form.platform} onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Scheduled Date</Label>
          <Input type="date" value={form.scheduled_date} onChange={set("scheduled_date")} />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as PlanStatus }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Caption</Label>
        <Textarea value={form.caption} onChange={set("caption")} placeholder="Post caption..." rows={3} />
      </div>
      <div className="space-y-1.5">
        <Label>Hashtags</Label>
        <Input value={form.hashtags} onChange={set("hashtags")} placeholder="#lifestyle #ai #model" />
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Input value={form.notes} onChange={set("notes")} placeholder="Internal notes..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : initial ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
