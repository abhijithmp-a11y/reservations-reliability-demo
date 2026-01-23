import React from 'react';
import { JobStatus } from '@/types';

export const StatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  const styles = {
    [JobStatus.RUNNING]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [JobStatus.COMPLETED]: 'bg-blue-100 text-blue-700 border-blue-200',
    [JobStatus.FAILED]: 'bg-rose-100 text-rose-700 border-rose-200',
    [JobStatus.QUEUED]: 'bg-slate-100 text-slate-600 border-slate-200',
    [JobStatus.INTERRUPTED]: 'bg-amber-100 text-amber-700 border-amber-200',
    [JobStatus.HANGING]: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
};
