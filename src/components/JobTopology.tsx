import React, { useState, useMemo } from 'react';
import { Job } from '@/types';
import { ChevronLeft, Filter, Info, TrendingUp, Zap, Thermometer, Activity } from 'lucide-react';
import { UnifiedNodeDetail, NODE_HEALTH_HISTORY } from './ClusterDirectorV2';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface JobTopologyProps {
  job: Job;
  onBack: () => void;
  onJobClick?: (jobId: string) => void;
}

interface NodeState {
  id: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  maintStatus: 'uptodate' | 'available' | 'inprogress' | 'pending';
  repairStatus: 'none' | 'pending' | 'inprogress';
  block: string;
  subblock: string;
}

// Mock time series data generator
const generateTimeSeriesData = (baseValue: number, variance: number, count: number = 20) => {
  return Array.from({ length: count }).map((_, i) => ({
    time: `${9 + Math.floor(i/4)}:${(i%4)*15 || '00'}`,
    value: baseValue + (Math.random() * variance * 2 - variance)
  }));
};

export const JobTopology: React.FC<JobTopologyProps> = ({ job, onBack, onJobClick }) => {
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);

  // Generate mock nodes for this job
  const nodes = useMemo(() => {
    const nodeCount = job.id.includes('zeta') ? 128 : 64;
    const result: NodeState[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      // Deterministic but varied status
      const seed = (i * 17 + job.id.length) % 100;
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (seed > 95) status = 'unhealthy';
      else if (seed > 85) status = 'degraded';

      const maintSeed = (i * 31 + job.id.length) % 100;
      let maintStatus: 'uptodate' | 'available' | 'inprogress' | 'pending' = 'uptodate';
      if (maintSeed > 98) maintStatus = 'inprogress';
      else if (maintSeed > 95) maintStatus = 'pending';
      else if (maintSeed > 90) maintStatus = 'available';

      const nodesPerSubblock = 18;
      const nodesPerBlock = 36;
      const blockNum = Math.floor(i / nodesPerBlock) + 1;
      const subblockNum = Math.floor((i % nodesPerBlock) / nodesPerSubblock) + 1;

      const repairSeed = (i * 47 + job.id.length) % 100;
      let repairStatus: 'none' | 'pending' | 'inprogress' = 'none';
      if (repairSeed > 97) repairStatus = 'inprogress';
      else if (repairSeed > 92) repairStatus = 'pending';

      result.push({ 
        id: i, 
        status, 
        maintStatus,
        repairStatus,
        block: `B${blockNum}`,
        subblock: `B${blockNum}-sb${subblockNum}`
      });
    }
    return result;
  }, [job.id]);

  const [filterBlock, setFilterBlock] = useState('All Blocks');
  const [filterSubblock, setFilterSubblock] = useState('All Subblocks');
  const [filterNode, setFilterNode] = useState('All Nodes');

  const blocks = useMemo(() => ['All Blocks', ...new Set(nodes.map(n => n.block))], [nodes]);
  const subblocks = useMemo(() => {
    const filtered = filterBlock === 'All Blocks' ? nodes : nodes.filter(n => n.block === filterBlock);
    return ['All Subblocks', ...new Set(filtered.map(n => n.subblock))];
  }, [nodes, filterBlock]);
  const nodeOptions = useMemo(() => {
    let filtered = nodes;
    if (filterBlock !== 'All Blocks') filtered = filtered.filter(n => n.block === filterBlock);
    if (filterSubblock !== 'All Subblocks') filtered = filtered.filter(n => n.subblock === filterSubblock);
    return ['All Nodes', ...filtered.map(n => `Node ${n.id}`)];
  }, [nodes, filterBlock, filterSubblock]);

  const filteredNodes = nodes.filter(n => {
    const matchesBlock = filterBlock === 'All Blocks' || n.block === filterBlock;
    const matchesSubblock = filterSubblock === 'All Subblocks' || n.subblock === filterSubblock;
    const matchesNode = filterNode === 'All Nodes' || `Node ${n.id}` === filterNode;
    return matchesBlock && matchesSubblock && matchesNode;
  });

  // Prepare multi-series data for charts
  const chartNodes = useMemo(() => filteredNodes.slice(0, 8), [filteredNodes]);
  
  const multiSeriesData = useMemo(() => {
    const timePoints = 20;
    const data = Array.from({ length: timePoints }).map((_, i) => {
      const time = `${9 + Math.floor(i/4)}:${(i%4)*15 || '00'}`;
      const entry: any = { time };
      chartNodes.forEach(node => {
        // Deterministic random walk for each node
        const seed = (node.id * 13) + i;
        entry[`temp_${node.id}`] = 60 + (node.id % 5) + (Math.sin(seed) * 3);
        entry[`power_${node.id}`] = 350 + (node.id % 50) + (Math.cos(seed) * 20);
        entry[`util_${node.id}`] = 85 + (node.id % 10) + (Math.sin(seed * 0.5) * 5);
      });
      return entry;
    });
    return data;
  }, [chartNodes]);

  const stats = useMemo(() => {
    return {
      total: nodes.length,
      healthy: nodes.filter(n => n.status === 'healthy').length,
      degraded: nodes.filter(n => n.status === 'degraded').length,
      unhealthy: nodes.filter(n => n.status === 'unhealthy').length,
    };
  }, [nodes]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{job.name}</h1>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                {job.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Job Topology • {job.cluster} • {job.accelerator}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Healthy</div>
              <div className="text-sm font-bold text-emerald-600">{stats.healthy}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Degraded</div>
              <div className="text-sm font-bold text-amber-600">{stats.degraded}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Unhealthy</div>
              <div className="text-sm font-bold text-rose-600">{stats.unhealthy}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Duration</div>
          <div className="text-lg font-bold text-slate-800">{job.duration}</div>
          <div className="text-[10px] text-slate-500 mt-1">Submitted {job.submitted}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Goodput</div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-emerald-600">{job.goodput}%</div>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${job.goodput}%` }} />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{job.goodputType}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Accelerator</div>
          <div className="text-lg font-bold text-slate-800 truncate">{job.accelerator}</div>
          <div className="text-[10px] text-slate-500 mt-1">8 chips per node</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">User</div>
          <div className="text-lg font-bold text-slate-800">{job.user}</div>
          <div className="text-[10px] text-slate-500 mt-1">Priority: {job.priority}</div>
        </div>
      </div>

      {/* Unified Logical Block: Filters + Topology + Metrics */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filter:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={filterBlock}
                onChange={(e) => {
                  setFilterBlock(e.target.value);
                  setFilterSubblock('All Subblocks');
                  setFilterNode('All Nodes');
                }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-slate-600 focus:outline-none focus:border-[#1967D2] transition-colors cursor-pointer"
              >
                {blocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              
              <select 
                value={filterSubblock}
                onChange={(e) => {
                  setFilterSubblock(e.target.value);
                  setFilterNode('All Nodes');
                }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-slate-600 focus:outline-none focus:border-[#1967D2] transition-colors cursor-pointer"
              >
                {subblocks.map(sb => <option key={sb} value={sb}>{sb}</option>)}
              </select>
              
              <select 
                value={filterNode}
                onChange={(e) => setFilterNode(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-slate-600 focus:outline-none focus:border-[#1967D2] transition-colors cursor-pointer"
              >
                {nodeOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#67e8f9' }} /> Healthy
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#8b5cf6' }} /> Maint
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#78350f' }} /> Repair
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#fbbf24' }} /> Degraded
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#f43f5e' }} /> Unhealthy
            </div>
          </div>
        </div>

        {/* Node Grid Section */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Allocated Nodes ({filteredNodes.length})
              <Info size={14} className="text-slate-400 cursor-help" />
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isPendingMaint = node.maintStatus === 'pending';
              const isPendingRepair = node.repairStatus === 'pending';
              
              const colors = {
                healthy: '#67e8f9',
                degraded: '#fbbf24',
                unhealthy: '#f43f5e',
                pending: '#8b5cf6',
                repair: '#78350f',
              };

              const baseColor = node.status === 'healthy' ? colors.healthy : 
                               node.status === 'degraded' ? colors.degraded : colors.unhealthy;
              
              let background = baseColor;
              if (isPendingMaint) {
                background = `linear-gradient(135deg, ${baseColor} 50%, ${colors.pending} 50%)`;
              } else if (isPendingRepair) {
                background = `linear-gradient(135deg, ${baseColor} 50%, ${colors.repair} 50%)`;
              }

              return (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className={`w-6 h-5 rounded-[2px] cursor-pointer transition-all flex items-center justify-center ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400 scale-110 z-10' : 'hover:opacity-80'}`}
                  style={{ background }}
                  title={`Node ${node.id} - ${node.status.toUpperCase()}${isPendingMaint ? ' (Pending Maintenance)' : ''}${isPendingRepair ? ' (Pending Repair)' : ''}`}
                />
              );
            })}
          </div>

          {/* Node Detail Overlay */}
          {selectedNode && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <UnifiedNodeDetail 
                nodeIdx={selectedNode.id}
                hierarchyLabel={`${selectedNode.block}/${selectedNode.subblock}`}
                healthStatus={selectedNode.status}
                maintStatus={selectedNode.maintStatus}
                repairStatus={selectedNode.repairStatus}
                hasVM={true}
                onJobClick={onJobClick}
              />
            </div>
          )}
        </div>

        {/* Performance Metrics Section */}
        <div className="p-6 space-y-6 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-[#1967D2]" />
                Job Performance Metrics
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Real-time GPU telemetry across allocated resources</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Showing {chartNodes.length} nodes</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GPU Temperature */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 rounded">
                  <Thermometer size={14} className="text-rose-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">GPU Temperature</span>
              </div>
              <div className="h-48 w-full bg-white rounded-lg border border-slate-200 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={multiSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis fontSize={9} tickLine={false} axisLine={false} unit="°" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '4px' }} />
                    {chartNodes.map((node, i) => (
                      <Line 
                        key={node.id} 
                        type="monotone" 
                        dataKey={`temp_${node.id}`} 
                        name={`Node ${node.id}`}
                        stroke={['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'][i % 8]} 
                        strokeWidth={1.5} 
                        dot={false} 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GPU Power */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 rounded">
                  <Zap size={14} className="text-amber-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">GPU Power Usage</span>
              </div>
              <div className="h-48 w-full bg-white rounded-lg border border-slate-200 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={multiSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis fontSize={9} tickLine={false} axisLine={false} unit="W" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '4px' }} />
                    {chartNodes.map((node, i) => (
                      <Line 
                        key={node.id} 
                        type="monotone" 
                        dataKey={`power_${node.id}`} 
                        name={`Node ${node.id}`}
                        stroke={['#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a', '#f43f5e', '#3b82f6', '#10b981'][i % 8]} 
                        strokeWidth={1.5} 
                        dot={false} 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SM Utilization */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded">
                  <Activity size={14} className="text-blue-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">SM Utilization</span>
              </div>
              <div className="h-48 w-full bg-white rounded-lg border border-slate-200 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={multiSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis fontSize={9} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '4px' }} />
                    {chartNodes.map((node, i) => (
                      <Line 
                        key={node.id} 
                        type="monotone" 
                        dataKey={`util_${node.id}`} 
                        name={`Node ${node.id}`}
                        stroke={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a', '#f43f5e'][i % 8]} 
                        strokeWidth={1.5} 
                        dot={false} 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
