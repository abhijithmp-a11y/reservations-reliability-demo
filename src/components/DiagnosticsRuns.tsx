
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  PlayCircle 
} from 'lucide-react';
import { Card, TableHeader } from './Card';
import { Job, JobStatus } from '../types';

// Mock Data specifically for the Runs table
const MOCK_RUNS = [
  { 
    id: 'run_234-jobset1-timestamp', 
    status: 'Complete', 
    jobName: 'jobset-1', 
    runGroup: 'hero-job', 
    monitoring: 'Slowdown detected', 
    sdk: true, 
    tpuUtil: 25, 
    throughput: '450 images/s',
    jobRef: { status: JobStatus.RUNNING } as Job // Mock ref for navigation
  },
  { 
    id: 'run-name-2-jobset3-timestamp', 
    status: 'Complete', 
    jobName: 'jobset-3', 
    runGroup: 'tpu-slice-size-sweep', 
    monitoring: 'Hang detected', 
    sdk: false, 
    tpuUtil: 0, 
    throughput: '-',
    jobRef: { status: JobStatus.HANGING } as Job
  },
  { 
    id: 'run-name-3-date', 
    status: 'Complete', 
    jobName: 'jobset-3', 
    runGroup: 'tpu-slice-size-sweep', 
    monitoring: 'Running', 
    sdk: false, 
    tpuUtil: 40, 
    throughput: '-',
    jobRef: { status: JobStatus.RUNNING } as Job
  },
  { 
    id: 'run-name-4-date1', 
    status: 'Complete', 
    jobName: 'jobset-4', 
    runGroup: 'tpu-slice-size-sweep', 
    monitoring: 'Running', 
    sdk: false, 
    tpuUtil: 40, 
    throughput: '-',
    jobRef: { status: JobStatus.RUNNING } as Job
  },
  { 
    id: 'run-name-4-date2', 
    status: 'Failed', 
    jobName: 'jobset-4', 
    runGroup: 'tpu-slice-size-sweep', 
    monitoring: 'Complete', 
    sdk: false, 
    tpuUtil: 40, 
    throughput: '-',
    jobRef: { status: JobStatus.FAILED } as Job
  },
  { 
    id: 'run-name-5-date', 
    status: 'Complete', 
    jobName: 'jobset-4', 
    runGroup: 'tpu-slice-size-sweep', 
    monitoring: 'Complete', 
    sdk: false, 
    tpuUtil: 40, 
    throughput: '-',
    jobRef: { status: JobStatus.COMPLETED } as Job
  },
  { 
    id: 'run-name-6-date', 
    status: 'Active', 
    jobName: 'jobset-4', 
    runGroup: 'tpu-slice-size-sweep', 
    monitoring: 'Complete', 
    sdk: false, 
    tpuUtil: 40, 
    throughput: '-',
    jobRef: { status: JobStatus.RUNNING } as Job
  },
  { 
    id: 'run-name-7-date', 
    status: 'Complete', 
    jobName: 'jobset-4', 
    runGroup: 'tpu-slice-size-sweep', 
    monitoring: 'Complete', 
    sdk: false, 
    tpuUtil: 40, 
    throughput: '-',
    jobRef: { status: JobStatus.COMPLETED } as Job
  },
];

interface DiagnosticsRunsProps {
  onRunClick: (jobStub: Partial<Job>) => void;
  onJobClick?: (jobName: string) => void;
}

export const DiagnosticsRuns: React.FC<DiagnosticsRunsProps> = ({ onRunClick, onJobClick }) => {
  const [activeView, setActiveView] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const renderStatusIcon = (status: string) => {
    switch(status) {
      case 'Complete': return <CheckCircle2 size={16} className="text-emerald-600" />;
      case 'Active': return <PlayCircle size={16} className="text-blue-600" />;
      case 'Failed': return <AlertOctagon size={16} className="text-rose-600" />;
      default: return <Clock size={16} className="text-slate-400" />;
    }
  };

  const renderMonitoring = (status: string) => {
    if (status === 'Slowdown detected') {
      return (
        <span className="flex items-center gap-1.5 text-amber-600 font-medium">
          <AlertTriangle size={12} /> {status}
        </span>
      );
    }
    if (status === 'Hang detected') {
      return (
        <span className="flex items-center gap-1.5 text-rose-600 font-medium">
          <AlertOctagon size={12} /> {status}
        </span>
      );
    }
    if (status === 'Running') {
      return (
        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <PlayCircle size={12} /> {status}
        </span>
      );
    }
    if (status === 'Complete') {
      return (
         <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <CheckCircle2 size={12} /> {status}
        </span>
      );
    }
    return <span className="text-slate-500">{status}</span>;
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-slate-900">Diagnostics</h1>
        
        {/* View Toggle Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-slate-500 mr-2 whitespace-nowrap">View list as:</span>
          {['All', 'Job mapping', 'System metrics', 'Model Metrics', 'Only config', 'Profiles'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap border ${
                activeView === view 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex justify-between items-center bg-white p-2 rounded-md border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2 w-full max-w-lg">
              <button className="flex items-center gap-1.5 px-2 py-1 text-slate-700 hover:bg-slate-50 rounded font-medium text-xs">
                 <Filter size={12} /> Filter
              </button>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <div className="relative flex-1">
                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                 <input 
                    type="text" 
                    placeholder="Filter table" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-4 py-1 text-xs border-none focus:ring-0 outline-none bg-transparent text-slate-700 placeholder-slate-400"
                 />
              </div>
           </div>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-white">
           <h3 className="text-slate-800 font-semibold text-xs tracking-wider">Runs</h3>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 w-8">Status</th>
                <TableHeader label="Name" tooltip="The unique run identifier" />
                <TableHeader label="Job name" tooltip="Associated job name" />
                <TableHeader label="Run group" tooltip="Grouping identifier for the run" />
                <TableHeader label="Monitoring" tooltip="Current monitoring status from Diagon++" />
                <TableHeader label="SDK instrumented" tooltip="Whether the Diagon SDK is active" />
                <TableHeader label="TPU Tensorcore uti." tooltip="Utilization percentage" />
                <TableHeader label="Throughput" tooltip="Resources processed per second" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {MOCK_RUNS.filter(r => r.id.toLowerCase().includes(searchTerm.toLowerCase())).map((run) => (
                <tr 
                  key={run.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onRunClick({ ...run.jobRef, name: run.jobName, id: run.id } as Partial<Job>)}
                >
                  <td className="px-3 py-2">
                    {renderStatusIcon(run.status)}
                  </td>
                  <td className="px-4 py-2 font-medium text-[#1967D2] underline decoration-transparent group-hover:decoration-[#1967D2] transition-all">
                    {run.id}
                  </td>
                  <td className="px-4 py-2">
                    <button 
                      className="text-[#1967D2] hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick?.(run.jobName);
                      }}
                    >
                      {run.jobName}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{run.runGroup}</td>
                  <td className="px-4 py-2 text-[11px]">
                    {renderMonitoring(run.monitoring)}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{run.sdk ? 'yes' : 'no'}</td>
                  <td className="px-4 py-2 text-slate-600">{run.tpuUtil}%</td>
                  <td className="px-4 py-2 text-slate-600">{run.throughput}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
