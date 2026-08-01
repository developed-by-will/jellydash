'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, GripVertical, Library, ListVideo, Loader2, Lock } from 'lucide-react';
import { DragEventHandler, useState } from 'react';

export type OrderableTile = {
  id: string;
  name: string;
  isPlaylists?: boolean;
  imageUrl?: string | null;
};

type Props = {
  item: OrderableTile;
  excluded: boolean;
  draggable?: boolean;
  pinned?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  isPending?: boolean;
  onToggleExclude?: () => void;
  onDragStart?: DragEventHandler<HTMLDivElement>;
  onDragOver?: DragEventHandler<HTMLDivElement>;
  onDrop?: DragEventHandler<HTMLDivElement>;
  onDragEnd?: DragEventHandler<HTMLDivElement>;
};

// Small fixed-size thumbnail with a muted icon fallback shown underneath at all times - the real
// image (if any) just layers on top once it loads, so a broken/slow URL never leaves a blank gap.
function Thumbnail({ item }: Readonly<{ item: OrderableTile }>) {
  const [failed, setFailed] = useState(false);
  const showImage = item.imageUrl && !failed;

  return (
    <div className="relative w-24 h-14 shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
      {item.isPlaylists ? (
        <ListVideo className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Library className="h-5 w-5 text-muted-foreground" />
      )}

      {showImage && (
        // Plain <img> rather than next/image - these are tiny decorative thumbnails from a
        // dynamic Jellyfin host, not worth the remotePatterns/layout ceremony next/image wants.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl!}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function Tile({
  item,
  excluded,
  draggable = false,
  pinned = false,
  isDragging = false,
  isDropTarget = false,
  isPending = false,
  onToggleExclude,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}: Readonly<Props>) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 bg-card transition-colors',
        draggable && 'cursor-grab active:cursor-grabbing',
        (excluded || pinned) && 'opacity-50',
        isDragging && 'opacity-30',
        isDropTarget && 'border-primary border-dashed'
      )}
    >
      {pinned ? (
        <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
      ) : draggable ? (
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      ) : (
        <div className="w-4 shrink-0" />
      )}

      <span className="flex-1 text-sm font-medium truncate">{item.name}</span>

      <Thumbnail item={item} />

      {pinned && (
        <Badge variant="secondary" className="text-xs">
          1st
        </Badge>
      )}

      {!item.isPlaylists && onToggleExclude && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleExclude}
          disabled={isPending}
          title={excluded ? 'Show on home screen' : 'Exclude from home screen'}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : excluded ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
