
import React, { useMemo } from 'react';
import { REGIONS } from './ClusterTopology';
import { Cpu, Activity, ExternalLink, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ClusterTableProps {
  filterOrchestrator?: string;
  onClusterClick: (clusterId: string) => void;
  onViewTopology?: (clusterId: string) => void;
}

export const ClusterTable: React.FC<ClusterTableProps> = ({ filterOrchestrator, onClusterClick, onViewTopology }) => {
  const clusters = useMemo(() => {
    const all = REGIONS.flatMap(region => 
      region.clusters.map(cluster => ({
        ...cluster,
        regionName: region.name
      }))
    );
    if (!filterOrchestrator) return all;
    return all.filter(c => c.orchestrator === filterOrchestrator);
  }, [filterOrchestrator]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cluster Name</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reservation</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Orchestrator</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chips</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilization</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {clusters.map((cluster) => (
            <tr key={cluster.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4">
                <button 
                  onClick={() => onClusterClick(cluster.id)}
                  className="text-sm font-bold text-[#1967D2] hover:underline flex items-center gap-2"
                >
                  {cluster.name}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin size={14} className="text-slate-400" />
                  {cluster.regionName}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                {(cluster as any).reservation}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  cluster.orchestrator === 'GKE' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {cluster.orchestrator === 'Director' ? 'Slurm' : cluster.orchestrator}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-1 text-xs text-slate-600">
                  <Cpu size={14} className="text-slate-400" />
                  {cluster.type}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                {cluster.count.toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 h-1.5 w-24 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        cluster.util >= 80 ? 'bg-emerald-500' : 
                        cluster.util >= 50 ? 'bg-amber-400' : 
                        'bg-rose-500'
                      }`} 
                      style={{ width: `${cluster.util}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 font-mono w-8">{cluster.util}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                  {cluster.status === 'healthy' ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={14} className="text-amber-500" />
                  )}
                  <span className="text-xs font-medium text-slate-700 capitalize">{cluster.status}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onViewTopology?.(cluster.id)}
                  className="text-[10px] font-bold text-[#1967D2] hover:text-[#1557B0] flex items-center gap-1 justify-end ml-auto"
                >
                  View cluster topology <ExternalLink size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
