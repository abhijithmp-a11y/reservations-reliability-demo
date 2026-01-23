
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Server, 
  Cpu, 
  Network, 
  Database,
  Thermometer,
  Clock,
  ArrowRight,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  AlertOctagon,
  Play,
  SkipForward
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart, 
  Bar,
  LineChart,
  Line
} from 'recharts';
import { Card, StatCard, MiniGauge, Sparkline } from './Card';

interface FleetEfficiencyDetailProps {
  sliceId: string; 
  onBack: () => void;
  onNavigateToJob: (jobId?: string) => void;
}

// Mock Data for Charts
const TENSOR_UTIL_DATA = [
  { time: '10:00', value: 78 },
  { time: '10:05', value: 82 },
  { time: '10:10', value: 85 },
  { time: '10:15', value: 91 },
  { time: '10:20', value: 89 },
  { time: '10:25', value: 94 },
  { time: '10:30', value: 92 },
  { time: '10:35', value: 95 },
  { time: '10:40', value: 93 },
  { time: '10:45', value: 96 },
];

const TRANSPORT_TPUT_DATA = [
  { time: '10:00', value: 120 },
  { time: '10:05', value: 135 },
  { time: '10:10', value: 128 },
  { time: '10:15', value: 142 },
  { time: '10:20', value: 145 },
  { time: '10:25', value: 138 },
  { time: '10:30', value: 150 },
];

// Mock Data for TPU Topology
const TPU_TOPOLOGY_MOCK = [
  {
    id: 'rack-01',
    label: 'Rack 01',
    status: 'Healthy',
    isOpen: true,
    blocks: [
        { id: 'tray-01', label: 'Tray 01', nodes: Array(8).fill('healthy') },
        { id: 'tray-02', label: 'Tray 02', nodes: Array(8).fill('healthy') },
        { id: 'tray-03', label: 'Tray 03', nodes: Array(8).fill('healthy') },
        { id: 'tray-04', label: 'Tray 04', nodes: Array(8).fill('healthy') },
    ]
  },
  {
    id: 'rack-02',
    label: 'Rack 02',
    status: 'Warning',
    isOpen: true,
    blocks: [
        { id: 'tray-05', label: 'Tray 01', nodes: Array(8).fill('healthy') },
        { id: 'tray-06', label: 'Tray 02', nodes: [...Array(6).fill('healthy'), 'suspected', 'healthy'] },
        { id: 'tray-07', label: 'Tray 03', nodes: Array(8).fill('healthy') },
        { id: 'tray-08', label: 'Tray 04', nodes: Array(8).fill('healthy') },
    ]
  },
  {
    id: 'rack-03',
    label: 'Rack 03',
    status: 'Healthy',
    isOpen: false,
    blocks: [
        { id: 'tray-09', label: 'Tray 01', nodes: Array(8).fill('healthy') },
        { id: 'tray-10', label: 'Tray 02', nodes: Array(8).fill('healthy') },
        { id: 'tray-11', label: 'Tray 03', nodes: Array(8).fill('healthy') },
        { id: 'tray-12', label: 'Tray 04', nodes: Array(8).fill('healthy') },
    ]
  }
];

export const FleetEfficiencyDetail: React.FC<FleetEfficiencyDetailProps> = ({ sliceId, onBack, onNavigateToJob }) => {
  // Determine accelerator type
  const isTpu = sliceId.toLowerCase().includes('tpu') || sliceId.toLowerCase().includes('v4') || sliceId.toLowerCase().includes('v5');
  const typeLabel = isTpu ? 'TPU' : 'GPU';
  
  // Topology State
  const [topology, setTopology] = useState(TPU_TOPOLOGY_MOCK);

  const toggleRack = (id: string) => {
    setTopology(prev => prev.map(r => r.id === id ? { ...r, isOpen: !r.isOpen } : r));
  };

  // Custom Labels based on accelerator type
  const labels = {
    tensorCore: isTpu ? 'MXU Utilization' : 'Tensor Core Utilization',
    interconnect: isTpu ? 'ICI Link Health' : 'NVLink Health',
    queue: isTpu ? 'HLO Queue Size' : 'Kernel Queue Depth',
    collective: isTpu ? 'Collective E2E Latency' : 'NCCL E2E Latency',
    buffer: 'Buffer Transfer Latency',
  };

  // Status simulation
  const nodeHealthScore = 98;

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      
      {/* Header */}
      <div>
        <button onClick={onBack} className="text-slate-500 hover:text-[#1967D2] text-xs flex items-center gap-1 mb-3 font-medium transition-colors">
          <ArrowLeft size={14} /> Back to fleet efficiency
        </button>
        
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <div className="flex items-center gap-2 mb-0.5">
                <div className={`p-1.5 rounded-md ${isTpu ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                   <Server size={18} />
                </div>
                <h1 className="text-lg font-bold text-slate-900">{sliceId}</h1>
             </div>
             <p className="text-slate-500 text-xs pl-8">Real-time telemetry and health metrics for {typeLabel} slice.</p>
          </div>
          <div className="flex gap-2">
             <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Node Health: {nodeHealthScore}/100
             </div>
             <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5">
                <Activity size={12} /> Live Logs
             </button>
          </div>
        </div>
      </div>

      {/* 1. Critical Indicators Row (Node Health, Throttling, Idle) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Node Health Score" 
          value={`${nodeHealthScore}`} 
          trend="Stable" 
          trendUp={true}
          tooltip="Aggregate health score based on hardware errors, link flaps, and thermal events."
        />
        <StatCard 
          label="Core Throttling Indicators" 
          value="None" 
          trend="0 events (24h)" 
          trendUp={true}
          tooltip="Indicators of thermal or power throttling events."
        />
        <StatCard 
          label="Chip Idle Time" 
          value="12%" 
          trend="+2%" 
          trendUp={false}
          tooltip="Percentage of time the accelerator execution units are stalled or idle."
        />
      </div>

      {/* TPU TOPOLOGY SECTION (Only for TPUs) */}
      {isTpu && (
        <div className="mt-2">
           <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers size={16} className="text-[#1967D2]" /> Slice Topology
              </h3>
              <div className="flex gap-4 text-[10px] font-medium">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-300"/> Healthy</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"/> Degraded</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"/> Unhealthy</div>
              </div>
           </div>
           
           <div className="space-y-3">
              {topology.map(rack => (
                 <div key={rack.id} className="bg-white border border-slate-200 rounded-lg shadow-sm transition-all">
                    {/* Header */}
                    <div 
                      onClick={() => toggleRack(rack.id)}
                      className={`px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 select-none rounded-t-lg ${!rack.isOpen ? 'rounded-b-lg' : ''}`}
                    >
                       <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-slate-900">{rack.label}</h3>
                          <ChevronDown size={16} className={`text-slate-400 transition-transform ${rack.isOpen ? 'rotate-180' : ''}`} />
                       </div>
                       
                       {/* Status Summary */}
                       <div className="flex items-center gap-3">
                          {rack.status === 'Warning' ? (
                             <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-bold">
                                <AlertTriangle size={12} /> Degraded nodes detected
                             </div>
                          ) : (
                             <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                                <CheckCircle2 size={12} /> All nodes healthy
                             </div>
                          )}
                          {rack.isOpen && rack.status === 'Warning' && (
                             <div className="flex gap-2 ml-2">
                                <button className="text-[#1967D2] text-[10px] font-bold flex items-center gap-1 hover:underline bg-white border border-[#1967D2]/20 px-2 py-0.5 rounded">
                                   <Play size={10} className="fill-[#1967D2]" /> Run diagnostics
                                </button>
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Nodes Grid */}
                    {rack.isOpen && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         {rack.blocks.map(tray => (
                            <div key={tray.id}>
                               <h5 className="text-[10px] text-slate-500 mb-1.5 font-medium uppercase tracking-wide">{tray.label}</h5>
                               <div className="flex flex-wrap gap-1">
                                  {tray.nodes.map((status, idx) => (
                                     <div 
                                       key={idx}
                                       className={`
                                         w-6 h-5 rounded-[2px] cursor-pointer hover:opacity-80 transition-opacity
                                         ${status === 'healthy' ? 'bg-cyan-300' : ''}
                                         ${status === 'suspected' ? 'bg-amber-400' : ''}
                                         ${status === 'unhealthy' ? 'bg-rose-500' : ''}
                                       `}
                                       title={`Node ${idx}: ${status}`}
                                     ></div>
                                  ))}
                               </div>
                            </div>
                         ))}
                      </div>
                    )}
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* 2. Compute & Memory Deep Dive */}
      <div>
         <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <Cpu size={16} className="text-[#1967D2]" /> Compute & Memory
         </h3>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card title={labels.tensorCore} className="lg:col-span-2">
               <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                     <AreaChart data={TENSOR_UTIL_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorTensor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '4px', fontSize: '10px', padding: '4px' }} />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#colorTensor)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </Card>
            
            <div className="space-y-4">
               <StatCard 
                 label="HBM Utilization" 
                 value="82%" 
                 trend="High Bandwidth"
                 tooltip="Real-time percentage usage of High Bandwidth Memory (HBM)."
               />
               <StatCard 
                 label="VM Memory Utilization" 
                 value="45%" 
                 trend="Healthy"
                 tooltip="Host VM memory usage."
               />
               <StatCard 
                 label="CPU Utilization" 
                 value="38%" 
                 trend="Stable"
                 tooltip="Host CPU utilization."
               />
            </div>
         </div>
      </div>

      {/* 3. Network & Interconnect */}
      <div>
         <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <Network size={16} className="text-[#1967D2]" /> Interconnect & Transport
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
               label={labels.interconnect} 
               value="Optimal" 
               trend="0 Flaps" 
               trendUp={true}
               tooltip={`Health status of the ${isTpu ? 'ICI' : 'NVLink'} mesh.`}
            />
            <StatCard 
               label={labels.collective} 
               value="145us" 
               trend="+12us" 
               trendUp={false}
               tooltip="End-to-end latency for collective operations (AllReduce)."
            />
            <StatCard 
               label="TCP Multi-slice Latency" 
               value="1.2ms" 
               trend="Nominal" 
               tooltip="Latency between slices over TCP transport."
            />
            <StatCard 
               label="Transport RTT" 
               value="45ms" 
               trend="Stable" 
               tooltip="Round trip time for transport layer packets."
            />
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
             <Card title="Transport Layer Throughput (GB/s)">
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                     <LineChart data={TRANSPORT_TPUT_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '4px', fontSize: '10px', padding: '4px' }} />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                     </LineChart>
                  </ResponsiveContainer>
                </div>
             </Card>
             <div className="grid grid-cols-1 gap-4">
                 <StatCard 
                   label="Buffer Transfer Latency" 
                   value="12us" 
                   trend="Fast"
                   tooltip="Latency for DMA buffer transfers."
                 />
                 <StatCard 
                   label={labels.queue} 
                   value="14" 
                   trend="Depth"
                   tooltip="Current depth of the instruction queue."
                 />
             </div>
         </div>
      </div>

    </div>
  );
};
