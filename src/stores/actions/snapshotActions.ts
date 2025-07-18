import { StateCreator } from 'zustand';
import { ResumeState, ResumeActions, VersionSnapshot } from '../types';
import { ResumeData } from '@/types/resume';

export interface SnapshotActions {
  createSnapshot: (name: string, dataToSnapshot?: ResumeData) => void;
  restoreSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;
  updateSnapshotName: (snapshotId: string, newName: string) => void;
}

export const createSnapshotActions: StateCreator<
  ResumeState & ResumeActions,
  [],
  [],
  SnapshotActions
> = (set) => ({
  createSnapshot: (name, dataToSnapshot) =>
    set((state) => {
      const data = dataToSnapshot || state.resumeData;
      const schemaVersion =
        'schemaVersion' in data ? data.schemaVersion : '1.0.0';

      const clonedData = JSON.parse(JSON.stringify(data));
      if (clonedData.personalDetails) {
        clonedData.personalDetails.avatar = '';
      }

      const newSnapshot: VersionSnapshot = {
        id: `snapshot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name,
        createdAt: new Date().toISOString(),
        schemaVersion,
        resumeData: clonedData,
      };

      return {
        versionSnapshots: [...state.versionSnapshots, newSnapshot],
      };
    }),

  restoreSnapshot: (snapshotId) =>
    set((state) => {
      const snapshot = state.versionSnapshots.find((s) => s.id === snapshotId);
      if (!snapshot) {
        console.error(`Snapshot ${snapshotId} not found`);
        return state;
      }

      const currentSchemaVersion =
        'schemaVersion' in state.resumeData
          ? state.resumeData.schemaVersion
          : '1.0.0';

      if (snapshot.schemaVersion !== currentSchemaVersion) {
        console.warn(
          `Schema version mismatch! Snapshot version: ${snapshot.schemaVersion}, ` +
            `Current version: ${currentSchemaVersion}. Data migration may be needed.`
        );
      }

      return {
        resumeData: JSON.parse(JSON.stringify(snapshot.resumeData)),
      };
    }),

  deleteSnapshot: (snapshotId) =>
    set((state) => ({
      versionSnapshots: state.versionSnapshots.filter(
        (s) => s.id !== snapshotId
      ),
    })),

  updateSnapshotName: (snapshotId, newName) =>
    set((state) => ({
      versionSnapshots: state.versionSnapshots.map((s) =>
        s.id === snapshotId ? { ...s, name: newName } : s
      ),
    })),
});
