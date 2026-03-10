import MediaCard from "@/components/MediaCard";
import type { MediaAsset } from "@/types";

interface MediaGridProps {
  assets: MediaAsset[];
  onAssetClick: (asset: MediaAsset) => void;
}

export default function MediaGrid({ assets, onAssetClick }: MediaGridProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No media assets yet</p>
        <p className="text-sm mt-1">Upload some media to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {assets.map((asset) => (
        <MediaCard key={asset.id} asset={asset} onClick={onAssetClick} />
      ))}
    </div>
  );
}
