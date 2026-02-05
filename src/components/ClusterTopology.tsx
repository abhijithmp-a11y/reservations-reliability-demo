
import React, { useState, useMemo } from 'react';
import { Server, Activity, Cpu, AlertTriangle, CheckCircle2, Zap, Thermometer, Box, ChevronUp, ExternalLink } from 'lucide-react';
import { Job, JobStatus } from '../types';

// Mock Data for the Topology View
export const REGIONS = [
  {
    id: 'us-west',
    name: 'US West (Oregon)',
    status: 'healthy',
    latency: '24ms',
    clusters: [
      { id: 'c1', name: 'us-west-train-v4', type: 'H100 Pod', orchestrator: 'GKE', count: 2048, util: 94, status: 'healthy', reservation: 'us-west8-reservation1' },
      { id: 'c2', name: 'us-west-inf-01', type: 'T4 Pool', orchestrator: 'Slurm', count: 512, util: 45, status: 'warning', reservation: 'us-west8-reservation1' }
    ]
  },
  {
    id: 'us-east',
    name: 'US East (N. Virginia)',
    status: 'healthy',
    latency: '82ms',
    clusters: [
      { id: 'c3', name: 'us-east-train-02', type: 'TPU v5p', orchestrator: 'GKE', count: 1024, util: 98, status: 'healthy', reservation: 'us-central1-reservation2' }
    ]
  },
  {
    id: 'eu',
    name: 'Europe (Frankfurt)',
    status: 'warning',
    latency: '145ms',
    clusters: [
      { id: 'c4', name: 'eu-central-gpu-2', type: 'A100 Superpod', orchestrator: 'Vertex AI', count: 1024, util: 88, status: 'warning', reservation: 'europe-north-reservation3' },
      { id: 'c5', name: 'eu-west-inf-03', type: 'T4 Pool', orchestrator: 'Compute', count: 256, util: 60, status: 'healthy', reservation: 'europe-north-reservation3' }
    ]
  },
  {
    id: 'asia',
    name: 'Asia (Tokyo)',
    status: 'healthy',
    latency: '110ms',
    clusters: [
      { id: 'c6', name: 'asia-ne-tpu-1', type: 'TPU v4', orchestrator: 'Director', count: 2048, util: 95, status: 'healthy', reservation: 'asia-south-reservation4' }
    ]
  }
];

interface ClusterTopologyProps {
  onClusterClick?: (clusterId: string) => void;
  jobs?: Job[];
  filterOrchestrator?: string;
}

const TopologyLegend = () => (
  <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-200">
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
      <span className="text-[10px] text-slate-600 font-medium">Healthy cluster</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div>
      <span className="text-[10px] text-slate-600 font-medium">Unhealthy cluster</span>
    </div>
  </div>
);

export const ClusterTopology: React.FC<ClusterTopologyProps> = ({ onClusterClick, jobs = [], filterOrchestrator }) => {
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);

  const filteredRegions = useMemo(() => {
    if (!filterOrchestrator) return REGIONS;
    
    return REGIONS.map(region => ({
      ...region,
      clusters: region.clusters.filter(c => c.orchestrator === filterOrchestrator)
    })).filter(region => region.clusters.length > 0);
  }, [filterOrchestrator]);

  const toggleExpand = (id: string) => {
    setExpandedClusterId(prev => prev === id ? null : id);
  };

  const renderExpandedDetails = (cluster: typeof REGIONS[0]['clusters'][0]) => {
    // Mock nodes generation for mini rack view
    const isWarning = cluster.status === 'warning';
    const nodes = Array.from({ length: 64 }).map((_, i) => {
        if (isWarning && i >= 40 && i < 44) return 'failed'; 
        if (i % 12 === 0) return 'maintenance';
        return 'active';
    });

    const clusterJobs = jobs.filter(j => j.cluster === cluster.name);
    
    // Mock Issue Logic based on status
    const issueText = isWarning 
      ? (cluster.name.includes('eu') ? "Rack 04 PDU Failure (4 nodes offline)" : "High Thermal Throttle detected") 
      : null;

    return (
      <div className="mt-2 pt-2 border-t border-slate-100 animate-fadeIn cursor-default">
         
         {/* 1. Specific Issue Banner (Priority 1) */}
         {issueText && (
           <div className="mb-2 bg-rose-50 border border-rose-100 rounded px-1.5 py-1 flex items-start gap-1.5">
              <AlertTriangle size={10} className="text-rose-600 shrink-0 mt-0.5" />
              <span className="text-[9px] font-bold text-rose-700 leading-tight">{issueText}</span>
           </div>
         )}

         {/* Horizontal Layout for Map and Metrics */}
         <div className="flex gap-3 items-start">
             {/* 2. Minimap with Inline Legend */}
             <div className="shrink-0 flex gap-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                <div>
                   <div className="text-[8px] font-bold text-slate-400 uppercase mb-1 text-center tracking-wider">Topology</div>
                   <div className="grid grid-cols-8 gap-px bg-white p-0.5 border border-slate-200 rounded-sm shadow-sm">
                       {nodes.map((status, i) => (
                         <div 
                           key={i}
                           className={`
                             w-1 h-1 rounded-[0.5px]
                             ${status === 'active' ? 'bg-emerald-400' : ''}
                             ${status === 'failed' ? 'bg-rose-500' : ''}
                             ${status === 'maintenance' ? 'bg-slate-300' : ''}
                           `}
                         ></div>
                      ))}
                   </div>
                </div>
                
                {/* Node Status Legend */}
                <div className="flex flex-col justify-center gap-1 pt-2">
                   <div className="flex items-center gap-1">
                     <div className="w-1 h-1 bg-emerald-400 rounded-[0.5px]"></div>
                     <span className="text-[8px] text-slate-500 font-medium">Active</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <div className="w-1 h-1 bg-rose-500 rounded-[0.5px]"></div>
                     <span className="text-[8px] text-slate-500 font-medium">Failed</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <div className="w-1 h-1 bg-slate-300 rounded-[0.5px]"></div>
                     <span className="text-[8px] text-slate-500 font-medium">Maint</span>
                   </div>
                </div>
             </div>

             {/* 3. Utilization & Details (Priority 3 - Horizontal context) */}
             <div className="flex-1 min-w-0 grid grid-cols-1 gap-y-1">
                <div className="flex justify-between items-center border-b border-slate-50 pb-0.5">
                   <span className="text-[9px] text-slate-500 font-medium">Utilization</span>
                   <span className="text-[10px] font-bold text-[#1967D2] font-mono">{cluster.util}%</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-0.5">
                   <span className="text-[9px] text-slate-500 font-medium">Reservation</span>
                   <span className="text-[10px] font-bold text-slate-700 font-mono truncate max-w-[100px]" title={(cluster as any).reservation}>{(cluster as any).reservation}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-0.5">
                   <span className="text-[9px] text-slate-500 font-medium">Active jobs</span>
                   <span className="text-[10px] font-bold text-slate-700 font-mono">{clusterJobs.length}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-0.5">
                   <span className="text-[9px] text-slate-500 font-medium">Power</span>
                   <span className="text-[10px] font-bold text-slate-700 font-mono">{cluster.type.includes('H100') ? '840kW' : '420kW'}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9px] text-slate-500 font-medium">Temp</span>
                   <span className="text-[10px] font-bold text-slate-700 font-mono">62°C</span>
                </div>
             </div>
         </div>

         {/* 4. Footer / Action */}
         <div className="mt-2 pt-1 border-t border-slate-50 flex justify-center items-center">
            <button 
               onClick={(e) => {
                 e.stopPropagation();
                 if (onClusterClick) onClusterClick(cluster.id);
               }}
               className="text-[9px] font-bold text-[#1967D2] hover:text-[#1557B0] flex items-center gap-1"
            >
                View reservation details
            </button>
         </div>
      </div>
    );
  };

  return (
    <div className="relative p-2 overflow-x-auto">
      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {filteredRegions.map((region, idx) => (
          <div key={region.id} className="relative flex flex-col items-center">
             
             {/* Region Node */}
             <div className={`w-full max-w-[240px] bg-white border-l-4 ${region.status === 'healthy' ? 'border-l-emerald-500' : 'border-l-amber-500'} shadow-sm rounded-md p-2 mb-3 relative z-10 border-y border-r border-slate-200`}>
                <div className="flex justify-between items-start mb-1">
                   <h4 className="font-bold text-slate-800 text-xs">{region.name}</h4>
                   {region.status === 'healthy' 
                     ? <CheckCircle2 size={12} className="text-emerald-500" />
                     : <AlertTriangle size={12} className="text-amber-500" />
                   }
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                   <Activity size={10} /> {region.latency}
                </div>
             </div>

             {/* Clusters Tree */}
             <div className="w-full max-w-[240px] space-y-2 pl-3 border-l border-dashed border-slate-200 ml-6 pb-2">
                {region.clusters.map(cluster => {
                  const isExpanded = expandedClusterId === cluster.id;
                  return (
                    <div key={cluster.id} className="relative group">
                      {/* Connector from dash line to card */}
                      <div className="absolute top-4 -left-3 w-3 h-px bg-slate-300"></div>
                      
                      <div 
                        onClick={() => toggleExpand(cluster.id)}
                        className={`
                           bg-slate-50 border border-slate-200 rounded p-2 cursor-pointer transition-all
                           ${isExpanded ? 'bg-white ring-1 ring-[#1967D2]/30 shadow-md z-20 relative' : 'hover:bg-white hover:shadow-md hover:border-[#1967D2]/50'}
                        `}
                      >
                         {/* Header Summary */}
                         <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-[11px] text-slate-700 group-hover:text-[#1967D2] transition-colors">{cluster.name}</span>
                            {/* Status Circle */}
                            <div className={`w-1.5 h-1.5 rounded-full ${cluster.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                         </div>
                         <div className="flex justify-between items-center text-[9px] text-slate-500 mb-1">
                            <span className="flex items-center gap-1 bg-slate-100 px-1 py-0.5 rounded"><Cpu size={8} /> {cluster.type}</span>
                            <span className="font-mono">{cluster.count} chips</span>
                         </div>
                         
                         {/* Orchestrator Tag */}
                         <div className="mb-1.5">
                            <span className={`px-1 py-0.5 rounded-[3px] text-[8px] font-bold border ${
                              cluster.orchestrator === 'GKE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              cluster.orchestrator === 'Slurm' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              cluster.orchestrator === 'Vertex AI' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              cluster.orchestrator === 'Director' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                              'bg-slate-50 text-slate-700 border-slate-100'
                            }`}>
                              {cluster.orchestrator}
                            </span>
                         </div>
                         
                         {/* Util Bar (Always visible) */}
                         <div className="w-full flex items-center gap-1.5">
                            <div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    cluster.util >= 80 ? 'bg-emerald-500' : 
                                    cluster.util >= 50 ? 'bg-amber-400' : 
                                    'bg-rose-500'
                                  }`} 
                                  style={{ width: `${cluster.util}%` }}
                                ></div>
                            </div>
                            <span className="text-[9px] font-medium text-slate-600 w-5 text-right">{cluster.util}%</span>
                         </div>

                         {/* Expanded Content */}
                         {isExpanded && (
                            <div onClick={(e) => e.stopPropagation()}>
                              {renderExpandedDetails(cluster)}
                              <div 
                                onClick={() => toggleExpand(cluster.id)}
                                className="flex justify-center mt-1 pt-1 text-slate-400 hover:text-[#1967D2] cursor-pointer"
                              >
                                <ChevronUp size={12} />
                              </div>
                            </div>
                         )}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <TopologyLegend />
    </div>
  );
};
