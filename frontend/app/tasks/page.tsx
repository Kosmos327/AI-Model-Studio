"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import TaskForm from "@/components/TaskForm";
import { getTasks, getCharacters, getPrompts, createTask, updateTaskStatus, deleteTask } from "@/lib/api";
import type { GenerationTask, Character, PromptTemplate, TaskFormData, TaskStatus } from "@/types";
import { format } from "date-fns";

export default function TasksPage() {
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [charFilter, setCharFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [engineFilter, setEngineFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tsks, chars, proms] = await Promise.all([
        getTasks({
          size: 200,
          character_id: charFilter ? Number(charFilter) : undefined,
          status: statusFilter || undefined,
          engine: engineFilter || undefined,
        }),
        getCharacters({ size: 100 }),
        getPrompts({ size: 200 }),
      ]);
      setTasks(tsks.items);
      setCharacters(chars.items);
      setPrompts(proms.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [charFilter, statusFilter, engineFilter]);

  const handleCreate = async (data: TaskFormData) => {
    await createTask(data);
    setShowForm(false);
    fetchData();
  };

  const handleStatusUpdate = async (task: GenerationTask, status: TaskStatus) => {
    await updateTaskStatus(task.id, status);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status } : t));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Task Queue</h1>
          <p className="text-gray-400 mt-1">Generation tasks and jobs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" />New Task</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={charFilter} onValueChange={setCharFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All characters" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All characters</SelectItem>
            {characters.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={engineFilter} onValueChange={setEngineFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All engines" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All engines</SelectItem>
            <SelectItem value="midjourney">Midjourney</SelectItem>
            <SelectItem value="dalle">DALL·E</SelectItem>
            <SelectItem value="stable_diffusion">Stable Diffusion</SelectItem>
            <SelectItem value="runway">Runway</SelectItem>
            <SelectItem value="kling">Kling</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No tasks found</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" />Create Task</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id} className="hover:border-gray-600 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-200">{t.title}</h3>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="capitalize">{t.engine}</span>
                      <span className="capitalize">{t.task_type.replace(/_/g, " ")}</span>
                      {t.character_name && <span>{t.character_name}</span>}
                      <span>{t.result_count_actual}/{t.result_count_expected} results</span>
                      {t.created_at && <span>{format(new Date(t.created_at), "MMM d, yyyy")}</span>}
                    </div>
                    {t.description && <p className="text-sm text-gray-400 mt-1 line-clamp-1">{t.description}</p>}
                    {t.error_message && <p className="text-xs text-red-400 mt-1">{t.error_message}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {t.status === "queued" && (
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleStatusUpdate(t, "running")}>
                        Start
                      </Button>
                    )}
                    {t.status === "running" && (
                      <>
                        <Button size="sm" variant="outline" className="text-xs h-7 text-green-400 border-green-700" onClick={() => handleStatusUpdate(t, "done")}>Done</Button>
                        <Button size="sm" variant="outline" className="text-xs h-7 text-red-400 border-red-700" onClick={() => handleStatusUpdate(t, "failed")}>Fail</Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
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
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <TaskForm characters={characters} prompts={prompts} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
