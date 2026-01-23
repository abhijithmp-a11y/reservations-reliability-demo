
import React from 'react';
import { ArrowLeft, Calendar, DollarSign, Server, CheckCircle2, AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react';
import { Card, StatCard, MiniGauge } from './Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReservationDetailProps {
  reservationId: string;
  onBack: () => void;
}

const UTILIZATION_DATA = [
  { time: '00:00', value: 85 },
  { time: '04:00', value: 82 },
  { time: '08:00', value: 94 },
  { time: '12:00', value: 98 },
  { time: '16:00', value: 95 },
  { time: '20:00', value: 88 },
  { time: '24:00', value: 84 },
];

export const ReservationDetail: React.FC<ReservationDetailProps> = ({ reservationId, onBack }) => {
  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      {/* Header */}
      <div>
        <button onClick={onBack} className="text-slate-500 hover:text-[#1967D2] text-xs flex items-center gap-1 mb-3 font-medium transition-colors">
          <ArrowLeft size={14} /> Back to cost and capacity
        </button>
        
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1967D2]/10 rounded-lg text-[#1967D2]">
              <Server size={24} />
            </div>
            <div>
               <h1 className="text-lg font-bold text-slate-900">{reservationId}</h1>
               <div className="flex gap-4 text-xs text-slate-500 mt-0.5">
                 <span className="flex items-center gap-1"><Calendar size={12} /> Created: Oct 15, 2024</span>
                 <span className="flex items-center gap-1"><Clock size={12} /> Expires: Oct 15, 2025</span>
               </div>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Active
             </div>
             <button className="px-3 py-1.5 bg-[#1967D2] text-white rounded-md font-bold text-xs hover:bg-[#1557B0] transition-colors shadow-sm">
                Edit reservation
             </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            label="Total chips" 
            value="2,048" 
            trend="100% Allocated"
            trendUp={true}
        />
        <StatCard 
            label="Current utilization" 
            value="92%" 
            trend="+1.2%"
            trendUp={true}
        />
        <StatCard 
            label="Cost / hour" 
            value="$4,200" 
            trend="On Budget"
            trendUp={true}
        />
         <StatCard 
            label="Active jobs" 
            value="14" 
            trend="2 Queued"
            trendUp={true}
        />
      </div>

      {/* Utilization Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Utilization trend (24h)" className="lg:col-span-2">
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={UTILIZATION_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorResUtil" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1967D2" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1967D2" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', fontSize: '10px', padding: '4px' }} />
                    <Area type="monotone" dataKey="value" stroke="#1967D2" strokeWidth={2} fill="url(#colorResUtil)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>

        {/* Alerts / Insights */}
        <div className="space-y-4">
             <Card title="Efficiency insights">
                <div className="space-y-3">
                    <div className="p-2 bg-amber-50 rounded border border-amber-100 flex gap-2">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h5 className="text-xs font-bold text-amber-800">Idle capacity detected</h5>
                            <p className="text-[10px] text-amber-700 mt-0.5">
                                5% of chips have been idle for &gt;2 hours. Consider scheduling non-urgent batch jobs.
                            </p>
                        </div>
                    </div>
                     <div className="p-2 bg-emerald-50 rounded border border-emerald-100 flex gap-2">
                        <TrendingUp size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <h5 className="text-xs font-bold text-emerald-800">High goodput</h5>
                            <p className="text-[10px] text-emerald-700 mt-0.5">
                                Reservation running at 98% efficiency compared to fleet average of 92%.
                            </p>
                        </div>
                    </div>
                </div>
             </Card>
             
             <Card title="Quota info">
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Project</span>
                        <span className="font-medium text-slate-900">ml-prod-training</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Zone</span>
                        <span className="font-medium text-slate-900">us-west1-b</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Machine Type</span>
                        <span className="font-medium text-slate-900">a3-highgpu-8g</span>
                    </div>
                </div>
             </Card>
        </div>
      </div>
    </div>
  );
};