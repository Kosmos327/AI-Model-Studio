"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadReference } from "@/lib/api";
import type { Character } from "@/types";

interface ReferenceUploadZoneProps {
  characters: Character[];
  onUploaded: () => void;
}

export default function ReferenceUploadZone({ characters, onUploaded }: ReferenceUploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [characterId, setCharacterId] = useState("none");
  const [category, setCategory] = useState("face");
  const [isMaster, setIsMaster] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (characterId && characterId !== "none") fd.append("character_id", characterId);
      fd.append("category", category);
      fd.append("is_master", String(isMaster));
      if (notes) fd.append("notes", notes);
      await uploadReference(fd);
      onUploaded();
      setFile(null);
      setPreview(null);
      setNotes("");
      setCharacterId("none");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-700 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragging ? "border-indigo-500 bg-indigo-500/10" : "border-gray-600 hover:border-gray-500"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {preview ? (
          <div className="flex flex-col items-center gap-2">
            <img src={preview} alt="Preview" className="max-h-32 rounded-md object-contain" />
            <p className="text-sm text-gray-300">{file?.name}</p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-12 w-12 text-gray-500" />
            <p className="text-sm text-gray-300">{file.name}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-gray-500" />
            <p className="text-gray-400 text-sm">
              Drop files here or <span className="text-indigo-400">browse</span>
            </p>
            <p className="text-gray-600 text-xs">Images and videos supported</p>
          </div>
        )}
      </div>
      {file && (
        <div className="space-y-3 bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Character</Label>
              <Select value={characterId} onValueChange={setCharacterId}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {characters.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["face", "body", "outfit", "background", "style", "other"].map((c) => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isMaster}
              onChange={(e) => setIsMaster(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-600"
            />
            <span className="text-sm text-gray-300">Mark as master reference</span>
          </label>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setFile(null); setPreview(null); }}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
            <Button size="sm" onClick={handleUpload} disabled={loading}>
              <Upload className="h-4 w-4 mr-1" />
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
