"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import CharacterForm from "@/components/CharacterForm";
import {
  getCharacter,
  updateCharacter,
  deleteCharacter,
  getConsistencyProfile,
  getReferences,
  getPrompts,
  getTasks,
  getMediaAssets,
  getPlanItems,
} from "@/lib/api";
import type { Character, ConsistencyProfile, ReferenceAsset, PromptTemplate, GenerationTask, MediaAsset, ContentPlanItem, CharacterFormData } from "@/types";
import MediaCard from "@/components/MediaCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [character, setCharacter] = useState<Character | null>(null);
  const [profile, setProfile] = useState<ConsistencyProfile | null>(null);
  const [references, setReferences] = useState<ReferenceAsset[]>([]);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [planItems, setPlanItems] = useState<ContentPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(id) || id <= 0) return;
    setLoading(true);
    Promise.all([
      getCharacter(id),
      getConsistencyProfile(id).catch(() => null),
      getReferences({ character_id: id, size: 50 }),
      getPrompts({ character_id: id, size: 50 }),
      getTasks({ character_id: id, size: 50 }),
      getMediaAssets({ character_id: id, size: 50 }),
      getPlanItems({ character_id: id, size: 50 }),
    ])
      .then(([char, prof, refs, proms, tsks, med, plan]) => {
        setCharacter(char);
        setProfile(prof);
        setReferences(refs.items);
        setPrompts(proms.items);
        setTasks(tsks.items);
        setMedia(med.items);
        setPlanItems(plan.items);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (data: CharacterFormData) => {
    const updated = await updateCharacter(id, data);
    setCharacter(updated);
    setShowEdit(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete character "${character?.name}"? This cannot be undone.`)) return;
    await deleteCharacter(id);
    router.push("/characters");
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse">Loading...</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;
  if (!character) return <div className="p-8 text-gray-400">Character not found</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/characters">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl text-indigo-300 font-bold">
          {character.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">{character.name}</h1>
          <p className="text-gray-400">{character.archetype}</p>
        </div>
        <div className="ml-4">
          <StatusBadge status={character.status} />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="references">References ({references.length})</TabsTrigger>
          <TabsTrigger value="prompts">Prompts ({prompts.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="media">Media ({media.length})</TabsTrigger>
          <TabsTrigger value="planner">Planner ({planItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm text-gray-400">Identity</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Archetype" value={character.archetype} />
                <InfoRow label="Age Style" value={character.age_style} />
                <InfoRow label="Nationality" value={character.nationality_style} />
                <InfoRow label="Tone of Voice" value={character.tone_of_voice} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-gray-400">Personality</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Core Traits" value={character.core_traits} />
                <InfoRow label="Forbidden Traits" value={character.forbidden_traits} />
                <InfoRow label="Style Notes" value={character.style_notes} />
              </CardContent>
            </Card>
            {character.bio_short && (
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-sm text-gray-400">Bio</CardTitle></CardHeader>
                <CardContent className="text-sm text-gray-300 space-y-2">
                  {character.bio_short && <p className="font-medium">{character.bio_short}</p>}
                  {character.bio_full && <p className="text-gray-400">{character.bio_full}</p>}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="consistency" className="mt-4">
          {!profile ? (
            <div className="text-center py-16 text-gray-500">No consistency profile yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-sm text-gray-400">Visual Style</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <InfoRow label="Face Prompt" value={profile.face_prompt} />
                  <InfoRow label="Body Prompt" value={profile.body_prompt} />
                  <InfoRow label="Default Outfit" value={profile.outfit_default} />
                  <InfoRow label="Lighting" value={profile.lighting_style} />
                  <InfoRow label="Color Palette" value={profile.color_palette} />
                  <InfoRow label="Camera Style" value={profile.camera_style} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm text-gray-400">Midjourney References</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <InfoRow label="SREF URL" value={profile.midjourney_sref_url} />
                  <InfoRow label="CREF URL" value={profile.midjourney_cref_url} />
                  <InfoRow label="Negative Prompt" value={profile.negative_prompt} />
                  <InfoRow label="Notes" value={profile.notes} />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="references" className="mt-4">
          {references.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No references yet. <Link href="/references" className="text-indigo-400 hover:underline">Upload some</Link></div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {references.map((r) => {
                const url = r.file_url ? (r.file_url.startsWith("http") ? r.file_url : `${API_URL}${r.file_url}`) : null;
                return (
                  <div key={r.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <div className="aspect-square bg-gray-900 flex items-center justify-center">
                      {url ? <img src={url} alt={r.category} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <span className="text-gray-600 text-xs">{r.asset_type}</span>}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-300 capitalize">{r.category}</p>
                      {r.is_master && <p className="text-xs text-yellow-500">★ Master</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prompts" className="mt-4">
          {prompts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No prompts yet. <Link href="/prompts" className="text-indigo-400 hover:underline">Create some</Link></div>
          ) : (
            <div className="space-y-3">
              {prompts.map((p) => (
                <Card key={p.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-200">{p.title}</h3>
                          {p.is_favorite && <span className="text-yellow-400 text-sm">★</span>}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{p.prompt_type} · {p.category}</p>
                        <p className="text-sm text-gray-400 line-clamp-2">{p.prompt_text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          {tasks.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No tasks yet</div>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <Card key={t.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-200">{t.title}</h3>
                        <p className="text-xs text-gray-500">{t.engine} · {t.task_type.replace(/_/g, " ")} · {t.result_count_actual}/{t.result_count_expected} results</p>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          {media.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No media yet</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {media.map((m) => <MediaCard key={m.id} asset={m} onClick={() => {}} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="planner" className="mt-4">
          {planItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No content planned yet</div>
          ) : (
            <div className="space-y-3">
              {planItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-200">{item.title}</h3>
                        <p className="text-xs text-gray-500">{item.platform}{item.scheduled_date ? ` · ${item.scheduled_date}` : ""}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Character</DialogTitle>
          </DialogHeader>
          <CharacterForm initial={character} onSubmit={handleUpdate} onCancel={() => setShowEdit(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className="text-gray-300">{value}</span>
    </div>
  );
}
