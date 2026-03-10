"use client";

import { Star, Film, ImageIcon } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import type { MediaAsset } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface MediaCardProps {
  asset: MediaAsset;
  onClick: (asset: MediaAsset) => void;
}

export default function MediaCard({ asset, onClick }: MediaCardProps) {
  const imgUrl = asset.file_url
    ? (asset.file_url.startsWith("http") ? asset.file_url : `${API_URL}${asset.file_url}`)
    : null;

  return (
    <div
      onClick={() => onClick(asset)}
      className="relative group bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
    >
      <div className="aspect-square bg-gray-800 flex items-center justify-center overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={`Media ${asset.id}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-600">
            {asset.asset_type === "video" ? (
              <Film className="h-10 w-10" />
            ) : (
              <ImageIcon className="h-10 w-10" />
            )}
            <span className="text-xs">No preview</span>
          </div>
        )}
        {asset.is_best && (
          <div className="absolute top-2 right-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 drop-shadow" />
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <StatusBadge status={asset.publish_status} />
          {asset.character_name && (
            <span className="text-xs text-gray-400 truncate max-w-[80px]">{asset.character_name}</span>
          )}
        </div>
        {(asset.quality_score !== null || asset.consistency_score !== null) && (
          <div className="flex gap-2">
            {asset.quality_score !== null && asset.quality_score !== undefined && (
              <span className="text-xs bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-gray-300">
                Q: {asset.quality_score}/10
              </span>
            )}
            {asset.consistency_score !== null && asset.consistency_score !== undefined && (
              <span className="text-xs bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-gray-300">
                C: {asset.consistency_score}/10
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
