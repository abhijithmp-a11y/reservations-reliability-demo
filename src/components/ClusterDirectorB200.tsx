
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
  ArrowRight,
  Clock
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

type ViewMode = 'HEALTH' | 'MAINTENANCE' | 'CAPACITY';

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

const NODE_HEALTH_HISTORY = [
  { time: '09:00', temp: 45, util: 85 },
  { time: '09:15', temp: 48, util: 88 },
  { time: '09:30', temp: 52, util: 92 },
  { time: '09:45', temp: 88, util: 95 },
  { time: '10:00', temp: 82, util: 40 },
  { time: '10:15', temp: 75, util: 10 },
  { time: '10:30', temp: 65, util: 0 },
];

// --- COMPONENTS ---

const HealthTooltip = ({ content, children, align = 'center' }: { content: string; children: React.ReactNode; align?: 'left' | 'center' | 'right' }) => (
  <div className="group relative inline-block">
    {children}
    <div className={`
      absolute bottom-full mb-2 w-max max-w-[220px] p-2.5 bg-white text-slate-700 text-[10px] leading-relaxed rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none font-normal whitespace-normal border border-slate-200 backdrop-blur-sm
      ${align === 'center' ? 'left-1/2 -translate-x-1/2 text-center' : ''}
      ${align === 'left' ? 'left-0 text-left' : ''}
      ${align === 'right' ? 'right-0 text-right' : ''}
    `}>
      {content}
      <div className={`
        absolute top-full border-[6px] border-transparent border-t-white
        ${align === 'center' ? 'left-1/2 -translate-x-1/2' : ''}
        ${align === 'left' ? 'left-4' : ''}
        ${align === 'right' ? 'right-4' : ''}
      `} />
    </div>
  </div>
);

export const UnifiedNodeDetail: React.FC<{ 
  nodeIdx: number; 
  hierarchyLabel: string; 
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  maintStatus: 'uptodate' | 'available' | 'inprogress' | 'pending';
  repairStatus?: 'none' | 'pending' | 'inprogress';
  hasVM: boolean;
  onJobClick?: (jobId: string) => void;
}> = ({ nodeIdx, hierarchyLabel, healthStatus, maintStatus, repairStatus = 'none', hasVM, onJobClick }) => {
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

  const terminationReasons = ["User reported fault", "Hosterror", "Repair", "Planned maintenance"];
  const terminationReason = healthStatus === 'unhealthy' 
    ? terminationReasons[nodeIdx % terminationReasons.length] 
    : "Preemption (Priority)";

  return (
    <div className="col-span-full mt-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-fadeIn">
      {!hasVM && (maintStatus === 'pending' || maintStatus === 'inprogress') && (
        <div 
          className="h-1 w-full" 
          style={{ 
            background: `linear-gradient(90deg, transparent 50%, ${maintStatus === 'pending' ? COLORS.maintenance.pending : COLORS.maintenance.inprogress} 50%)` 
          }} 
        />
      )}
      {/* Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            {!hasVM && (maintStatus === 'pending' || maintStatus === 'inprogress') && (
              <div 
                className="w-3 h-3 rounded-[2px] shrink-0 shadow-sm border border-slate-200" 
                style={{ 
                  background: `linear-gradient(135deg, transparent 50%, ${maintStatus === 'pending' ? COLORS.maintenance.pending : COLORS.maintenance.inprogress} 50%)` 
                }} 
              />
            )}
            Node {nodeIdx} Diagnostics • <span className="text-[#1967D2]">{hierarchyLabel}</span>
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
                    <div className="text-[10px] font-bold text-slate-700">{terminationReason}</div>
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
              <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">GPU Driver</div>
              <div className="text-xs font-mono font-bold text-slate-700">{maintConfig.driver}</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">GCE Software</div>
              <div className="text-xs font-mono font-bold text-slate-700">v20240214</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
              <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">OS Image</div>
              <div className="text-xs font-bold text-slate-700">Ubuntu 22.04 LTS</div>
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
                    <div className="text-[10px] font-bold text-violet-700">Feb 10, 04:00 AM</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-violet-500 uppercase font-bold">Est. Duration</div>
                    <div className="text-[10px] font-bold text-violet-700">45 minutes</div>
                  </div>
                </div>
              </div>
            )}
            {maintStatus === 'inprogress' && (
              <div className="bg-pink-50 p-2.5 rounded border border-pink-100 mt-2 space-y-2">
                <div>
                  <div className="text-[9px] text-pink-600 uppercase font-bold mb-1">Maintenance Started</div>
                  <div className="text-[10px] font-bold text-pink-700">Feb 6, 09:15 AM</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-pink-200/50">
                  <div>
                    <div className="text-[9px] text-pink-500 uppercase font-bold">Progress</div>
                    <div className="text-[10px] font-bold text-pink-700">65% Complete</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-pink-500 uppercase font-bold">Est. Remaining</div>
                    <div className="text-[10px] font-bold text-pink-700">15 minutes</div>
                  </div>
                </div>
              </div>
            )}
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
                    <div className="text-[10px] font-bold text-amber-900">Feb 7, 02:00 PM</div>
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

        {/* Right Col: Diagnostics */}
        <div className="space-y-4 border-l border-slate-100 pl-6">
          <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Recent Diagnostic Runs</h5>
          <div className="space-y-2">
            {testRuns.map((run) => (
              <div key={run.id} className="bg-slate-50 p-2.5 rounded border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-700">{run.name}</div>
                  <div className="text-[9px] text-slate-400">{run.id} • {run.date}</div>
                </div>
                <div className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                  run.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 
                  run.status === 'WARN' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {run.status}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2 bg-[#1967D2] text-white rounded text-xs font-bold hover:bg-[#1557B0] transition-all flex items-center justify-center gap-2 shadow-sm">
            <Play size={12} /> Run full diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClusterDirectorB200: React.FC<{ 
  onBack?: () => void;
  clusterId?: string;
  onJobClick?: (jobId: string) => void;
}> = ({ onBack, clusterId, onJobClick }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('HEALTH');
  const [blocks, setBlocks] = useState([
    {
      id: 'b1',
      label: 'Block 1',
      isOpen: false,
      healthyCount: 98,
      degradedCount: 1,
      unhealthyCount: 1,
      nodes: Array(100).fill(0).map((_, i) => {
          if (i === 42) return { status: 'unhealthy', hasVM: true, maint: 'uptodate' };
          if (i === 7) return { status: 'degraded', hasVM: true, maint: 'pending' };
          if (i % 15 === 0) return { status: 'healthy', hasVM: false, maint: 'available' };
          return { status: 'healthy', hasVM: true, maint: 'uptodate' };
      })
    },
    {
      id: 'b2',
      label: 'Block 2',
      isOpen: false,
      healthyCount: 100,
      degradedCount: 0,
      unhealthyCount: 0,
      nodes: Array(100).fill(0).map((_, i) => {
          if (i % 20 === 0) return { status: 'healthy', hasVM: false, maint: 'uptodate' };
          return { status: 'healthy', hasVM: true, maint: 'uptodate' };
      })
    }
  ]);
  const [basicsOpen, setBasicsOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(true);
  const [capacityFilter, setCapacityFilter] = useState<'ALL' | 'SLURM' | 'GKE' | 'IDLE'>('ALL');
  const [selectedNode, setSelectedNode] = useState<{ blockId: string; nodeIdx: number } | null>(null);

  const reconciledMetrics = {
    totalNodes: 256,
    nodesWithVM: 100,
    emptyNodes: 156,
    healthyNodes: 198,
    unhealthyNodes: 2,
    maintPending: 5,
    repairInProgress: 1,
    healthyBlocks: 1,
    unhealthyBlocks: 1,
    healthySubblocks: 2,
    unhealthySubblocks: 0,
    schedulableSubblocks: 0,
    maintBlocksInProgress: 0,
    maintBlocksPending: 1,
    maintSubblocksInProgress: 0,
    maintSubblocksPending: 1,
    maintInProgress: 0,
    pendingMaintCount: 5,
    repairSubblocksInProgress: 0,
    repairSubblocksPending: 1,
    inRepairCount: 1,
    pendingRepairCount: 0,
  };

  const toggleBlock = (id: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, isOpen: !b.isOpen } : b));
    if (selectedNode?.blockId === id) setSelectedNode(null);
  };

  const handleNodeClick = (blockId: string, nodeIdx: number) => {
    if (selectedNode?.blockId === blockId && selectedNode?.nodeIdx === nodeIdx) {
      setSelectedNode(null);
    } else {
      setSelectedNode({ blockId, nodeIdx });
    }
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
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Blocks</h4>
                        <p className="text-xs text-slate-500">Healthy vs Unhealthy</p>
                     </div>
                     <div className="text-right">
                        <span className="text-2xl font-black text-slate-900">2</span>
                        <span className="text-[10px] text-slate-400 ml-1 uppercase font-bold tracking-tighter">Total Blocks</span>
                     </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                     <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: '50%' }} />
                     <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: '50%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                     <HealthTooltip align="left" content="A block is Healthy if all its nodes are healthy.">
                        <div className="flex items-center gap-2 text-cyan-600 cursor-help">
                           <div className="w-2 h-2 rounded-full bg-cyan-400" /> Healthy: 1
                        </div>
                     </HealthTooltip>
                     <HealthTooltip align="right" content="A block is Unhealthy if it contains at least one unhealthy node.">
                        <div className="flex items-center gap-2 text-rose-600 cursor-help">
                           Unhealthy: 1 <div className="w-2 h-2 rounded-full bg-rose-500" />
                        </div>
                     </HealthTooltip>
                  </div>
               </div>

               {/* Nodes Health Summary */}
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <div>
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Nodes</h4>
                        <p className="text-xs text-slate-500">Fleet Health Status</p>
                     </div>
                     <div className="text-right">
                        <span className="text-2xl font-black text-slate-900">256</span>
                        <span className="text-[10px] text-slate-400 ml-1 uppercase font-bold tracking-tighter">Total Nodes</span>
                     </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                     <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: '77%' }} />
                     <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: '1%' }} />
                     <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: '1%' }} />
                     <div className="h-full bg-slate-200 transition-all duration-500" style={{ width: '21%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                     <div className="flex items-center gap-2 text-cyan-600">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" /> Healthy: 198
                     </div>
                     <div className="flex items-center gap-2 text-rose-600">
                        Unhealthy: 2 <div className="w-2 h-2 rounded-full bg-rose-500" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'MAINTENANCE':
        const combinedChartData = [
          { name: 'Blocks (M)', ongoing: reconciledMetrics.maintBlocksInProgress, pending: reconciledMetrics.maintBlocksPending, type: 'MAINT' },
          { name: 'Nodes (M)', ongoing: reconciledMetrics.maintInProgress, pending: reconciledMetrics.pendingMaintCount, type: 'MAINT' },
          { name: 'Nodes (R)', ongoing: reconciledMetrics.inRepairCount, pending: reconciledMetrics.pendingRepairCount, type: 'REPAIR' },
        ];

        const CustomCombinedTooltip = ({ active, payload }: any) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isOngoing = payload[0].dataKey === 'ongoing';
            const isMaint = data.type === 'MAINT';
            
            return (
              <div className="bg-white text-slate-900 p-3 rounded-lg shadow-xl text-[10px] border border-slate-200 animate-fadeIn">
                <div className="font-bold mb-1 border-b border-slate-200 pb-1 uppercase tracking-wider text-slate-500">
                  {data.name} {isMaint ? 'Maintenance' : 'Repair'}
                </div>
                {isOngoing ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isMaint ? 'bg-pink-500' : 'bg-[#451a03]'}`} />
                      <span className={`font-bold ${isMaint ? 'text-pink-400' : 'text-amber-600'}`}>
                        {isMaint ? 'Ongoing:' : 'In Repair:'}
                      </span> {data.ongoing} units
                    </div>
                    <div className="text-slate-300 pl-3.5">
                      {isMaint ? 'Status: Applying updates' : 'Status: Active repair session'}<br />
                      {isMaint ? 'Est. Completion: 20m' : 'Technician: Assigned'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isMaint ? 'bg-violet-500' : 'bg-[#78350f]'}`} />
                      <span className={`font-bold ${isMaint ? 'text-violet-400' : 'text-amber-800'}`}>Pending:</span> {data.pending} units
                    </div>
                    <div className="text-slate-300 pl-3.5">
                      {isMaint ? 'Status: Scheduled' : 'Status: Queued for repair'}<br />
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
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Fleet Events</h4>
                  <p className="text-[10px] text-slate-500">Combined view of Maintenance (M) and Repairs (R)</p>
                </div>
                <div className="flex gap-4 text-[9px] font-bold">
                  <div className="flex items-center gap-1.5 text-pink-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Maint. Ongoing
                  </div>
                  <div className="flex items-center gap-1.5 text-violet-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Maint. Pending
                  </div>
                  <div className="flex items-center gap-1.5 text-[#451a03]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#451a03]" /> Repair In-Progress
                  </div>
                  <div className="flex items-center gap-1.5 text-[#78350f]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#78350f]" /> Repair Pending
                  </div>
                </div>
              </div>

              <div className="h-40 w-full bg-slate-50/50 rounded-lg border border-slate-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={combinedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip shared={false} content={<CustomCombinedTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="ongoing" radius={[2, 2, 0, 0]} barSize={32}>
                      {combinedChartData.map((entry, index) => (
                        <Cell key={`cell-ongoing-${index}`} fill={entry.type === 'MAINT' ? '#ec4899' : '#451a03'} />
                      ))}
                    </Bar>
                    <Bar dataKey="pending" radius={[2, 2, 0, 0]} barSize={32}>
                      {combinedChartData.map((entry, index) => (
                        <Cell key={`cell-pending-${index}`} fill={entry.type === 'MAINT' ? '#8b5cf6' : '#78350f'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'CAPACITY':
        const allocatedDelivered = Math.round(reconciledMetrics.totalNodes * 0.78);
        const slurmConsumed = Math.round(reconciledMetrics.totalNodes * 0.35);
        const gkeConsumed = Math.round(reconciledMetrics.totalNodes * 0.39);
        const idleConsumed = allocatedDelivered - (slurmConsumed + gkeConsumed);

        const capacityData = [
          {
            name: 'Reserved',
            delivered: reconciledMetrics.totalNodes,
            pending: 0,
            full: reconciledMetrics.totalNodes,
          },
          {
            name: 'Allocated',
            delivered: allocatedDelivered,
            pending: Math.round(reconciledMetrics.totalNodes * 0.22),
            full: reconciledMetrics.totalNodes,
          },
          {
            name: 'Consumed',
            slurm: slurmConsumed,
            gke: gkeConsumed,
            idle: idleConsumed,
            full: reconciledMetrics.totalNodes,
          }
        ];

        const CustomCapacityTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
            return (
              <div className="bg-white text-slate-900 p-3 rounded-lg shadow-xl text-[10px] border border-slate-200 animate-fadeIn">
                <div className="font-bold mb-1 border-b border-slate-200 pb-1 uppercase tracking-wider text-slate-500">
                  {label}
                </div>
                <div className="space-y-1.5 mt-2">
                  {payload.map((p: any, index: number) => {
                    if (!p.value || p.value === 0) return null;
                    const isPending = p.dataKey === 'pending';
                    return (
                      <div key={index} className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="font-bold">{isPending ? 'Pending Qualification' : p.name}:</span>
                          <span>{p.value} units</span>
                        </div>
                        {isPending && (
                          <div className="text-amber-400 pl-3.5 font-medium italic">
                            Expected delivery: Feb 12, 2026
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          return null;
        };

        return (
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-50/50 rounded-xl border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Capacity Lifecycle</h4>
                    <p className="text-xs text-slate-500">Reserved vs Allocated vs Consumed</p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-end max-w-[60%]">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-blue-500" /> Reserved
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" /> Allocated
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-slate-300" /> Pending Qualification
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" /> Consumed (Slurm)
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> Consumed (GKE)
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-amber-400" /> Idle
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={capacityData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      barSize={32}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide domain={[0, reconciledMetrics.totalNodes]} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false}
                        fontSize={11}
                        fontWeight="bold"
                        tick={{ fill: '#475569' }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        content={<CustomCapacityTooltip />}
                      />
                      <Bar dataKey="delivered" name="Delivered" stackId="cap" radius={[0, 0, 0, 0]}>
                        {capacityData.map((entry, index) => (
                          <Cell key={`cell-del-${index}`} fill={entry.name === 'Reserved' ? '#3b82f6' : entry.name === 'Allocated' ? '#22d3ee' : 'transparent'} />
                        ))}
                      </Bar>
                      <Bar dataKey="pending" name="Pending Qualification" stackId="cap" radius={[0, 4, 4, 0]}>
                        {capacityData.map((entry, index) => (
                          <Cell key={`cell-pen-${index}`} fill={entry.name === 'Allocated' ? '#cbd5e1' : 'transparent'} />
                        ))}
                      </Bar>
                      <Bar 
                        dataKey="slurm" 
                        name="Slurm" 
                        stackId="cap" 
                        fill="#6366f1" 
                        radius={[0, 0, 0, 0]} 
                        onClick={() => setCapacityFilter(capacityFilter === 'SLURM' ? 'ALL' : 'SLURM')}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      <Bar 
                        dataKey="gke" 
                        name="GKE" 
                        stackId="cap" 
                        fill="#10b981" 
                        radius={[0, 0, 0, 0]} 
                        onClick={() => setCapacityFilter(capacityFilter === 'GKE' ? 'ALL' : 'GKE')}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      <Bar 
                        dataKey="idle" 
                        name="Idle" 
                        stackId="cap" 
                        fill="#fbbf24" 
                        radius={[0, 4, 4, 0]} 
                        onClick={() => setCapacityFilter(capacityFilter === 'IDLE' ? 'ALL' : 'IDLE')}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Capacity Efficiency</h5>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-2xl font-black text-slate-900">94.2%</span>
                    <span className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-0.5">
                      <TrendingUp size={12} /> +1.4%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">Allocated to Consumed ratio</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Consumption Split</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-600">Slurm</span>
                      <span className="text-xs font-bold text-slate-900">47.3%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: '47.3%' }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-600">GKE</span>
                      <span className="text-xs font-bold text-slate-900 text-right">52.7%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: '52.7%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-900 pb-10">
      
      <div className="mb-6">
        <h1 className="text-lg font-bold text-slate-900">us-east4-reservation1</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider border border-indigo-100">B200 GPU Reservation</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500">us-east4-a</span>
        </div>
      </div>

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

      <div className="space-y-6 animate-fadeIn">
         {/* Summary Block */}
         <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="flex items-center gap-6">
               <div className="relative w-20 h-20 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={[{value: 100}]} innerRadius={32} outerRadius={40} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
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
                  <p className="text-xs text-slate-500">GKE Cluster</p>
               </div>
            </div>

            <div className="md:pl-8 pt-6 md:pt-0">
               <h4 className="text-sm font-medium text-slate-800 mb-1">Unused capacity</h4>
               <div className="text-lg font-bold text-slate-900 mb-1">{reconciledMetrics.emptyNodes} / {reconciledMetrics.totalNodes} instances</div>
               <p className="text-xs text-slate-500">
                  {Math.round((reconciledMetrics.emptyNodes / reconciledMetrics.totalNodes) * 100)}% not in use.
               </p>
            </div>

            <div className="md:pl-8 pt-6 md:pt-0">
               <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="text-sm font-medium text-slate-800">Maintenance and Repairs</h4>
                  <HelpCircle size={14} className="text-slate-400 cursor-help" />
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                  There are Maintenance and Repairs affecting this reservation. <button onClick={() => setViewMode('MAINTENANCE')} className="text-[#1a73e8] hover:underline font-medium">View details</button>
               </p>
            </div>
         </div>

         {/* Overview with Tabs */}
         <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Reservation overview</h3>
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
               <div className="px-6 pt-4 border-b border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-6">
                    {(['HEALTH', 'MAINTENANCE', 'CAPACITY'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
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

         {/* Basics and Config Accordions */}
         <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
               <button onClick={() => setBasicsOpen(!basicsOpen)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <h3 className="text-lg font-medium text-slate-900">Reservation basics</h3>
                  <ChevronDown size={20} className={`text-slate-500 transition-transform ${basicsOpen ? 'rotate-180' : ''}`} />
               </button>
               {basicsOpen && (
                  <div className="px-6 pb-6 border-t border-slate-200 animate-fadeIn">
                     <div className="border border-slate-200 rounded overflow-hidden mt-4">
                        <table className="w-full text-sm">
                           <tbody className="divide-y divide-slate-200">
                              {[
                                { label: 'Status', value: <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200"><CheckCircle2 size={12} /> Ready</span> },
                                { label: 'Assured count', value: '256' },
                                { label: 'Creation time', value: 'February 5, 2026, 10:00 PM' },
                                { label: 'Location', value: 'us-east4-a' },
                                { label: 'Number of blocks', value: '2' },
                                { label: 'Health status', value: <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200"><CheckCircle2 size={12} /> Healthy</span> },
                                { label: 'Deployment type', value: 'Dense' },
                                { label: 'Operational mode', value: 'All capacity' },
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

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
               <button onClick={() => setConfigOpen(!configOpen)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <h3 className="text-lg font-medium text-slate-900">Configuration details</h3>
                  <ChevronDown size={20} className={`text-slate-500 transition-transform ${configOpen ? 'rotate-180' : ''}`} />
               </button>
               {configOpen && (
                  <div className="px-6 pb-6 border-t border-slate-100 animate-fadeIn">
                     <div className="border border-slate-200 rounded overflow-hidden mt-4">
                        <table className="w-full text-sm">
                           <tbody className="divide-y divide-slate-100">
                              {[
                                { label: 'Number of VM instances', value: '256' },
                                { label: 'VMs in use', value: '100' },
                                { label: 'Machine type', value: 'a4-highgpu-8g' },
                                { label: 'vCPUs', value: '224' },
                                { label: 'Memory', value: '1433 GB' },
                                { label: 'Min CPU Platform', value: 'Intel Granite Rapids' },
                                { label: 'GPU Type', value: 'NVIDIA B200' },
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

         {/* Physical Resource Topology Section (At the bottom) */}
         <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Physical resource topology</h3>
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
               {/* Topology Legend */}
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
                    {blocks.map((block, bIdx) => {
                      const isExpanded = block.isOpen;
                      return (
                        <div key={block.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
                          <div 
                            className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => toggleBlock(block.id)}
                          >
                            <div className="flex items-center gap-3">
                              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Block</span>
                                <h4 className="text-sm font-medium text-slate-800">{bIdx + 1}</h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="flex gap-3 text-[9px] font-bold">
                                  <span className="text-cyan-600">H: {block.healthyCount}</span>
                                  {block.degradedCount > 0 && <span className="text-amber-600">D: {block.degradedCount}</span>}
                                  {block.unhealthyCount > 0 && <span className="text-rose-600">U: {block.unhealthyCount}</span>}
                               </div>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="p-4 border-t border-slate-100 space-y-6 animate-slideDown">
                               <div className="flex flex-wrap gap-1">
                                  {block.nodes.map((node, nodeIdx) => {
                                    const key = (nodeIdx + bIdx * 100);
                                    const isPendingRepair = key % 13 === 5;
                                    const isInRepair = key % 13 === 8;
                                    const hasVM = node.hasVM && !isInRepair;
                                    
                                    const healthColor = node.status === 'healthy' ? COLORS.health.healthy : 
                                                       node.status === 'degraded' ? COLORS.health.suspected : COLORS.health.unhealthy;
                                    
                                    const isSelected = selectedNode?.blockId === block.id && selectedNode?.nodeIdx === nodeIdx;
                                    const isPendingMaint = node.maint === 'pending';
                                    const isOngoingMaint = node.maint === 'inprogress';
                                    
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
                                            : (isPendingMaint 
                                                ? `linear-gradient(135deg, transparent 50%, ${COLORS.maintenance.pending} 50%)`
                                                : (isOngoingMaint 
                                                   ? `linear-gradient(135deg, transparent 50%, ${COLORS.maintenance.inprogress} 50%)`
                                                   : 'transparent')),
                                          border: hasVM ? 'none' : (isInRepair ? `1.5px solid ${COLORS.repair.inprogress}` : `1.5px solid ${healthColor}`)
                                        }}
                                        onClick={() => handleNodeClick(block.id, nodeIdx)}
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
                               {selectedNode && selectedNode.blockId === block.id && (
                                 <UnifiedNodeDetail 
                                   nodeIdx={selectedNode.nodeIdx} 
                                   hierarchyLabel={`B${bIdx + 1}`} 
                                   healthStatus={block.nodes[selectedNode.nodeIdx].status as any}
                                   maintStatus={block.nodes[selectedNode.nodeIdx].maint as any}
                                   repairStatus={(selectedNode.nodeIdx + bIdx * 100) % 13 === 5 ? 'pending' : ((selectedNode.nodeIdx + bIdx * 100) % 13 === 8 ? 'inprogress' : 'none')}
                                   hasVM={block.nodes[selectedNode.nodeIdx].hasVM}
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
