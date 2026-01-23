
export enum JobStatus {
  RUNNING = 'RUNNING',
  QUEUED = 'QUEUED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  INTERRUPTED = 'INTERRUPTED',
  HANGING = 'HANGING',
}

export enum GoodputType {
  GKE = 'GKE (Basic)',
  ML_PRODUCTIVITY = 'ML Productivity (SDK)',
}

export interface Job {
  id: string;
  name: string;
  user: string;
  cluster: string; // Added to support multi-cluster view
  status: JobStatus;
  priority: string;
  duration: string; // e.g., "2h 15m"
  estimatedRemaining?: string; // e.g., "4h 30m"
  gpuUtil: number; // 0-100
  tensorCoreUtil: number; // 0-100
  goodput: number; // 0-100
  goodputType: GoodputType;
  badNodes: string[];
  interruptions: number;
  downtime: string;
  submitted: string;
  recentRun?: string; // New field for most recent run
  // Filter fields
  accelerator?: string;
  jobType?: string;
  orchestrator?: string;
  reservation?: string;
  // Detailed Metrics (Mock data support)
  stepsPerSecond?: number;
  targetStepsPerSecond?: number;
  lossCurrent?: number;
  computeIdleTime?: string;
  memoryBwUtil?: number;
  collectiveOpTime?: string;
  inputPipelineStall?: number;
  hostCpuUtil?: number;
  storageIoLatency?: string;
  recentEvent?: string;
}

export interface SystemMetrics {
  totalJobs: number;
  activeJobs: number;
  queuedJobs: number;
  failedJobs: number;
  avgGoodput: number;
  totalInterruptions: number;
}

export interface DiagnosticReport {
  jobId: string;
  timestamp: string;
  analysis: string;
  recommendation: string;
}

export interface DashboardFilters {
  accelerator: string;
  jobType: string;
  orchestrator: string;
  timeRange: string;
  reservation: string;
}