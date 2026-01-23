import React from 'react';
import { FilterBar } from '@/components/FilterBar';
import { DashboardFilters } from '@/types';

interface DashboardHeaderProps {
  filters: DashboardFilters;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold text-slate-900">Overview</h1>
      <div className="flex justify-between items-start">
        <FilterBar filters={filters} setFilters={setFilters} />
      </div>
    </div>
  );
};
