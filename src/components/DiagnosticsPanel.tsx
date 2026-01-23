
import React, { useState } from 'react';
import { ArrowLeft, Star, Activity, FileText, Cpu, Settings, BarChart2, ShieldCheck, ArrowUp, HelpCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Job } from '../types';

interface DiagnosticsPanelProps {
  job: Job;
  onBack?: () => void;
}

// --- MOCK DATA FOR MONITORING VIEW ---
const TENSOR_DATA = Array.from({ length: 60 }, (_, i) => {
  // Simulate a dip around index 42 (approx 70% mark)
  let val = Math.floor(Math.random() * 30) + 50;
  if (i >= 42 && i <= 46) val = 15; // Dip
  if (i > 46) val = 25; // Recovery but low
  return { time: i, value: val };
});

const EVENTS_ROWS = [
  { label: 'Slowdown', color: 'bg-cyan-200 border-cyan-300', bars: [{ start: 70, width: 25 }] },
  { label: 'Hang', color: 'bg-pink-200 border-pink-300', bars: [{ start: 90, width: 10 }] },
  { label: 'Unexpected restart', color: 'bg-orange-200 border-orange-300', bars: [{ start: 5, width: 6 }, { start: 70, width: 1.5 }, { start: 78, width: 2 }] },
  { label: 'Expected restart', color: 'bg-purple-200 border-purple-300', bars: [{ start: 15, width: 4 }, { start: 35, width: 4 }, { start: 55, width: 4 }, { start: 62, width: 2 }, { start: 67, width: 2 }] },
];

const EVENTS_TABLE = [
  { name: 'slowdown_9090kdk', type: 'Slowdown', start: '2024-10-30 17:30', end: '2024-10-30 17:30', severity: 'Medium', details: 'TPU utilization below 25% do this thing...' },
  { name: 'hang_0008899', type: 'Hang', start: '2024-10-30 17:30', end: '2024-10-30 17:30', severity: 'High', details: 'progress' },
  { name: 'urestart_990988', type: 'Unexpected restart', start: '2024-10-30 17:30', end: '2024-10-30 17:30', severity: 'Medium', details: 'progress' },
  { name: 'restart_99567v', type: 'Expected restart', start: '2024-10-30 17:30', end: '2024-10-30 17:30', severity: 'Low', details: 'progress' },
  { name: 'restart_93340', type: 'Expected restart', start: '2024-10-30 17:30', end: '2024-10-30 17:30', severity: 'Low', details: 'progress' },
  { name: 'restart_89090kl', type: 'Expected restart', start: '2024-10-30 17:30', end: '2024-10-30 17:30', severity: 'Low', details: 'progress' },
];

const EventMonitoringView = () => {
  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-10">
      {/* Subpage Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <h2 className="text-lg font-bold text-slate-800">Timeline</h2>
        <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-medium border border-slate-200">
           Time selection is Sep 23, 2025, 12:29 PM — Sep 23, 2025, 1:29 PM
        </div>
      </div>

      {/* Chart Complex */}
      <div className="flex gap-4 mb-8">
         {/* Left Labels Column */}
         <div className="w-28 shrink-0 flex flex-col justify-end pb-8 text-right space-y-0">
             {/* Labels for Tensor Chart Y-axis (Simulated) */}
             <div className="h-32 flex flex-col justify-between text-[10px] text-slate-400 py-2 mb-10">
                <span>90 -</span>
                <span>50 -</span>
                <span>0 -</span>
             </div>
             
             {/* Labels for Timeline Rows */}
             <div className="space-y-4 pt-1">
                {EVENTS_ROWS.map((r, i) => (
                   <div key={i} className="h-6 text-[10px] font-medium text-slate-600 flex items-center justify-end whitespace-nowrap" title={r.label}>
                      {r.label}
                   </div>
                ))}
             </div>
         </div>

         {/* Charts Column */}
         <div className="flex-1 relative">
             {/* Vertical Sync Line */}
             <div className="absolute top-0 bottom-6 left-[72%] w-px border-l-2 border-dashed border-[#3b82f6] z-10 pointer-events-none">
                <div className="absolute -bottom-2.5 -left-4 bg-[#3b82f6] text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap z-20">
                   6:22pm
                </div>
                <div className="absolute w-3 h-3 bg-[#3b82f6]/20 rounded-full -bottom-1 -left-[5px] animate-ping"></div>
             </div>

             {/* Chart 1: Tensor Core */}
             <div className="mb-2">
                <h3 className="text-xs font-bold text-slate-900 mb-2 pl-1">Tensor core utilization</h3>
                <div className="h-32 w-full">
                   <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                      <BarChart data={TENSOR_DATA} barGap={0} barCategoryGap={1} margin={{top:0, left:0, right:0, bottom:0}}>
                         <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                         <XAxis dataKey="time" hide />
                         <YAxis hide domain={[0, 90]} />
                         <Tooltip 
                            cursor={{fill: '#f1f5f9'}} 
                            contentStyle={{fontSize: '10px', borderRadius: '4px', padding: '4px'}} 
                         />
                         <Bar dataKey="value" fill="#4285F4" radius={[1, 1, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Chart 2: Events Timeline */}
             <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-900 mb-2 pl-1">Events over Step time</h3>
                <div className="space-y-4 relative">
                   {EVENTS_ROWS.map((row, idx) => (
                      <div key={idx} className="h-6 w-full bg-slate-50 relative rounded-sm overflow-hidden">
                         {row.bars.map((bar, bIdx) => (
                            <div 
                               key={bIdx}
                               className={`absolute top-0 bottom-0 ${row.color} opacity-80 border-r border-white/50`}
                               style={{ left: `${bar.start}%`, width: `${bar.width}%` }}
                            ></div>
                         ))}
                      </div>
                   ))}
                </div>
                {/* X Axis Simulator */}
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
                   <span>0</span>
                   <span>500</span>
                   <span>1000</span>
                   <span>1500</span>
                   <span>2000</span>
                   <span>2500</span>
                </div>
             </div>
         </div>
      </div>

      {/* Table Section */}
      <div>
         <h3 className="text-lg font-bold text-slate-800 mb-3">All events</h3>
         <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
               <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                     <th className="px-4 py-2.5 font-medium cursor-pointer hover:bg-slate-100 transition-colors w-1/6">
                        <div className="flex items-center gap-1">Event name <ArrowUp size={12} className="text-slate-400"/></div>
                     </th>
                     <th className="px-4 py-2.5 font-medium w-1/6">Event type</th>
                     <th className="px-4 py-2.5 font-medium cursor-pointer hover:bg-slate-100 transition-colors w-1/6">
                        <div className="flex items-center gap-1">Start time <ArrowUp size={12} className="text-slate-400"/></div>
                     </th>
                     <th className="px-4 py-2.5 font-medium cursor-pointer hover:bg-slate-100 transition-colors w-1/6">
                        <div className="flex items-center gap-1">End time <ArrowUp size={12} className="text-slate-400"/></div>
                     </th>
                     <th className="px-4 py-2.5 font-medium w-1/12">
                        <div className="flex items-center gap-1">Severity <HelpCircle size={12} className="text-slate-400"/></div>
                     </th>
                     <th className="px-4 py-2.5 font-medium w-1/4">
                        <div className="flex items-center gap-1">Details <HelpCircle size={12} className="text-slate-400"/></div>
                     </th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 bg-white">
                  {EVENTS_TABLE.map((evt, i) => (
                     <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-900">{evt.name}</td>
                        <td className="px-4 py-2.5 text-slate-600">{evt.type}</td>
                        <td className="px-4 py-2.5 text-slate-600 font-mono text-[10px]">{evt.start}</td>
                        <td className="px-4 py-2.5 text-slate-600 font-mono text-[10px]">{evt.end}</td>
                        <td className="px-4 py-2.5">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white border ${
                              evt.severity === 'High' ? 'bg-rose-500 border-rose-600' : 
                              evt.severity === 'Medium' ? 'bg-orange-500 border-orange-600' : 
                              'bg-slate-400 border-slate-500'
                           }`}>
                              {evt.severity}
                           </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">
                           {evt.details === 'progress' ? (
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                 <div className="h-full bg-slate-400 w-2/3 rounded-full"></div>
                              </div>
                           ) : (
                              <div className="flex items-center gap-1.5">
                                 <span className="text-purple-500 text-[10px] flex items-center justify-center w-3 h-3 bg-purple-100 rounded-full">✦</span> 
                                 <span className="truncate max-w-[200px]" title={evt.details}>{evt.details}</span>
                              </div>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ job, onBack }) => {
  const [activeItem, setActiveItem] = useState('monitoring');

  // Updated NAV_ITEMS with "Event monitoring" label
  const NAV_ITEMS = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'monitoring', label: 'Event monitoring', icon: Activity },
    { id: 'performance', label: 'Model performance metrics', icon: BarChart2 },
    { id: 'quality', label: 'Model quality metrics', icon: ShieldCheck },
    { id: 'system', label: 'System metrics', icon: Cpu },
    { id: 'profiles', label: 'Profiles', icon: Settings },
  ];

  const renderContent = () => {
    if (activeItem === 'monitoring') {
      return <EventMonitoringView />;
    }

    return (
      <div className="h-full bg-white border border-slate-200 rounded-lg p-6 shadow-sm animate-fadeIn">
        <div className="flex items-center gap-2 mb-4">
           <Star className="fill-blue-500 text-blue-500" size={24} />
           <h2 className="text-xl font-bold text-slate-800">
             {NAV_ITEMS.find(i => i.id === activeItem)?.label}
           </h2>
        </div>
        <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 text-center text-slate-500">
           <p className="mb-2">Subpage content for <strong>{activeItem}</strong></p>
           <p className="text-sm">This section is currently under development.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      {/* 1. Back Button and Header */}
      <div className="flex-none mb-4">
        <button 
          onClick={onBack} 
          className="text-slate-500 hover:text-[#1967D2] text-xs flex items-center gap-1 font-medium transition-colors mb-2"
        >
          <ArrowLeft size={14} /> Back to diagnostics
        </button>
        {/* 2. Run Name Title (Updated as requested) */}
        <div className="flex flex-col gap-3">
           <h1 className="text-xl font-bold text-slate-900">{job.id}</h1>
           <div className="text-sm text-slate-500 flex items-center gap-2">
             <span className="font-medium text-slate-400 uppercase text-[10px]">Job:</span> {job.name}
           </div>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="border-b border-slate-200 mb-6"></div>

      <div className="flex flex-1 min-h-0">
        {/* 3. Left Nav Inset with Border */}
        <div className="w-64 shrink-0 flex flex-col gap-1 pr-6 border-r border-slate-200">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all flex items-center gap-3 ${
                activeItem === item.id 
                  ? 'bg-[#1967D2]/10 text-[#1967D2]' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {/* Optional icons for flair, though not explicitly requested, they look good in inset navs */}
              {/* <item.icon size={16} className={activeItem === item.id ? 'text-[#1967D2]' : 'text-slate-400'} /> */}
              {item.label}
            </button>
          ))}
        </div>

        {/* 4. Inset Page Content */}
        <div className="flex-1 min-w-0 pl-6">
           {renderContent()}
        </div>
      </div>
    </div>
  );
};
