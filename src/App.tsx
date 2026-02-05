
import React, { useState, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { 
  Activity, 
  Bell, 
  Search,
  PlayCircle,
  AlertCircle,
  Cpu,
  Layers,
  Server,
  LayoutGrid,
  BarChart3,
  LayoutDashboard,
  Settings,
  Zap,
  Play,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  X,
  Info,
  Menu,
  Terminal,
  HelpCircle,
  MoreVertical,
  User,
  HeartPulse,
  Stethoscope,
  Home,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  Box,
  Filter,
  Camera,
  Timer,
  Download
} from 'lucide-react';
import { Card, StatCard, DonutChart, Sparkline, TableHeader } from '@/components/Card';
import { DiagnosticsPanel } from '@/components/DiagnosticsPanel';
import { DiagnosticsRuns } from '@/components/DiagnosticsRuns';
import { ClusterTopology, REGIONS } from '@/components/ClusterTopology';
import { ClusterTable } from '@/components/ClusterTable';
import { ClusterDirectorV2 } from '@/components/ClusterDirectorV2';
import { ClusterDirectorBulk } from '@/components/ClusterDirectorBulk';
import { ProjectTopology } from '@/components/ProjectTopology';
import { ReservationsList } from '@/components/ReservationsList';
import { ScenarioGuide, SCENARIOS } from '@/components/ScenarioGuide';
import { Job, JobStatus, GoodputType, DashboardFilters } from '@/types';
import { FilterBar } from '@/components/FilterBar';
import { ActiveJobsTable } from '@/components/ActiveJobsTable';
import { JobTopology } from '@/components/JobTopology';
import { useTable } from '@/hooks/useTable';
import { DashboardHeader } from '@/components/DashboardHeader';

// --- MOCK DATA ---
const MOCK_JOBS: Job[] = [
  // Page 1
  {
    id: 'job-zeta-789',
    jobsetId: 'jobset-af-sim',
    workloadName: 'AlphaFold-Protein-Sim',
    user: 'm.curie',
    cluster: 'us-east-tpu-3',
    status: JobStatus.RUNNING,
    priority: 'HIGH',
    duration: '22h 5m',
    estimatedRemaining: '40h',
    gpuUtil: 98,
    tensorCoreUtil: 95,
    goodput: 97,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 01:00 AM',
    recentRun: 'run-af-sim-20241025',
    accelerator: 'Google TPU v5p',
    jobType: 'Simulation',
    orchestrator: 'GKE (Kueue)',
    recentEvent: 'Job started successfully',
    reservation: 'us-west8-reservation1',
  },
  {
    id: 'job-zeta-790',
    jobsetId: 'jobset-af-sim',
    workloadName: 'AlphaFold-Protein-Sim',
    user: 'm.curie',
    cluster: 'us-east-tpu-3',
    status: JobStatus.RUNNING,
    priority: 'HIGH',
    duration: '21h 55m',
    estimatedRemaining: '40h',
    gpuUtil: 97,
    tensorCoreUtil: 94,
    goodput: 96,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 01:10 AM',
    recentRun: 'run-af-sim-20241025',
    accelerator: 'Google TPU v5p',
    jobType: 'Simulation',
    orchestrator: 'GKE (Kueue)',
    recentEvent: 'Job running',
    reservation: 'us-west8-reservation1',
  },
  {
    id: 'job-alpha-102',
    jobsetId: 'jobset-llama-3',
    workloadName: 'LLAMA-3-70B-Finetune',
    user: 'j.doe',
    cluster: 'us-west-training-v4',
    status: JobStatus.RUNNING,
    priority: 'HIGH',
    duration: '4h 12m',
    estimatedRemaining: '2h 15m',
    gpuUtil: 92,
    tensorCoreUtil: 88,
    goodput: 94,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 09:00 AM',
    recentRun: 'run-20241024-alpha',
    accelerator: 'NVIDIA H100',
    jobType: 'LLM Training',
    orchestrator: 'GKE',
    stepsPerSecond: 4.2,
    targetStepsPerSecond: 4.5,
    computeIdleTime: '12%',
    memoryBwUtil: 78,
    recentEvent: 'Scaling to 1024 chips',
    reservation: 'us-central1-reservation2',
  },
  {
    id: 'job-alpha-103',
    jobsetId: 'jobset-llama-3',
    workloadName: 'LLAMA-3-70B-Finetune',
    user: 'j.doe',
    cluster: 'us-west-training-v4',
    status: JobStatus.RUNNING,
    priority: 'HIGH',
    duration: '4h 10m',
    estimatedRemaining: '2h 17m',
    gpuUtil: 91,
    tensorCoreUtil: 87,
    goodput: 93,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 09:02 AM',
    recentRun: 'run-20241024-alpha',
    accelerator: 'NVIDIA H100',
    jobType: 'LLM Training',
    orchestrator: 'GKE',
    stepsPerSecond: 4.1,
    targetStepsPerSecond: 4.5,
    computeIdleTime: '13%',
    memoryBwUtil: 77,
    recentEvent: 'Processing shard 4',
    reservation: 'us-central1-reservation2',
  },
  {
    id: 'job-recent-001',
    jobsetId: 'jobset-gemini-flash',
    workloadName: 'Gemini-Flash-Inference',
    user: 'system',
    cluster: 'us-central1-a',
    status: JobStatus.RUNNING,
    priority: 'HIGH',
    duration: '15m',
    estimatedRemaining: 'Indefinite',
    gpuUtil: 65,
    tensorCoreUtil: 60,
    goodput: 99,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 03:45 PM',
    recentRun: 'run-gemini-inf-prod',
    accelerator: 'NVIDIA T4',
    jobType: 'Inference',
    orchestrator: 'GKE',
    recentEvent: 'New model version deployed',
    reservation: 'europe-north-reservation3',
  },
  // NEW HANGING JOB FOR DEMO SCENARIO
  {
    id: 'job-hang-007',
    jobsetId: 'jobset-gpt5-moe',
    workloadName: 'GPT-5-MoE-Training',
    user: 'p.parker',
    cluster: 'us-west-training-v4',
    status: JobStatus.HANGING,
    priority: 'CRITICAL',
    duration: '14h 20m',
    estimatedRemaining: 'Unknown',
    gpuUtil: 0, // Deadlock
    tensorCoreUtil: 0,
    goodput: 10,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 1,
    downtime: '4h 10m',
    submitted: 'Yesterday, 08:00 PM',
    recentRun: 'run-gpt5-moe-iter4',
    accelerator: 'NVIDIA H100',
    jobType: 'LLM Training',
    orchestrator: 'Slurm',
    inputPipelineStall: 25,
    hostCpuUtil: 95,
    recentEvent: 'Input pipeline stalled',
    reservation: 'asia-south-reservation4',
  },
  {
    id: 'job-beta-991',
    jobsetId: 'jobset-resnet-50',
    workloadName: 'ResNet-50-Training',
    user: 'a.smith',
    cluster: 'eu-central-gpu-2',
    status: JobStatus.FAILED,
    priority: 'NORMAL',
    duration: '1h 45m',
    estimatedRemaining: '-',
    gpuUtil: 12,
    tensorCoreUtil: 5,
    goodput: 15,
    goodputType: GoodputType.GKE,
    badNodes: ['node-gke-4', 'node-gke-9'],
    interruptions: 3,
    downtime: '45m',
    submitted: 'Yesterday, 2:30 PM',
    recentRun: 'run-resnet-train-v2',
    accelerator: 'NVIDIA A100',
    jobType: 'Training',
    orchestrator: 'GKE',
    recentEvent: 'Node failure detected',
    reservation: 'us-west8-reservation1',
  },
  {
    id: 'job-gamma-332',
    jobsetId: 'jobset-bert-large',
    workloadName: 'Bert-Large-Inference',
    user: 'm.chen',
    cluster: 'us-east-inference-1',
    status: JobStatus.QUEUED,
    priority: 'LOW',
    duration: '-',
    gpuUtil: 0,
    tensorCoreUtil: 0,
    goodput: 0,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 12:15 PM',
    recentRun: 'run-bert-inf-test',
    accelerator: 'NVIDIA T4',
    jobType: 'Inference',
    orchestrator: 'Ray',
    recentEvent: 'Awaiting resource allocation',
    reservation: 'us-central1-reservation2',
  },
  {
    id: 'job-delta-404',
    jobsetId: 'jobset-gpt4-distill',
    workloadName: 'GPT-4-Distillation',
    user: 'k.west',
    cluster: 'us-west-training-v4',
    status: JobStatus.INTERRUPTED,
    priority: 'HIGH',
    duration: '12h 10m',
    gpuUtil: 85,
    tensorCoreUtil: 76,
    goodput: 80,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 1,
    downtime: '15m',
    submitted: 'Today, 01:00 AM',
    recentRun: 'run-gpt4-distill-x',
    accelerator: 'Google TPU v5p',
    jobType: 'Fine-tuning',
    orchestrator: 'GKE (Kueue)',
    recentEvent: 'Preempted by higher priority job',
    reservation: 'europe-north-reservation3',
  },
  {
    id: 'job-epsilon-551',
    jobsetId: 'jobset-sd-xl',
    workloadName: 'Stable-Diffusion-XL',
    user: 's.lee',
    cluster: 'asia-northeast-tpu-1',
    status: JobStatus.RUNNING,
    priority: 'NORMAL',
    duration: '6h 30m',
    gpuUtil: 95,
    tensorCoreUtil: 91,
    goodput: 96,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 03:45 AM',
    recentRun: 'run-sd-xl-gen-1',
    accelerator: 'Google TPU v4',
    jobType: 'Inference',
    orchestrator: 'GKE',
    recentEvent: 'Job running smoothly',
    reservation: 'asia-south-reservation4',
  },
  // Page 2
  {
    id: 'job-eta-111',
    jobsetId: 'jobset-dlrm',
    workloadName: 'DLRM-Recommendation',
    user: 'a.lovelace',
    cluster: 'us-central-gpu-1',
    status: JobStatus.RUNNING,
    priority: 'NORMAL',
    duration: '3h 45m',
    estimatedRemaining: '1h 30m',
    gpuUtil: 85,
    tensorCoreUtil: 80,
    goodput: 92,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 12:30 PM',
    recentRun: 'run-dlrm-rec-v3',
    accelerator: 'NVIDIA A100',
    jobType: 'Training',
    orchestrator: 'GKE',
    recentEvent: 'Gradient overflow detected',
    reservation: 'us-west8-reservation1',
  },
  {
    id: 'job-theta-222',
    jobsetId: 'jobset-wavenet',
    workloadName: 'Wavenet-Audio-Gen',
    user: 'system',
    cluster: 'eu-west-inf-2',
    status: JobStatus.RUNNING,
    priority: 'LOW',
    duration: '1h 5m',
    estimatedRemaining: 'Indefinite',
    gpuUtil: 55,
    tensorCoreUtil: 50,
    goodput: 98,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 03:10 PM',
    recentRun: 'run-wavenet-prod-2',
    accelerator: 'NVIDIA T4',
    jobType: 'Inference',
    orchestrator: 'Ray',
    recentEvent: 'Autoscaling triggered',
    reservation: 'us-central1-reservation2',
  },
  {
    id: 'job-iota-333',
    jobsetId: 'jobset-vit',
    workloadName: 'ViT-Image-Classification',
    user: 'c.babbage',
    cluster: 'us-west-training-v4',
    status: JobStatus.QUEUED,
    priority: 'NORMAL',
    duration: '-',
    gpuUtil: 0,
    tensorCoreUtil: 0,
    goodput: 0,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 04:00 PM',
    recentRun: 'run-vit-img-class-1',
    accelerator: 'NVIDIA H100',
    jobType: 'Training',
    orchestrator: 'Slurm',
    recentEvent: 'Pending dependencies',
    reservation: 'europe-north-reservation3',
  },
  {
    id: 'job-kappa-444',
    jobsetId: 'jobset-bert-ft',
    workloadName: 'BERT-Large-Finetune',
    user: 'j.neumann',
    cluster: 'asia-east-gpu-1',
    status: JobStatus.FAILED,
    priority: 'HIGH',
    duration: '6h 20m',
    estimatedRemaining: '-',
    gpuUtil: 5,
    tensorCoreUtil: 2,
    goodput: 8,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: ['node-gke-asia-7'],
    interruptions: 2,
    downtime: '1h 5m',
    submitted: 'Yesterday, 10:00 PM',
    recentRun: 'run-bert-large-ft-v9',
    accelerator: 'NVIDIA A100',
    jobType: 'Fine-tuning',
    orchestrator: 'GKE',
    recentEvent: 'OOM error in training loop',
    reservation: 'asia-south-reservation4',
  },
  {
    id: 'job-lambda-555',
    jobsetId: 'jobset-gan',
    workloadName: 'GAN-Image-Generation',
    user: 'g.hopper',
    cluster: 'us-central-tpu-2',
    status: JobStatus.RUNNING,
    priority: 'NORMAL',
    duration: '9h 15m',
    estimatedRemaining: '3h',
    gpuUtil: 90,
    tensorCoreUtil: 88,
    goodput: 94,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 1,
    downtime: '10m',
    submitted: 'Today, 07:00 AM',
    recentRun: 'run-gan-img-gen-4',
    accelerator: 'Google TPU v4',
    jobType: 'Training',
    orchestrator: 'GKE (Kueue)',
    recentEvent: 'Checkpoint saved',
    reservation: 'us-west8-reservation1',
  },
  {
    id: 'job-mu-666',
    jobsetId: 'jobset-pathways',
    workloadName: 'Pathways-LLM-Inference',
    user: 'system',
    cluster: 'us-east-inf-1',
    status: JobStatus.RUNNING,
    priority: 'CRITICAL',
    duration: '30m',
    estimatedRemaining: 'Indefinite',
    gpuUtil: 70,
    tensorCoreUtil: 65,
    goodput: 99,
    goodputType: GoodputType.GKE,
    badNodes: [],
    interruptions: 0,
    downtime: '0m',
    submitted: 'Today, 03:45 PM',
    recentRun: 'run-pathways-prod-inf',
    accelerator: 'NVIDIA T4',
    jobType: 'Inference',
    orchestrator: 'GKE',
    recentEvent: 'Healthy',
    reservation: 'us-central1-reservation2',
  },
  {
    id: 'job-nu-777',
    jobsetId: 'jobset-rl-sim',
    workloadName: 'Reinforcement-Learning-Sim',
    user: 'r.feinman',
    cluster: 'eu-central-gpu-2',
    status: JobStatus.INTERRUPTED,
    priority: 'HIGH',
    duration: '18h 40m',
    gpuUtil: 88,
    tensorCoreUtil: 82,
    goodput: 85,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 1,
    downtime: '20m',
    submitted: 'Yesterday, 08:00 PM',
    recentRun: 'run-rl-sim-alpha',
    accelerator: 'NVIDIA H100',
    jobType: 'Simulation',
    orchestrator: 'Slurm',
    recentEvent: 'Job paused by user',
    reservation: 'europe-north-reservation3',
  },
  {
    id: 'job-xi-888',
    jobsetId: 'jobset-moe-sparse',
    workloadName: 'MoE-Sparse-Training',
    user: 's.hawking',
    cluster: 'us-west-training-v4',
    status: JobStatus.HANGING,
    priority: 'CRITICAL',
    duration: '2h 10m',
    estimatedRemaining: 'Unknown',
    gpuUtil: 0,
    tensorCoreUtil: 0,
    goodput: 5,
    goodputType: GoodputType.ML_PRODUCTIVITY,
    badNodes: [],
    interruptions: 1,
    downtime: '1h 30m',
    submitted: 'Today, 02:00 PM',
    recentRun: 'run-moe-sparse-iter2',
    accelerator: 'NVIDIA H100',
    jobType: 'LLM Training',
    orchestrator: 'Slurm',
    recentEvent: 'Deadlock in NCCL communication',
    reservation: 'asia-south-reservation4',
  }
];

// Simulated historical data for sparklines
const activeJobsHistory = [42, 45, 48, 46, 50, 52, 49, 55, 58, 57];
const interruptionsHistory = [5, 3, 6, 2, 1, 0, 2, 4, 1, 0];

// Helper to convert "duration string" like "4h 12m" to minutes
const parseDurationToMinutes = (dur: string): number => {
  if (!dur || dur === '-') return 0;
  let minutes = 0;
  const hMatch = dur.match(/(\d+)h/);
  const mMatch = dur.match(/(\d+)m/);
  if (hMatch) minutes += parseInt(hMatch[1]) * 60;
  if (mMatch) minutes += parseInt(mMatch[1]);
  return minutes;
};

// Helper to estimate chip usage per job accelerator
const getChipCountForJob = (job: Job): number => {
  if (job.status === JobStatus.QUEUED) return 0;
  if (job.accelerator?.includes('H100')) return 8; // e.g. 1 node
  if (job.accelerator?.includes('A100')) return 8;
  if (job.accelerator?.includes('TPU v4')) return 4; // e.g. small slice
  if (job.accelerator?.includes('TPU v5p')) return 4;
  if (job.accelerator?.includes('T4')) return 1;
  return 1;
};

// Helper to parse mock date strings into approximate "hours ago"
const parseTimeAgo = (submitted: string): number => {
  // Assume "Today" is 4:00 PM (16:00) for simulation context
  const CURRENT_HOUR_24 = 16;
  
  if (submitted.includes("Today")) {
    const match = submitted.match(/(\d+):(\d+) (AM|PM)/);
    if (!match) return 0;
    let [_, h, m, p] = match;
    let hour = parseInt(h);
    if (p === 'PM' && hour !== 12) hour += 12;
    if (p === 'AM' && hour === 12) hour = 0;
    
    // Difference from current time (16:00)
    return Math.max(0, CURRENT_HOUR_24 - hour);
  } else if (submitted.includes("Yesterday")) {
    const match = submitted.match(/(\d+):(\d+) (AM|PM)/);
    if (!match) return 24;
    let [_, h, m, p] = match;
    let hour = parseInt(h);
    if (p === 'PM' && hour !== 12) hour += 12;
    if (p === 'AM' && hour === 12) hour = 0;
    
    // Yesterday means 24h + (current time - yesterday time)
    // Actually, simply: (24 - hour) + CURRENT_HOUR_24
    return (24 - hour) + CURRENT_HOUR_24;
  }
  return 48; // Default "old"
};

const getMockSparklineData = (val: number) => {
  if (val === 0) return [0, 0, 0, 0, 0, 0];
  return [val - 5, val + 2, val - 3, val + 5, val - 2, val];
};

// --- COMPONENTS ---



// Rainbow Banner Component
const RainbowBanner: React.FC = () => {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div 
      className="w-full h-[60px] flex items-center justify-center text-lg font-bold text-white mb-4 rounded-md shadow-md"
      style={{ background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)' }}
    >
      🌈 This page is a work of progress (as of {dateStr})
    </div>
  );
};

// Navigation Structure
const NAV_GROUPS = [
  {
    title: 'Infrastructure',
    id: 'infrastructure',
    items: [
      { label: 'Reservations', id: 'reservations' },
      { label: 'Clusters', id: 'clusters' }
    ]
  },
  {
    title: 'Jobs and Diagnostics',
    id: 'tools',
    items: [
      { label: 'Jobs', id: 'jobs', icon: Layers },
      { label: 'Diagnostics', id: 'diagnostics', icon: Activity }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  // View state controls sub-views within tabs (e.g. List vs Detail)
  const [view, setView] = useState<'dashboard' | 'diagnostics' | 'diagnostics-list' | 'cluster-detail' | 'reservation-detail' | 'fleet-detail' | 'reservation-bulk'>('dashboard');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'infrastructure': true,
    'tools': true,
    'solutions': true
  });
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [filterStatus, setFilterStatus] = useState<JobStatus | 'ALL'>('ALL');
  
  // Global Scope Filters
  const [filters, setFilters] = useState<DashboardFilters>({
    accelerator: 'All',
    jobType: 'All',
    orchestrator: 'All',
    timeRange: 'Last 24 hours',
    reservation: 'All'
  });
  
  // Scenario State
  const [scenarioActive, setScenarioActive] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SCENARIOS[0].id);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  
  // Screen Capture State
  const [autoCapture, setAutoCapture] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Menu State
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Derived Lists & Metrics
  const jobsInScope = useMemo(() => {
    return MOCK_JOBS.filter(job => {
      // Accelerator Filter
      let matchAccelerator = false;
      if (filters.accelerator === 'All') {
        matchAccelerator = true;
      } else if (filters.accelerator === 'TPUs') {
        matchAccelerator = job.accelerator?.includes('TPU') || false;
      } else if (filters.accelerator === 'GPUs') {
        matchAccelerator = job.accelerator?.includes('NVIDIA') || false;
      }

      // Job Type Filter
      let matchJobType = false;
      if (filters.jobType === 'All') {
        matchJobType = true;
      } else if (filters.jobType === 'Training') {
        matchJobType = ['LLM Training', 'Training', 'Fine-tuning'].includes(job.jobType || '');
      } else if (filters.jobType === 'Inference') {
        matchJobType = job.jobType === 'Inference';
      }

      // Orchestrator Filter
      let matchOrchestrator = false;
      if (filters.orchestrator === 'All') {
        matchOrchestrator = true;
      } else if (filters.orchestrator === 'Google Kubernetes Engine') {
        matchOrchestrator = job.orchestrator?.includes('GKE') || false;
      } else if (filters.orchestrator === 'Slurm') {
        matchOrchestrator = job.orchestrator === 'Slurm';
      } else if (filters.orchestrator === 'Custom') {
        matchOrchestrator = job.orchestrator === 'Ray';
      } else {
        matchOrchestrator = job.orchestrator === filters.orchestrator;
      }
      
      // Time Range Filter
      let matchTime = true;
      if (filters.timeRange !== 'All time') {
        const hoursAgo = parseTimeAgo(job.submitted);
        if (filters.timeRange === 'Last 1 hour') matchTime = hoursAgo <= 1;
        else if (filters.timeRange === 'Last 12 hours') matchTime = hoursAgo <= 12;
        else if (filters.timeRange === 'Last 24 hours') matchTime = hoursAgo <= 24;
        else if (filters.timeRange === 'Last 7 days') matchTime = hoursAgo <= 168;
      }

      const matchReservation = filters.reservation === 'All' || job.reservation === filters.reservation;

      return matchAccelerator && matchJobType && matchOrchestrator && matchTime && matchReservation;
    });
  }, [filters]);

  const filteredJobs = useMemo(() => {
    let jobs = jobsInScope;
    
    if (filterStatus !== 'ALL') {
        jobs = jobs.filter(j => j.status === filterStatus);
    }

    return jobs.filter(job => 
      job.workloadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobsetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobsInScope, searchTerm, filterStatus]);

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setActiveTab('jobs'); 
    setView('job-topology');
  };

  const handleViewRunDiagnostics = (job: Job) => {
    setSelectedJob(job);
    setActiveTab('diagnostics');
    setView('diagnostics');
  };

  const handleClusterClick = (clusterId: string) => {
    setActiveTab('director');
    setView('dashboard');
    setSelectedClusterId(null);
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedJob(null);
    setSelectedClusterId(null);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Reset view states when switching major tabs
    if (tabId === 'diagnostics') {
      setView('diagnostics-list');
      setSelectedJob(null);
    } else { 
       setView('dashboard');
       setSelectedJob(null);
       setSelectedClusterId(null);
    }
  };

  // --- BREADCRUMBS ---
  const Breadcrumbs: React.FC = () => {
    const items = useMemo(() => {
        const list = [];
        // Root
        list.push({ id: 'home', label: 'Google Cloud', onClick: undefined });
        list.push({ id: 'chimera', label: 'chimera', onClick: undefined });

        // Group & Tab
        if (activeTab === 'reservations') {
            list.push({ id: 'grp-infra', label: 'Infrastructure', onClick: undefined });
            list.push({ id: 'reservations', label: 'Reservations', active: true });
            return list;
        }

        if (activeTab === 'overview') {
            list.push({ id: 'grp-infra', label: 'Infrastructure', onClick: undefined });
            list.push({ id: 'overview', label: 'Overview', active: true });
            return list;
        }

        if (activeTab === 'director') {
            list.push({ id: 'grp-infra', label: 'Infrastructure', onClick: undefined });
            list.push({ id: 'reservations', label: 'Reservations', onClick: () => handleTabChange('reservations') });
            list.push({ id: 'director', label: 'us-west8-reservation1', active: true });
            return list;
        }

        if (activeTab === 'director-bulk') {
            list.push({ id: 'grp-infra', label: 'Infrastructure', onClick: undefined });
            list.push({ id: 'reservations', label: 'Reservations', onClick: () => handleTabChange('reservations') });
            list.push({ id: 'director-bulk', label: 'us-central1-reservation2', active: true });
            return list;
        }

        if (activeTab === 'clusters') {
            list.push({ id: 'grp-infra', label: 'Infrastructure', onClick: undefined });
            list.push({ id: 'clusters', label: 'Clusters', active: true });
            return list;
        }

        const group = NAV_GROUPS.find(g => g.items.some(i => i.id === activeTab));
        const tab = group?.items.find(i => i.id === activeTab);

        if (group) {
            list.push({ id: group.id, label: group.title, onClick: undefined });
        }
        
        if (tab) {
            const isDeep = view !== 'dashboard' && view !== 'diagnostics-list';
            list.push({ 
                id: tab.id, 
                label: tab.label, 
                onClick: isDeep ? () => handleTabChange(tab.id) : undefined,
                active: !isDeep
            });
        }

        // Deep Views
        if ((view === 'diagnostics' || view === 'job-topology') && selectedJob) {
             list.push({ id: 'job-detail', label: selectedJob.workloadName || selectedJob.id, active: true });
        }
        else if (view === 'cluster-detail' && selectedClusterId) {
             const region = REGIONS.find(r => r.clusters.some(c => c.id === selectedClusterId));
             const cluster = region?.clusters.find(c => c.id === selectedClusterId);
             list.push({ id: 'cluster-detail', label: cluster?.name || selectedClusterId, active: true });
        }

        return list;
    }, [activeTab, view, selectedJob, selectedClusterId]);

    return (
        <div className="border-b border-slate-200 px-4 py-2 bg-white flex items-center gap-1.5 text-xs text-slate-500 shadow-sm z-30 sticky top-0">
            {items.map((item, idx) => (
                <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight size={12} className="text-slate-300" />}
                    {item.active ? (
                        <span className="font-semibold text-slate-800">{item.label}</span>
                    ) : (
                        <span 
                            onClick={item.onClick} 
                            className={`font-medium ${item.onClick ? 'hover:text-[#1967D2] cursor-pointer transition-colors' : 'cursor-default'}`}
                        >
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
  };

  // --- SCREENSHOT LOGIC ---
  const handleScreenshot = async (customFilename?: string) => {
    if (isCapturing) return;
    setIsCapturing(true);
    setShowMoreMenu(false);
    
    // 1. Target main elements
    const mainElement = document.querySelector('main');
    const asideElement = document.querySelector('aside');
    const wrapperElement = mainElement?.parentElement;

    if (!mainElement || !asideElement || !wrapperElement) {
        setIsCapturing(false);
        return;
    }

    // 2. Save original styles
    const originalMainStyle = {
      overflow: mainElement.style.overflow,
      height: mainElement.style.height
    };
    const originalWrapperStyle = {
      overflow: wrapperElement.style.overflow,
      height: wrapperElement.style.height
    };
    const originalAsideStyle = {
      height: asideElement.style.height
    };

    // 3. Temporarily expand container to full height
    mainElement.style.overflow = 'visible';
    mainElement.style.height = 'auto';
    
    wrapperElement.style.overflow = 'visible';
    wrapperElement.style.height = 'auto';

    // 4. Force sidebar to match the full height of the content
    const fullHeight = Math.max(
      document.body.scrollHeight, 
      document.documentElement.scrollHeight,
      mainElement.scrollHeight
    );
    asideElement.style.height = `${fullHeight}px`;

    // 5. Scroll to top to ensure clean capture start
    window.scrollTo(0, 0);

    // Add a small delay to ensure layout repaint
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(document.body, {
          backgroundColor: '#f8fafc',
          scale: 2,
          useCORS: true,
          height: fullHeight, // Explicitly set height
          windowHeight: fullHeight // Ensure viewport matches
        });
        
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = customFilename ? `${customFilename}.png` : `mle-dashboard-snapshot-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error("Screenshot failed:", e);
      } finally {
        // 6. Restore original styles
        mainElement.style.overflow = originalMainStyle.overflow;
        mainElement.style.height = originalMainStyle.height;
        
        wrapperElement.style.overflow = originalWrapperStyle.overflow;
        wrapperElement.style.height = originalWrapperStyle.height;

        asideElement.style.height = originalAsideStyle.height;
        
        setIsCapturing(false);
      }
    }, 500); // 500ms delay
  };

  const handleExportHtml = () => {
    setShowMoreMenu(false);
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mle-dashboard-export-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- SCENARIO LOGIC ---
  const startScenario = (id: string) => {
    setSelectedScenarioId(id);
    setScenarioActive(true);
    setScenarioStep(0);
    setActiveTab('overview');
    setView('dashboard');
    setSelectedJob(null);
    setShowScenarioMenu(false);
    setFilterStatus('ALL');
    setFilters({ accelerator: 'All', jobType: 'All', orchestrator: 'All', timeRange: 'All time' });
  };

  const handleScenarioNext = () => {
    const nextStep = scenarioStep + 1;
    setScenarioStep(nextStep);

    // AUTOMATION LOGIC
    if (selectedScenarioId === 'job-failure') {
        if (nextStep === 2) {
          setActiveTab('diagnostics');
          setView('diagnostics-list');
          setSearchTerm('');
          setFilterStatus('ALL');
        } else if (nextStep === 3) {
          const hangingJob = MOCK_JOBS.find(j => j.status === JobStatus.HANGING);
          if (hangingJob) {
            setSelectedJob(hangingJob);
            setView('diagnostics');
          }
        }
    } 
    else if (selectedScenarioId === 'infra-failure') {
        if (nextStep === 1) {
          setActiveTab('director');
          setView('dashboard');
        } else if (nextStep === 4) {
           const job = MOCK_JOBS.find(j => j.id === 'job-hang-007');
           if (job) handleViewJob(job);
        }
    }
  };

  const handleScenarioPrev = () => {
    setScenarioStep(Math.max(0, scenarioStep - 1));
  };

  // Auto-capture on step change
  useEffect(() => {
    if (scenarioActive && autoCapture) {
      // Wait for route/view transitions animations to settle
      const timer = setTimeout(() => {
         const stepName = `scenario-${selectedScenarioId}-step-${scenarioStep + 1}`;
         handleScreenshot(stepName);
      }, 1200); // 1.2s delay to allow animations to finish
      return () => clearTimeout(timer);
    }
  }, [scenarioStep, scenarioActive, autoCapture, selectedScenarioId]);

  const activeScenarioDef = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];

  const hasIssues = (job: Job) => {
    return job.status === JobStatus.FAILED || 
           job.status === JobStatus.HANGING || 
           job.status === JobStatus.INTERRUPTED || 
           job.badNodes.length > 0;
  };

  // ... (renderOverviewContent and other render functions omitted for brevity as they haven't changed)
  const renderOverviewContent = () => (
    <div className="space-y-4 animate-fadeIn">
        <h1 className="text-xl font-bold text-slate-900">Overview</h1>
        <FilterBar filters={filters} setFilters={setFilters} hideTimeRange={true} hideJobType={true} />
        
        {/* Reservation Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Reservation overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="TPU v/s GPU Reservation">
              <DonutChart 
                data={[
                  { name: 'TPU', value: 3200, color: '#1967D2' },
                  { name: 'GPU', value: 1800, color: '#4285F4' }
                ]} 
              />
            </Card>
            <Card title="Orchestrator Reservation">
              <DonutChart 
                data={[
                  { name: 'GKE', value: 2100, color: '#34A853' },
                  { name: 'Slurm', value: 1200, color: '#4285F4' },
                  { name: 'Vertex AI', value: 800, color: '#FBBC04' },
                  { name: 'Director', value: 500, color: '#1967D2' },
                  { name: 'Compute', value: 300, color: '#EA4335' },
                  { name: 'Custom', value: 100, color: '#9333EA' }
                ]} 
              />
            </Card>
            <Card title="Healthy v/s Unhealthy Reservation">
              <DonutChart 
                data={[
                  { name: 'Healthy', value: 4850, color: '#10b981' },
                  { name: 'Unhealthy', value: 150, color: '#ef4444' }
                ]} 
              />
            </Card>
          </div>
        </div>

        {/* Reservation Topology */}
        <div>
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-sm font-bold text-slate-900">Reservation topology</h3>
             <button onClick={() => handleTabChange('director')} className="text-xs text-[#1967D2] hover:text-[#1557B0] font-medium flex items-center gap-1">
               View reservation details <ArrowRight size={12} />
             </button>
          </div>
          <Card className="bg-slate-50/50">
            <ClusterTopology onClusterClick={handleClusterClick} jobs={jobsInScope} />
          </Card>
        </div>
    </div>
  );

  // 3. ACTIVE JOBS CONTENT
  const renderActiveJobsContent = () => {
    if (view === 'job-topology' && selectedJob) {
      return (
        <JobTopology 
          job={selectedJob} 
          onBack={() => {
            setView('dashboard');
            setSelectedJob(null);
          }} 
          onJobClick={(jobId) => {
            const job = MOCK_JOBS.find(j => j.id === jobId) || MOCK_JOBS[0];
            handleViewJob(job);
          }}
        />
      );
    }

    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-900">Jobs</h1>
          <div className="flex items-center gap-2">
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1967D2] text-white text-xs font-bold rounded shadow-sm hover:bg-[#1557B0] transition-colors">
                <PlayCircle size={14} />
                Submit job
             </button>
          </div>
        </div>
        
        <FilterBar filters={filters} setFilters={setFilters} />
        
        <Card className="overflow-hidden">
          <ActiveJobsTable 
            jobs={filteredJobs} 
            onViewJob={handleViewJob} 
          />
        </Card>
      </div>
    );
  };

  // 3. JOBS CONTENT
  const renderJobsContent = () => {
    // If we're in "Diagnostics" tab (sidebar)
    if (activeTab === 'diagnostics') {
       if (view === 'diagnostics' && selectedJob) {
          // Show the new "Diagnostics Details" page
          return <DiagnosticsPanel job={selectedJob} onBack={() => setView('diagnostics-list')} />;
       }
       // Default to the new "Runs" list
       return (
         <DiagnosticsRuns 
           onRunClick={(jobStub) => {
             // For the demo, ensure we have a full job object if possible, or use the stub
             const fullJob = MOCK_JOBS.find(j => j.id === jobStub.id) || { ...MOCK_JOBS[0], ...jobStub };
             setSelectedJob(fullJob as Job);
             setView('diagnostics');
           }} 
         />
       );
    }

    return null;
  };

  // 4. CLUSTERS CONTENT
  const renderClustersContent = () => {
    return (
      <div className="space-y-4 animate-fadeIn">
        <h1 className="text-xl font-bold text-slate-900">Clusters</h1>
        <ClusterTable 
          onClusterClick={handleClusterClick}
          onViewTopology={handleClusterClick}
        />
      </div>
    );
  };

  // ... (Header and layout logic remains the same)
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* ... (Header preserved) ... */}
      <header className="h-12 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 relative z-40 shadow-sm">
        <div className="flex items-center gap-3">
           <button className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
              <Menu size={18} />
           </button>
           <div className="flex items-center gap-2 pr-4 border-r border-slate-200 h-6">
              <span className="text-base font-medium text-slate-600 flex items-center gap-1">
                 <span className="font-bold text-slate-800">Google</span> Cloud
              </span>
           </div>
           <button className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 transition-colors">
              <Layers size={12} className="text-slate-500" />
              <span>chimera</span>
              <ChevronDown size={12} className="text-slate-400" />
           </button>
        </div>

        <div className="flex-1 max-w-xl px-6 hidden md:block">
           <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                 <Search size={14} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md leading-5 bg-slate-50 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-[#1967D2] focus:border-[#1967D2] text-xs transition-shadow shadow-inner" 
                placeholder="Search for resources, docs, products and more" 
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                 <div className="text-slate-400 text-[10px] border border-slate-200 px-1 py-0.5 rounded bg-white">/</div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-1.5">
           <div className="relative mr-1">
              <button 
                onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                className={`p-1.5 rounded-full transition-colors ${
                  scenarioActive ? 'bg-[#1967D2]/10 text-[#1967D2]' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="Run Scenario"
              >
                <Play size={18} className={scenarioActive ? "fill-[#1967D2]" : ""} />
              </button>
              
              {showScenarioMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 animate-fadeIn">
                   <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Scenario</div>
                   {SCENARIOS.map(scenario => (
                     <button 
                       key={scenario.id}
                       onClick={() => startScenario(scenario.id)}
                       className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                     >
                        <div className="font-bold text-slate-800 text-xs">{scenario.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{scenario.description}</div>
                     </button>
                   ))}
                </div>
              )}
           </div>

           <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <Terminal size={18} />
           </button>
           <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={18} />
           </button>
           <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <HelpCircle size={18} />
           </button>
           
           {/* More Menu (Dropdown) */}
           <div className="relative">
             <button 
               onClick={() => setShowMoreMenu(!showMoreMenu)}
               className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
             >
                <MoreVertical size={18} />
             </button>
             {showMoreMenu && (
               <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 animate-fadeIn">
                 <button 
                   onClick={() => handleScreenshot()}
                   className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-2"
                 >
                   <Camera size={14} /> Take screenshot
                 </button>
                 <button 
                   onClick={handleExportHtml}
                   className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-2"
                 >
                   <Download size={14} /> Export as HTML
                 </button>
               </div>
             )}
           </div>

           <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold ml-1 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-purple-500 transition-all">
              SW
           </div>
        </div>
      </header>

      {/* --- BREADCRUMBS --- */}
      <Breadcrumbs />

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
           <div className="p-3">
              <div className="flex items-center gap-2 mb-3 px-2">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Infrastructure</div>
                 <span className="bg-blue-600 text-white text-[9px] font-bold px-1 py-0.5 rounded shadow-sm">NEW</span>
              </div>
              
              <nav className="space-y-3">
                  {/* Overview Standalone */}
                  <button 
                     onClick={() => handleTabChange('overview')}
                     className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors border-l-2 ${
                       activeTab === 'overview' 
                         ? 'bg-[#1967D2]/10 text-[#1967D2] border-[#1967D2]' 
                         : 'text-slate-600 hover:bg-slate-50 border-transparent hover:border-slate-300'
                     }`}
                   >
                     <span>Overview</span>
                   </button>

                {NAV_GROUPS.map(group => (
                  <div key={group.id}>
                    <button 
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded transition-colors"
                    >
                      <span>{group.title}</span>
                      {expandedMenus[group.id] ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                    </button>
                    
                    {expandedMenus[group.id] && (
                      <div className="mt-0.5 space-y-0.5 pl-2">
                        {group.items.map(item => (
                          <button 
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors border-l-2 ${
                              activeTab === item.id 
                                ? 'bg-[#1967D2]/10 text-[#1967D2] border-[#1967D2]' 
                                : 'text-slate-600 hover:bg-slate-50 border-transparent hover:border-slate-300'
                            }`}
                          >
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
           </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 scroll-smooth">
          <div className="max-w-7xl">
            {activeTab === 'reservations' && (
              <ReservationsList onNavigate={(tabId) => handleTabChange(tabId)} />
            )}

            {activeTab === 'overview' && renderOverviewContent()}
            
            {activeTab === 'clusters' && renderClustersContent()}

            {activeTab === 'jobs' && renderActiveJobsContent()}
            
            {activeTab === 'diagnostics' && renderJobsContent()}
            
            {/* Reservation details View - NEW UI */}
            {activeTab === 'director' && (
               <div className="space-y-4 animate-fadeIn">
                  {view === 'cluster-detail' && selectedClusterId ? (
                     <ClusterDirectorV2 
                       clusterId={selectedClusterId}
                       onBack={() => {
                         setView('dashboard');
                         setSelectedClusterId(null);
                       }}
                       onJobClick={(jobId) => {
                         const job = MOCK_JOBS.find(j => j.id === jobId) || MOCK_JOBS[0];
                         handleViewJob(job);
                       }}
                     />
                  ) : (
                     <ClusterDirectorV2 
                       onJobClick={(jobId) => {
                         const job = MOCK_JOBS.find(j => j.id === jobId) || MOCK_JOBS[0];
                         handleViewJob(job);
                       }}
                     /> 
                  )}
               </div>
            )}

            {activeTab === 'director-bulk' && (
               <div className="space-y-4 animate-fadeIn">
                  <ClusterDirectorBulk 
                    onJobClick={(jobId) => {
                      const job = MOCK_JOBS.find(j => j.id === jobId) || MOCK_JOBS[0];
                      handleViewJob(job);
                    }}
                  />
               </div>
            )}

            {/* Scenario Overlay */}
            {scenarioActive && (
               <ScenarioGuide 
                 scenario={activeScenarioDef} 
                 step={scenarioStep}
                 onNext={handleScenarioNext}
                 onPrev={handleScenarioPrev}
                 onClose={() => setScenarioActive(false)}
                 autoCapture={autoCapture}
                 onToggleAutoCapture={() => setAutoCapture(!autoCapture)}
                 isCapturing={isCapturing}
               />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
