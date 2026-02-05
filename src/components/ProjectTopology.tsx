
import React, { useState } from 'react';
import { 
  Server, 
  Activity, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Settings, 
  Search, 
  ArrowLeft,
  ExternalLink,
  Clock,
  FileText,
  Play,
  RotateCcw
} from 'lucide-react';
import { TableHeader } from '@/components/Card';
import { useTable } from '@/hooks/useTable';
import { Pagination } from '@/components/Pagination';

// Mock Data for the Project Topology View
export const PROJECT_CLUSTERS = [
  { 
    id: 'c1', 
    name: 'us-west-train-v4', 
    region: 'US West (Oregon)',
    gpuType: 'NVIDIA H100', 
    type: 'GPU',
    orchestrator: 'GKE',
    chips: 2048, 
    reservationId: 'res-9921', 
    mode: 'Managed', 
    qualifiedDate: '2024-01-15',
    compliance: 'green',
    tests: [
      { name: 'HBM Bandwidth', status: 'pass', lastRun: '2024-01-15 08:30', duration: '45s', error: '-' },
      { name: 'NCCL All-Reduce', status: 'pass', lastRun: '2024-01-15 09:15', duration: '120s', error: '-' },
      { name: 'ECC Memory Check', status: 'pass', lastRun: '2024-01-15 07:00', duration: '10s', error: '-' },
      { name: 'Thermal Stress Test', status: 'pass', lastRun: '2024-01-14 22:00', duration: '1h', error: '-' },
    ]
  },
  { 
    id: 'c2', 
    name: 'us-west-inf-01', 
    region: 'US West (Oregon)',
    gpuType: 'NVIDIA T4', 
    type: 'GPU',
    orchestrator: 'Slurm',
    chips: 512, 
    reservationId: 'res-4412', 
    mode: 'Raw', 
    qualifiedDate: '2023-11-20',
    compliance: 'yellow',
    tests: [
      { name: 'HBM Bandwidth', status: 'pass', lastRun: '2023-11-20 10:00', duration: '30s', error: '-' },
      { name: 'NCCL All-Reduce', status: 'fail', lastRun: '2023-11-20 10:30', duration: '15s', error: 'Timeout' },
      { name: 'ECC Memory Check', status: 'pass', lastRun: '2023-11-20 09:00', duration: '10s', error: '-' },
    ]
  },
  { 
    id: 'c3', 
    name: 'us-east-train-02', 
    region: 'US East (N. Virginia)',
    gpuType: 'TPU v5p', 
    type: 'TPU',
    orchestrator: 'GKE',
    chips: 1024, 
    reservationId: 'res-8810', 
    mode: 'Managed', 
    qualifiedDate: '2024-02-01',
    compliance: 'green',
    tests: [
      { name: 'TensorCore Perf', status: 'pass', lastRun: '2024-02-01 14:00', duration: '60s', error: '-' },
      { name: 'ICI Link Stability', status: 'pass', lastRun: '2024-02-01 14:30', duration: '300s', error: '-' },
    ]
  },
  { 
    id: 'c4', 
    name: 'eu-central-gpu-2', 
    region: 'Europe (Frankfurt)',
    gpuType: 'NVIDIA A100', 
    type: 'GPU',
    orchestrator: 'Vertex AI',
    chips: 1024, 
    reservationId: 'res-7723', 
    mode: 'Managed', 
    qualifiedDate: '2023-12-10',
    compliance: 'red',
    tests: [
      { name: 'HBM Bandwidth', status: 'fail', lastRun: '2023-12-10 11:00', duration: '5s', error: 'Bus Error' },
      { name: 'NCCL All-Reduce', status: 'fail', lastRun: '2023-12-10 11:15', duration: '2s', error: 'Network Unreachable' },
      { name: 'ECC Memory Check', status: 'pass', lastRun: '2023-12-10 10:00', duration: '10s', error: '-' },
    ]
  },
  { 
    id: 'c5', 
    name: 'eu-west-inf-03', 
    region: 'Europe (Frankfurt)',
    gpuType: 'NVIDIA T4', 
    type: 'GPU',
    orchestrator: 'Compute',
    chips: 256, 
    reservationId: 'res-3319', 
    mode: 'Raw', 
    qualifiedDate: '2024-01-05',
    compliance: 'green',
    tests: [
      { name: 'HBM Bandwidth', status: 'pass', lastRun: '2024-01-05 09:00', duration: '30s', error: '-' },
    ]
  },
  { 
    id: 'c6', 
    name: 'asia-ne-tpu-1', 
    region: 'Asia (Tokyo)',
    gpuType: 'TPU v4', 
    type: 'TPU',
    orchestrator: 'Director',
    chips: 2048, 
    reservationId: 'res-2215', 
    mode: 'Managed', 
    qualifiedDate: '2023-10-25',
    compliance: 'yellow',
    tests: [
      { name: 'TensorCore Perf', status: 'pass', lastRun: '2023-10-25 08:00', duration: '60s', error: '-' },
      { name: 'ICI Link Stability', status: 'fail', lastRun: '2023-10-25 08:30', duration: '120s', error: 'High Latency' },
    ]
  }
];

const TestDetailsPanel: React.FC<{ cluster: any; onBack: () => void }> = ({ cluster, onBack }) => {
  const isWarning = cluster.compliance === 'yellow';

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-slate-400 hover:text-[#1967D2] text-xs font-medium transition-colors"
        >
          <ArrowLeft size={14} /> Back to topology
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">{cluster.name}</span>
          <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded">{cluster.region}</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#1967D2]" />
              Qualification Test Results
            </h4>
            <button className="text-[10px] bg-[#1967D2] text-white px-2 py-1 rounded font-bold hover:bg-[#1557B0] transition-colors flex items-center gap-1">
              <RotateCcw size={10} /> Rerun all tests
            </button>
          </div>
          <span className="text-[10px] text-slate-500 italic">Last qualified: {cluster.qualifiedDate}</span>
        </div>
        
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 font-bold text-slate-500">Test Name</th>
              <th className="px-4 py-2 font-bold text-slate-500">Status</th>
              <th className="px-4 py-2 font-bold text-slate-500">Last Run</th>
              <th className="px-4 py-2 font-bold text-slate-500">Duration</th>
              <th className="px-4 py-2 font-bold text-slate-500">Error Message</th>
              <th className="px-4 py-2 font-bold text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cluster.tests.map((test: any, idx: number) => {
              const displayStatus = (isWarning && test.status === 'fail') ? 'EXPIRED' : test.status.toUpperCase();
              const statusColor = displayStatus === 'PASS' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : displayStatus === 'EXPIRED'
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-rose-50 text-rose-700 border-rose-100';

              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{test.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold flex items-center gap-1 w-fit border ${statusColor}`}>
                      {displayStatus === 'PASS' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                      {displayStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 flex items-center gap-1">
                    <Clock size={10} /> {test.lastRun}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{test.duration}</td>
                  <td className="px-4 py-3 text-slate-500 italic">
                    {(isWarning && test.status === 'fail') ? '-' : test.error}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {(displayStatus === 'FAIL' || displayStatus === 'EXPIRED') && (
                        <button className="text-[10px] text-[#1967D2] hover:underline font-bold flex items-center gap-1">
                          <Play size={10} fill="currentColor" /> Run tests now
                        </button>
                      )}
                      <button className="text-[10px] text-slate-500 hover:underline flex items-center gap-1">
                        <FileText size={10} /> Logs
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ProjectTopology: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);
  const [filterTerm, setFilterTerm] = useState('');

  const filteredData = React.useMemo(() => {
    if (!filterTerm) return PROJECT_CLUSTERS;
    const lowerTerm = filterTerm.toLowerCase();
    return PROJECT_CLUSTERS.filter(c => 
      c.name.toLowerCase().includes(lowerTerm) || 
      c.region.toLowerCase().includes(lowerTerm) ||
      c.gpuType.toLowerCase().includes(lowerTerm)
    );
  }, [filterTerm]);

  const table = useTable<any>({
    initialData: filteredData,
    initialSortColumn: 'name',
  });

  if (selectedCluster) {
    return <TestDetailsPanel cluster={selectedCluster} onBack={() => setSelectedCluster(null)} />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Server size={16} className="text-[#1967D2]" />
            Reservation topology & compliance
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Fleet-wide test qualification status and hardware configuration</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input 
            type="text" 
            placeholder="Search clusters, regions..." 
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-8 pr-3 py-1.5 rounded-md text-xs focus:outline-none focus:border-[#1967D2] focus:ring-1 focus:ring-[#1967D2] transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <TableHeader
                label="Cluster Name"
                sortable={true}
                sorted={table.sortColumn === 'name'}
                ascending={table.sortDirection === 'asc'}
                onClick={() => table.handleSort('name')}
              />
              <TableHeader label="Region" />
              <TableHeader label="Resource Type" />
              <TableHeader label="Orchestrator" />
              <TableHeader
                label="Chips"
                sortable={true}
                sorted={table.sortColumn === 'chips'}
                ascending={table.sortDirection === 'asc'}
                onClick={() => table.handleSort('chips')}
              />
              <TableHeader label="Reservation ID" />
              <TableHeader label="Mode" />
              <TableHeader
                label="Qualified Date"
                sortable={true}
                sorted={table.sortColumn === 'qualifiedDate'}
                ascending={table.sortDirection === 'asc'}
                onClick={() => table.handleSort('qualifiedDate')}
              />
              <TableHeader label="Compliance" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((cluster, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{cluster.name}</td>
                <td className="px-4 py-3 text-slate-600">{cluster.region}</td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold w-fit border ${
                    cluster.type === 'TPU' 
                      ? 'bg-blue-50 text-blue-700 border-blue-100' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}>
                    <Cpu size={10} /> {cluster.gpuType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    cluster.orchestrator === 'GKE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    cluster.orchestrator === 'Slurm' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    cluster.orchestrator === 'Vertex AI' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    cluster.orchestrator === 'Director' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                    'bg-slate-50 text-slate-700 border-slate-100'
                  }`}>
                    {cluster.orchestrator}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-slate-700">{cluster.chips.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-[#1967D2]">{cluster.reservationId}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Settings size={10} className="text-slate-400" /> {cluster.mode}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 flex items-center gap-1">
                  <Calendar size={10} className="text-slate-400" /> {cluster.qualifiedDate}
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => setSelectedCluster(cluster)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-[10px] font-bold border transition-all hover:shadow-sm ${
                      cluster.compliance === 'green' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' : 
                      cluster.compliance === 'yellow' ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' : 
                      'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      cluster.compliance === 'green' ? 'bg-emerald-500' : 
                      cluster.compliance === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    {cluster.compliance === 'green' ? 'HEALTHY' : cluster.compliance === 'yellow' ? 'WARNING' : 'UNHEALTHY'}
                    <ExternalLink size={10} className="ml-0.5 opacity-60" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
        <Pagination
          currentPage={table.currentPage}
          totalPages={table.totalPages}
          onPageChange={table.goToPage}
        />
      </div>
    </div>
  );
};
