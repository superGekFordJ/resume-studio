'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useResumeStore } from '@/stores/resumeStore';
import {
  Calendar,
  History,
  Save,
  RotateCcw,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import type { VersionSnapshot } from '@/stores/types';

interface VersionSnapshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VersionSnapshotDialog({
  open,
  onOpenChange,
}: VersionSnapshotDialogProps) {
  const { t } = useTranslation(['components', 'common']);
  const versionSnapshots = useResumeStore((state) => state.versionSnapshots);
  const createSnapshot = useResumeStore((state) => state.createSnapshot);
  const restoreSnapshot = useResumeStore((state) => state.restoreSnapshot);
  const deleteSnapshot = useResumeStore((state) => state.deleteSnapshot);
  const updateSnapshotName = useResumeStore(
    (state) => state.updateSnapshotName
  );

  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateSnapshot = () => {
    if (newSnapshotName.trim()) {
      createSnapshot(newSnapshotName.trim());
      setNewSnapshotName('');
    }
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    if (confirm(t('VersionSnapshotDialog.restoreConfirm'))) {
      restoreSnapshot(snapshotId);
      onOpenChange(false);
    }
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    if (confirm(t('VersionSnapshotDialog.deleteConfirm'))) {
      deleteSnapshot(snapshotId);
    }
  };

  const handleStartEdit = (snapshot: VersionSnapshot) => {
    setEditingId(snapshot.id);
    setEditingName(snapshot.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateSnapshotName(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 flex-shrink-0">
          <DialogTitle className="font-headline text-2xl flex items-center">
            <History className="mr-2 h-6 w-6 text-primary" />
            {t('VersionSnapshotDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('VersionSnapshotDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder={t('VersionSnapshotDialog.placeholder')}
              value={newSnapshotName}
              onChange={(e) => setNewSnapshotName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSnapshot()}
              className="flex-1"
            />
            <Button
              onClick={handleCreateSnapshot}
              disabled={!newSnapshotName.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {t('VersionSnapshotDialog.saveButton')}
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <div className="py-4 space-y-3">
            {versionSnapshots.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('VersionSnapshotDialog.noVersions')}
              </p>
            ) : (
              versionSnapshots
                .slice()
                .reverse()
                .map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingId === snapshot.id ? (
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              className="h-8 flex-1"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <h3 className="font-semibold text-base mb-1">
                            {snapshot.name}
                          </h3>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(snapshot.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <span className="text-xs">
                            {t('VersionSnapshotDialog.schemaVersion', {
                              version: snapshot.schemaVersion,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRestoreSnapshot(snapshot.id)}
                          className="h-8 px-3"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {t('VersionSnapshotDialog.restore')}
                        </Button>
                        {editingId !== snapshot.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(snapshot)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSnapshot(snapshot.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
          <ScrollBar />
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('dialog.close', { ns: 'common' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
