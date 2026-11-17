import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActivityEvent,
  MonitoringProject,
  NotificationItem,
  ResearcherProfile,
  WildlifeRecord,
} from '../types';
import {
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFILE,
  INITIAL_PROJECTS,
  INITIAL_RECORDS,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ResearchContextValue {
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  profile: ResearcherProfile;
  updateProfile: (partial: Partial<ResearcherProfile>) => void;
  projects: MonitoringProject[];
  addProject: (input: {
    name: string;
    description: string;
    location: string;
    cameras: string[];
  }) => MonitoringProject;
  records: WildlifeRecord[];
  addAnalyzedRecords: (newRecords: WildlifeRecord[]) => void;
  confirmPrediction: (recordId: string) => void;
  correctSpecies: (recordId: string, correctedSpecies: string, reviewNotes?: string) => void;
  markUnidentifiable: (recordId: string) => void;
  activities: ActivityEvent[];
  addActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  aiBackendConnected: boolean | null;
  refreshBackendHealth: () => Promise<boolean>;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const ResearchContext = createContext<ResearchContextValue | undefined>(undefined);

export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [profile, setProfile] = useState<ResearcherProfile>(INITIAL_PROFILE);
  const [projects, setProjects] = useState<MonitoringProject[]>(INITIAL_PROJECTS);
  const [records, setRecords] = useState<WildlifeRecord[]>(INITIAL_RECORDS);
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [aiBackendConnected, setAiBackendConnected] = useState<boolean | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const refreshBackendHealth = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        setAiBackendConnected(false);
        return false;
      }
      const data = (await res.json()) as { aiConnected?: boolean };
      const connected = Boolean(data.aiConnected);
      setAiBackendConnected(connected);
      return connected;
    } catch {
      setAiBackendConnected(false);
      return false;
    }
  };

  useEffect(() => {
    void refreshBackendHealth();
  }, []);

  const addActivity = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const entry: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: 'Just now',
    };
    setActivities((prev) => [entry, ...prev].slice(0, 20));
  };

  const login = (email: string, name?: string) => {
    setIsAuthenticated(true);
    setProfile((prev) => ({
      ...prev,
      email: email || prev.email,
      name: name?.trim() ? name.trim() : prev.name,
    }));
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateProfile = (partial: Partial<ResearcherProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  };

  const addProject = (input: {
    name: string;
    description: string;
    location: string;
    cameras: string[];
  }): MonitoringProject => {
    const created: MonitoringProject = {
      id: `proj-${Date.now().toString(36)}`,
      name: input.name.trim(),
      description: input.description.trim(),
      location: input.location.trim(),
      status: 'Active',
      cameras: input.cameras.length > 0 ? input.cameras : ['CAM-01'],
      uploadedImages: 0,
      observationsCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setProjects((prev) => [created, ...prev]);
    addActivity({
      type: 'upload',
      title: 'New monitoring project created',
      detail: `${created.name} · ${created.cameras.length} camera(s)`,
    });
    showToast({
      type: 'success',
      title: 'Project created',
      description: `${created.name} is now active.`,
    });
    return created;
  };

  const addAnalyzedRecords = (newRecords: WildlifeRecord[]) => {
    if (newRecords.length === 0) return;
    setRecords((prev) => [...newRecords, ...prev]);

    const countsByProject: Record<string, { total: number; animals: number }> = {};
    for (const rec of newRecords) {
      if (!countsByProject[rec.projectId]) {
        countsByProject[rec.projectId] = { total: 0, animals: 0 };
      }
      countsByProject[rec.projectId].total += 1;
      if (rec.detectionStatus === 'animal_detected') {
        countsByProject[rec.projectId].animals += 1;
      }
    }

    setProjects((prev) =>
      prev.map((proj) => {
        const delta = countsByProject[proj.id];
        if (!delta) return proj;
        return {
          ...proj,
          uploadedImages: proj.uploadedImages + delta.total,
          observationsCount: proj.observationsCount + delta.animals,
        };
      })
    );
  };

  const confirmPrediction = (recordId: string) => {
    const target = records.find((r) => r.id === recordId);
    if (!target) return;
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              confirmedSpecies: rec.predictedSpecies,
              verificationStatus:
                rec.predictedSpecies === 'Empty Frame' ? 'Empty Frame' : 'Verified',
            }
          : rec
      )
    );
    addActivity({
      type: 'verification',
      title: 'Species prediction confirmed',
      detail: `${target.filename} verified as ${target.predictedSpecies}`,
    });
    showToast({
      type: 'success',
      title: 'Prediction confirmed',
      description: `${target.filename} marked as ${target.predictedSpecies}.`,
    });
  };

  const correctSpecies = (
    recordId: string,
    correctedSpecies: string,
    reviewNotes?: string
  ) => {
    const target = records.find((r) => r.id === recordId);
    if (!target) return;
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              confirmedSpecies: correctedSpecies,
              verificationStatus:
                correctedSpecies === 'Empty Frame' ? 'Empty Frame' : 'Corrected',
              detectionStatus:
                correctedSpecies === 'Empty Frame'
                  ? 'empty_frame'
                  : correctedSpecies === 'Human / Vehicle'
                    ? 'human_or_vehicle'
                    : 'animal_detected',
              reviewNotes: reviewNotes?.trim() || rec.reviewNotes,
            }
          : rec
      )
    );
    addActivity({
      type: 'correction',
      title: 'Species prediction corrected',
      detail: `${target.filename} updated from ${target.predictedSpecies} to ${correctedSpecies}`,
    });
    showToast({
      type: 'success',
      title: 'Species updated',
      description: `${target.filename} saved as ${correctedSpecies}.`,
    });
  };

  const markUnidentifiable = (recordId: string) => {
    const target = records.find((r) => r.id === recordId);
    if (!target) return;
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              confirmedSpecies: 'Unidentifiable',
              verificationStatus: 'Unidentifiable',
            }
          : rec
      )
    );
    addActivity({
      type: 'verification',
      title: 'Capture marked unidentifiable',
      detail: `${target.filename} flagged as unclear for species ID`,
    });
    showToast({
      type: 'info',
      title: 'Marked as unidentifiable',
      description: `${target.filename} updated.`,
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <ResearchContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        profile,
        updateProfile,
        projects,
        addProject,
        records,
        addAnalyzedRecords,
        confirmPrediction,
        correctSpecies,
        markUnidentifiable,
        activities,
        addActivity,
        notifications,
        markAllNotificationsRead,
        markNotificationRead,
        aiBackendConnected,
        refreshBackendHealth,
        toasts,
        showToast,
        dismissToast,
        globalSearch,
        setGlobalSearch,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch() {
  const ctx = useContext(ResearchContext);
  if (!ctx) {
    throw new Error('useResearch must be used inside ResearchProvider');
  }
  return ctx;
}
