"use client";

import { useEffect, useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ReferenceUploadZone from "@/components/ReferenceUploadZone";
import { getReferences, getCharacters, deleteReference } from "@/lib/api";
import type { ReferenceAsset, Character } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ReferencesPage() {
  const [references, setReferences] = useState<ReferenceAsset[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [charFilter, setCharFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [masterFilter, setMasterFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [refs, chars] = await Promise.all([
        getReferences({
          size: 200,
          character_id: charFilter !== "all" ? Number(charFilter) : undefined,
          asset_type: typeFilter !== "all" ? typeFilter : undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          is_master: masterFilter === "true" ? true : masterFilter === "false" ? false : undefined,
        }),
        getCharacters({ size: 100 }),
      ]);
      setReferences(refs.items);
      setCharacters(chars.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [charFilter, typeFilter, categoryFilter, masterFilter]);

  const handleUploaded = () => {
    setShowUpload(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this reference?")) return;
    await deleteReference(id);
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">References</h1>
          <p className="text-gray-400 mt-1">Visual reference library</p>
        </div>
        <Button onClick={() => setShowUpload(true)}><Plus className="h-4 w-4 mr-1" />Upload</Button>
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {["face","body","outfit","background","style","other"].map((c) => (
              <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={masterFilter} onValueChange={setMasterFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All refs" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All refs</SelectItem>
            <SelectItem value="true">Masters only</SelectItem>
            <SelectItem value="false">Non-masters</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse">Loading references...</div>
      ) : references.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No references found</p>
          <Button className="mt-4" onClick={() => setShowUpload(true)}><Plus className="h-4 w-4 mr-1" />Upload Reference</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {references.map((ref) => {
            const url = ref.file_url ? (ref.file_url.startsWith("http") ? ref.file_url : `${API_URL}${ref.file_url}`) : null;
            return (
              <div key={ref.id} className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-500 transition-colors">
                <div className="aspect-square bg-gray-800 flex items-center justify-center overflow-hidden">
                  {url ? (
                    <img src={url} alt={ref.category} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <span className="text-gray-600 text-xs capitalize">{ref.asset_type}</span>
                  )}
                  {ref.is_master && (
                    <div className="absolute top-1 right-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(ref.id)}
                    className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 rounded p-0.5 hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </button>
                </div>
                <div className="p-1.5">
                  <Badge variant="secondary" className="text-xs capitalize">{ref.category}</Badge>
                  {ref.character_name && <p className="text-xs text-gray-500 mt-0.5 truncate">{ref.character_name}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Upload Reference</DialogTitle></DialogHeader>
          <ReferenceUploadZone characters={characters} onUploaded={handleUploaded} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
