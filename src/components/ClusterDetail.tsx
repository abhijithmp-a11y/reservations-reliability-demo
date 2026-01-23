
import React, { useState } from 'react';
import { 
  Server, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Play, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight, 
  RotateCw, 
  SkipForward, 
  Search,
  TrendingUp,
  Plus
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { REGIONS } from './ClusterTopology';
import { Job, JobStatus } from '../types';

interface ClusterDetailProps {
  clusterId: string;
  onBack: () => void;
  jobs: Job[];
  onViewJob: (job: Job) => void;
  onNavigateToJobs?: (status?: JobStatus) => void;
}

const COLORS = {
  health: {
    healthy: '#67e8f9', // Cyan-300
    suspected: '#fbbf24', // Amber-400
    unhealthy: '#f43f5e', // Rose-500
  },
  utilization: {
    low: '#93c5fd', // Blue-300
    med: '#60a5fa', // Blue-400
    high: '#3b82f6', // Blue-500
    reserved: '#e2e8f0', // Slate-200
    straggler: '#f97316', // Orange-500
  },
  maintenance: {
    uptodate: '#3b82f6', // Blue-500
    available: '#f59e0b', // Amber-500
    inprogress: '#ec4899', // Pink-400
    pending: '#8b5cf6', // Violet-500
  }
};

const HEALTH_DATA = [
  { name: 'Healthy', value: 414, color: COLORS.health.healthy },
  { name: 'Pending Maint.', value: 47, color: COLORS.maintenance.pending },
  { name: 'Degraded', value: 13, color: COLORS.health.suspected },
  { name: 'Unhealthy', value: 3, color: COLORS.health.unhealthy },
];

const MAINT_DATA = [
  { name: 'Up-to-date', value: 200, color: COLORS.maintenance.uptodate },
  { name: 'Pending', value: 47, color: COLORS.maintenance.pending },
  { name: 'Available', value: 150, color: COLORS.maintenance.available },
  { name: 'In Progress', value: 33, color: COLORS.maintenance.inprogress },
];

const MOCK_BLOCKS = [
  {
    id: 'sb1',
    title: 'Block 1',
    unhealthyCount: 2,
    suspectedCount: 9,
    isOpen: true,
    subblocks: [
      {
        id: 'b1',
        label: 'subblock 1',
        nodes: [
          ...Array(4).fill('healthy'),
          ...Array(4).fill('healthy'),
          ...Array(4).fill('healthy'),
          ...Array(3).fill('healthy'), 'unhealthy'
        ]
      },
      {
        id: 'b2',
        label: 'subblock 2',
        nodes: [
          ...Array(4).fill('healthy'),
          ...Array(3).fill('suspected'), 'healthy',
          ...Array(4).fill('healthy'),
          ...Array(4).fill('healthy'),
          ...Array(4).fill('healthy'),
          ...Array(4).fill('healthy'),
          ...Array(3).fill('healthy'), 'suspected' // Target for tooltip
        ]
      }
    ]
  },
  {
    id: 'sb2',
    title: 'Block 2',
    unhealthyCount: 1,
    suspectedCount: 4,
    isOpen: false,
    subblocks: []
  },
  {
    id: 'sb3',
    title: 'Block 3',
    unhealthyCount: 0,
    suspectedCount: 0,
    isOpen: false,
    subblocks: []
  },
  {
    id: 'sb4',
    title: 'Block 4',
    unhealthyCount: 0,
    suspectedCount: 0,
    isOpen: false,
    subblocks: []
  }
];

const NODE_HEALTH_HISTORY = [
  { time: '09:00', temp: 45, util: 85 },
  { time: '09:15', temp: 48, util: 88 },
  { time: '09:30', temp: 52, util: 92 },
  { time: '09:45', temp: 88, util: 95 }, // Thermal spike
  { time: '10:00', temp: 82, util: 40 }, // Performance drop
  { time: '10:15', temp: 75, util: 10 }, // XID error
  { time: '10:30', temp: 65, util: 0 },
];

const UTIL_DATA = [
  { name: 'Used', value: 510, color: '#a855f7' },
  { name: 'Free', value: 120, color: '#e2e8f0' },
];

const NodeHealthDetail: React.FC<{ 
  nodeIdx: number; 
  blockLabel: string;
  status: 'healthy' | 'degraded' | 'unhealthy'
}> = ({ nodeIdx, blockLabel, status }) => {
  const config = {
    healthy: {
      color: 'bg-cyan-300',
      textColor: 'text-cyan-600',
      label: 'HEALTHY',
      detailLabel: 'Status',
      detailValue: 'Normal',
      action: 'None needed'
    },
    degraded: {
      color: 'bg-amber-400',
      textColor: 'text-amber-600',
      label: 'DEGRADED',
      detailLabel: 'Straggler node',
      detailValue: 'High Latency',
      action: <button className="text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded hover:bg-amber-600 transition-colors shadow-sm">Investigate metrics</button>
    },
    unhealthy: {
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      label: 'UNHEALTHY',
      detailLabel: 'Error Code',
      detailValue: 'XID 31 (Memory)',
      action: <button className="text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded hover:bg-rose-700 transition-colors shadow-sm">Replace node</button>
    }
  }[status];

  return (
    <div className="col-span-full mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            Node {nodeIdx} Health Diagnostics ({blockLabel})
          </h4>
          <p className="text-[10px] text-slate-500">Real-time telemetry and error markers</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
              <div className="w-2 h-0.5 bg-rose-500" /> Temperature (°C)
           </div>
           <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
              <div className="w-2 h-0.5 bg-blue-500" /> Utilization (%)
           </div>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={NODE_HEALTH_HISTORY} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            
            {/* Markers */}
            {status !== 'healthy' && (
              <>
                <ReferenceLine 
                  x="09:45" 
                  stroke="#f43f5e" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: 'Thermal Spike', 
                    position: 'top', 
                    fill: '#f43f5e', 
                    fontSize: 10, 
                    fontWeight: 'bold' 
                  }} 
                />
                <ReferenceLine 
                  x="10:15" 
                  stroke="#e11d48" 
                  strokeWidth={2}
                  label={{ 
                    value: 'XID Error', 
                    position: 'top', 
                    fill: '#e11d48', 
                    fontSize: 10, 
                    fontWeight: 'bold' 
                  }} 
                />
              </>
            )}

            <Line 
              type="monotone" 
              dataKey="temp" 
              stroke="#f43f5e" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#f43f5e' }} 
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="util" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#3b82f6' }} 
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Status</div>
          <div className={`text-xs font-bold ${config.textColor}`}>{config.label}</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">{config.detailLabel}</div>
          <div className="text-xs font-bold text-slate-700">{config.detailValue}</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Running Job</div>
          <div className="text-xs font-mono font-bold text-[#1967D2]">job-zeta-{(nodeIdx * 17) % 900 + 100}</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Action</div>
          <div className="text-[10px] font-bold text-slate-500">{config.action}</div>
        </div>
      </div>
    </div>
  );
};

const NodeMaintenanceDetail: React.FC<{ 
  nodeIdx: number; 
  blockLabel: string; 
  status: 'uptodate' | 'available' | 'inprogress' | 'pending'
}> = ({ nodeIdx, blockLabel, status }) => {
  const config = {
    uptodate: {
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      label: 'UP TO DATE',
      driver: 'v535.154.05',
      gce: 'v20240214',
      action: 'None needed'
    },
    pending: {
      color: 'bg-violet-500',
      textColor: 'text-violet-700',
      label: 'PENDING MAINTENANCE',
      driver: 'v535.154.05',
      nextDriver: 'v535.160.01',
      gce: 'v20240214',
      nextGce: 'v20240301',
      action: <button className="text-[10px] font-bold text-white bg-violet-600 px-2 py-0.5 rounded hover:bg-violet-700 transition-colors">Update now</button>
    },
    available: {
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      label: 'UPDATE AVAILABLE',
      driver: 'v535.129.03',
      nextDriver: 'v535.154.05',
      gce: 'v20240110',
      nextGce: 'v20240214',
      action: <button className="text-[10px] font-bold text-[#1967D2] hover:underline">Schedule update</button>
    },
    inprogress: {
      color: 'bg-pink-500',
      textColor: 'text-pink-700',
      label: 'UPDATING',
      driver: 'v535.154.05 (Applying...)',
      gce: 'v20240214 (Applying...)',
      action: <div className="flex items-center gap-1 text-pink-600 animate-pulse"><RefreshCw size={10} /> In progress</div>
    }
  }[status];

  return (
    <div className="col-span-full mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            Node {nodeIdx} Software Stack ({blockLabel})
          </h4>
          <p className="text-[10px] text-slate-500">Current firmware and orchestration versions</p>
        </div>
        <div className="bg-white px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500">
          OS: Ubuntu 22.04 LTS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
          <div className="text-[9px] text-slate-400 uppercase font-bold mb-2">GPU Driver</div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-slate-700">{config.driver}</div>
            {(status === 'available' || status === 'pending') && (
              <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold">
                <SkipForward size={10} /> {config.nextDriver}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
          <div className="text-[9px] text-slate-400 uppercase font-bold mb-2">GCE Software</div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-slate-700">{config.gce}</div>
            {(status === 'available' || status === 'pending') && (
              <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold">
                <SkipForward size={10} /> {config.nextGce}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Status</div>
          <div className={`text-xs font-bold ${config.textColor}`}>{config.label}</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Last updated</div>
          <div className="text-xs font-bold text-slate-700">12 days ago</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Action</div>
          <div className="text-[10px] font-bold text-slate-500">{config.action}</div>
        </div>
      </div>
    </div>
  );
};

export const ClusterDetail: React.FC<ClusterDetailProps> = ({ clusterId, onBack }) => {
  const [viewMode, setViewMode] = useState<'HEALTH' | 'UTILIZATION' | 'MAINTENANCE'>('HEALTH');
  const [blocks, setBlocks] = useState(MOCK_BLOCKS);
  const [selectedNode, setSelectedNode] = useState<{
    sbId: string, 
    bId: string, 
    idx: number,
    status: any
  } | null>(() => {
    // Auto-select first unhealthy node if navigating from a warning cluster
    const sb1 = MOCK_BLOCKS[0];
    const b1 = sb1.subblocks[0];
    const unhealthyIdx = b1.nodes.findIndex(n => n === 'unhealthy');
    if (unhealthyIdx !== -1) {
      return { sbId: sb1.id, bId: b1.id, idx: unhealthyIdx, status: 'unhealthy' };
    }
    return null;
  });

  const handleTabChange = (mode: 'HEALTH' | 'UTILIZATION' | 'MAINTENANCE') => {
    setViewMode(mode);
    setSelectedNode(null);
  };

  const region = REGIONS.find(r => r.clusters.some(c => c.id === clusterId));
  const foundCluster = region?.clusters.find(c => c.id === clusterId);
  
  const clusterData = foundCluster 
    ? { ...foundCluster, regionName: region?.name || 'Unknown Region' }
    : { name: 'Cluster', regionName: 'Unknown', type: 'Unknown', count: 0 };

  const toggleBlock = (id: string) => {
    setBlocks(prev => prev.map(sb => sb.id === id ? { ...sb, isOpen: !sb.isOpen } : sb));
  };

  const getNodeColor = (sbIdx: number, blockIdx: number, nodeIdx: number, mode: 'HEALTH' | 'UTILIZATION' | 'MAINTENANCE') => {
    // Deterministic mock pattern matching ClusterDirectorV2
    const key = (sbIdx * 32) + (blockIdx * 16) + nodeIdx;
    
    if (mode === 'HEALTH') {
      if (key === 15) return COLORS.health.unhealthy;
      if (key > 16 && key < 20) return COLORS.health.suspected;
      if (key === 42) return COLORS.health.unhealthy;
      if (key === 60) return COLORS.health.suspected;
      return COLORS.health.healthy;
    }

    if (mode === 'UTILIZATION') {
      if (key === 21) return COLORS.utilization.straggler;
      if (key === 45) return COLORS.utilization.straggler;
      if (key % 3 === 0) return COLORS.utilization.low;
      if (key % 3 === 1) return COLORS.utilization.med;
      return COLORS.utilization.high;
    }

    if (mode === 'MAINTENANCE') {
      if (key > 5 && key < 10) return COLORS.maintenance.inprogress;
      if (key > 16 && key < 24) return COLORS.maintenance.available;
      // Specific keys for pending: 3, 7, 12, 22, 28
      if (key % 17 === 0 || [3, 7, 12, 22, 28].includes(key)) return COLORS.maintenance.pending;
      return COLORS.maintenance.uptodate;
    }
    
    return '#e2e8f0';
  };

  const renderDashboardCard = () => {
    switch (viewMode) {
      case 'HEALTH':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 shrink-0 mx-auto lg:mx-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                        <Pie
                            data={HEALTH_DATA}
                            innerRadius={45}
                            outerRadius={55}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {HEALTH_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-700">430</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Total VMs</span>
                </div>
            </div>

            {/* Health Details Columns */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Status Legend */}
                <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs">Health check status</h4>
                    <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300"></div>
                            <span>Healthy: <strong className="text-[#1967D2]">414 VMs</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                            <span>Pending Maint: <strong className="text-[#1967D2]">47 VMs</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                            <span>Degraded: <strong className="text-[#1967D2]">13 VMs</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                            <span>Unhealthy: <strong className="text-[#1967D2]">3 VMs</strong></span>
                        </div>
                    </div>
                </div>

                {/* Column 2: Unhealthy/Degraded Summary */}
                <div className="space-y-4">
                     <div>
                        <h4 className="font-bold text-slate-800 text-xs mb-1">Unhealthy nodes</h4>
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold text-base">
                             <AlertOctagon size={16} /> 3 / 430 VMs
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Last check 02/14/2025</div>
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-800 text-xs mb-1">Degraded nodes</h4>
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold text-base">
                             <AlertTriangle size={16} /> 13 / 430 VMs
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Based on AI Health Predictor</div>
                     </div>
                </div>


            </div>
          </div>
        );
      case 'MAINTENANCE':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 shrink-0 mx-auto lg:mx-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                        <Pie
                            data={MAINT_DATA}
                            innerRadius={45}
                            outerRadius={55}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {MAINT_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-700">430</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Total VMs</span>
                </div>
            </div>

            {/* Maintenance Details Columns */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs">Maintenance status</h4>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Up-to-date: <span className="text-[#1967D2]">200 VMs</span></div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"/> Pending: <span className="text-[#1967D2]">47 VMs</span></div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/> Update available: <span className="text-[#1967D2]">150 VMs</span></div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-400"/> In progress: <span className="text-[#1967D2]">33 VMs</span></div>
                    </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Upcoming impact:</h4>
                  <ul className="space-y-1.5 text-[10px] text-slate-600">
                      <li><span className="text-purple-600 font-bold">•</span> Next 5 days: <span className="text-[#1967D2]">78 VMs</span></li>
                      <li><span className="text-purple-400 font-bold">•</span> In a week: <span className="text-[#1967D2]">56 VMs</span></li>
                      <li><span className="text-blue-500 font-bold">•</span> In a month: <span className="text-[#1967D2]">216 VMs</span></li>
                  </ul>
                  <p className="text-[9px] text-slate-500 leading-tight">Start partially now to avoid disruption.</p>
                  <button className="text-[#1967D2] text-[10px] font-bold hover:underline">Learn more</button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Unplanned maintenance <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block ml-0.5"></span></h4>
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base"><AlertOctagon size={16} className="fill-red-500 text-white" /> 4 / 430 VMs</div>
                  <p className="text-[9px] text-slate-500 leading-tight">Start 02/14/2025 at 12:00 UTC. Add temporary capacity to keep jobs running.</p>
                  <button className="text-[#1967D2] text-[10px] font-bold hover:underline">Start maintenance now</button>
                </div>
            </div>
          </div>
        );
      case 'UTILIZATION':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
             <div className="space-y-3">
               <h4 className="font-bold text-slate-800 text-xs">Reserved capacity</h4>
               <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base"><AlertTriangle size={16} className="text-amber-500" /> 38 / 430 VMs</div>
               <p className="text-[10px] text-slate-500 leading-tight">You have unused reserved capacity. Start using these VMs to use it fully.</p>
               <button className="text-[#1967D2] text-[10px] font-bold hover:underline">See reservations</button>
             </div>

             <div className="space-y-3">
               <h4 className="font-bold text-slate-800 text-xs">Newly added jobs</h4>
               <div className="text-[10px] space-y-1 text-slate-600">
                  <div className="flex justify-between"><span>Job-name-7</span> <span className="text-[#1967D2]">34 VMs</span></div>
                  <div className="flex justify-between"><span>Job-name-8</span> <span className="text-[#1967D2]">28 VMs</span></div>
                  <div className="flex justify-between"><span>Job-name-9</span> <span className="text-[#1967D2]">13 VMs</span></div>
               </div>
               <button className="text-[#1967D2] text-[10px] font-bold hover:underline">See cluster trends</button>
             </div>

             <div className="relative w-28 h-28 shrink-0 mx-auto">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                        <Pie
                            data={UTIL_DATA}
                            innerRadius={40}
                            outerRadius={50}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {UTIL_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-slate-700">510</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Total Jobs</span>
                </div>
            </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Straggler detection <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block ml-0.5"></span></h4>
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base"><TrendingUp size={16} className="text-orange-500" /> 5 / 430 VMs</div>
                  <p className="text-[10px] text-slate-500 leading-tight">Use checkpointing to replace nodes and keep jobs running.</p>
                  <button className="text-[#1967D2] text-[10px] font-bold hover:underline">Learn more</button>
                </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn font-sans text-slate-900 text-xs">
      {/* Breadcrumb / Header */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-slate-500 hover:text-[#1967D2] text-xs flex items-center gap-1 font-medium transition-colors">
          <ArrowLeft size={14} /> Back to fleet
        </button>
        <div className="text-xs text-slate-500">
           <span className="font-bold text-slate-700">{clusterData.name}</span> • {clusterData.regionName}
        </div>
      </div>

      {/* Health Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-4 border-b border-slate-100 p-4">
            {/* Filter Controls */}
            <div className="flex gap-3 items-center">
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-white px-1">Clusters</label>
                    <div className="border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-700 min-w-[140px] flex justify-between items-center">
                        {clusterData.name} <ChevronDown size={12} />
                    </div>
                </div>
                 <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-white px-1">Filter mode</label>
                    <div className="border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-700 min-w-[120px] flex justify-between items-center">
                        Partition <ChevronDown size={12} />
                    </div>
                </div>
                 <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase absolute -top-2 left-2 bg-white px-1">Partitions</label>
                    <div className="border border-slate-300 rounded px-2 py-1.5 text-xs font-medium text-slate-700 min-w-[160px] flex justify-between items-center">
                        Partition A, Partition B <ChevronDown size={12} />
                    </div>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
                <button 
                  onClick={() => handleTabChange('HEALTH')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold transition-colors uppercase tracking-wide ${viewMode === 'HEALTH' ? 'bg-[#1967D2]/10 text-[#1967D2]' : 'bg-white border border-[#1967D2]/20 text-[#1967D2] hover:bg-slate-50'}`}
                >
                    <CheckCircle2 size={12} /> Health
                </button>
                {/* Utilization and Maintenance tabs removed as per request */}
            </div>
        </div>

        {/* Dashboard Metrics */}
        {renderDashboardCard()}

        {/* Bottom Legend Bar */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex gap-4 text-[10px] font-medium">
                 {viewMode === 'HEALTH' && (
                    <>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-300"></div> Healthy</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-500"></div> Pending Maint</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Degraded</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Unhealthy</div>
                    </>
                 )}
                 {viewMode === 'UTILIZATION' && (
                    <>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-300"/> 0%-40%</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"/> 40%-80%</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> 80%-100%</div>
                    </>
                 )}
                 {viewMode === 'MAINTENANCE' && (
                    <>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> Up-to-date</div>
                       <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-500"/> Pending</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"/> Update available</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-400"/> In progress</div>
                    </>
                 )}
             </div>
             <div className="flex gap-4">
                 {viewMode === 'HEALTH' && (
                   <>
                   </>
                 )}
                 {viewMode === 'UTILIZATION' && (
                   <>
                     <button className="flex items-center gap-1 text-[#1967D2] text-xs font-medium hover:text-[#1557B0]">
                        <Plus size={14} /> Add capacity
                     </button>
                     <button className="flex items-center gap-1 text-[#1967D2] text-xs font-medium hover:text-[#1557B0]">
                        <SkipForward size={14} className="fill-[#1967D2]" /> Replace stragglers
                     </button>
                   </>
                 )}
                 {viewMode === 'MAINTENANCE' && (
                   <button className="flex items-center gap-1 text-[#1967D2] text-xs font-medium hover:text-[#1557B0]">
                      <Play size={14} className="fill-[#1967D2]" /> Start all maintenance now
                   </button>
                 )}
             </div>
        </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-3">
         {blocks.map(sb => (
            <div key={sb.id} className="bg-white border border-slate-200 rounded-lg shadow-sm transition-all">
               {/* Block Header */}
               <div 
                 onClick={() => toggleBlock(sb.id)}
                 className={`px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 select-none rounded-t-lg ${!sb.isOpen ? 'rounded-b-lg' : ''}`}
               >
                  <div className="flex items-center gap-2">
                     <h3 className="text-sm font-medium text-slate-900">{sb.title}</h3>
                     <ChevronDown size={16} className={`text-slate-400 transition-transform ${sb.isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {sb.isOpen && (sb.unhealthyCount > 0 || sb.suspectedCount > 0) && (
                     <div className="flex gap-4 text-[10px] font-bold">
                        {sb.unhealthyCount > 0 && (
                            <div className="flex items-center gap-1 text-rose-600">
                                <div className="px-1 py-0.5 bg-rose-600 text-white rounded text-[9px]">!</div>
                                Unhealthy: {sb.unhealthyCount} VMs
                            </div>
                        )}
                        {sb.suspectedCount > 0 && (
                            <div className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle size={12} className="fill-amber-500 text-white" />
                                Degraded: {sb.suspectedCount} VMs
                            </div>
                        )}
                <div className="flex gap-2">
                    {viewMode === 'MAINTENANCE' && (
                        <div className="flex items-center gap-1 text-[#1967D2] text-[10px] font-bold">
                            <Play size={10} className="fill-[#1967D2]" /> Start maintenance
                        </div>
                    )}
                    {viewMode === 'UTILIZATION' && (
                        <div className="flex items-center gap-1 text-[#1967D2] text-[10px] font-bold">
                            <SkipForward size={10} className="fill-[#1967D2]" /> Replace stragglers
                        </div>
                    )}
                </div>
                     </div>
                  )}
                  {!sb.isOpen && (
                     <div className="flex gap-3 text-[10px]">
                        {sb.unhealthyCount > 0 && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded font-bold flex items-center gap-1"><AlertOctagon size={10}/> {sb.unhealthyCount} Unhealthy</span>}
                        {sb.suspectedCount > 0 && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-bold flex items-center gap-1"><AlertTriangle size={10}/> {sb.suspectedCount} Degraded</span>}
                         <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold flex items-center gap-1"><CheckCircle2 size={10}/> {sb.isOpen ? '' : '414'} Healthy</span>
                     </div>
                  )}
               </div>

               {/* Content */}
               {sb.isOpen && (
                 <div className="px-4 pb-4 pt-2 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sb.subblocks.map(block => (
                        <div key={block.id}>
                            <h5 className="text-xs text-slate-500 mb-2">{block.label}</h5>
                             <div className="flex flex-wrap gap-1">
                                {block.nodes.map((_, idx) => {
                                    const color = getNodeColor(blocks.indexOf(sb), sb.subblocks.indexOf(block), idx, viewMode);
                                    const isSelected = selectedNode?.sbId === sb.id && selectedNode?.bId === block.id && selectedNode?.idx === idx;
                                    const isPendingMaint = getNodeColor(blocks.indexOf(sb), sb.subblocks.indexOf(block), idx, 'MAINTENANCE') === COLORS.maintenance.pending;
                                    
                                    let mappedStatus: any;
                                    if (viewMode === 'HEALTH') {
                                      mappedStatus = color === COLORS.health.unhealthy ? 'unhealthy' :
                                                     color === COLORS.health.suspected ? 'degraded' : 'healthy';
                                    } else if (viewMode === 'MAINTENANCE') {
                                      mappedStatus = color === COLORS.maintenance.inprogress ? 'inprogress' :
                                                     color === COLORS.maintenance.available ? 'available' : 
                                                     color === COLORS.maintenance.pending ? 'pending' : 'uptodate';
                                    } else {
                                      mappedStatus = 'healthy';
                                    }

                                    return (
                                        <div 
                                          key={idx}
                                          onClick={() => {
                                            if (isSelected) setSelectedNode(null);
                                            else setSelectedNode({ sbId: sb.id, bId: block.id, idx, status: mappedStatus });
                                          }}
                                          className={`
                                            w-6 h-5 rounded-[2px] cursor-pointer transition-all relative
                                            ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400 z-20 scale-110' : 'z-0 hover:opacity-80'}
                                          `}
                                          style={{ 
                                            background: (isPendingMaint && viewMode === 'HEALTH') 
                                              ? `linear-gradient(135deg, ${COLORS.health.healthy} 50%, ${COLORS.maintenance.pending} 50%)` 
                                              : color 
                                          }}
                                          title={`Node ${idx}`}
                                        >
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Inline Health Detail */}
                    {selectedNode && selectedNode.sbId === sb.id && viewMode === 'HEALTH' && (
                      <NodeHealthDetail 
                        nodeIdx={selectedNode.idx} 
                        blockLabel={sb.subblocks.find(b => b.id === selectedNode.bId)?.label || ''} 
                        status={selectedNode.status}
                      />
                    )}

                    {/* Inline Maintenance Detail */}
                    {selectedNode && selectedNode.sbId === sb.id && viewMode === 'MAINTENANCE' && (
                      <NodeMaintenanceDetail 
                        nodeIdx={selectedNode.idx} 
                        blockLabel={sb.subblocks.find(b => b.id === selectedNode.bId)?.label || ''} 
                        status={selectedNode.status}
                      />
                    )}
                 </div>
               )}
            </div>
         ))}
      </div>
    </div>
  );
};
