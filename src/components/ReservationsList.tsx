import React from 'react';
import { Layers, ChevronRight, MapPin, Activity, Calendar } from 'lucide-react';

interface ReservationEntry {
  id: string;
  name: string;
  location: string;
  type: 'Standard' | 'Extended';
  status: 'Ready' | 'Degraded' | 'Healthy';
  assuredCount: number;
  gpuType: string;
  creationTime: string;
  tabId: 'director' | 'director-bulk';
}

export const RESERVATIONS: ReservationEntry[] = [
  {
    id: 'res-1',
    name: 'us-west8-reservation1',
    location: 'us-west8-a',
    type: 'Standard',
    status: 'Ready',
    assuredCount: 144,
    gpuType: 'NVIDIA GB200',
    creationTime: 'Jan 7, 2026',
    tabId: 'director'
  },
  {
    id: 'res-2',
    name: 'us-central1-reservation2',
    location: 'us-central1-a',
    type: 'Extended',
    status: 'Healthy',
    assuredCount: 4320,
    gpuType: 'NVIDIA GB200',
    creationTime: 'Jan 12, 2026',
    tabId: 'director-bulk'
  },
  {
    id: 'res-3',
    name: 'us-east4-reservation1',
    location: 'us-east4-a',
    type: 'Standard',
    status: 'Ready',
    assuredCount: 256,
    gpuType: 'NVIDIA B200',
    creationTime: 'Feb 5, 2026',
    tabId: 'director-b200'
  }
];

interface ReservationsListProps {
  onNavigate: (tabId: string) => void;
}

export const ReservationsList: React.FC<ReservationsListProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
        <button className="bg-[#1967D2] hover:bg-[#1557B0] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
          Create Reservation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Activity size={20} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-700">Total Capacity</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">4,720</div>
          <div className="text-xs text-slate-500 mt-1">Assured instances across all reservations</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-700">Active Reservations</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">3</div>
          <div className="text-xs text-slate-500 mt-1">2 Standard, 1 Extended</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Activity size={20} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-700">Utilization</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">84%</div>
          <div className="text-xs text-slate-500 mt-1">Average across all resources</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">GPU Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assured Count</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {RESERVATIONS.map((res) => (
              <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <button 
                    onClick={() => onNavigate(res.tabId)}
                    className="text-sm font-bold text-[#1967D2] hover:underline flex items-center gap-2"
                  >
                    <Layers size={16} className="text-slate-400 group-hover:text-[#1967D2]" />
                    {res.name}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    {res.location}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    res.type === 'Standard' 
                      ? 'bg-slate-100 text-slate-600 border-slate-200' 
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {res.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {res.gpuType}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${
                      res.status === 'Healthy' || res.status === 'Ready' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-sm font-medium text-slate-700">{res.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                  {res.assuredCount}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {res.creationTime}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onNavigate(res.tabId)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#1967D2] transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
