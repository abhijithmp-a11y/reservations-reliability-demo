import React from 'react';
import { Job, JobStatus } from '@/types';
import { useTable } from '@/hooks/useTable';
import { Pagination } from '@/components/Pagination';
import { TableHeader } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';

interface ActiveJobsTableProps {
  jobs: Job[];
  onViewJob: (job: Job) => void;
  onViewRunDiagnostics: (job: Job) => void;
}

export const ActiveJobsTable: React.FC<ActiveJobsTableProps> = ({ jobs, onViewJob, onViewRunDiagnostics }) => {
  const table = useTable<Job>({
    initialData: jobs,
    initialSortColumn: 'recentEvent',
    initialSortDirection: 'desc',
  });

  return (
    <div>
      <div className="overflow-x-auto border-b border-slate-200">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr>
              <TableHeader
                label="Job ID / Name"
                sortable={true}
                sorted={table.sortColumn === 'name'}
                ascending={table.sortDirection === 'asc'}
                onClick={() => table.handleSort('name')}
              />
              <TableHeader
                label="Status"
                sortable={true}
                sorted={table.sortColumn === 'status'}
                ascending={table.sortDirection === 'asc'}
                onClick={() => table.handleSort('status')}
              />
              <TableHeader
                label="Cluster"
                sortable={true}
                sorted={table.sortColumn === 'cluster'}
                ascending={table.sortDirection === 'asc'}
                onClick={() => table.handleSort('cluster')}
              />
              <TableHeader
                label="Orchestrator"
                sortable={true}
                sorted={table.sortColumn === 'orchestrator'}
                ascending={table.sortDirection === 'asc'}
                onClick={() => table.handleSort('orchestrator')}
              />
              <TableHeader
                label="Goodput"
                tooltip="ML Productivity: A measure of how efficiently the job is using the allocated hardware for ML tasks."
                sortable={true}
                sorted={table.sortColumn === 'goodput'}
                ascending={table.sortDirection === 'asc'}
                onClick={() => table.handleSort('goodput')}
              />
              <TableHeader
                label="Recent Event"
                sortable={true}
                sorted={table.sortColumn === 'recentEvent'}
                ascending={table.sortDirection === 'asc'}
                onClick={() => table.handleSort('recentEvent')}
              />
              <TableHeader label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 font-medium text-slate-900 truncate" style={{ maxWidth: '200px' }}>
                  <div className="font-bold text-slate-800">{job.name}</div>
                  <div className="text-slate-500 font-mono text-[10px]">{job.id}</div>
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-4 py-2 text-slate-600 font-mono text-[11px] truncate" style={{ maxWidth: '150px' }}>{job.cluster}</td>
                <td className="px-4 py-2 text-slate-600 truncate" style={{ maxWidth: '120px' }}>{job.orchestrator}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${job.goodput > 90 ? 'bg-emerald-500' : job.goodput > 70 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                        style={{ width: `${job.goodput}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">{job.goodput}%</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-slate-600 truncate" style={{ maxWidth: '200px' }}>{job.recentEvent}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => onViewJob(job)} className="text-[10px] font-bold text-[#1967D2] hover:underline">View</button>
                    <button onClick={() => onViewRunDiagnostics(job)} className="text-[10px] font-bold text-[#1967D2] hover:underline">Run diagnostics</button>
                  </div>
                </td>
              </tr>
            ))}
            {table.paginatedData.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500 text-sm">
                  No active jobs match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={table.currentPage}
        totalPages={table.totalPages}
        onPageChange={table.goToPage}
      />
    </div>
  );
};
