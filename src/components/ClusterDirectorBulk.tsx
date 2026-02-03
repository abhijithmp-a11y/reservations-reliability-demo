
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

type ViewMode = 'HEALTH' | 'MAINTENANCE';

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
  const [topologyFilter, setTopologyFilter] = useState<'ALL' | 'HEALTHY' | 'UNHEALTHY'>('ALL');
  const [topologySort, setTopologySort] = useState<'MOST_UNHEALTHY' | 'LEAST_UNHEALTHY'>('MOST_UNHEALTHY');
  const [expandedSubblocks, setExpandedSubblocks] = useState<Set<string>>(new Set());


  // Generate 30 blocks, 8 subblocks, 16 nodes
  const initialBlocks = useMemo(() => {
    const blocks = [];
    for (let i = 1; i <= 30; i++) {
      const subblocks = [];
      for (let j = 1; j <= 8; j++) {
        subblocks.push({
          id: `sb-${i}-b-${j}`,
          label: `B${i}-sb${j}`,
          nodes: Array(16).fill(0)
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
  };

  const getNodeColor = (blockIdx: number, sbIdx: number, nodeIdx: number, mode: ViewMode) => {
    const key = (blockIdx * 128) + (sbIdx * 16) + nodeIdx;
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
          const key = (bIdx * 128) + (sbIdx * 16) + nIdx;
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

        if (sbHealthyNodes === 16) healthySubblocks++;
        else if (sbHealthyNodes >= 14) {
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
        unhealthyCount: (8 * 16) - blockHealthyNodes,
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

    // Apply Topology Sort
    if (topologySort === 'LEAST_UNHEALTHY') {
      result.reverse();
    }

    return result;
  }, [reconciledMetrics.sortedBlocks, topologyFilter, topologySort]);

  const renderDashboardCard = () => {
    if (viewMode === 'HEALTH') {
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
                <HealthTooltip align="left" content="A subblock is Healthy if 16 out of 16 machines are healthy.">
                  <div className="flex items-center gap-2 text-cyan-600 cursor-help"><div className="w-2 h-2 rounded-full bg-cyan-400" /> Healthy: {reconciledMetrics.healthySubblocks}</div>
                </HealthTooltip>
                <HealthTooltip content="A subblock is Schedulable if 14 or 15 machines are healthy. Viable for most workloads.">
                  <div className="flex items-center gap-2 text-amber-600 cursor-help"><div className="w-2 h-2 rounded-full bg-amber-500" /> Schedulable: {reconciledMetrics.schedulableSubblocks}</div>
                </HealthTooltip>
                <HealthTooltip align="right" content="A subblock is Unhealthy if fewer than 14 machines are healthy. Critical failure state.">
                  <div className="flex items-center gap-2 text-rose-600 cursor-help">Unhealthy: {reconciledMetrics.unhealthySubblocks} <div className="w-2 h-2 rounded-full bg-rose-500" /></div>
                </HealthTooltip>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const maintChartData = [
      { name: 'Blocks', ongoing: reconciledMetrics.maintBlocksInProgress, pending: reconciledMetrics.maintBlocksPending },
      { name: 'Subblocks', ongoing: reconciledMetrics.maintSubblocksInProgress, pending: reconciledMetrics.maintSubblocksPending },
      { name: 'VMs', ongoing: reconciledMetrics.maintInProgress, pending: reconciledMetrics.pendingMaintCount },
    ];
    const repairChartData = [
      { name: 'Subblocks', ongoing: reconciledMetrics.repairSubblocksInProgress, pending: reconciledMetrics.repairSubblocksPending },
      { name: 'Machines', ongoing: reconciledMetrics.inRepairCount, pending: reconciledMetrics.pendingRepairCount },
    ];

    return (
      <div className="p-6 space-y-10">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div><h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Maintenance</h4><p className="text-xs text-slate-500">Ongoing vs Pending maintenance</p></div>
            <div className="flex gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5 text-pink-600"><div className="w-2 h-2 rounded-full bg-pink-500" /> Ongoing</div>
              <div className="flex items-center gap-1.5 text-violet-600"><div className="w-2 h-2 rounded-full bg-violet-500" /> Pending</div>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="ongoing" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="pending" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <div><h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Repairs</h4><p className="text-xs text-slate-500">Hardware repairs</p></div>
            <div className="flex gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5 text-[#451a03]"><div className="w-2 h-2 rounded-full bg-[#451a03]" /> In Repair</div>
              <div className="flex items-center gap-1.5 text-[#78350f]"><div className="w-2 h-2 rounded-full bg-[#78350f]" /> Pending</div>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repairChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="ongoing" fill="#451a03" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="pending" fill="#78350f" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 font-sans text-slate-900 pb-10">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-lg font-bold text-slate-800">{reconciledMetrics.nodesWithVM}</span><span className="text-[9px] text-slate-500 uppercase font-bold">Used</span></div>
            </div>
            <div><h4 className="text-sm font-medium text-slate-800 mb-1">VMs used</h4><p className="text-xs text-slate-500">Bulk Reservation</p></div>
          </div>
          <div className="md:pl-8 pt-6 md:pt-0">
            <h4 className="text-sm font-medium text-slate-800 mb-1">Unused capacity</h4>
            <div className="text-lg font-bold text-slate-900 mb-1">{reconciledMetrics.emptyNodes} / {reconciledMetrics.totalNodes} instances</div>
            <p className="text-xs text-slate-500">{Math.round((reconciledMetrics.emptyNodes / reconciledMetrics.totalNodes) * 100)}% not in use.</p>
          </div>
          <div className="md:pl-8 pt-6 md:pt-0">
            <div className="flex items-center gap-1.5 mb-1"><h4 className="text-sm font-medium text-slate-800">Maintenance and Repairs</h4><HelpCircle size={14} className="text-slate-400 cursor-help" /></div>
            <p className="text-xs text-slate-500 leading-relaxed">Maintenance and Repairs affecting this bulk reservation. <button onClick={() => handleTabChange('MAINTENANCE')} className="text-[#1a73e8] hover:underline font-medium">View details</button></p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Reservation overview</h3>
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 pt-4 border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-6">
                {(['HEALTH', 'MAINTENANCE'] as const).map((mode) => (
                  <button key={mode} onClick={() => handleTabChange(mode)} className={`pb-3 text-xs font-bold transition-all relative ${viewMode === mode ? 'text-[#1967D2]' : 'text-slate-400 hover:text-slate-600'}`}>
                    {mode === 'MAINTENANCE' ? 'Maintenance and repairs' : 'Health'}
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
            <button onClick={() => setBasicsOpen(!basicsOpen)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"><h3 className="text-lg font-medium text-slate-900">Reservation basics</h3><ChevronDown size={20} className={`text-slate-400 transition-transform ${basicsOpen ? 'rotate-180' : ''}`} /></button>
            {basicsOpen && (
              <div className="px-6 pb-6 border-t border-slate-100 animate-fadeIn">
                <div className="border border-slate-200 rounded overflow-hidden mt-4">
                  <table className="w-full text-sm"><tbody className="divide-y divide-slate-100">
                    {[{ label: 'Status', value: <span className="text-emerald-700 font-bold">Ready</span> }, { label: 'Location', value: 'us-central1-a' }, { label: 'Number of blocks', value: '30' }, { label: 'Number of subblocks', value: '240' }, { label: 'Total Nodes', value: reconciledMetrics.totalNodes.toString() }].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors"><td className="py-2.5 px-4 text-slate-600 font-medium w-1/2">{row.label}</td><td className="py-2.5 px-4 text-slate-900">{row.value}</td></tr>
                    ))}
                  </tbody></table>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <button onClick={() => setConfigOpen(!configOpen)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"><h3 className="text-lg font-medium text-slate-900">Configuration details</h3><ChevronDown size={20} className={`text-slate-400 transition-transform ${configOpen ? 'rotate-180' : ''}`} /></button>
            {configOpen && (
              <div className="px-6 pb-6 border-t border-slate-100 animate-fadeIn">
                <div className="border border-slate-200 rounded overflow-hidden mt-4">
                  <table className="w-full text-sm"><tbody className="divide-y divide-slate-100">
                    {[{ label: 'Machine type', value: 'a3-highgpu-8g' }, { label: 'Accelerator type', value: 'NVIDIA H100' }, { label: 'Accelerator count', value: '8' }].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors"><td className="py-2.5 px-4 text-slate-600 font-medium w-1/2">{row.label}</td><td className="py-2.5 px-4 text-slate-900">{row.value}</td></tr>
                    ))}
                  </tbody></table>
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
              <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-sm">
                {(['ALL', 'HEALTHY', 'UNHEALTHY'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTopologyFilter(f)}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                      topologyFilter === f 
                        ? 'bg-slate-100 text-[#1967D2]' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              {/* Sort */}
              <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-sm">
                <button
                  onClick={() => setTopologySort(topologySort === 'MOST_UNHEALTHY' ? 'LEAST_UNHEALTHY' : 'MOST_UNHEALTHY')}
                  className="px-3 py-1 text-[10px] font-bold text-[#1967D2] flex items-center gap-1.5 hover:bg-slate-50 transition-all"
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

                            return (
                              <React.Fragment key={sb.id}>
                                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-1.5">
                                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subblock</h5>
                                      <span className="text-[9px] font-mono text-slate-400">{sb.label}</span>
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
                                  <div className="grid grid-cols-8 gap-1">
                                    {sb.nodes.map((_, nIdx) => {
                                      const healthColor = getNodeColor(block.originalIndex, sbIdx, nIdx, 'HEALTH');
                                      const maintColor = getNodeColor(block.originalIndex, sbIdx, nIdx, 'MAINTENANCE');
                                      const key = (block.originalIndex * 128) + (sbIdx * 16) + nIdx;
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
