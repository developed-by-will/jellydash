'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

type BrowseResponse = {
  path: string | null;
  parent: string | null;
  folders: string[];
  error?: string;
};

type Props = {
  value: string;
  onChange: (path: string) => void;
  disabled?: boolean;
  error?: string;
};

export default function FolderPicker({ value, onChange, disabled, error }: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [parent, setParent] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async (targetPath: string | null) => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const url = targetPath
        ? `/api/browse-folders?path=${encodeURIComponent(targetPath)}`
        : '/api/browse-folders';
      const res = await fetch(url);
      const data: BrowseResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to browse folder');
      }

      setCurrentPath(data.path);
      setParent(data.parent);
      setFolders(data.folders);
    } catch (err: any) {
      setLoadError(err?.message ?? 'Failed to browse folder');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      load(value || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSelect = () => {
    if (currentPath) {
      onChange(currentPath);
      setOpen(false);
    }
  };

  return (
    <>
      <Label htmlFor="musicPath" className="w-full">
        Music Folder Path
        <div className="flex gap-2 w-full mt-1">
          <div
            id="musicPath"
            className="flex-1 truncate rounded-md border border-input bg-background px-3 py-2 text-sm"
            title={value}
          >
            {value || 'No folder selected'}
          </div>
          <Button type="button" variant="outline" disabled={disabled} onClick={() => setOpen(true)}>
            Browse...
          </Button>
        </div>
      </Label>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Music Folder</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground truncate">{currentPath ?? 'Drives'}</div>

          {loadError && <p className="text-sm text-destructive">{loadError}</p>}

          <div className="max-h-72 overflow-y-auto border rounded-md divide-y">
            {parent !== null && (
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                onClick={() => load(parent)}
                disabled={isLoading}
              >
                .. (up)
              </button>
            )}

            {!isLoading && folders.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No subfolders</div>
            )}

            {folders.map((name) => {
              const childPath = currentPath ? `${currentPath.replace(/\\+$/, '')}\\${name}` : name;
              return (
                <button
                  key={childPath}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                  onClick={() => load(childPath)}
                  disabled={isLoading}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSelect} disabled={!currentPath || isLoading}>
              Select This Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
