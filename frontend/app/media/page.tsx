"use client";

import { useEffect, useState } from "react";
import { Upload, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MediaGrid from "@/components/MediaGrid";
import { getMediaAssets, getCharacters, uploadMediaAsset, updateMediaAsset, deleteMediaAsset } from "@/lib/api";
import type { MediaAsset, Character, PublishStatus } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [charFilter, setCharFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bestFilter, setBestFilter] = useState("all");
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [med, chars] = await Promise.all([
        getMediaAssets({
          size: 200,
          character_id: charFilter !== "all" ? Number(charFilter) : undefined,
          asset_type: typeFilter !== "all" ? typeFilter : undefined,
          publish_status: statusFilter !== "all" ? statusFilter : undefined,
          is_best: bestFilter === "true" ? true : bestFilter === "false" ? false : undefined,
        }),
        getCharacters({ size: 100 }),
      ]);
      setAssets(med.items);
      setCharacters(chars.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [charFilter, typeFilter, statusFilter, bestFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await uploadMediaAsset(fd);
      fetchData();
    } finally {
      setUploading(false);
    }
  };

  const handleToggleBest = async (asset: MediaAsset) => {
    const updated = await updateMediaAsset(asset.id, { is_best: !asset.is_best });
    setAssets((prev) => prev.map((a) => a.id === asset.id ? updated : a));
    if (selected?.id === asset.id) setSelected(updated);
  };

  const handleStatusChange = async (asset: MediaAsset, status: PublishStatus) => {
    const updated = await updateMediaAsset(asset.id, { publish_status: status });
    setAssets((prev) => prev.map((a) => a.id === asset.id ? updated : a));
    if (selected?.id === asset.id) setSelected(updated);
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (!confirm("Delete this media asset?")) return;
    await deleteMediaAsset(asset.id);
    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    setSelected(null);
  };

  const handleNotesUpdate = async (asset: MediaAsset, notes: string) => {
    const updated = await updateMediaAsset(asset.id, { notes });
    setAssets((prev) => prev.map((a) => a.id === asset.id ? updated : a));
    setSelected(updated);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Media Library</h1>
          <p className="text-gray-400 mt-1">Generated images and videos</p>
        </div>
        <label className="cursor-pointer">
          <Button asChild disabled={uploading}>
            <span><Upload className="h-4 w-4 mr-1" />{uploading ? "Uploading..." : "Upload"}</span>
          </Button>
          <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={charFilter} onValueChange={setCharFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All characters" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All characters</SelectItem>
            {characters.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={bestFilter} onValueChange={setBestFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All media" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All media</SelectItem>
            <SelectItem value="true">Best only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse">Loading media...</div>
      ) : (
        <MediaGrid assets={assets} onAssetClick={setSelected} />
      )}

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Media Asset #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <MediaDetail
              asset={selected}
              onToggleBest={() => handleToggleBest(selected)}
              onStatusChange={(s) => handleStatusChange(selected, s)}
              onDelete={() => handleDelete(selected)}
              onNotesUpdate={(notes) => handleNotesUpdate(selected, notes)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaDetail({
  asset,
  onToggleBest,
  onStatusChange,
  onDelete,
  onNotesUpdate,
}: {
  asset: MediaAsset;
  onToggleBest: () => void;
  onStatusChange: (s: PublishStatus) => void;
  onDelete: () => void;
  onNotesUpdate: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(asset.notes ?? "");
  const imgUrl = asset.file_url
    ? (asset.file_url.startsWith("http") ? asset.file_url : `${API_URL}${asset.file_url}`)
    : null;

  return (
    <div className="space-y-4">
      {imgUrl && (
        <div className="rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center max-h-80">
          <img src={imgUrl} alt="Media" className="max-w-full max-h-80 object-contain" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div><span className="text-gray-500">Character: </span><span className="text-gray-200">{asset.character_name ?? "—"}</span></div>
          <div><span className="text-gray-500">Type: </span><span className="text-gray-200 capitalize">{asset.asset_type}</span></div>
          <div><span className="text-gray-500">Quality: </span><span className="text-gray-200">{asset.quality_score ?? "—"}/10</span></div>
          <div><span className="text-gray-500">Consistency: </span><span className="text-gray-200">{asset.consistency_score ?? "—"}/10</span></div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Status: </span>
            <Select value={asset.publish_status} onValueChange={(v) => onStatusChange(v as PublishStatus)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <button onClick={onToggleBest} className="flex items-center gap-1 text-sm hover:text-yellow-400 transition-colors">
              <Star className={`h-4 w-4 ${asset.is_best ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`} />
              <span className="text-gray-400">{asset.is_best ? "Best asset" : "Mark as best"}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onNotesUpdate(notes)}
          rows={2}
          placeholder="Add notes..."
        />
      </div>
      <div className="flex justify-end">
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1" />Delete
        </Button>
      </div>
    </div>
  );
}
