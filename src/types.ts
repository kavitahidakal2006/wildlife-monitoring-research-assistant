export type ProjectStatus = 'Active' | 'Paused' | 'Completed';

export type DetectionStatus =
  | 'animal_detected'
  | 'empty_frame'
  | 'human_or_vehicle'
  | 'unclear';

export type ProcessingStatus = 'completed' | 'processing' | 'failed' | 'queued';

export type VerificationStatus =
  | 'Verified'
  | 'Needs Review'
  | 'Corrected'
  | 'Unidentifiable'
  | 'Empty Frame';

export interface MonitoringProject {
  id: string;
  name: string;
  description: string;
  location: string;
  status: ProjectStatus;
  cameras: string[];
  uploadedImages: number;
  observationsCount: number;
  createdAt: string;
}

export interface WildlifeRecord {
  id: string;
  filename: string;
  imageUrl: string;
  projectId: string;
  cameraId: string;
  capturedAt: string;
  detectionStatus: DetectionStatus;
  predictedSpecies: string;
  confirmedSpecies?: string;
  confidence: number;
  processingStatus: ProcessingStatus;
  verificationStatus: VerificationStatus;
  notes: string;
  isDemoData: boolean;
  analysisSource: 'demo' | 'gemini_vision';
  reviewNotes?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'upload' | 'analysis' | 'correction' | 'verification' | 'report';
  title: string;
  detail: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTo: string;
}

export interface ResearcherProfile {
  name: string;
  email: string;
  role: string;
  organization: string;
  avatarUrl: string;
  notifications: {
    lowConfidenceAlerts: boolean;
    batchCompleted: boolean;
    weeklyDigest: boolean;
  };
}
