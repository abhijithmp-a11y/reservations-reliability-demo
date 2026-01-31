
import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Shield, 
  Play, 
  SkipForward, 
  AlertTriangle, 
  AlertOctagon, 
  RefreshCw, 
  TrendingUp, 
  Plus, 
  LayoutGrid,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Pencil,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

// --- TYPES & CONSTANTS ---

type ViewMode = 'HEALTH' | 'UTILIZATION' | 'MAINTENANCE';

const COLORS = {
  health: {
    healthy: '#67e8f9', // Cyan-300
    suspected: '#fbbf24', // Amber-400
    unhealthy: '#f43f5e', // Rose-500
    schedulable: '#f59e0b', // Amber-500
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
    inprogress: '#ec4899', // Pink-500
    pending: '#8b5cf6', // Violet-500
  },
  repair: {
    pending: '#78350f', // Brown-900
    inprogress: '#451a03', // Brown-950
  }
};

// --- MOCK DATA ---

const MOCK_BLOCKS = [
  {
    id: 'sb1',
    label: 'Block 1',
    isOpen: false,
    healthyCount: 33,
    degradedCount: 1,
    unhealthyCount: 2,
    subblocks: [
      { id: 'b1', label: 'subblock 1', nodes: Array(18).fill(0) },
      { id: 'b2', label: 'subblock 2', nodes: Array(18).fill(0) },
    ]
  },
  {
    id: 'sb2',
    label: 'Block 2',
    isOpen: false,
    healthyCount: 32,
    degradedCount: 3,
    unhealthyCount: 1,
    subblocks: [
      { id: 'b3', label: 'subblock 1', nodes: Array(18).fill(0) },
      { id: 'b4', label: 'subblock 2', nodes: Array(18).fill(0) },
    ]
  },
  {
    id: 'sb3',
    label: 'Block 3',
    isOpen: false,
    healthyCount: 32,
    degradedCount: 0,
    unhealthyCount: 4,
    subblocks: [
      { id: 'b5', label: 'subblock 1', nodes: Array(18).fill(0) },
      { id: 'b6', label: 'subblock 2', nodes: Array(18).fill(0) },
    ]
  },
  {
    id: 'sb4',
    label: 'Block 4',
    isOpen: false,
    healthyCount: 36,
    degradedCount: 0,
    unhealthyCount: 0,
    subblocks: [
      { id: 'b7', label: 'subblock 1', nodes: Array(18).fill(0) },
      { id: 'b8', label: 'subblock 2', nodes: Array(18).fill(0) },
    ]
  }
];

// Health Data
const HEALTH_DONUT = [
  { name: 'Healthy', value: 414, color: COLORS.health.healthy },
  { name: 'Pending Maint.', value: 47, color: COLORS.maintenance.pending },
  { name: 'Degraded', value: 13, color: COLORS.health.suspected },
  { name: 'Unhealthy', value: 3, color: COLORS.health.unhealthy },
];

// Utilization Data
const UTIL_DONUT = [
  { name: 'Used', value: 510, color: '#a855f7' }, // Purple
  { name: 'Free', value: 120, color: '#e2e8f0' },
];

// Maintenance Data
const MAINT_DONUT = [
  { name: 'Up-to-date', value: 200, color: COLORS.maintenance.uptodate },
  { name: 'Pending', value: 47, color: COLORS.maintenance.pending },
  { name: 'Available', value: 150, color: COLORS.maintenance.available },
  { name: 'In Progress', value: 33, color: COLORS.maintenance.inprogress },
];

const SPARKLINE_DATA = [
  { v: 10 }, { v: 12 }, { v: 8 }, { v: 15 }, { v: 20 }, { v: 18 }, { v: 25 }
];

export const NODE_HEALTH_HISTORY = [
  { time: '09:00', temp: 45, util: 85 },
  { time: '09:15', temp: 48, util: 88 },
  { time: '09:30', temp: 52, util: 92 },
  { time: '09:45', temp: 88, util: 95 }, // Thermal spike
  { time: '10:00', temp: 82, util: 40 }, // Performance drop
  { time: '10:15', temp: 75, util: 10 }, // XID error
  { time: '10:30', temp: 65, util: 0 },
];

// --- COMPONENTS ---

const NodeHealthDetail: React.FC<{ 
  nodeIdx: number; 
  blockLabel: string; 
  status: 'healthy' | 'degraded' | 'unhealthy';
  hasVM: boolean;
}> = ({ nodeIdx, blockLabel, status, hasVM }) => {
  const config = {
    healthy: {
      color: 'bg-cyan-500',
      textColor: 'text-cyan-700',
      label: 'HEALTHY',
      detailLabel: 'Status',
      detailValue: 'Normal',
      action: 'None needed'
    },
    degraded: {
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      label: 'DEGRADED',
      detailLabel: hasVM ? 'Straggler node' : 'Repairs/Unschedulable',
      detailValue: hasVM ? 'High Latency' : 'Maintenance State',
      action: hasVM ? (
        <button className="text-[10px] font-bold text-[#1967D2] hover:underline">Investigate metrics</button>
      ) : (
        <button className="text-[10px] font-bold text-[#1967D2] hover:underline">Check logs</button>
      )
    },
    unhealthy: {
      color: 'bg-rose-600',
      textColor: 'text-rose-700',
      label: 'UNHEALTHY',
      detailLabel: 'Error Code',
      detailValue: 'XID 31 (Memory)',
      action: <button className="text-[10px] font-bold text-[#1967D2] hover:underline">Report & Replace</button>
    }
  }[status];

  return (
    <div className="col-span-full mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${config.color} text-white`}>
               {status === 'healthy' ? <CheckCircle2 size={10} /> : status === 'unhealthy' ? <AlertOctagon size={10} /> : <AlertTriangle size={10} />}
               {config.label}
            </div>
            Node {nodeIdx} Health Diagnostics ({blockLabel})
          </h4>
          <p className="text-[10px] text-slate-500">
            {hasVM ? 'Real-time telemetry and error markers' : 'Node state and repair logs'}
          </p>
        </div>
        {hasVM && (
          <div className="flex gap-2">
             <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
                <div className="w-2 h-0.5 bg-rose-500" /> Temperature (°C)
             </div>
             <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
                <div className="w-2 h-0.5 bg-blue-500" /> Utilization (%)
             </div>
          </div>
        )}
      </div>

      {hasVM ? (
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
      ) : (
        <div className="h-24 flex items-center justify-center bg-white border border-dashed border-slate-200 rounded mb-4">
           <div className="text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">No VM Active</div>
              <p className="text-[10px] text-slate-400">Time series metrics are unavailable for empty nodes.</p>
           </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Status</div>
          <div className={`text-xs font-bold ${config.textColor}`}>{config.label}</div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">{config.detailLabel}</div>
          <div className="text-xs font-bold text-slate-700">{config.detailValue}</div>
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
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${config.color} text-white`}>
               {status === 'uptodate' ? <Shield size={10} /> : status === 'inprogress' ? <RefreshCw size={10} className="animate-spin" /> : <AlertTriangle size={10} />}
               {config.label}
            </div>
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
            {status === 'available' && (
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
            {status === 'available' && (
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
          <div className="text-[9px] text-slate-400 uppercase font-bold">Repair Log</div>
          <div className="text-[10px] font-bold text-[#1967D2] hover:underline cursor-pointer flex items-center gap-1 mt-1">
            Machine repair log <ExternalLink size={10} />
          </div>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Action</div>
          <div className="text-[10px] font-bold text-slate-500">{config.action}</div>
        </div>
      </div>
    </div>
  );
};

export const UnifiedNodeDetail: React.FC<{ 
  nodeIdx: number; 
  blockLabel: string; 
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  maintStatus: 'uptodate' | 'available' | 'inprogress' | 'pending';
  repairStatus?: 'none' | 'pending' | 'inprogress';
  hasVM: boolean;
  onJobClick?: (jobId: string) => void;
}> = ({ nodeIdx, blockLabel, healthStatus, maintStatus, repairStatus = 'none', hasVM, onJobClick }) => {
  const healthConfig = {
    healthy: { color: 'bg-cyan-500', textColor: 'text-cyan-700', label: 'HEALTHY', detailValue: 'Normal', action: null },
    degraded: { color: 'bg-amber-500', textColor: 'text-amber-700', label: 'DEGRADED', detailValue: hasVM ? 'High Latency' : 'Maintenance State', action: 'Investigate metrics' },
    unhealthy: { 
      color: 'bg-rose-600', 
      textColor: 'text-rose-700', 
      label: 'UNHEALTHY', 
      detailValue: !hasVM ? 'In repair' : 'XID 31 (Memory)', 
      action: 'Replace node' 
    }
  }[healthStatus];

  const maintConfig = {
    uptodate: { color: 'bg-blue-500', textColor: 'text-blue-700', label: 'UP TO DATE', driver: 'v535.154.05' },
    pending: { color: 'bg-violet-500', textColor: 'text-violet-700', label: 'PENDING MAINTENANCE', driver: 'v535.154.05' },
    available: { color: 'bg-amber-500', textColor: 'text-amber-700', label: 'UPDATE AVAILABLE', driver: 'v535.129.03' },
    inprogress: { color: 'bg-pink-500', textColor: 'text-pink-700', label: 'UPDATING', driver: 'v535.154.05 (Applying...)' }
  }[maintStatus];

  const testRuns = [
    { id: 'TR-882', name: 'Memory Stress Test', status: 'PASS', date: '2h ago' },
    { id: 'TR-881', name: 'NVLink P2P Latency', status: healthStatus === 'unhealthy' ? 'FAIL' : 'PASS', date: '4h ago' },
    { id: 'TR-879', name: 'Thermal Throttling Check', status: healthStatus === 'degraded' ? 'WARN' : 'PASS', date: 'Yesterday' },
  ];

  return (
    <div className="col-span-full mt-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Node {nodeIdx} Comprehensive Diagnostics ({blockLabel})
          </h4>
          <p className="text-[10px] text-slate-500">Unified view of health, software stack, and recent diagnostic runs</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Health & Telemetry */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Health & Telemetry</h5>
            <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${healthConfig.color} text-white`}>
              {healthStatus === 'healthy' ? <CheckCircle2 size={12} /> : healthStatus === 'unhealthy' ? <AlertOctagon size={12} /> : <AlertTriangle size={12} />}
              {healthConfig.label}
            </div>
          </div>
          
          {hasVM && maintStatus !== 'inprogress' ? (
            <div className="h-32 w-full bg-slate-50 rounded border border-slate-100 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={NODE_HEALTH_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="util" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-[9px] text-slate-500"><div className="w-2 h-0.5 bg-rose-500" /> Temp</div>
                <div className="flex items-center gap-1 text-[9px] text-slate-500"><div className="w-2 h-0.5 bg-blue-500" /> Util</div>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded text-[10px] text-slate-400 text-center px-4">
              {maintStatus === 'inprogress' 
                ? 'Telemetry unavailable: Maintenance in progress.' 
                : 'Telemetry unavailable: No active VM on this node.'}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Issue</div>
              <div className="text-xs font-bold text-slate-700 truncate">{healthConfig.detailValue}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Uptime</div>
              <div className="text-xs font-bold text-slate-700">14d 2h 12m</div>
            </div>
            {hasVM && maintStatus !== 'inprogress' && (
              <div className="bg-slate-50 p-2 rounded border border-slate-100 col-span-2">
                <div className="text-[9px] text-slate-400 uppercase font-bold">Running Job</div>
                <button 
                  onClick={() => onJobClick?.(`job-zeta-${(nodeIdx * 13) % 900 + 100}`)}
                  className="text-xs font-mono font-bold text-[#1967D2] hover:underline cursor-pointer text-left block w-full"
                >
                  job-zeta-{(nodeIdx * 13) % 900 + 100}
                </button>
              </div>
            )}
          </div>
          {healthConfig.action && (
            <div className="pt-2">
              <button className={`w-full py-2 rounded text-xs font-bold text-white shadow-sm transition-all ${healthStatus === 'unhealthy' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                {healthConfig.action}
              </button>
            </div>
          )}

          {/* Recent VM Termination */}
          {hasVM && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Recent VM Termination</h5>
                <button className="text-[9px] font-bold text-[#1967D2] hover:underline flex items-center gap-0.5">
                  View history <ExternalLink size={10} />
                </button>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Reason</div>
                    <div className="text-[10px] font-bold text-slate-700">Preemption (Priority)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Time</div>
                    <div className="text-[10px] font-bold text-slate-700">Jan 24, 11:45 PM</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Col: Software & Maintenance */}
        <div className="space-y-4 border-l border-slate-100 pl-6">
          <div className="flex justify-between items-center">
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Software Stack</h5>
            <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${maintConfig.color} text-white`}>
              {maintStatus === 'uptodate' ? <Shield size={12} /> : maintStatus === 'inprogress' ? <RefreshCw size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
              {maintConfig.label}
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold">GPU Driver</span>
                <span className="text-[9px] text-slate-500 font-medium">Ubuntu 22.04</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-700">{maintConfig.driver}</div>
            </div>
            {maintStatus === 'pending' && (
              <div className="bg-violet-50 p-2.5 rounded border border-violet-100 mt-2 space-y-2">
                <div>
                  <div className="text-[9px] text-violet-600 uppercase font-bold mb-1">Future Version</div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-mono font-bold text-violet-700">v535.160.01</div>
                    <button className="text-[10px] font-bold text-white bg-violet-600 px-2 py-1 rounded hover:bg-violet-700 transition-colors shadow-sm">
                      Update now
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-violet-200/50">
                  <div>
                    <div className="text-[9px] text-violet-500 uppercase font-bold">Scheduled Start</div>
                    <div className="text-[10px] font-bold text-violet-700">Jan 25, 04:00 AM</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-violet-500 uppercase font-bold">Est. Duration</div>
                    <div className="text-[10px] font-bold text-violet-700">45 minutes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Orchestrator Agent</span>
                <span className="text-[9px] text-slate-500 font-medium">v2024.02.14</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-700">v2.4.12-stable</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Last Maintenance</div>
              <div className="text-xs font-bold text-slate-700">Jan 12, 2025 (Routine)</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Repair Log</div>
              <div className="text-[10px] font-bold text-[#1967D2] hover:underline cursor-pointer flex items-center gap-1">
                Machine repair log <ExternalLink size={10} />
              </div>
            </div>

            {/* Hardware Repairs Section */}
            {repairStatus !== 'none' && (
              <div className="pt-4 border-t border-slate-100 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Hardware Repairs</h5>
                  <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${repairStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {repairStatus.toUpperCase()}
                  </div>
                </div>
                <div className="bg-amber-50 p-2.5 rounded border border-amber-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] text-amber-600 uppercase font-bold">Unhealthy Component</div>
                      <div className="text-[10px] font-bold text-amber-900">NVLink Bridge (GPU 4-5)</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-amber-600 uppercase font-bold">
                        {repairStatus === 'inprogress' ? 'Repair started at' : 'Scheduled Start'}
                      </div>
                      <div className="text-[10px] font-bold text-amber-900">Jan 27, 02:00 PM</div>
                    </div>
                  </div>
                  {repairStatus !== 'inprogress' && (
                    <button className="w-full py-1.5 bg-amber-700 text-white text-[10px] font-bold rounded hover:bg-amber-800 transition-colors shadow-sm">
                      Send machine to repair now
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        {/* Right Col: Recent Test Runs */}
        <div className="space-y-4 border-l border-slate-100 pl-6">
          <div className="flex justify-between items-center">
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Recent Test Runs</h5>
            <button className="text-[10px] font-bold text-[#1967D2] bg-white border border-[#1967D2]/20 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
              Rerun diagnostics
            </button>
          </div>
          
          <div className="space-y-2">
            {testRuns.map(test => (
              <div key={test.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${test.status === 'PASS' ? 'bg-emerald-500' : test.status === 'FAIL' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <div>
                    <div className="text-[10px] font-bold text-slate-700 group-hover:text-[#1967D2]">{test.name}</div>
                    <div className="text-[9px] text-slate-400">{test.id} • {test.date}</div>
                  </div>
                </div>
                <div className={`text-[9px] font-bold ${test.status === 'PASS' ? 'text-emerald-600' : test.status === 'FAIL' ? 'text-rose-600' : 'text-amber-600'}`}>
                  {test.status}
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full py-2 border border-dashed border-slate-300 rounded text-[10px] font-bold text-slate-500 hover:border-[#1967D2] hover:text-[#1967D2] transition-all">
            View all run history
          </button>
        </div>
      </div>
    </div>
  );
};

const HealthTooltip = ({ content, children, align = 'center' }: { content: string; children: React.ReactNode; align?: 'left' | 'center' | 'right' }) => (
  <div className="group relative inline-block">
    {children}
    <div className={`
      absolute bottom-full mb-2 w-max max-w-[220px] p-2.5 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none font-normal whitespace-normal border border-white/10 backdrop-blur-sm
      ${align === 'center' ? 'left-1/2 -translate-x-1/2 text-center' : ''}
      ${align === 'left' ? 'left-0 text-left' : ''}
      ${align === 'right' ? 'right-0 text-right' : ''}
    `}>
      {content}
      <div className={`
        absolute top-full border-[6px] border-transparent border-t-slate-900
        ${align === 'center' ? 'left-1/2 -translate-x-1/2' : ''}
        ${align === 'left' ? 'left-4' : ''}
        ${align === 'right' ? 'right-4' : ''}
      `} />
    </div>
  </div>
);

export const ClusterDirectorV2: React.FC<{ 
  onBack?: () => void; 
  clusterId?: string;
  onJobClick?: (jobId: string) => void;
}> = ({ onBack, clusterId, onJobClick }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('HEALTH');
  const [blocks, setBlocks] = useState(MOCK_BLOCKS);
  const [basicsOpen, setBasicsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [blockFilter, setBlockFilter] = useState<'ALL' | 'HEALTHY' | 'UNHEALTHY'>('ALL');
  const [subblockFilter, setSubblockFilter] = useState<'ALL' | 'HEALTHY' | 'UNHEALTHY' | 'SCHEDULABLE'>('ALL');
  const [expandedSubblocks, setExpandedSubblocks] = useState<Set<string>>(new Set());

  const toggleSubblock = (id: string) => {
    setExpandedSubblocks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const [selectedNode, setSelectedNode] = useState<{ 
    sbId: string; 
    blockId: string; 
    nodeIdx: number;
    status: any;
    hasVM: boolean;
    repairStatus?: 'none' | 'pending' | 'inprogress';
  } | null>(null);

  const handleTabChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedNode(null); // Reset selection when switching modes to avoid status mismatch
  };

  const getNodeColor = (sbIdx: number, blockIdx: number, nodeIdx: number, mode: ViewMode) => {
    // Deterministic mock pattern for visuals
    const key = (sbIdx * 36) + (blockIdx * 18) + nodeIdx;
    
    if (mode === 'HEALTH') {
      // SB 0 (sb1): 15 (U), 30 (U), 20 (D), 21 (U), 28 (U)
      if (sbIdx === 0) {
        if (key === 15 || key === 30 || key === 21 || key === 28) return COLORS.health.unhealthy;
        if (key === 20) return COLORS.health.suspected;
      }
      // SB 1 (sb2): 42 (U), 50, 51, 52 (D)
      if (sbIdx === 1) {
        if (key === 42) return COLORS.health.unhealthy;
        if (key >= 50 && key <= 52) return COLORS.health.suspected;
      }
      // SB 2 (sb3): 80, 81, 90, 91 (U)
      if (sbIdx === 2) {
        if (key === 80 || key === 81 || key === 90 || key === 91) return COLORS.health.unhealthy;
      }
      
      return COLORS.health.healthy;
    }

    if (mode === 'UTILIZATION') {
      if (key % 15 === 0) return COLORS.utilization.straggler;
      if (key % 3 === 0) return COLORS.utilization.low;
      if (key % 3 === 1) return COLORS.utilization.med;
      return COLORS.utilization.high;
    }

    if (mode === 'MAINTENANCE') {
      if (key % 12 === 0) return COLORS.maintenance.inprogress;
      if (key % 8 === 0) return COLORS.maintenance.available;
      // Specific keys for pending: 3, 7, 12, 22, 28
      if (key % 17 === 0 || [3, 7, 12, 22, 28].includes(key)) return COLORS.maintenance.pending;
      return COLORS.maintenance.uptodate;
    }
    
    return '#e2e8f0';
  };

  const reconciledMetrics = useMemo(() => {
    let totalNodes = 0;
    let nodesWithVM = 0;
    let emptyNodes = 0;
    let healthyCount = 0;
    let pendingMaintCount = 0;
    let pendingRepairCount = 0;
    let inRepairCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;

    let maintUpToDate = 0;
    let maintAvailable = 0;
    let maintInProgress = 0;

    let healthyBlocks = 0;
    let unhealthyBlocks = 0;
    let healthySubblocks = 0;
    let unhealthySubblocks = 0;
    let schedulableSubblocks = 0;

    let maintBlocksPending = 0;
    let maintBlocksInProgress = 0;
    let maintSubblocksPending = 0;
    let maintSubblocksInProgress = 0;

    let repairSubblocksPending = 0;
    let repairSubblocksInProgress = 0;

    blocks.forEach((sb, sbIdx) => {
      let isBlockHealthy = true;
      let blockHasMaintPending = false;
      let blockHasMaintInProgress = false;

      sb.subblocks.forEach((block, blockIdx) => {
        let healthyNodesInSubblock = 0;
        let subblockHasMaintPending = false;
        let subblockHasMaintInProgress = false;
        let subblockHasRepairPending = false;
        let subblockHasRepairInProgress = false;

        block.nodes.forEach((_, nodeIdx) => {
          const key = (sbIdx * 36) + (blockIdx * 18) + nodeIdx;
          if (key % 13 === 5) subblockHasRepairPending = true;
          if (key % 13 === 8) subblockHasRepairInProgress = true;
          
          totalNodes++;
          const hasVM = key % 7 !== 0;
          
          if (hasVM) {
            nodesWithVM++;
            
            const healthColor = getNodeColor(sbIdx, blockIdx, nodeIdx, 'HEALTH');
            if (healthColor === COLORS.health.unhealthy) {
              unhealthyCount++;
            }
            else {
              healthyNodesInSubblock++;
              if (healthColor === COLORS.health.suspected) degradedCount++;
              else healthyCount++;
            }

            if (key % 13 === 5) pendingRepairCount++;
            if (key % 13 === 8) inRepairCount++;

            const maintColor = getNodeColor(sbIdx, blockIdx, nodeIdx, 'MAINTENANCE');
            if (maintColor === COLORS.maintenance.pending) {
              pendingMaintCount++;
              subblockHasMaintPending = true;
              blockHasMaintPending = true;
            }
            else if (maintColor === COLORS.maintenance.uptodate) maintUpToDate++;
            else if (maintColor === COLORS.maintenance.available) maintAvailable++;
            else if (maintColor === COLORS.maintenance.inprogress) {
              maintInProgress++;
              subblockHasMaintInProgress = true;
              blockHasMaintInProgress = true;
            }
          } else {
            emptyNodes++;
            const healthColor = getNodeColor(sbIdx, blockIdx, nodeIdx, 'HEALTH');
            if (healthColor === COLORS.health.unhealthy) {
              unhealthyCount++;
            } else {
              healthyNodesInSubblock++;
            }
          }
        });
        
        if (subblockHasMaintPending) maintSubblocksPending++;
        if (subblockHasMaintInProgress) maintSubblocksInProgress++;

        if (subblockHasRepairPending) repairSubblocksPending++;
        if (subblockHasRepairInProgress) repairSubblocksInProgress++;

        if (healthyNodesInSubblock === 18) {
          healthySubblocks++;
        } else if (healthyNodesInSubblock >= 16) {
          schedulableSubblocks++;
          isBlockHealthy = false;
        } else {
          unhealthySubblocks++;
          isBlockHealthy = false;
        }
      });
      if (isBlockHealthy) healthyBlocks++;
      else unhealthyBlocks++;

      if (blockHasMaintPending) maintBlocksPending++;
      if (blockHasMaintInProgress) maintBlocksInProgress++;
    });

    return {
      totalNodes,
      nodesWithVM,
      emptyNodes,
      healthyCount,
      pendingMaintCount,
      pendingRepairCount,
      degradedCount,
      unhealthyCount,
      maintUpToDate,
      maintAvailable,
      maintInProgress,
      healthyBlocks,
      unhealthyBlocks,
      healthySubblocks,
      unhealthySubblocks,
      schedulableSubblocks,
      maintBlocksPending,
      maintBlocksInProgress,
      maintSubblocksPending,
      maintSubblocksInProgress,
      repairSubblocksPending,
      repairSubblocksInProgress,
      inRepairCount,
      unplannedCount: Math.round(totalNodes * 0.01),
      upcomingImpact: {
        fiveDays: Math.round(totalNodes * 0.18),
        week: Math.round(totalNodes * 0.13),
        month: Math.round(totalNodes * 0.5)
      }
    };
  }, [blocks]);

  const dynamicHealthDonut = [
    { name: 'Healthy', value: reconciledMetrics.healthyCount, color: COLORS.health.healthy },
    { name: 'Pending Maint.', value: reconciledMetrics.pendingMaintCount, color: COLORS.maintenance.pending },
    { name: 'Pending Repair', value: reconciledMetrics.pendingRepairCount, color: COLORS.repair.pending },
    { name: 'Degraded', value: reconciledMetrics.degradedCount, color: COLORS.health.suspected },
    { name: 'Unhealthy', value: reconciledMetrics.unhealthyCount, color: COLORS.health.unhealthy },
  ];

  const dynamicMaintDonut = [
    { name: 'Up-to-date', value: reconciledMetrics.maintUpToDate, color: COLORS.maintenance.uptodate },
    { name: 'Pending', value: reconciledMetrics.pendingMaintCount, color: COLORS.maintenance.pending },
    { name: 'Available', value: reconciledMetrics.maintAvailable, color: COLORS.maintenance.available },
    { name: 'In Progress', value: reconciledMetrics.maintInProgress, color: COLORS.maintenance.inprogress },
  ];

  const toggleBlock = (id: string) => {
    setBlocks(prev => prev.map(sb => sb.id === id ? { ...sb, isOpen: !sb.isOpen } : sb));
    if (selectedNode?.sbId === id) setSelectedNode(null);
  };

   const renderDashboardCard = () => {
    switch (viewMode) {
      case 'HEALTH':
        return (
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Blocks Health */}
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Blocks</h4>
                           <div className="flex items-center bg-slate-100 rounded-md p-0.5">
                              {(['ALL', 'HEALTHY', 'UNHEALTHY'] as const).map((f) => (
                                 <button
                                    key={f}
                                    onClick={() => setBlockFilter(f)}
                                    className={`px-2 py-0.5 text-[9px] font-black rounded transition-all ${
                                       blockFilter === f 
                                          ? 'bg-white text-slate-900 shadow-sm' 
                                          : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                 >
                                    {f}
                                 </button>
                              ))}
                           </div>
                        </div>
                        <p className="text-xs text-slate-500">Healthy vs Unhealthy</p>
                     </div>
                     <div className="text-right">
                        <span className="text-2xl font-black text-slate-900">{reconciledMetrics.healthyBlocks + reconciledMetrics.unhealthyBlocks}</span>
                        <span className="text-[10px] text-slate-400 ml-1 uppercase font-bold tracking-tighter">Total Blocks</span>
                     </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                     <div 
                        className="h-full bg-cyan-400 transition-all duration-500" 
                        style={{ width: `${(reconciledMetrics.healthyBlocks / (reconciledMetrics.healthyBlocks + reconciledMetrics.unhealthyBlocks)) * 100}%` }}
                     />
                     <div 
                        className="h-full bg-rose-500 transition-all duration-500" 
                        style={{ width: `${(reconciledMetrics.unhealthyBlocks / (reconciledMetrics.healthyBlocks + reconciledMetrics.unhealthyBlocks)) * 100}%` }}
                     />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                     <HealthTooltip align="left" content="A block is Healthy if all its subblocks are fully healthy (18/18 nodes).">
                        <div className="flex items-center gap-2 text-cyan-600 cursor-help">
                           <div className="w-2 h-2 rounded-full bg-cyan-400" />
                           Healthy: {reconciledMetrics.healthyBlocks}
                        </div>
                     </HealthTooltip>
                     <HealthTooltip align="right" content="A block is Unhealthy if it contains at least one subblock that is Schedulable or Unhealthy.">
                        <div className="flex items-center gap-2 text-rose-600 cursor-help">
                           Unhealthy: {reconciledMetrics.unhealthyBlocks}
                           <div className="w-2 h-2 rounded-full bg-rose-500" />
                        </div>
                     </HealthTooltip>
                  </div>
               </div>

               {/* Subblocks Health */}
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Subblocks</h4>
                           <div className="flex items-center bg-slate-100 rounded-md p-0.5">
                              {(['ALL', 'HEALTHY', 'SCHEDULABLE', 'UNHEALTHY'] as const).map((f) => (
                                 <button
                                    key={f}
                                    onClick={() => setSubblockFilter(f)}
                                    className={`px-2 py-0.5 text-[9px] font-black rounded transition-all ${
                                       subblockFilter === f 
                                          ? 'bg-white text-slate-900 shadow-sm' 
                                          : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                 >
                                    {f}
                                 </button>
                              ))}
                           </div>
                        </div>
                        <p className="text-xs text-slate-500">Healthy vs Unhealthy</p>
                     </div>
                     <div className="text-right">
                        <span className="text-2xl font-black text-slate-900">{reconciledMetrics.healthySubblocks + reconciledMetrics.unhealthySubblocks + reconciledMetrics.schedulableSubblocks}</span>
                        <span className="text-[10px] text-slate-400 ml-1 uppercase font-bold tracking-tighter">Total Subblocks</span>
                     </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                     <div 
                        className="h-full bg-cyan-400 transition-all duration-500" 
                        style={{ width: `${(reconciledMetrics.healthySubblocks / (reconciledMetrics.healthySubblocks + reconciledMetrics.unhealthySubblocks + reconciledMetrics.schedulableSubblocks)) * 100}%` }}
                     />
                     <div 
                        className="h-full bg-amber-500 transition-all duration-500" 
                        style={{ width: `${(reconciledMetrics.schedulableSubblocks / (reconciledMetrics.healthySubblocks + reconciledMetrics.unhealthySubblocks + reconciledMetrics.schedulableSubblocks)) * 100}%` }}
                     />
                     <div 
                        className="h-full bg-rose-500 transition-all duration-500" 
                        style={{ width: `${(reconciledMetrics.unhealthySubblocks / (reconciledMetrics.healthySubblocks + reconciledMetrics.unhealthySubblocks + reconciledMetrics.schedulableSubblocks)) * 100}%` }}
                     />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                     <HealthTooltip align="left" content="A subblock is Healthy if 18 out of 18 machines are healthy.">
                        <div className="flex items-center gap-2 text-cyan-600 cursor-help">
                           <div className="w-2 h-2 rounded-full bg-cyan-400" />
                           Healthy: {reconciledMetrics.healthySubblocks}
                        </div>
                     </HealthTooltip>
                     <HealthTooltip content="A subblock is Schedulable if 16 or 17 machines are healthy. Viable for most workloads.">
                        <div className="flex items-center gap-2 text-amber-600 cursor-help">
                           <div className="w-2 h-2 rounded-full bg-amber-500" />
                           Schedulable: {reconciledMetrics.schedulableSubblocks}
                        </div>
                     </HealthTooltip>
                     <HealthTooltip align="right" content="A subblock is Unhealthy if fewer than 16 machines are healthy. Critical failure state.">
                        <div className="flex items-center gap-2 text-rose-600 cursor-help">
                           Unhealthy: {reconciledMetrics.unhealthySubblocks}
                           <div className="w-2 h-2 rounded-full bg-rose-500" />
                        </div>
                     </HealthTooltip>
                  </div>
               </div>
            </div>


          </div>
        );

      case 'UTILIZATION':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
             <div className="space-y-3">
               <h4 className="font-bold text-slate-800 text-xs">Reserved capacity</h4>
               <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base"><AlertTriangle size={16} className="text-amber-500" /> {reconciledMetrics.emptyNodes} / {reconciledMetrics.totalNodes} VMs</div>
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
               <div className="h-6 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={SPARKLINE_DATA} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                      <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
               <button className="text-[#1967D2] text-[10px] font-bold hover:underline">See cluster trends</button>
             </div>

             <div className="relative w-28 h-28 shrink-0 mx-auto">
               <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                 <PieChart>
                   <Pie data={UTIL_DONUT} innerRadius={40} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                     {UTIL_DONUT.map((e, i) => <Cell key={i} fill={e.color} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-xl font-bold text-slate-700">510</span>
                 <span className="text-[9px] text-slate-400 uppercase font-bold">Total jobs</span>
               </div>
             </div>

             <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Straggler detection <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block ml-0.5"></span></h4>
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base"><TrendingUp size={16} className="text-orange-500" /> 5 / {reconciledMetrics.totalNodes} VMs</div>
                <p className="text-[10px] text-slate-500 leading-tight">Use checkpointing to replace nodes and keep jobs running.</p>
                <button className="text-[#1967D2] text-[10px] font-bold hover:underline">Learn more</button>
             </div>
          </div>
        );

      case 'MAINTENANCE':
        const maintChartData = [
          { name: 'Blocks', ongoing: reconciledMetrics.maintBlocksInProgress, pending: reconciledMetrics.maintBlocksPending },
          { name: 'Subblocks', ongoing: reconciledMetrics.maintSubblocksInProgress, pending: reconciledMetrics.maintSubblocksPending },
          { name: 'VMs', ongoing: reconciledMetrics.maintInProgress, pending: reconciledMetrics.pendingMaintCount },
        ];

        const repairChartData = [
          { name: 'Subblocks', ongoing: reconciledMetrics.repairSubblocksInProgress, pending: reconciledMetrics.repairSubblocksPending },
          { name: 'Machines', ongoing: reconciledMetrics.inRepairCount, pending: reconciledMetrics.pendingRepairCount },
        ];

        const CustomMaintTooltip = ({ active, payload }: any) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isOngoing = payload[0].dataKey === 'ongoing';
            return (
              <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-[10px] border border-slate-700 animate-fadeIn">
                <div className="font-bold mb-1 border-b border-slate-700 pb-1 uppercase tracking-wider text-slate-400">
                  {data.name} Maintenance
                </div>
                {isOngoing ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      <span className="font-bold text-pink-400">Ongoing:</span> {data.ongoing} units
                    </div>
                    <div className="text-slate-300 pl-3.5">
                      Started: Jan 30, 08:00 AM<br />
                      Expected end: Jan 30, 11:00 AM
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      <span className="font-bold text-violet-400">Pending:</span> {data.pending} units
                    </div>
                    <div className="text-slate-300 pl-3.5">
                      Expected start: Jan 30, 02:00 PM<br />
                      Expected end: Jan 30, 04:00 PM
                    </div>
                  </div>
                )}
              </div>
            );
          }
          return null;
        };

        const CustomRepairTooltip = ({ active, payload }: any) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isOngoing = payload[0].dataKey === 'ongoing';
            return (
              <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-[10px] border border-slate-700 animate-fadeIn">
                <div className="font-bold mb-1 border-b border-slate-700 pb-1 uppercase tracking-wider text-slate-400">
                  {data.name} Repair
                </div>
                {isOngoing ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#451a03]" />
                      <span className="font-bold text-amber-600">In Repair:</span> {data.ongoing} units
                    </div>
                    <div className="text-slate-300 pl-3.5">
                      Status: Active repair session<br />
                      Technician: Assigned
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#78350f]" />
                      <span className="font-bold text-amber-800">Pending:</span> {data.pending} units
                    </div>
                    <div className="text-slate-300 pl-3.5">
                      Status: Queued for repair<br />
                      Priority: High
                    </div>
                  </div>
                )}
              </div>
            );
          }
          return null;
        };

        return (
          <div className="p-6 space-y-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Maintenance</h4>
                  <p className="text-xs text-slate-500">Ongoing vs Pending maintenance across hierarchy levels</p>
                </div>
                <div className="flex gap-4 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5 text-pink-600">
                    <div className="w-2 h-2 rounded-full bg-pink-500" /> Ongoing
                  </div>
                  <div className="flex items-center gap-1.5 text-violet-600">
                    <div className="w-2 h-2 rounded-full bg-violet-500" /> Pending
                  </div>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Tooltip shared={false} content={<CustomMaintTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="ongoing" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="pending" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Repairs</h4>
                  <p className="text-xs text-slate-500">Hardware repairs for subblocks and machines</p>
                </div>
                <div className="flex gap-4 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5 text-[#451a03]">
                    <div className="w-2 h-2 rounded-full bg-[#451a03]" /> In Repair
                  </div>
                  <div className="flex items-center gap-1.5 text-[#78350f]">
                    <div className="w-2 h-2 rounded-full bg-[#78350f]" /> Pending
                  </div>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={repairChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Tooltip shared={false} content={<CustomRepairTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="ongoing" fill="#451a03" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="pending" fill="#78350f" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-900 pb-10">
      
      {onBack && (
        <div className="flex justify-between items-center mb-2">
          <button onClick={onBack} className="text-slate-500 hover:text-[#1967D2] text-xs flex items-center gap-1 font-medium transition-colors">
            <ArrowLeft size={14} /> Back to fleet
          </button>
          {clusterId && (
            <div className="text-xs text-slate-500">
              <span className="font-bold text-slate-700">{clusterId}</span>
            </div>
          )}
        </div>
      )}

      {/* Top Navigation - Removed as per request to merge views */}

      <div className="space-y-6 animate-fadeIn">
         {/* Combined Summary Block (Now at the top) */}
         <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* VMs Used Section */}
            <div className="flex items-center gap-6">
               <div className="relative w-20 h-20 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie 
                          data={[{value: 100}]} 
                          innerRadius={32} 
                          outerRadius={40} 
                          dataKey="value" 
                          startAngle={90} 
                          endAngle={-270} 
                          stroke="none"
                        >
                           <Cell fill="#1a73e8" />
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-lg font-bold text-slate-800">{reconciledMetrics.nodesWithVM}</span>
                     <span className="text-[9px] text-slate-500 uppercase font-bold">Used</span>
                  </div>
               </div>
               <div>
                  <h4 className="text-sm font-medium text-slate-800 mb-1">VMs used</h4>
                  <p className="text-xs text-slate-500">Compute Engine and GKE</p>
               </div>
            </div>

            {/* Unused Capacity Section */}
            <div className="md:pl-8 pt-6 md:pt-0">
               <h4 className="text-sm font-medium text-slate-800 mb-1">Unused capacity</h4>
               <div className="text-lg font-bold text-slate-900 mb-1">{reconciledMetrics.emptyNodes} / {reconciledMetrics.totalNodes} instances</div>
               <p className="text-xs text-slate-500">
                  {Math.round((reconciledMetrics.emptyNodes / reconciledMetrics.totalNodes) * 100)}% not in use. <a href="#" className="text-[#1a73e8] hover:underline inline-flex items-center gap-0.5">Learn more <ExternalLink size={10} /></a>
               </p>
            </div>

            {/* Maintenance Section */}
            <div className="md:pl-8 pt-6 md:pt-0">
               <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="text-sm font-medium text-slate-800">Maintenance and Repairs</h4>
                  <HelpCircle size={14} className="text-slate-400 cursor-help" />
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                  There are Maintenance and Repairs affecting this reservation. <button onClick={() => handleTabChange('MAINTENANCE')} className="text-[#1a73e8] hover:underline font-medium">View details</button>
               </p>
            </div>
         </div>

         {/* Physical Resource Topology Section (Now below summary) */}
         <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Reservation overview</h3>
            
            {/* Unified Logical Block: Metrics + Topology */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
               <div className="px-6 pt-4 border-b border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-6">
                    {(['HEALTH', 'MAINTENANCE'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleTabChange(mode)}
                        className={`pb-3 text-xs font-bold transition-all relative ${
                          viewMode === mode 
                            ? 'text-[#1967D2]' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {mode === 'MAINTENANCE' ? 'Maintenance and repairs' : mode.charAt(0) + mode.slice(1).toLowerCase()}
                        {viewMode === mode && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1967D2] rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
               </div>
               {renderDashboardCard()}
            </div>
         </div>





























                                            




         {/* Collapsible Details Sections */}
         <div className="space-y-4">
            {/* Reservation Basics Collapsible */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
               <button 
                 onClick={() => setBasicsOpen(!basicsOpen)}
                 className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
               >
                  <h3 className="text-lg font-medium text-slate-900">Reservation basics</h3>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${basicsOpen ? 'rotate-180' : ''}`} />
               </button>
               {basicsOpen && (
                  <div className="px-6 pb-6 border-t border-slate-100 animate-fadeIn">
                     <div className="border border-slate-200 rounded overflow-hidden mt-4">
                        <table className="w-full text-sm">
                           <tbody className="divide-y divide-slate-100">
                              {[
                                { label: 'Status', value: <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200"><CheckCircle2 size={12} /> Ready</span> },
                                { label: 'Assured count', value: '17' },
                                { label: 'Creation time', value: 'January 7, 2026, 9:05 AM' },
                                { label: 'Auto-delete time', value: 'February 6, 2026, 12:00 AM' },
                                { label: 'Location', value: 'us-west8-a' },
                                { label: 'Number of subblocks', value: '1' },
                                { label: 'Health status', value: <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200"><AlertTriangle size={12} /> Degraded</span> },
                                { label: 'Healthy subblocks', value: '0' },
                                { label: 'Degraded subblocks', value: '1' },
                                { label: 'Deployment type', value: 'Dense' },
                                { label: 'Maintenance mode', value: 'Grouped' },
                                { label: 'Operational mode', value: 'All capacity' },
                                { label: 'Description', value: '-' },
                                { label: 'Linked Commitments', value: '-' },
                                { label: 'Share with other Google services', value: <div className="flex items-center justify-between w-full"><span>No</span> <Pencil size={14} className="text-[#1a73e8] cursor-pointer" /></div> },
                                { label: 'Share type', value: 'Local' },
                                { label: 'Shared with', value: '-' },
                                { label: 'Use with VM instance', value: 'Specific' },
                              ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                   <td className="py-2.5 px-4 text-slate-600 font-medium w-1/2">{row.label}</td>
                                   <td className="py-2.5 px-4 text-slate-900">{row.value}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}
            </div>

            {/* Configuration Details Collapsible */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
               <button 
                 onClick={() => setConfigOpen(!configOpen)}
                 className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
               >
                  <h3 className="text-lg font-medium text-slate-900">Configuration details</h3>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${configOpen ? 'rotate-180' : ''}`} />
               </button>
               {configOpen && (
                  <div className="px-6 pb-6 border-t border-slate-100 animate-fadeIn">
                     <div className="border border-slate-200 rounded overflow-hidden mt-4">
                        <table className="w-full text-sm">
                           <tbody className="divide-y divide-slate-100">
                              {[
                                { label: 'Number of VM instances', value: reconciledMetrics.totalNodes.toString() },
                                { label: 'VMs in use', value: reconciledMetrics.nodesWithVM.toString() },
                                { label: 'Machine type', value: 'a4x-highgpu-4g' },
                                { label: 'vCPUs', value: '140' },
                                { label: 'Memory', value: '884 GB' },
                                { label: 'Min CPU Platform', value: 'Automatic' },
                                { label: 'Placement policy', value: '-' },
                              ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                   <td className="py-2.5 px-4 text-slate-600 font-medium w-1/2">{row.label}</td>
                                   <td className="py-2.5 px-4 text-slate-900">{row.value}</td>
                                </tr>
                              ))}
                              {/* Accelerators Sub-header */}
                              <tr className="bg-slate-50/50">
                                 <td colSpan={2} className="py-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Accelerators</td>
                              </tr>
                              {[
                                { label: 'Accelerator type', value: 'GB200' },
                                { label: 'Accelerator count', value: '4' },
                              ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                   <td className="py-2.5 px-4 text-slate-600 font-medium w-1/2">{row.label}</td>
                                   <td className="py-2.5 px-4 text-slate-900">{row.value}</td>
                                </tr>
                              ))}
                              {/* Local SSDs Sub-header */}
                              <tr className="bg-slate-50/50">
                                 <td colSpan={2} className="py-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Local SSDs</td>
                              </tr>
                              {[
                                { label: 'Local SSD count', value: '4' },
                                { label: 'Interface', value: 'NVME' },
                              ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                   <td className="py-2.5 px-4 text-slate-600 font-medium w-1/2">{row.label}</td>
                                   <td className="py-2.5 px-4 text-slate-900">{row.value}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Physical Resource Topology Section (Moved to bottom) */}
         <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Physical resource topology</h3>
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
               {/* Topology Legend (Moved to top) */}
               <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Legend:</div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                      <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: COLORS.health.healthy }} /> Healthy
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                      <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: COLORS.health.suspected }} /> Degraded
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                      <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: COLORS.health.unhealthy }} /> Unhealthy
                    </div>
                  </div>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                      <div className="w-3 h-3 rounded-[2px]" style={{ background: `linear-gradient(135deg, ${COLORS.health.healthy} 50%, ${COLORS.maintenance.pending} 50%)` }} /> Maint. Pending
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                      <div className="w-3 h-3 rounded-[2px]" style={{ background: `linear-gradient(135deg, ${COLORS.health.unhealthy} 50%, ${COLORS.maintenance.inprogress} 50%)` }} /> Ongoing Maint.
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                      <div className="w-3 h-3 rounded-[2px]" style={{ background: `linear-gradient(135deg, ${COLORS.health.healthy} 50%, ${COLORS.repair.pending} 50%)` }} /> Repair Pending
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                      <div className="w-3 h-3 rounded-[2px] border flex items-center justify-center" style={{ borderColor: COLORS.repair.inprogress }}>
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: COLORS.repair.inprogress }} />
                      </div>
                      In Repair
                    </div>
                  </div>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                    <div className="w-3 h-3 rounded-[2px] border border-slate-300 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-slate-400" />
                    </div>
                    Empty (No VM)
                  </div>
               </div>

               <div className="p-6">
                  <div className="grid grid-cols-1 gap-8">
                    {blocks.map((sb, originalSbIdx) => {
                      const isExpanded = expandedSubblocks.has(sb.id);
                      
                      // Apply filter
                      const healthyNodesInSb = sb.subblocks.reduce((acc, b) => acc + b.nodes.filter((_, nIdx) => {
                         const key = (originalSbIdx * 36) + (sb.subblocks.indexOf(b) * 18) + nIdx;
                         const hasVM = key % 7 !== 0;
                         return !hasVM || getNodeColor(originalSbIdx, sb.subblocks.indexOf(b), nIdx, 'HEALTH') !== COLORS.health.unhealthy;
                      }).length, 0);
                      
                      const sbStatus = healthyNodesInSb === 36 ? 'HEALTHY' : 
                                       healthyNodesInSb >= 32 ? 'SCHEDULABLE' : 'UNHEALTHY';
                                       
                      if (subblockFilter !== 'ALL' && sbStatus !== subblockFilter) return null;

                      return (
                        <div key={sb.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
                          <div 
                            className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => toggleSubblock(sb.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${sbStatus === 'HEALTHY' ? 'bg-emerald-500' : sbStatus === 'SCHEDULABLE' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Block</span>
                                <h4 className="text-sm font-medium text-slate-800">B{originalSbIdx + 1}</h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="p-4 border-t border-slate-100 space-y-6 animate-slideDown">
                              {sb.subblocks.map((block, bIdx) => {
                                const blockHealth = block.nodes.map((_, nodeIdx) => getNodeColor(originalSbIdx, bIdx, nodeIdx, 'HEALTH'));
                                const hCount = blockHealth.filter(c => c === COLORS.health.healthy).length;
                                const dCount = blockHealth.filter(c => c === COLORS.health.suspected).length;
                                const uCount = blockHealth.filter(c => c === COLORS.health.unhealthy).length;

                                const blockMaint = block.nodes.map((_, nodeIdx) => getNodeColor(originalSbIdx, bIdx, nodeIdx, 'MAINTENANCE'));
                                const mUpToDate = blockMaint.filter(c => c === COLORS.maintenance.uptodate).length;
                                const mAvailable = blockMaint.filter(c => c === COLORS.maintenance.available).length;
                                const mInProgress = blockMaint.filter(c => c === COLORS.maintenance.inprogress).length;

                                return (
                                  <div key={block.id}>
                                    <div className="flex justify-between items-center mb-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subblock</h5>
                                        <span className="text-[9px] font-mono text-slate-400">B{originalSbIdx + 1}-sb{bIdx + 1}</span>
                                      </div>
                                      <div className="flex gap-2 text-[9px] font-bold">
                                        {viewMode === 'MAINTENANCE' ? (
                                          <>
                                            <span className="text-blue-600">U: {mUpToDate}</span>
                                            {mAvailable > 0 && <span className="text-amber-600">A: {mAvailable}</span>}
                                            {mInProgress > 0 && <span className="text-pink-600">P: {mInProgress}</span>}
                                          </>
                                        ) : (
                                          <>
                                            <span className="text-cyan-600">H: {hCount}</span>
                                            {dCount > 0 && <span className="text-amber-600">D: {dCount}</span>}
                                            {uCount > 0 && <span className="text-rose-600">U: {uCount}</span>}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {block.nodes.map((_, nodeIdx) => {
                                        const key = (nodeIdx + bIdx * 18 + originalSbIdx * 36);
                                        const isPendingRepair = key % 13 === 5;
                                        const isInRepair = key % 13 === 8;
                                        const hasVM = (key % 7 !== 0) && !isInRepair;
                                        
                                        const healthColor = getNodeColor(originalSbIdx, bIdx, nodeIdx, 'HEALTH');
                                        const isSelected = selectedNode?.sbId === sb.id && selectedNode?.blockId === block.id && selectedNode?.nodeIdx === nodeIdx;
                                        const isPendingMaint = getNodeColor(originalSbIdx, bIdx, nodeIdx, 'MAINTENANCE') === COLORS.maintenance.pending;
                                        const isOngoingMaint = getNodeColor(originalSbIdx, bIdx, nodeIdx, 'MAINTENANCE') === COLORS.maintenance.inprogress;
                                        
                                        const status = healthColor === COLORS.health.unhealthy ? 'unhealthy' : 
                                                 healthColor === COLORS.health.suspected ? 'degraded' : 'healthy';
                                        
                                        return (
                                          <div 
                                            key={nodeIdx}
                                            className={`w-6 h-5 rounded-[2px] cursor-pointer transition-all flex items-center justify-center ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400 scale-110 z-10' : 'hover:opacity-80'}`}
                                            style={{ 
                                              background: hasVM 
                                                ? (isPendingMaint 
                                                    ? `linear-gradient(135deg, ${healthColor} 50%, ${COLORS.maintenance.pending} 50%)` 
                                                    : (isOngoingMaint
                                                       ? `linear-gradient(135deg, ${healthColor} 50%, ${COLORS.maintenance.inprogress} 50%)`
                                                       : (isPendingRepair 
                                                          ? `linear-gradient(135deg, ${healthColor} 50%, ${COLORS.repair.pending} 50%)`
                                                          : healthColor)))
                                                : 'transparent',
                                              border: hasVM ? 'none' : (isInRepair ? `1.5px solid ${COLORS.repair.inprogress}` : `1.5px solid ${healthColor}`)
                                            }}
                                            onClick={() => {
                                              if (isSelected) setSelectedNode(null);
                                              else {
                                                setSelectedNode({ 
                                                  sbId: sb.id, 
                                                  blockId: block.id, 
                                                  nodeIdx, 
                                                  status, 
                                                  hasVM, 
                                                  repairStatus: isPendingRepair ? 'pending' : (isInRepair ? 'inprogress' : 'none') 
                                                });
                                              }
                                            }}
                                          >
                                            {!hasVM && (
                                              <div 
                                                className="w-1 h-1 rounded-full" 
                                                style={{ 
                                                  backgroundColor: isInRepair ? COLORS.repair.inprogress : healthColor 
                                                }} 
                                              />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Inline Unified Detail */}
                              {selectedNode && selectedNode.sbId === sb.id && (
                                <UnifiedNodeDetail 
                                  nodeIdx={selectedNode.nodeIdx} 
                                  blockLabel={sb.subblocks.find(b => b.id === selectedNode.blockId)?.label || ''} 
                                  healthStatus={selectedNode.status}
                                  maintStatus={(() => {
                                    const color = getNodeColor(originalSbIdx, sb.subblocks.findIndex(b => b.id === selectedNode.blockId), selectedNode.nodeIdx, 'MAINTENANCE');
                                    return color === COLORS.maintenance.inprogress ? 'inprogress' :
                                           color === COLORS.maintenance.available ? 'available' : 
                                           color === COLORS.maintenance.pending ? 'pending' : 'uptodate';
                                  })()}
                                  repairStatus={selectedNode.repairStatus}
                                  hasVM={selectedNode.hasVM}
                                  onJobClick={onJobClick}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                   </div>
                </div>
            </div>
         </div>

      </div>
   </div>
);
};
