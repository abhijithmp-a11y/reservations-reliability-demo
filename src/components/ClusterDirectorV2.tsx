
import React, { useState } from 'react';
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
  Filter,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

// --- TYPES & CONSTANTS ---

type ViewMode = 'HEALTH' | 'UTILIZATION' | 'MAINTENANCE';

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
    isOpen: true,
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
    unhealthy: { color: 'bg-rose-600', textColor: 'text-rose-700', label: 'UNHEALTHY', detailValue: 'XID 31 (Memory)', action: 'Replace node' }
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
          
          {hasVM ? (
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
              Telemetry unavailable: No active VM on this node.
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
            {hasVM && (
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
                      <div className="text-[9px] text-amber-600 uppercase font-bold">Scheduled Start</div>
                      <div className="text-[10px] font-bold text-amber-900">Jan 27, 02:00 PM</div>
                    </div>
                  </div>
                  <button className="w-full py-1.5 bg-amber-700 text-white text-[10px] font-bold rounded hover:bg-amber-800 transition-colors shadow-sm">
                    Send machine to repair now
                  </button>
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

export const ClusterDirectorV2: React.FC<{ 
  onBack?: () => void; 
  clusterId?: string;
  onJobClick?: (jobId: string) => void;
}> = ({ onBack, clusterId, onJobClick }) => {
  const [mainTab, setMainTab] = useState<'DETAILS' | 'TOPOLOGY'>('DETAILS');
  const [viewMode, setViewMode] = useState<ViewMode>('HEALTH');
  const [blocks, setBlocks] = useState(MOCK_BLOCKS);
  const [selectedNode, setSelectedNode] = useState<{ 
    sbId: string; 
    blockId: string; 
    nodeIdx: number;
    status: any;
    hasVM: boolean;
  } | null>(() => {
    // Auto-select first unhealthy node in Block 1 for demo purposes
    const sb1 = MOCK_BLOCKS[0];
    const b1 = sb1.subblocks[0];
    const hasVM = (15 + 0 * 18) % 7 !== 0;
    // In getNodeColor, key 15 is unhealthy. blockIdx 0, nodeIdx 15 -> key 15.
    return { sbId: sb1.id, blockId: b1.id, nodeIdx: 15, status: 'unhealthy', hasVM };
  });

  const toggleBlock = (id: string) => {
    setBlocks(prev => prev.map(sb => sb.id === id ? { ...sb, isOpen: !sb.isOpen } : sb));
    if (selectedNode?.sbId === id) setSelectedNode(null);
  };

  const handleTabChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedNode(null); // Reset selection when switching modes to avoid status mismatch
  };

  const getNodeColor = (sbIdx: number, blockIdx: number, nodeIdx: number, mode: ViewMode) => {
    // Deterministic mock pattern for visuals
    const key = (sbIdx * 36) + (blockIdx * 18) + nodeIdx;
    
    if (mode === 'HEALTH') {
      // SB 0 (sb1): 15 (U), 30 (U), 20 (D)
      if (sbIdx === 0) {
        if (key === 15 || key === 30) return COLORS.health.unhealthy;
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

  const renderDashboardCard = () => {
    switch (viewMode) {
      case 'HEALTH':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
            {/* Donut */}
            <div className="relative w-32 h-32 shrink-0 mx-auto lg:mx-0">
               <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                 <PieChart>
                   <Pie data={HEALTH_DONUT} innerRadius={45} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                     {HEALTH_DONUT.map((e, i) => <Cell key={i} fill={e.color} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-2xl font-bold text-slate-700">430</span>
                 <span className="text-[9px] text-slate-400 uppercase font-bold">Total VMs</span>
               </div>
            </div>

            {/* Metrics */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Health check status</h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-300"/> Healthy: <span className="text-[#1967D2]">414 VMs</span></div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"/> Pending Maint: <span className="text-[#1967D2]">47 VMs</span></div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#78350f]"/> Pending Repair: <span className="text-[#1967D2]">5 VMs</span></div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> Degraded: <span className="text-[#1967D2]">13 VMs</span></div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"/> Unhealthy: <span className="text-[#1967D2]">3 VMs</span></div>
                  </div>
               </div>

               <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-1">Unhealthy nodes</h4>
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-base"><AlertOctagon size={16} /> 3 / 430 VMs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Last check 02/14/2025</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-1">Degraded nodes</h4>
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold text-base"><AlertTriangle size={16} /> 13 / 430 VMs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Based on AI Health Predictor</div>
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
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base"><TrendingUp size={16} className="text-orange-500" /> 5 / 430 VMs</div>
                <p className="text-[10px] text-slate-500 leading-tight">Use checkpointing to replace nodes and keep jobs running.</p>
                <button className="text-[#1967D2] text-[10px] font-bold hover:underline">Learn more</button>
             </div>
          </div>
        );

      case 'MAINTENANCE':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
             <div className="relative w-32 h-32 shrink-0 mx-auto lg:mx-0">
               <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                 <PieChart>
                   <Pie data={MAINT_DONUT} innerRadius={45} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                     {MAINT_DONUT.map((e, i) => <Cell key={i} fill={e.color} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-2xl font-bold text-slate-700">430</span>
                 <span className="text-[9px] text-slate-400 uppercase font-bold">Total VMs</span>
               </div>
             </div>

             <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Maintenance status</h4>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Up-to-date: <span className="text-[#1967D2]">200 VMs</span></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"/> Pending: <span className="text-[#1967D2]">47 VMs</span></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/> Update available: <span className="text-[#1967D2]">150 VMs</span></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500"/> In progress: <span className="text-[#1967D2]">33 VMs</span></div>
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

      {/* Top Navigation */}
      <div className="flex gap-6 border-b border-slate-200">
         <button 
           onClick={() => setMainTab('DETAILS')}
           className={`px-1 py-2 border-b-2 font-bold text-xs transition-colors ${mainTab === 'DETAILS' ? 'border-[#1967D2] text-[#1967D2]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
           DETAILS
         </button>
         <button 
           onClick={() => setMainTab('TOPOLOGY')}
           className={`px-1 py-2 border-b-2 font-bold text-xs transition-colors ${mainTab === 'TOPOLOGY' ? 'border-[#1967D2] text-[#1967D2]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
           TOPOLOGY
         </button>
      </div>

      {mainTab === 'DETAILS' ? (
        <div className="space-y-6 animate-fadeIn">
           {/* Top Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* VMs Used Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center gap-8 shadow-sm">
                 <div className="relative w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={[{value: 100}]} 
                            innerRadius={38} 
                            outerRadius={45} 
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
                       <span className="text-xl font-bold text-slate-800">18</span>
                       <span className="text-[10px] text-slate-500">VMs used</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#1a73e8]" />
                    <span className="text-sm text-slate-600">Compute Engine and GKE <span className="font-bold text-slate-800">18</span></span>
                 </div>
              </div>

              {/* Unused Capacity Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                 <h4 className="text-sm font-medium text-slate-800 mb-1">Unused capacity</h4>
                 <div className="text-lg font-bold text-slate-900 mb-2">0 / 18 VM instances</div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                    0% of your reservation is not being put to use. <a href="#" className="text-[#1a73e8] hover:underline inline-flex items-center gap-0.5">Learn more <ExternalLink size={10} /></a>
                 </p>
              </div>

              {/* Maintenance Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                 <div className="flex items-center gap-1.5 mb-1">
                    <h4 className="text-sm font-medium text-slate-800">Maintenance</h4>
                    <HelpCircle size={14} className="text-slate-400 cursor-help" />
                 </div>
                 <div className="flex items-center gap-2 text-violet-600 font-bold text-sm mb-2">
                    <AlertTriangle size={18} /> 47 VMs Pending
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                    Updates scheduled for next window. <a href="#" className="text-[#1a73e8] hover:underline">View schedule</a>
                 </p>
              </div>
           </div>

           {/* Details Tables Section */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Reservation Basics */}
              <div>
                 <h3 className="text-lg font-medium text-slate-900 mb-4">Reservation basics</h3>
                 <div className="border border-slate-200 rounded overflow-hidden">
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

              {/* Configuration Details */}
              <div className="space-y-8">
                 <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Configuration details</h3>
                    <div className="border border-slate-200 rounded overflow-hidden">
                       <table className="w-full text-sm">
                          <tbody className="divide-y divide-slate-100">
                             {[
                               { label: 'Number of VM instances', value: '18' },
                               { label: 'VMs in use', value: '18' },
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
              </div>
           </div>

           {/* Link to Topology */}
           <div className="pt-8 border-t border-slate-100">
              <button 
                onClick={() => setMainTab('TOPOLOGY')}
                className="flex items-center gap-2 text-[#1a73e8] font-bold text-sm hover:underline group"
              >
                View physical resource topology <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <p className="text-xs text-slate-500 mt-1">
                Explore the physical location and health status of all reserved resources in the interactive topology view.
              </p>
           </div>
        </div>
      ) : (
        <>
          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row gap-4 justify-end items-start md:items-end animate-fadeIn">
          <div className="flex bg-white rounded border border-[#1967D2]/20 shadow-sm overflow-hidden">
             {/* Utilization and Maintenance tabs removed as per request */}
          </div>
      </div>

      {/* Summary Dashboard Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          {renderDashboardCard()}
          
          {/* Legend Footer */}
          <div className="px-4 py-3 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 rounded-b-lg">
             <div className="flex gap-4 text-[10px] font-medium">
                 <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-slate-200">
                    <div className="w-3 h-2.5 bg-slate-400 rounded-[1px]" />
                    <span>With VM</span>
                    <div className="w-3 h-2.5 border border-slate-400 rounded-[1px] ml-1" />
                    <span>No VM</span>
                 </div>
                 {viewMode === 'HEALTH' && (
                    <>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-300"/> Healthy</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-500"/> Pending Maint</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#78350f]"/> Pending Repair</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"/> Degraded</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"/> Unhealthy</div>
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
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"/> Update available</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-500"/> In progress</div>
                    </>
                 )}
             </div>

             <div className="flex gap-3">
                {viewMode === 'HEALTH' && (
                  <>
                  </>
                )}
                {viewMode === 'UTILIZATION' && (
                  <>
                     <button className="text-[#1967D2] text-xs font-bold flex items-center gap-1 hover:text-[#1557B0]"><Plus size={12} /> Add capacity</button>
                     <button className="text-[#1967D2] text-xs font-bold flex items-center gap-1 hover:text-[#1557B0]"><SkipForward size={12} className="fill-[#1967D2]" /> Replace stragglers</button>
                  </>
                )}
                {viewMode === 'MAINTENANCE' && (
                   <button className="text-[#1967D2] text-xs font-bold flex items-center gap-1 hover:text-[#1557B0]"><Play size={12} className="fill-[#1967D2]" /> Start all maintenance now</button>
                )}
             </div>
          </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-3">
         {blocks.map((sb, sbIdx) => {
            const sbMaint = sb.subblocks.flatMap((b, bIdx) => 
              b.nodes.map((_, nIdx) => getNodeColor(sbIdx, bIdx, nIdx, 'MAINTENANCE'))
            );
            const sbUpToDate = sbMaint.filter(c => c === COLORS.maintenance.uptodate).length;
            const sbAvailable = sbMaint.filter(c => c === COLORS.maintenance.available).length;
            const sbInProgress = sbMaint.filter(c => c === COLORS.maintenance.inprogress).length;

            return (
            <div key={sb.id} className="bg-white border border-slate-200 rounded-lg shadow-sm transition-all">
               {/* Header */}
               <div 
                 onClick={() => toggleBlock(sb.id)}
                 className={`px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 select-none rounded-t-lg ${!sb.isOpen ? 'rounded-b-lg' : ''}`}
               >
                  <div className="flex items-center gap-2">
                     <h3 className="text-sm font-medium text-slate-900">{sb.label}</h3>
                     <ChevronDown size={16} className={`text-slate-400 transition-transform ${sb.isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {/* Right Actions */}
                  {sb.isOpen ? (
                     <div className="flex gap-4">
                        {viewMode === 'UTILIZATION' && (
                           <>
                             <button className="text-[#1967D2] text-[10px] font-bold flex items-center gap-1 hover:underline"><Plus size={12} /> Add capacity</button>
                             <button className="text-[#1967D2] text-[10px] font-bold flex items-center gap-1 hover:underline"><SkipForward size={10} className="fill-[#1967D2]" /> Replace stragglers</button>
                           </>
                        )}
                         {viewMode === 'MAINTENANCE' && (
                             <button className="text-[#1967D2] text-[10px] font-bold flex items-center gap-1 hover:underline"><Play size={10} className="fill-[#1967D2]" /> Start maintenance</button>
                        )}
                     </div>
                  ) : (
                     // Collapsed Summary
                     <div className="flex items-center gap-4 text-[10px] font-bold">
                        {viewMode === 'MAINTENANCE' ? (
                          <>
                            <div className="flex items-center gap-1 text-blue-600">
                               <Shield size={12} className="fill-blue-50" /> Up-to-date: {sbUpToDate} VMs
                            </div>
                            {sbAvailable > 0 && (
                               <div className="flex items-center gap-1 text-amber-600">
                                   <RefreshCw size={12} className="animate-spin-slow" /> Available: {sbAvailable} VMs
                               </div>
                            )}
                            {sbInProgress > 0 && (
                               <div className="flex items-center gap-1 text-pink-600">
                                   <Play size={12} className="fill-pink-50" /> In progress: {sbInProgress} VMs
                               </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1 text-cyan-600">
                               <Shield size={12} className="fill-cyan-50" /> Healthy: {sb.healthyCount} VMs
                            </div>
                            {sb.degradedCount > 0 && (
                               <div className="flex items-center gap-1 text-amber-600">
                                   <AlertTriangle size={12} className="fill-amber-50" /> Degraded: {sb.degradedCount} VMs
                               </div>
                            )}
                            {sb.unhealthyCount > 0 && (
                               <div className="flex items-center gap-1 text-rose-600">
                                   <AlertOctagon size={12} className="fill-rose-50" /> Unhealthy: {sb.unhealthyCount} VMs
                               </div>
                            )}
                          </>
                        )}
                        {viewMode === 'MAINTENANCE' && sb.id === 'sb2' && (
                            <div className="flex items-center gap-1 text-rose-600">
                                <AlertOctagon size={12} className="fill-rose-100" /> Unplanned: 2 VMs
                            </div>
                        )}
                     </div>
                  )}
               </div>

               {/* Content */}
               {sb.isOpen && (
                 <div className="px-4 pb-4 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sb.subblocks.map((block, blockIdx) => {
                       const blockHealth = block.nodes.map((_, nodeIdx) => getNodeColor(sbIdx, blockIdx, nodeIdx, 'HEALTH'));
                       const hCount = blockHealth.filter(c => c === COLORS.health.healthy).length;
                       const dCount = blockHealth.filter(c => c === COLORS.health.suspected).length;
                       const uCount = blockHealth.filter(c => c === COLORS.health.unhealthy).length;

                       const blockMaint = block.nodes.map((_, nodeIdx) => getNodeColor(sbIdx, blockIdx, nodeIdx, 'MAINTENANCE'));
                       const mUpToDate = blockMaint.filter(c => c === COLORS.maintenance.uptodate).length;
                       const mAvailable = blockMaint.filter(c => c === COLORS.maintenance.available).length;
                       const mInProgress = blockMaint.filter(c => c === COLORS.maintenance.inprogress).length;

                       return (
                        <div key={block.id}>
                           <div className="flex justify-between items-center mb-1.5">
                              <h5 className="text-[10px] text-slate-500">{block.label}</h5>
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
                                const color = getNodeColor(sbIdx, blockIdx, nodeIdx, viewMode);
                                const isSelected = selectedNode?.sbId === sb.id && selectedNode?.blockId === block.id && selectedNode?.nodeIdx === nodeIdx;
                                const hasVM = (nodeIdx + blockIdx * 18 + sbIdx * 36) % 7 !== 0;
                                const isPendingMaint = getNodeColor(sbIdx, blockIdx, nodeIdx, 'MAINTENANCE') === COLORS.maintenance.pending;
                                
                                let status: any;
                                if (viewMode === 'HEALTH') {
                                  status = color === COLORS.health.unhealthy ? 'unhealthy' : 
                                           color === COLORS.health.suspected ? 'degraded' : 'healthy';
                                } else if (viewMode === 'MAINTENANCE') {
                                  status = color === COLORS.maintenance.inprogress ? 'inprogress' :
                                           color === COLORS.maintenance.available ? 'available' : 
                                           color === COLORS.maintenance.pending ? 'pending' : 'uptodate';
                                } else {
                                  status = 'healthy';
                                }
                                
                                return (
                                  <div 
                                    key={nodeIdx}
                                    className={`w-6 h-5 rounded-[2px] cursor-pointer transition-all flex items-center justify-center ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400 scale-110 z-10' : 'hover:opacity-80'}`}
                                    style={{ 
                                      background: hasVM 
                                        ? (isPendingMaint && viewMode === 'HEALTH' 
                                            ? `linear-gradient(135deg, ${COLORS.health.healthy} 50%, ${COLORS.maintenance.pending} 50%)` 
                                            : ((nodeIdx + blockIdx * 18 + sbIdx * 36) % 13 === 5 && viewMode === 'HEALTH'
                                               ? `linear-gradient(135deg, ${COLORS.health.healthy} 50%, ${COLORS.repair.pending} 50%)`
                                               : color))
                                        : 'transparent',
                                      border: hasVM ? 'none' : `1.5px solid ${color}`
                                    }}
                                    title={`Node ${nodeIdx}${!hasVM ? ' (No VM)' : ''}${(nodeIdx + blockIdx * 18 + sbIdx * 36) % 13 === 5 ? ' (Pending Repair)' : ''}`}
                                    onClick={() => {
                                      if (isSelected) setSelectedNode(null);
                                      else {
                                        const isPendingRepair = (nodeIdx + blockIdx * 18 + sbIdx * 36) % 13 === 5;
                                        setSelectedNode({ 
                                          sbId: sb.id, 
                                          blockId: block.id, 
                                          nodeIdx, 
                                          status, 
                                          hasVM, 
                                          repairStatus: isPendingRepair ? 'pending' : 'none' 
                                        });
                                      }
                                    }}
                                  >
                                    {!hasVM && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />}
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                       );
                    })}

                    {/* Inline Health Detail */}
                    {selectedNode && selectedNode.sbId === sb.id && viewMode === 'HEALTH' && (
                      <UnifiedNodeDetail 
                        nodeIdx={selectedNode.nodeIdx} 
                        blockLabel={sb.subblocks.find(b => b.id === selectedNode.blockId)?.label || ''} 
                        healthStatus={selectedNode.status}
                        maintStatus={(() => {
                          const color = getNodeColor(sbIdx, sb.subblocks.findIndex(b => b.id === selectedNode.blockId), selectedNode.nodeIdx, 'MAINTENANCE');
                          return color === COLORS.maintenance.inprogress ? 'inprogress' :
                                 color === COLORS.maintenance.available ? 'available' : 
                                 color === COLORS.maintenance.pending ? 'pending' : 'uptodate';
                        })()}
                        repairStatus={selectedNode.repairStatus}
                        hasVM={selectedNode.hasVM}
                        onJobClick={onJobClick}
                      />
                    )}

                    {/* Inline Maintenance Detail */}
                    {selectedNode && selectedNode.sbId === sb.id && viewMode === 'MAINTENANCE' && (
                      <NodeMaintenanceDetail 
                        nodeIdx={selectedNode.nodeIdx} 
                        blockLabel={sb.subblocks.find(b => b.id === selectedNode.blockId)?.label || ''} 
                        status={selectedNode.status}
                      />
                    )}
                 </div>
               )}
            </div>
          );
         })}
      </div>
    </>
  )}
</div>
);
};
