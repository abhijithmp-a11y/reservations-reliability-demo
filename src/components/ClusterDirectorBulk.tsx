
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
              <div className="pt-4 border-t border-slate-100 mt-4">
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
              {maintStatus === 'inprogress' && (
                <div className="bg-pink-50 p-2.5 rounded border border-pink-100 mt-2 space-y-2">
                  <div>
                    <div className="text-[9px] text-pink-600 uppercase font-bold mb-1">Maintenance Started</div>
                    <div className="text-[10px] font-bold text-pink-700">Jan 27, 09:15 AM</div>
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
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">CUDA Version</div>
                <div className="text-xs font-mono font-bold text-slate-700">v12.2.1</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Orchestrator</div>
                <div className="text-xs font-mono font-bold text-slate-700">GKE v1.28.3-gke.1203</div>
              </div>
              <div className="flex justify-end pt-1">
                <div className="text-[9px] font-bold text-[#1967D2] hover:underline flex items-center gap-0.5 cursor-pointer">
                  Machine repair log <ExternalLink size={10} />
                </div>
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

          {/* Right Col: Diagnostics */}
          <div className="space-y-4 border-l border-slate-100 pl-6">
            <div className="flex justify-between items-center">
              <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Recent Test Runs</h5>
              <button className="text-[10px] font-bold text-[#1967D2] bg-white border border-[#1967D2]/20 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                Run diagnostics <Play size={10} className="inline ml-1" />
              </button>
            </div>
          <div className="space-y-2">
            {testRuns.map(test => (
              <div key={test.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${test.status === 'PASS' ? 'bg-emerald-500' : test.status === 'FAIL' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <div>
                    <div className="text-[10px] font-bold text-slate-700">{test.name}</div>
                    <div className="text-[8px] text-slate-400 font-medium">{test.id} • {test.date}</div>
                  </div>
                </div>
                <ChevronDown size={12} className="text-slate-300 group-hover:text-slate-400 -rotate-90" />
              </div>
            ))}
          </div>
          <div className="pt-2">
            <button className="w-full py-2 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <MoreHorizontal size={14} /> View all diagnostics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export const ClusterDirectorBulk: React.FC<{ 
  onBack?: () => void; 
  onJobClick?: (jobId: string) => void;
  clusterId?: string;
}> = ({ onBack, onJobClick, clusterId }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('HEALTH');
  const [basicsOpen, setBasicsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [blockFilter, setBlockFilter] = useState<'ALL' | 'HEALTHY' | 'UNHEALTHY'>('ALL');
  const [subblockFilter, setSubblockFilter] = useState<'ALL' | 'HEALTHY' | 'SCHEDULABLE' | 'UNHEALTHY'>('ALL');
  const [capacityFilter, setCapacityFilter] = useState<'ALL' | 'SLURM' | 'GKE' | 'IDLE'>('ALL');
  const [topologyFilter, setTopologyFilter] = useState<'ALL' | 'HEALTHY' | 'UNHEALTHY'>('ALL');
  const [topologySort, setTopologySort] = useState<'MOST_UNHEALTHY' | 'LEAST_UNHEALTHY'>('MOST_UNHEALTHY');
  const [expandedSubblocks, setExpandedSubblocks] = useState<Set<string>>(new Set());


  // Generate 30 blocks, 8 subblocks, 18 nodes
  const initialBlocks = useMemo(() => {
    const blocks = [];
    for (let i = 1; i <= 30; i++) {
      const subblocks = [];
      for (let j = 1; j <= 8; j++) {
        subblocks.push({
          id: `sb-${i}-b-${j}`,
          label: `B${i}-sb${j}`,
          nodes: Array(18).fill(0)
        });
      }
      blocks.push({
        id: `block-${i}`,
        label: `B${i}`,
        isOpen: false,
        subblocks,
        originalIndex: i - 1
      });
    }
    return blocks;
  }, []);

  const [blocks, setBlocks] = useState(initialBlocks);

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
    setSelectedNode(null);
    if (mode !== 'CAPACITY') setCapacityFilter('ALL');
  };

  const getSubblockCluster = (blockIdx: number, sbIdx: number) => {
    const key = blockIdx * 8 + sbIdx;
    if (key % 3 === 0) return { name: 'Slurm-Bulk-01', type: 'SLURM' };
    if (key % 3 === 1) return { name: 'GKE-Data-Lake-02', type: 'GKE' };
    return { name: 'Idle / Reserve', type: 'IDLE' };
  };

  const getNodeColor = (blockIdx: number, sbIdx: number, nodeIdx: number, mode: ViewMode) => {
    const key = (blockIdx * 144) + (sbIdx * 18) + nodeIdx;
    const isGolden = blockIdx % 5 === 0;

    if (mode === 'HEALTH') {
      if (isGolden) return COLORS.health.healthy;
      if (key % 13 === 0) return COLORS.health.unhealthy;
      if (key % 17 === 0) return COLORS.health.suspected;
      return COLORS.health.healthy;
    }
    if (mode === 'MAINTENANCE') {
      if (isGolden) return COLORS.maintenance.uptodate;
      if (key % 20 === 0) return COLORS.maintenance.inprogress;
      if (key % 12 === 0) return COLORS.maintenance.available;
      if (key % 15 === 0) return COLORS.maintenance.pending;
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

    const blockMetrics = blocks.map((block, bIdx) => {
      let blockHealthyNodes = 0;
      let unhealthySubblocksInBlock = 0;
      let degradedSubblocksInBlock = 0;
      let blockHasMaintPending = false;
      let blockHasMaintInProgress = false;

      block.subblocks.forEach((sb, sbIdx) => {
        let sbHealthyNodes = 0;
        let subblockHasMaintPending = false;
        let subblockHasMaintInProgress = false;
        let subblockHasRepairPending = false;
        let subblockHasRepairInProgress = false;

        sb.nodes.forEach((_, nIdx) => {
          totalNodes++;
          const key = (bIdx * 144) + (sbIdx * 18) + nIdx;
          const isGolden = bIdx % 5 === 0;
          const isPendingRepair = !isGolden && (key % 13 === 5);
          const isInRepair = !isGolden && (key % 13 === 8);
          const hasVM = (key % 7 !== 0) && !isInRepair;
          
          const healthColor = getNodeColor(bIdx, sbIdx, nIdx, 'HEALTH');
          const maintColor = getNodeColor(bIdx, sbIdx, nIdx, 'MAINTENANCE');

          if (hasVM) {
            nodesWithVM++;
            if (healthColor === COLORS.health.unhealthy) unhealthyCount++;
            else {
              sbHealthyNodes++;
              if (healthColor === COLORS.health.suspected) degradedCount++;
              else healthyCount++;
            }
            if (isPendingRepair) { pendingRepairCount++; subblockHasRepairPending = true; }
            if (isInRepair) { inRepairCount++; subblockHasRepairInProgress = true; }
            if (maintColor === COLORS.maintenance.pending) { 
              pendingMaintCount++; subblockHasMaintPending = true; blockHasMaintPending = true; 
            }
            else if (maintColor === COLORS.maintenance.uptodate) maintUpToDate++;
            else if (maintColor === COLORS.maintenance.available) maintAvailable++;
            else if (maintColor === COLORS.maintenance.inprogress) { 
              maintInProgress++; subblockHasMaintInProgress = true; blockHasMaintInProgress = true; 
            }
          } else {
            emptyNodes++;
            if (healthColor === COLORS.health.unhealthy) unhealthyCount++;
            else sbHealthyNodes++;
            if (isInRepair) { inRepairCount++; subblockHasRepairInProgress = true; }
          }
        });

        if (sbHealthyNodes === 18) healthySubblocks++;
        else if (sbHealthyNodes >= 16) {
          schedulableSubblocks++;
          degradedSubblocksInBlock++;
        }
        else {
          unhealthySubblocks++;
          unhealthySubblocksInBlock++;
        }
        if (subblockHasMaintPending) maintSubblocksPending++;
        if (subblockHasMaintInProgress) maintSubblocksInProgress++;
        if (subblockHasRepairPending) repairSubblocksPending++;
        if (subblockHasRepairInProgress) repairSubblocksInProgress++;
        blockHealthyNodes += sbHealthyNodes;
      });

      const blockStatus = unhealthySubblocksInBlock > 0 ? 'UNHEALTHY' : 
                          degradedSubblocksInBlock > 0 ? 'DEGRADED' : 'HEALTHY';
      const isBlockHealthy = blockStatus === 'HEALTHY';
      if (isBlockHealthy) healthyBlocks++;
      else unhealthyBlocks++;
      if (blockHasMaintPending) maintBlocksPending++;
      if (blockHasMaintInProgress) maintBlocksInProgress++;

      return {
        ...block,
        unhealthySubblocksCount: unhealthySubblocksInBlock,
        degradedSubblocksCount: degradedSubblocksInBlock,
        unhealthyCount: (8 * 18) - blockHealthyNodes,
        isHealthy: isBlockHealthy,
        status: blockStatus
      };
    });

    // Sort blocks: Unhealthy first, then Degraded, then Healthy
    const sortedBlocks = [...blockMetrics].sort((a, b) => {
      const statusOrder = { 'UNHEALTHY': 0, 'DEGRADED': 1, 'HEALTHY': 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (b.unhealthySubblocksCount !== a.unhealthySubblocksCount) {
        return b.unhealthySubblocksCount - a.unhealthySubblocksCount;
      }
      return b.degradedSubblocksCount - a.degradedSubblocksCount;
    });

    return {
      totalNodes, nodesWithVM, emptyNodes, healthyCount, pendingMaintCount, pendingRepairCount,
      degradedCount, unhealthyCount, maintUpToDate, maintAvailable, maintInProgress,
      healthyBlocks, unhealthyBlocks, healthySubblocks, unhealthySubblocks, schedulableSubblocks,
      inRepairCount, maintBlocksPending, maintBlocksInProgress, maintSubblocksPending, 
      maintSubblocksInProgress, repairSubblocksPending, repairSubblocksInProgress, sortedBlocks
    };
  }, [blocks]);

  const filteredBlocks = useMemo(() => {
    let result = [...reconciledMetrics.sortedBlocks];
    
    // Apply Topology Filter
    if (topologyFilter === 'HEALTHY') {
      result = result.filter(block => block.status === 'HEALTHY');
    } else if (topologyFilter === 'UNHEALTHY') {
      result = result.filter(block => block.status !== 'HEALTHY');
    }

    // Apply Capacity Filter
    if (capacityFilter !== 'ALL') {
      result = result.filter(block => {
        return block.subblocks.some((_, sbIdx) => getSubblockCluster(block.originalIndex, sbIdx).type === capacityFilter);
      });
    }

    // Apply Topology Sort
    if (topologySort === 'LEAST_UNHEALTHY') {
      result.reverse();
    }

    return result;
  }, [reconciledMetrics.sortedBlocks, topologyFilter, topologySort]);

  const renderDashboardCard = () => {
    switch (viewMode) {
      case 'HEALTH':
        return (
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Blocks</h4>
                    <div className="flex items-center bg-slate-100 rounded-md p-0.5 mt-1">
                      {(['ALL', 'HEALTHY', 'UNHEALTHY'] as const).map((f) => (
                        <button key={f} onClick={() => setBlockFilter(f)} className={`px-2 py-0.5 text-[9px] font-black rounded transition-all ${blockFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">{reconciledMetrics.healthyBlocks + reconciledMetrics.unhealthyBlocks}</span>
                    <span className="text-[10px] text-slate-400 ml-1 uppercase font-bold tracking-tighter">Total Blocks</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${(reconciledMetrics.healthyBlocks / 30) * 100}%` }} />
                  <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${(reconciledMetrics.unhealthyBlocks / 30) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <HealthTooltip align="left" content="A block is Healthy if all its subblocks are fully healthy.">
                    <div className="flex items-center gap-2 text-cyan-600 cursor-help"><div className="w-2 h-2 rounded-full bg-cyan-400" /> Healthy: {reconciledMetrics.healthyBlocks}</div>
                  </HealthTooltip>
                  <HealthTooltip align="right" content="A block is Unhealthy if it contains at least one subblock that is Schedulable or Unhealthy.">
                    <div className="flex items-center gap-2 text-rose-600 cursor-help">Unhealthy: {reconciledMetrics.unhealthyBlocks} <div className="w-2 h-2 rounded-full bg-rose-500" /></div>
                  </HealthTooltip>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Subblocks</h4>
                    <div className="flex items-center bg-slate-100 rounded-md p-0.5 mt-1">
                      {(['ALL', 'HEALTHY', 'SCHEDULABLE', 'UNHEALTHY'] as const).map((f) => (
                        <button key={f} onClick={() => setSubblockFilter(f)} className={`px-2 py-0.5 text-[9px] font-black rounded transition-all ${subblockFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">240</span>
                    <span className="text-[10px] text-slate-400 ml-1 uppercase font-bold tracking-tighter">Total Subblocks</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${(reconciledMetrics.healthySubblocks / 240) * 100}%` }} />
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${(reconciledMetrics.schedulableSubblocks / 240) * 100}%` }} />
                  <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${(reconciledMetrics.unhealthySubblocks / 240) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <HealthTooltip align="left" content="A subblock is Healthy if 18 out of 18 machines are healthy.">
                    <div className="flex items-center gap-2 text-cyan-600 cursor-help"><div className="w-2 h-2 rounded-full bg-cyan-400" /> Healthy: {reconciledMetrics.healthySubblocks}</div>
                  </HealthTooltip>
                  <HealthTooltip content="A subblock is Schedulable if 16 or 17 machines are healthy. Viable for most workloads.">
                    <div className="flex items-center gap-2 text-amber-600 cursor-help"><div className="w-2 h-2 rounded-full bg-amber-500" /> Schedulable: {reconciledMetrics.schedulableSubblocks}</div>
                  </HealthTooltip>
                  <HealthTooltip align="right" content="A subblock is Unhealthy if fewer than 16 machines are healthy. Critical failure state.">
                    <div className="flex items-center gap-2 text-rose-600 cursor-help">Unhealthy: {reconciledMetrics.unhealthySubblocks} <div className="w-2 h-2 rounded-full bg-rose-500" /></div>
                  </HealthTooltip>
                </div>
              </div>
            </div>
          </div>
        );

      case 'MAINTENANCE': {
        const combinedChartData = [
          { name: 'Blocks (M)', ongoing: reconciledMetrics.maintBlocksInProgress, pending: reconciledMetrics.maintBlocksPending, type: 'MAINT' },
          { name: 'Subblocks (M)', ongoing: reconciledMetrics.maintSubblocksInProgress, pending: reconciledMetrics.maintSubblocksPending, type: 'MAINT' },
          { name: 'VMs (M)', ongoing: reconciledMetrics.maintInProgress, pending: reconciledMetrics.pendingMaintCount, type: 'MAINT' },
          { name: 'Subblocks (R)', ongoing: reconciledMetrics.repairSubblocksInProgress, pending: reconciledMetrics.repairSubblocksPending, type: 'REPAIR' },
          { name: 'Machines (R)', ongoing: reconciledMetrics.inRepairCount, pending: reconciledMetrics.pendingRepairCount, type: 'REPAIR' },
        ];

        return (
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Fleet Events</h4>
                  <p className="text-[10px] text-slate-500">Combined view of Maintenance (M) and Repairs (R)</p>
                </div>
                <div className="flex gap-4 text-[9px] font-bold">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-pink-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Maint. Ongoing
                    </div>
                    <div className="flex items-center gap-1.5 text-violet-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Maint. Pending
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[#451a03]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#451a03]" /> Repair In-Progress
                    </div>
                    <div className="flex items-center gap-1.5 text-[#78350f]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#78350f]" /> Repair Pending
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-40 w-full bg-slate-50/50 rounded-lg border border-slate-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={combinedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 9 }}
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
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
      }

      case 'CAPACITY': {
        const allocatedDelivered = Math.round(reconciledMetrics.totalNodes * 0.95);
        const slurmConsumed = Math.round(reconciledMetrics.totalNodes * 0.4);
        const gkeConsumed = Math.round(reconciledMetrics.totalNodes * 0.44);
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
            pending: Math.round(reconciledMetrics.totalNodes * 0.05),
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
              <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-[10px] border border-slate-700 animate-fadeIn">
                <div className="font-bold mb-1 border-b border-slate-700 pb-1 uppercase tracking-wider text-slate-400">
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
                    <span className="text-2xl font-black text-slate-900">88.4%</span>
                    <span className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-0.5">
                      <TrendingUp size={12} /> +2.1%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">Allocated to Consumed ratio</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Consumption Split</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-600">Slurm</span>
                      <span className="text-xs font-bold text-slate-900">47.6%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: '47.6%' }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-600">GKE</span>
                      <span className="text-xs font-bold text-slate-900 text-right">52.4%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: '52.4%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-900 pb-10">
      
      <div className="mb-6">
        <h1 className="text-lg font-bold text-slate-900">us-central1-reservation2</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100">Extended Reservation</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500">us-central1-a</span>
        </div>
      </div>

      {onBack && (
        <div className="flex justify-between items-center mb-2">
          <button onClick={onBack} className="text-slate-500 hover:text-[#1967D2] text-xs flex items-center gap-1 font-medium transition-colors"><ArrowLeft size={14} /> Back to fleet</button>
          {clusterId && <div className="text-xs text-slate-500"><span className="font-bold text-slate-700">{clusterId}</span></div>}
        </div>
      )}

      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{value: 100}]} innerRadius={32} outerRadius={40} dataKey="value" stroke="none"><Cell fill="#1a73e8" /></Pie></PieChart></ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-lg font-bold text-slate-900">{reconciledMetrics.nodesWithVM}</span><span className="text-[9px] text-slate-500 uppercase font-bold">Used</span></div>
            </div>
            <div><h4 className="text-sm font-medium text-slate-800 mb-1">VMs used</h4><p className="text-xs text-slate-500">Extended Reservation</p></div>
          </div>
          <div className="md:pl-8 pt-6 md:pt-0">
            <h4 className="text-sm font-medium text-slate-800 mb-1">Unused capacity</h4>
            <div className="text-lg font-bold text-slate-900 mb-1">{reconciledMetrics.emptyNodes} / {reconciledMetrics.totalNodes} instances</div>
            <p className="text-xs text-slate-500">
              {Math.round((reconciledMetrics.emptyNodes / reconciledMetrics.totalNodes) * 100)}% not in use. <button onClick={() => handleTabChange('CAPACITY')} className="text-[#1a73e8] hover:underline inline-flex items-center gap-0.5">View details <ExternalLink size={10} /></button>
            </p>
          </div>
          <div className="md:pl-8 pt-6 md:pt-0">
            <div className="flex items-center gap-1.5 mb-1"><h4 className="text-sm font-medium text-slate-800">Maintenance and Repairs</h4><HelpCircle size={14} className="text-slate-500 cursor-help" /></div>
            <p className="text-xs text-slate-500 leading-relaxed">Maintenance and Repairs affecting this extended reservation. <button onClick={() => handleTabChange('MAINTENANCE')} className="text-[#1a73e8] hover:underline font-medium">View details</button></p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Reservation overview</h3>
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-6">
                {(['HEALTH', 'MAINTENANCE', 'CAPACITY'] as const).map((mode) => (
                  <button key={mode} onClick={() => handleTabChange(mode)} className={`pb-3 text-xs font-bold transition-all relative ${viewMode === mode ? 'text-[#1967D2]' : 'text-slate-500 hover:text-slate-700'}`}>
                    {mode === 'MAINTENANCE' ? 'Maintenance and repairs' : mode === 'CAPACITY' ? 'Capacity' : 'Health'}
                    {viewMode === mode && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1967D2] rounded-full" />}
                  </button>
                ))}
              </div>
            </div>
            {renderDashboardCard()}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <button onClick={() => setBasicsOpen(!basicsOpen)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <h3 className="text-lg font-medium text-slate-900">Reservation basics</h3>
              <ChevronDown size={20} className={`text-slate-500 transition-transform ${basicsOpen ? 'rotate-180' : ''}`} />
            </button>
            {basicsOpen && (
              <div className="px-6 pb-6 border-t border-slate-800 animate-fadeIn">
                <div className="border border-slate-800 rounded overflow-hidden mt-4">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-800">
                      {[
                        { label: 'Status', value: <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200"><CheckCircle2 size={12} /> Ready</span> },
                        { label: 'Assured count', value: reconciledMetrics.totalNodes.toString() },
                        { label: 'Creation time', value: 'January 12, 2026, 10:30 AM' },
                        { label: 'Auto-delete time', value: 'March 12, 2026, 12:00 AM' },
                        { label: 'Location', value: 'us-central1-a' },
                        { label: 'Number of blocks', value: '30' },
                        { label: 'Number of subblocks', value: '240' },
                        { label: 'Health status', value: <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200"><CheckCircle2 size={12} /> Healthy</span> },
                        { label: 'Healthy subblocks', value: reconciledMetrics.healthySubblocks.toString() },
                        { label: 'Unhealthy subblocks', value: reconciledMetrics.unhealthySubblocks.toString() },
                        { label: 'Deployment type', value: 'Extended' },
                        { label: 'Maintenance mode', value: 'Grouped' },
                        { label: 'Operational mode', value: 'All capacity' },
                        { label: 'Description', value: 'Large scale training reservation' },
                        { label: 'Linked Commitments', value: 'C-99088-Extended' },
                        { label: 'Share with other Google services', value: <div className="flex items-center justify-between w-full"><span>No</span> <Pencil size={14} className="text-[#1a73e8] cursor-pointer" /></div> },
                        { label: 'Share type', value: 'Organization' },
                        { label: 'Shared with', value: 'All projects' },
                        { label: 'Use with VM instance', value: 'Any' },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 text-slate-500 font-medium w-1/2">{row.label}</td>
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
              <div className="px-6 pb-6 border-t border-slate-200 animate-fadeIn">
                <div className="border border-slate-200 rounded overflow-hidden mt-4">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { label: 'Number of VM instances', value: reconciledMetrics.totalNodes.toString() },
                        { label: 'VMs in use', value: reconciledMetrics.nodesWithVM.toString() },
                        { label: 'Machine type', value: 'a3-highgpu-8g' },
                        { label: 'vCPUs', value: '208' },
                        { label: 'Memory', value: '1872 GB' },
                        { label: 'Min CPU Platform', value: 'Intel Sapphire Rapids' },
                        { label: 'Placement policy', value: 'Compact' },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 text-slate-500 font-medium w-1/2">{row.label}</td>
                          <td className="py-2.5 px-4 text-slate-900">{row.value}</td>
                        </tr>
                      ))}
                      {/* Accelerators Sub-header */}
                      <tr className="bg-slate-50">
                        <td colSpan={2} className="py-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Accelerators</td>
                      </tr>
                      {[
                        { label: 'Accelerator type', value: 'NVIDIA H100' },
                        { label: 'Accelerator count', value: '8' },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 text-slate-500 font-medium w-1/2">{row.label}</td>
                          <td className="py-2.5 px-4 text-slate-900">{row.value}</td>
                        </tr>
                      ))}
                      {/* Local SSDs Sub-header */}
                      <tr className="bg-slate-50">
                        <td colSpan={2} className="py-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Local SSDs</td>
                      </tr>
                      {[
                        { label: 'Local SSD count', value: '16' },
                        { label: 'Interface', value: 'NVME' },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 text-slate-500 font-medium w-1/2">{row.label}</td>
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-slate-900">Physical resource topology</h3>
            <div className="flex items-center gap-4">
              {/* Filter */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md p-0.5 shadow-sm">
                {(['ALL', 'HEALTHY', 'UNHEALTHY'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTopologyFilter(f)}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                      topologyFilter === f 
                        ? 'bg-white text-[#1967D2] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              {/* Sort */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md p-0.5 shadow-sm">
                <button
                  onClick={() => setTopologySort(topologySort === 'MOST_UNHEALTHY' ? 'LEAST_UNHEALTHY' : 'MOST_UNHEALTHY')}
                  className="px-3 py-1 text-[10px] font-bold text-[#1967D2] flex items-center gap-1.5 hover:bg-white rounded transition-all"
                >
                  <TrendingUp size={12} className={topologySort === 'LEAST_UNHEALTHY' ? 'rotate-180' : ''} />
                  {topologySort === 'MOST_UNHEALTHY' ? 'Most unhealthy' : 'Least unhealthy'}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
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

              {capacityFilter !== 'ALL' && (
                <>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                  <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-100 rounded-md animate-pulse">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Filtering by capacity:</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${
                      capacityFilter === 'SLURM' ? 'bg-indigo-500 text-white' :
                      capacityFilter === 'GKE' ? 'bg-emerald-500 text-white' :
                      'bg-amber-500 text-white'
                    }`}>
                      {capacityFilter}
                    </span>
                    <button 
                      onClick={() => setCapacityFilter('ALL')}
                      className="text-blue-400 hover:text-blue-600 transition-colors ml-1"
                    >
                      <RefreshCw size={10} />
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="p-6"><div className="grid grid-cols-1 gap-8">
              {filteredBlocks.map((block, bIdx) => {
                const isExpanded = expandedSubblocks.has(block.id);
                return (
                  <div key={block.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
                    <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleSubblock(block.id)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          block.status === 'HEALTHY' ? 'bg-emerald-500' : 
                          block.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Block</span>
                          <h4 className="text-sm font-medium text-slate-800">{block.label}</h4>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-100 space-y-6 animate-slideDown">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {block.subblocks.map((sb, sbIdx) => {
                            const blockHealth = sb.nodes.map((_, nIdx) => getNodeColor(block.originalIndex, sbIdx, nIdx, 'HEALTH'));
                            const hCount = blockHealth.filter(c => c === COLORS.health.healthy).length;
                            const dCount = blockHealth.filter(c => c === COLORS.health.suspected).length;
                            const uCount = blockHealth.filter(c => c === COLORS.health.unhealthy).length;

                            const blockMaint = sb.nodes.map((_, nIdx) => getNodeColor(block.originalIndex, sbIdx, nIdx, 'MAINTENANCE'));
                            const mUpToDate = blockMaint.filter(c => c === COLORS.maintenance.uptodate).length;
                            const mAvailable = blockMaint.filter(c => c === COLORS.maintenance.available).length;
                            const mInProgress = blockMaint.filter(c => c === COLORS.maintenance.inprogress).length;

                            const clusterInfo = getSubblockCluster(block.originalIndex, sbIdx);
                            if (capacityFilter !== 'ALL' && clusterInfo.type !== capacityFilter) return null;

                            return (
                              <React.Fragment key={sb.id}>
                                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subblock</h5>
                                        <span className="text-[9px] font-mono text-slate-400">{sb.label}</span>
                                      </div>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border w-fit ${
                                        clusterInfo.type === 'SLURM' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                        clusterInfo.type === 'GKE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                      }`}>
                                        {clusterInfo.name}
                                      </span>
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
                                  <div className="grid grid-cols-9 gap-1">
                                    {sb.nodes.map((_, nIdx) => {
                                      const healthColor = getNodeColor(block.originalIndex, sbIdx, nIdx, 'HEALTH');
                                      const maintColor = getNodeColor(block.originalIndex, sbIdx, nIdx, 'MAINTENANCE');
                                      const key = (block.originalIndex * 144) + (sbIdx * 18) + nIdx;
                                      const isGolden = block.originalIndex % 5 === 0;
                                      const isPendingRepair = !isGolden && (key % 13 === 5);
                                      const isInRepair = !isGolden && (key % 13 === 8);
                                      const hasVM = (key % 7 !== 0) && !isInRepair;
                                      
                                      const isSelected = selectedNode?.sbId === block.id && selectedNode?.blockId === sb.id && selectedNode?.nodeIdx === nIdx;
                                      const isPendingMaint = maintColor === COLORS.maintenance.pending;
                                      const isOngoingMaint = maintColor === COLORS.maintenance.inprogress;
                                      
                                      const bg = hasVM 
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
                                               : 'transparent'));

                                      return (
                                        <div key={nIdx} className={`w-full aspect-square rounded-[1px] cursor-pointer transition-all flex items-center justify-center ${isSelected ? 'ring-2 ring-[#1967D2] ring-offset-1 z-10 scale-110' : 'hover:opacity-80'}`}
                                          style={{ background: bg, border: hasVM ? 'none' : (isInRepair ? `1.5px solid ${COLORS.repair.inprogress}` : `1.5px solid ${healthColor}`) }}
                                          onClick={() => {
                                            if (isSelected) setSelectedNode(null);
                                            else setSelectedNode({ 
                                              sbId: block.id, blockId: sb.id, nodeIdx: nIdx, 
                                              status: healthColor === COLORS.health.unhealthy ? 'unhealthy' : healthColor === COLORS.health.suspected ? 'degraded' : 'healthy',
                                              hasVM,
                                              repairStatus: isPendingRepair ? 'pending' : (isInRepair ? 'inprogress' : 'none')
                                            });
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
                                {selectedNode && selectedNode.sbId === block.id && selectedNode.blockId === sb.id && (
                                  <div className="col-span-full">
                                    <UnifiedNodeDetail 
                                      nodeIdx={selectedNode.nodeIdx} 
                                      hierarchyLabel={`B${block.originalIndex + 1}/${sb.label}`} 
                                      healthStatus={selectedNode.status}
                                      maintStatus={(() => {
                                        const color = getNodeColor(block.originalIndex, sbIdx, selectedNode.nodeIdx, 'MAINTENANCE');
                                        return color === COLORS.maintenance.inprogress ? 'inprogress' : color === COLORS.maintenance.available ? 'available' : color === COLORS.maintenance.pending ? 'pending' : 'uptodate';
                                      })()}
                                      repairStatus={selectedNode.repairStatus}
                                      hasVM={selectedNode.hasVM} 
                                      onJobClick={onJobClick}
                                    />
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div></div>
          </div>
        </div>
      </div>
    </div>
  );
};
