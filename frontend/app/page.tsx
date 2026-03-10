"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ListTodo, Film, Calendar, Plus, Upload, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { getDashboard } from "@/lib/api";
import type { DashboardStats } from "@/types";
import { format } from "date-fns";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-md bg-red-900/30 border border-red-700 px-4 py-3 text-red-300">
          Failed to load dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-gray-400 mt-1">AI Model Studio overview</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/references"><Upload className="h-4 w-4 mr-1" />Upload References</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/tasks"><Plus className="h-4 w-4 mr-1" />New Task</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/characters"><Plus className="h-4 w-4 mr-1" />New Character</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Characters" value={stats?.total_characters ?? 0} sub={`${stats?.active_characters ?? 0} active`} icon={<Users className="h-5 w-5 text-indigo-400" />} href="/characters" />
        <StatCard label="Pending Tasks" value={stats?.pending_tasks ?? 0} sub="queued or running" icon={<ListTodo className="h-5 w-5 text-yellow-400" />} href="/tasks" />
        <StatCard label="Media Assets" value={stats?.total_media ?? 0} sub="all types" icon={<Film className="h-5 w-5 text-green-400" />} href="/media" />
        <StatCard label="Upcoming Content" value={stats?.upcoming_content ?? 0} sub="next 7 days" icon={<Calendar className="h-5 w-5 text-purple-400" />} href="/planner" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Characters</CardTitle>
              <Link href="/characters" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(stats?.recent_characters ?? []).length === 0 ? (
              <p className="text-sm text-gray-500">No characters yet</p>
            ) : (
              stats?.recent_characters.map((c) => (
                <Link key={c.id} href={`/characters/${c.id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-300 font-medium">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.archetype}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Tasks</CardTitle>
              <Link href="/tasks" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(stats?.recent_tasks ?? []).length === 0 ? (
              <p className="text-sm text-gray-500">No tasks yet</p>
            ) : (
              stats?.recent_tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-200 truncate max-w-[160px]">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.engine} · {t.task_type.replace("_", " ")}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Content</CardTitle>
              <Link href="/planner" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(stats?.upcoming_plan_items ?? []).length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming content</p>
            ) : (
              stats?.upcoming_plan_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-200 truncate max-w-[160px]">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.platform}{item.scheduled_date && ` · ${format(new Date(item.scheduled_date), "MMM d")}`}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, href }: { label: string; value: number; sub: string; icon: React.ReactNode; href: string; }) {
  return (
    <Link href={href}>
      <Card className="hover:border-gray-600 transition-colors cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{sub}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-800">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
