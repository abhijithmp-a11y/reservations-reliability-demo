import React, { useState, useMemo } from 'react';
import { Job } from '@/types';
import { ChevronLeft, Search, Filter, Info } from 'lucide-react';
import { UnifiedNodeDetail } from './ClusterDirectorV2';

interface JobTopologyProps {
  job: Job;
  onBack: () => void;
}

interface NodeState {
  id: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  maintStatus: 'uptodate' | 'available' | 'inprogress' | 'pending';
}

export const JobTopology: React.FC<JobTopologyProps> = ({ job, onBack }) => {
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

      result.push({ id: i, status, maintStatus });
    }
    return result;
  }, [job.id]);

  const filteredNodes = nodes.filter(n => 
    n.id.toString().includes(searchTerm) || 
    n.status.includes(searchTerm.toLowerCase())
  );

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
          <div className="h-8 w-px bg-slate-200" />
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Filter nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#1967D2] w-48"
            />
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

      {/* Node Grid */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Allocated Nodes ({filteredNodes.length})
            <Info size={14} className="text-slate-400 cursor-help" />
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2 h-2 rounded-sm bg-cyan-500" /> Healthy
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2 h-2 rounded-sm bg-amber-500" /> Degraded
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2 h-2 rounded-sm bg-rose-600" /> Unhealthy
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filteredNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const color = node.status === 'healthy' ? 'bg-cyan-500' : node.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-600';
            
            return (
              <div 
                key={node.id}
                onClick={() => setSelectedNode(isSelected ? null : node)}
                className={`w-6 h-5 rounded-[2px] cursor-pointer transition-all flex items-center justify-center ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400 scale-110 z-10' : 'hover:opacity-80'} ${color}`}
                title={`Node ${node.id} - ${node.status.toUpperCase()}`}
              />
            );
          })}
        </div>

        {/* Node Detail Overlay */}
        {selectedNode && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <UnifiedNodeDetail 
              nodeIdx={selectedNode.id}
              blockLabel="Job Allocation"
              healthStatus={selectedNode.status}
              maintStatus={selectedNode.maintStatus}
              hasVM={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
