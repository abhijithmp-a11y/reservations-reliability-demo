
import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  FunnelChart, 
  Funnel, 
  Tooltip, 
  LabelList, 
  Cell,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend
} from 'recharts';
import { 
  AlertTriangle, 
  AlertOctagon,
  Activity,
  ArrowRight,
  Search,
  Info
} from 'lucide-react';
import { DashboardFilters } from '../types';
import { Card, StatCard, MiniGauge, TableHeader } from '@/components/Card';
import { FilterBar } from '@/components/FilterBar';
import { useTable } from '@/hooks/useTable';
import { Pagination } from '@/components/Pagination';

// --- MOCK DATA ---

export const funnelDataAll = [
  { value: 5000, name: 'Committed', fill: '#94a3b8', tpu: 2048, gpu: 2952 },
  { value: 4800, name: 'Available', fill: '#64748b', tpu: 2040, gpu: 2760 },
  { value: 3800, name: 'Allocated', fill: '#4f46e5', tpu: 1800, gpu: 2000 },
  { value: 3150, name: 'Utilized', fill: '#10b981', tpu: 1750, gpu: 1400 },
];

export const funnelDataTPU = [
  { value: 2048, name: 'Committed', fill: '#94a3b8' },
  { value: 2040, name: 'Available', fill: '#64748b' },
  { value: 1800, name: 'Allocated', fill: '#4f46e5' },
  { value: 1750, name: 'Utilized', fill: '#10b981' },
];

export const funnelDataGPU = [
  { value: 2952, name: 'Committed', fill: '#94a3b8' },
  { value: 2760, name: 'Available', fill: '#64748b' },
  { value: 2000, name: 'Allocated', fill: '#4f46e5' },
  { value: 1400, name: 'Utilized', fill: '#10b981' },
];

export const problematicReservations = [
  { id: 'res-3', name: 'US-East-1-General', type: 'Reservation', issue: 'Underutilized', impact: 'Low', count: 24 },
  { id: 'res-4', name: 'Asia-SE-2-Inference', type: 'On-Demand', issue: 'High Cost', impact: 'Medium', count: 16 },
  { id: 'res-1', name: 'US-West-2-Training', type: 'Reservation', issue: 'Underutilized', impact: 'Low', count: 12 },
  { id: 'res-2', name: 'EU-Central-1-Inference', type: 'On-Demand', issue: 'High Latency', impact: 'Medium', count: 8 },
];

// Base trend data for 'All'
const trendDataBase = [
// ... (rest of file)
  { day: 'Mon', availability: 99, activation: 92, scheduling: 88, utilization: 78 },
  { day: 'Tue', availability: 99, activation: 91, scheduling: 85, utilization: 80 },
  { day: 'Wed', availability: 96, activation: 94, scheduling: 89, utilization: 85 },
  { day: 'Thu', availability: 99, activation: 93, scheduling: 91, utilization: 82 },
  { day: 'Fri', availability: 99, activation: 95, scheduling: 92, utilization: 88 },
  { day: 'Sat', availability: 99, activation: 88, scheduling: 75, utilization: 70 },
  { day: 'Sun', availability: 99, activation: 89, scheduling: 76, utilization: 71 },
];

// --- COMPONENTS ---

interface EfficiencyFunnelChartProps {
  filters?: DashboardFilters;
  className?: string;
}

export const EfficiencyFunnelChart: React.FC<EfficiencyFunnelChartProps> = ({ filters, className = "h-48" }) => {
  const accelerator = filters?.accelerator || 'All';
  
  let data = funnelDataAll;
  let unitLabel = 'Accelerators';

  if (accelerator === 'TPUs') {
    data = funnelDataTPU as any;
    unitLabel = 'TPU Chips';
  } else if (accelerator === 'GPUs') {
    data = funnelDataGPU as any;
    unitLabel = 'GPUs';
  }

  // Define label renderer inside to access current data scope
  const renderFunnelLabel = (props: any) => {
    const { x, y, width, height, index } = props;
    const dataItem = data[index];
    
    if (!dataItem) return null;

    const fill = index === 0 ? '#334155' : '#ffffff'; 
    const yOffset = dataItem.name === 'Utilized' ? -2 : 0;
    
    // Check if we should show breakdown (Only for 'All' view and if data exists)
    const showBreakdown = accelerator === 'All' && (dataItem as any).tpu !== undefined;

    return (
      <text 
        x={x + width / 2} 
        y={y + height / 2 + yOffset} 
        fill={fill} 
        textAnchor="middle" 
        dominantBaseline="middle"
        style={{ 
          pointerEvents: 'none',
          textShadow: index > 0 ? '0px 1px 2px rgba(0,0,0,0.2)' : 'none'
        }}
      >
        <tspan x={x + width / 2} dy={showBreakdown ? "-0.8em" : "-0.4em"} fontSize="9" fontWeight="bold" opacity="0.9" style={{ textTransform: 'uppercase' }}>
          {dataItem.name}
        </tspan>
        <tspan x={x + width / 2} dy="1.2em" fontSize="12" fontWeight="bold">
          {dataItem.value.toLocaleString()}
        </tspan>
        {showBreakdown && (
            <tspan x={x + width / 2} dy="1.2em" fontSize="8" fontWeight="bold">
               {(dataItem as any).tpu.toLocaleString()} Chips / {(dataItem as any).gpu.toLocaleString()} GPUs
            </tspan>
        )}
      </text>
    );
  };

  return (
    <div className={`${className} w-full relative`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
        <FunnelChart>
          <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '4px' }}
              formatter={(value: number, name: string, props: any) => {
                 if (accelerator === 'All' && props.payload.tpu !== undefined) {
                     return [`${value.toLocaleString()} (TPU: ${props.payload.tpu}, GPU: ${props.payload.gpu})`, props.payload.name];
                 }
                 return [`${value.toLocaleString()} ${unitLabel}`, props.payload.name];
              }}
          />
          <Funnel
            data={data}
            dataKey="value"
            isAnimationActive
          >
            <LabelList position="center" content={renderFunnelLabel} dataKey="name" />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
};

export const FleetEfficiencyTrends: React.FC<{ filters: DashboardFilters; onNavigateToJobs: (id: string) => void }> = ({ filters, onNavigateToJobs }) => {
  const accelerator = filters?.accelerator || 'All';

  const data = React.useMemo(() => {
    // Clone and adjust data based on filter to simulate real data
    return trendDataBase.map(d => {
       if (accelerator === 'TPUs') {
          return {
             ...d,
             availability: Math.min(100, d.availability + 0.5), // TPUs usually very stable
             utilization: Math.min(100, d.utilization + 5), // High demand
             scheduling: Math.min(100, d.scheduling + 3)
          };
       } else if (accelerator === 'GPUs') {
          return {
             ...d,
             availability: d.availability - 1, // Occasional maintenance
             activation: d.activation - 4, // Burstier workloads
             utilization: d.utilization - 8 // Fragmented
          };
       }
       return d;
    });
  }, [accelerator]);

  return (
    <div className="w-full flex flex-col h-full">
      {/* Chart Section */}
      <div className="h-40 w-full shrink-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="day" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              dy={5}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              domain={[60, 100]} 
              tickCount={5}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '6px' }}
              itemStyle={{ fontSize: '10px', padding: '1px 0' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={20} 
              iconType="circle"
              wrapperStyle={{ paddingTop: '5px', fontSize: '10px', fontWeight: 500 }}
            />
            
            <Line 
              type="monotone" 
              dataKey="activation" 
              name="Activation rate" 
              stroke="#f59e0b" 
              strokeWidth={1.5} 
              dot={{ r: 3, fill: '#fff', strokeWidth: 1.5 }} 
              activeDot={{ r: 4 }} 
            />
            <Line 
              type="monotone" 
              dataKey="availability" 
              name="Availability rate" 
              stroke="#10b981" 
              strokeWidth={1.5} 
              dot={{ r: 3, fill: '#fff', strokeWidth: 1.5 }} 
              activeDot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="scheduling" 
              name="Scheduling rate" 
              stroke="#2563eb" 
              strokeWidth={1.5} 
              dot={{ r: 3, fill: '#fff', strokeWidth: 1.5 }} 
              activeDot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="utilization" 
              name="Utilization rate" 
              stroke="#ec4899" 
              strokeWidth={1.5} 
              dot={{ r: 3, fill: '#fff', strokeWidth: 1.5 }} 
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations Section */}
      <div className="mt-auto pt-3 border-t border-slate-100">
         <div className="flex items-center justify-between mb-2">
             <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Activity size={14} className="text-[#1967D2]" />
                Efficiency insights & recommendations
             </h4>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {/* Recommendation 1 */}
             <div className="p-2 bg-amber-50 rounded border border-amber-100 flex gap-2">
                <div className="shrink-0 mt-0.5">
                   <AlertTriangle size={14} className="text-amber-600" />
                </div>
                <div>
                   <h5 className="text-xs font-bold text-amber-800">Underutilized reservation</h5>
                   <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
                      Res-A100-EU is at 45% utilization. Consider moving Spot workloads here to optimize cost.
                   </p>
                   <button className="text-[10px] font-bold text-amber-800 hover:underline mt-1 flex items-center gap-1">
                      View reservation <ArrowRight size={10} />
                   </button>
                </div>
             </div>

             {/* Recommendation 2 */}
             <div className="p-2 bg-rose-50 rounded border border-rose-100 flex gap-2">
                <div className="shrink-0 mt-0.5">
                   <AlertOctagon size={14} className="text-rose-600" />
                </div>
                <div>
                   <h5 className="text-xs font-bold text-rose-800">Straggler node detected</h5>
                   <p className="text-[10px] text-rose-700 mt-0.5 leading-relaxed">
                      Node-gke-4 causing 15% slowdown in Job-beta-991. Hardware replacement recommended.
                   </p>
                   <button 
                     onClick={() => onNavigateToJobs('job-beta-991')}
                     className="text-[10px] font-bold text-rose-800 hover:underline mt-1 flex items-center gap-1"
                   >
                      Inspect job <ArrowRight size={10} />
                   </button>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

interface ProjectAcceleratorsTableProps {
  filters: DashboardFilters;
  onInvestigate: (type: string) => void;
  onReservationClick?: (reservationId: string) => void;
  onViewDetail?: (sliceId: string) => void;
  showAll?: boolean;
}

// New mock data reflecting Slice/VM utilization
const rows = [
  { id: 'slice-v4-us-west-a', type: 'TPU v4 Pod', coreUtil: 92, memUtil: 85, health: 'Healthy', recentEvent: 'Unexpected restart' },
  { id: 'fd-h100-eu-central-1', type: 'NVIDIA H100', coreUtil: 88, memUtil: 90, health: 'Warning', recentEvent: 'Unexpected restart' },
  { id: 'slice-v5p-us-east-b', type: 'TPU v5p Pod', coreUtil: 95, memUtil: 92, health: 'Healthy' },
  { id: 'fd-a100-us-central-2', type: 'NVIDIA A100', coreUtil: 45, memUtil: 30, health: 'Warning' },
  { id: 'slice-v4-asia-ne1-c', type: 'TPU v4 Pod', coreUtil: 60, memUtil: 55, health: 'Warning' },
  { id: 'slice-v4-us-east-a', type: 'TPU v4 Pod', coreUtil: 98, memUtil: 89, health: 'Healthy' },
  { id: 'fd-h100-us-west-1', type: 'NVIDIA H100', coreUtil: 75, memUtil: 85, health: 'Healthy' },
  { id: 'slice-v5p-eu-west-b', type: 'TPU v5p Pod', coreUtil: 91, memUtil: 94, health: 'Healthy' },
  { id: 'fd-a100-asia-east-2', type: 'NVIDIA A100', coreUtil: 55, memUtil: 60, health: 'Warning' },
  { id: 'slice-v4-us-central-c', type: 'TPU v4 Pod', coreUtil: 80, memUtil: 75, health: 'Healthy' },
  { id: 'slice-v5p-us-west-a', type: 'TPU v5p Pod', coreUtil: 93, memUtil: 91, health: 'Healthy' },
  { id: 'fd-h100-eu-west-1', type: 'NVIDIA H100', coreUtil: 81, memUtil: 88, health: 'Warning' },
  { id: 'slice-v4-eu-west-a', type: 'TPU v4 Pod', coreUtil: 85, memUtil: 80, health: 'Healthy' },
  { id: 'fd-a100-us-east-1', type: 'NVIDIA A100', coreUtil: 65, memUtil: 70, health: 'Warning' },
  { id: 'slice-v5p-asia-east-a', type: 'TPU v5p Pod', coreUtil: 96, memUtil: 93, health: 'Healthy' },
];

export const ProjectAcceleratorsTable: React.FC<ProjectAcceleratorsTableProps> = ({ 
  filters, 
  onInvestigate, 
  onReservationClick,
  onViewDetail,
  showAll = false
}) => {
  const [filterTerm, setFilterTerm] = useState('');

  const filteredData = React.useMemo(() => {
    return rows.filter(row => {
      // 1. Apply global dashboard filters
      if (!showAll) {
        if (filters.accelerator === 'TPUs' && !row.type.includes('TPU')) return false;
        if (filters.accelerator === 'GPUs' && !row.type.includes('NVIDIA')) return false;
      }

      // 2. Apply local text search filter
      if (filterTerm) {
        const lowerTerm = filterTerm.toLowerCase();
        return (
          row.id.toLowerCase().includes(lowerTerm) ||
          row.type.toLowerCase().includes(lowerTerm) ||
          row.health.toLowerCase().includes(lowerTerm)
        );
      }

      return true;
    });
  }, [filters, filterTerm, showAll]);

  const table = useTable<any>({
    initialData: filteredData,
    initialSortColumn: 'id',
  });

  return (
    <div className="flex flex-col">
      {/* Local Filter for Slice Utilization Table */}
      <div className="px-4 py-2 border-b border-slate-100 flex justify-end bg-slate-50/50">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input 
            type="text" 
            placeholder="Filter by ID, Type, Health..." 
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="w-48 bg-white border border-slate-300 text-slate-700 pl-8 pr-3 py-1 rounded-md text-xs focus:outline-none focus:border-[#1967D2] focus:ring-1 focus:ring-[#1967D2] shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <TableHeader
  label="VM / Slice ID"
  sortable={true}
  sorted={table.sortColumn === 'id'}
  ascending={table.sortDirection === 'asc'}
  onClick={() => table.handleSort('id')}
/>
              <TableHeader label="Accelerator type" />
              <TableHeader
  label="Core utilization"
  tooltip="Real-time percentage usage of the Compute/Tensor cores for a specific slice/VM."
  sortable={true}
  sorted={table.sortColumn === 'coreUtil'}
  ascending={table.sortDirection === 'asc'}
  onClick={() => table.handleSort('coreUtil')}
/>
              <TableHeader
  label="Memory utilization"
  tooltip="Real-time percentage usage of High Bandwidth Memory (HBM) for a specific slice/VM."
  sortable={true}
  sorted={table.sortColumn === 'memUtil'}
  ascending={table.sortDirection === 'asc'}
  onClick={() => table.handleSort('memUtil')}
/>
              <TableHeader
  label="Node health"
  tooltip="The specific status (Healthy/Warning/Critical) of a hardware unit."
  sortable={true}
  sorted={table.sortColumn === 'health'}
  ascending={table.sortDirection === 'asc'}
  onClick={() => table.handleSort('health')}
/>
              <TableHeader label="Recent event" />
              <TableHeader label="Action" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {table.paginatedData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 font-medium text-slate-900 font-mono text-[11px]">
                   <button 
                      onClick={() => onViewDetail && onViewDetail(row.id)}
                      className="text-[#1967D2] hover:underline hover:text-[#1557B0] font-medium"
                   >
                      {row.id}
                   </button>
                </td>
                <td className="px-4 py-2 text-slate-600">{row.type}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${row.coreUtil > 90 ? 'bg-emerald-500' : row.coreUtil > 70 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                        style={{ width: `${row.coreUtil}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">{row.coreUtil}%</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                   <div className="flex items-center gap-2">
                    <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${row.memUtil > 90 ? 'bg-emerald-500' : row.memUtil > 70 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                        style={{ width: `${row.memUtil}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">{row.memUtil}%</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${row.health === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {row.health}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-600">{row.recentEvent}</td>
                <td className="px-4 py-2">
                   {row.health === 'Warning' && (
                     <button 
                       onClick={() => onInvestigate(row.type)}
                       className="text-[10px] bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-2 py-1 rounded font-medium transition-colors shadow-sm"
                     >
                       Investigate
                     </button>
                   )}
                </td>
              </tr>
            ))}
            {table.paginatedData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500 text-xs">
                  No accelerators match the current filters.
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

interface FleetDashboardProps {
  onNavigateToJobs: (jobId?: string) => void;
  investigateRequest: { type: string; ts: number } | null;
  filters: DashboardFilters;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
  onReservationClick?: (reservationId: string) => void;
  onViewDetail?: (sliceId: string) => void;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({ 
  onNavigateToJobs, 
  investigateRequest,
  filters,
  setFilters,
  onReservationClick,
  onViewDetail
}) => {
  // NOTE: detailSliceId state and FleetEfficiencyDetail render are moved to parent App.tsx 
  // to support global navigation breadcrumbs.

  // Use investigateRequest to trigger a detail view if it comes in
  useEffect(() => {
    if (investigateRequest && onViewDetail) {
       onViewDetail(`${investigateRequest.type} Clusters`);
    }
  }, [investigateRequest, onViewDetail]);

  const funnelInfo = (
    <div className="group relative">
       <Info size={14} className="text-slate-400 hover:text-[#1967D2] cursor-help" />
       <div className="absolute right-0 w-64 bg-slate-800 text-white text-[10px] p-3 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 translate-y-1 font-normal normal-case leading-relaxed pointer-events-none">
          <div className="mb-2"><strong>Committed:</strong> The total number of accelerators the organization has purchased or reserved.</div>
          <div className="mb-2"><strong>Available:</strong> The subset of committed hardware that is online and healthy.</div>
          <div className="mb-2"><strong>Allocated:</strong> The number of chips currently assigned to a scheduler.</div>
          <div><strong>Utilized:</strong> The number of chips actually performing matrix operations (Goodput).</div>
          <div className="absolute -top-1 right-1 w-2 h-2 bg-slate-800 rotate-45"></div>
       </div>
    </div>
  );

  const trendsInfo = (
    <div className="group relative">
       <Info size={14} className="text-slate-400 hover:text-[#1967D2] cursor-help" />
       <div className="absolute right-0 w-64 bg-slate-800 text-white text-[10px] p-3 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 translate-y-1 font-normal normal-case leading-relaxed pointer-events-none">
          <div className="mb-2"><strong>Availability rate:</strong> Historical trend of hardware uptime.</div>
          <div className="mb-2"><strong>Activation rate:</strong> The speed at which allocated resources begin actual computation.</div>
          <div className="mb-2"><strong>Scheduling rate:</strong> The efficiency of the orchestrator in placing queued jobs onto available nodes.</div>
          <div><strong>Utilization rate:</strong> Historical view of fleet consumption over time.</div>
          <div className="absolute -top-1 right-1 w-2 h-2 bg-slate-800 rotate-45"></div>
       </div>
    </div>
  );

  // Main Fleet View
  return (
    <div className="space-y-4 animate-fadeIn">
       <div className="flex flex-col gap-3">
         <h1 className="text-xl font-bold text-slate-900">Fleet efficiency</h1>
         <div className="flex justify-between items-start">
             <FilterBar filters={filters} setFilters={setFilters} />
         </div>
       </div>

       {/* Fleet Health Overview */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
             label="Healthy chips" 
             value="4,850" 
             trend="97%" 
             trendUp={true}
             className="border-l-4 border-l-emerald-500"
          />
          <StatCard 
             label="Degraded chips" 
             value="125" 
             trend="2.5%" 
             trendUp={false}
             className="border-l-4 border-l-amber-500"
          />
          <StatCard 
             label="Unhealthy chips" 
             value="25" 
             trend="0.5%" 
             trendUp={false}
             className="border-l-4 border-l-rose-500"
          />
       </div>

       {/* Top Stats */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
             label="Fleet utilization" 
             value="63%" 
             trend="+1.2%" 
             trendUp={true}
             tooltip="The aggregate percentage of the entire hardware fleet currently performing work, used to gauge overall return on infrastructure investment."
          />
          <StatCard 
             label="Available capacity" 
             value="1,240"
             trend="Chips"
             trendUp={true}
             tooltip="The count of chips currently idle and ready to accept new jobs, crucial for capacity planning and scheduling."
          />
          <StatCard 
             label="Stranded capacity" 
             value="4.2%"
             trend="-0.5%"
             trendUp={true}
             tooltip="The percentage of resources that are paid for but unusable due to fragmentation or scheduling inefficiencies."
          />
           <StatCard 
             label="Total cost / hr" 
             value="$14.2k"
             trend="Within budget"
             trendUp={true}
             tooltip="The real-time financial run rate of the current infrastructure, ensuring the fleet is operating within budget."
          />
       </div>

       {/* Combined Funnel and Trends+Recs */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"> {/* Removed items-start to allow stretch */}
          {/* Funnel */}
          <Card title="Capacity funnel" action={funnelInfo} className="lg:col-span-1 flex flex-col h-full">
             <div className="flex-1 min-h-[200px]">
                <EfficiencyFunnelChart filters={filters} className="h-full min-h-[200px]" />
             </div>
             <div className="mt-2 flex gap-4 justify-center text-[10px] text-slate-500 border-t border-slate-100 pt-2 flex-wrap shrink-0">
                <div className="flex items-center gap-1.5">
                   <div className="w-2.5 h-2.5 rounded bg-[#94a3b8]"></div>
                   <span><strong>Committed</strong></span>
                </div>
                 <div className="flex items-center gap-1.5">
                   <div className="w-2.5 h-2.5 rounded bg-[#64748b]"></div>
                   <span><strong>Available</strong></span>
                </div>
                 <div className="flex items-center gap-1.5">
                   <div className="w-2.5 h-2.5 rounded bg-[#4f46e5]"></div>
                   <span><strong>Allocated</strong></span>
                </div>
                 <div className="flex items-center gap-1.5">
                   <div className="w-2.5 h-2.5 rounded bg-[#10b981]"></div>
                   <span><strong>Utilized</strong></span>
                </div>
             </div>
          </Card>

          {/* Combined Chart & Recommendations */}
          <Card title="Fleet-wide efficiency trends & recommendations" action={trendsInfo} className="lg:col-span-2 flex flex-col h-full">
             <FleetEfficiencyTrends filters={filters} onNavigateToJobs={onNavigateToJobs} />
          </Card>
       </div>

       <div className="grid grid-cols-1 gap-4">
          {/* Detailed Breakdown */}
          {filters.accelerator !== 'GPUs' && (
            <Card title="Fleet Utilization">
              <ProjectAcceleratorsTable 
                filters={filters} 
                onInvestigate={(type) => onViewDetail && onViewDetail(`${type} Cluster Group`)} 
                onReservationClick={onReservationClick}
                onViewDetail={onViewDetail}
              />
            </Card>
          )}
       </div>
    </div>
  );
};
