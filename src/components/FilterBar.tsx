
import React from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { DashboardFilters } from '../types';

const FILTER_OPTIONS = {
  workload: ['All', 'AlphaFold', 'LLAMA-3', 'Gemini-Flash', 'GPT-5', 'ResNet-50', 'BERT-Large', 'Stable-Diffusion-XL'],
  jobType: ['All', 'Training', 'Inference'],
  orchestrator: ['All', 'Reservation details', 'Compute Engine', 'Google Kubernetes Engine', 'Vertex AI', 'Slurm', 'Custom'],
  timeRange: ['Last 1 hour', 'Last 12 hours', 'Last 24 hours', 'Last 7 days', 'All time'],
  reservation: ['All', 'us-west8-reservation1', 'us-central1-reservation2', 'europe-north-reservation3', 'asia-south-reservation4']
};

interface FilterBarProps {
  filters: DashboardFilters;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
  hideTimeRange?: boolean;
  hideJobType?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  setFilters, 
  hideTimeRange = false,
  hideJobType = false 
}) => {
  const handleChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mb-3 animate-fadeIn">
      <div className="flex flex-wrap gap-3 w-full">
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-slate-500 font-bold">Workload</label>
          <div className="relative">
            <select 
              value={filters.workload}
              onChange={(e) => handleChange('workload', e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded focus:ring-[#1967D2] focus:border-[#1967D2] block w-full py-1.5 px-2 pr-6 appearance-none hover:bg-slate-50 transition-colors min-w-[140px] shadow-sm"
            >
              {FILTER_OPTIONS.workload.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'Select All' : opt}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {!hideJobType && (
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-slate-500 font-bold">Job type</label>
            <div className="relative">
               <select 
                  value={filters.jobType}
                  onChange={(e) => handleChange('jobType', e.target.value)}
                  className="bg-white border border-slate-300 text-slate-700 text-xs rounded focus:ring-[#1967D2] focus:border-[#1967D2] block w-full py-1.5 px-2 pr-6 appearance-none hover:bg-slate-50 transition-colors min-w-[140px] shadow-sm"
                >
                  {FILTER_OPTIONS.jobType.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'Select All' : opt}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-slate-500 font-bold">Orchestrator</label>
          <div className="relative">
            <select 
              value={filters.orchestrator}
              onChange={(e) => handleChange('orchestrator', e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded focus:ring-[#1967D2] focus:border-[#1967D2] block w-full py-1.5 px-2 pr-6 appearance-none hover:bg-slate-50 transition-colors min-w-[140px] shadow-sm"
            >
              {FILTER_OPTIONS.orchestrator.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'Select All' : opt}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {!hideTimeRange && (
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-slate-500 font-bold">Time range</label>
            <div className="relative">
              <select 
                value={filters.timeRange}
                onChange={(e) => handleChange('timeRange', e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 text-xs rounded focus:ring-[#1967D2] focus:border-[#1967D2] block w-full py-1.5 pl-7 pr-6 appearance-none hover:bg-slate-50 transition-colors min-w-[140px] shadow-sm"
              >
                {FILTER_OPTIONS.timeRange.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <Clock size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-slate-500 font-bold">Reservation</label>
          <div className="relative">
            <select 
              value={filters.reservation}
              onChange={(e) => handleChange('reservation', e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded focus:ring-[#1967D2] focus:border-[#1967D2] block w-full py-1.5 px-2 pr-6 appearance-none hover:bg-slate-50 transition-colors min-w-[140px] shadow-sm"
            >
              {FILTER_OPTIONS.reservation.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'Select All' : opt}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
