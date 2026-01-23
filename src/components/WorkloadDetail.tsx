
import React, { useState } from 'react';
import { 
  ArrowLeft,
  ArrowRight, 
  Activity, 
  Cpu, 
  Database, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  TrendingDown, 
  Zap, 
  Server,
  Microscope,
  Box,
  Terminal,
  FileText,
  PauseCircle,
  ExternalLink,
  AlertOctagon,
  ChevronDown,
  ChevronRight,
  Timer,
  RefreshCw,
  MoreVertical,
  Maximize2,
  LayoutDashboard,
  Network,
  Gauge,
  Layers
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Legend } from 'recharts';
import { Card, StatCard, Sparkline, MiniGauge, TableHeader } from './Card';
import { Job, JobStatus } from '../types';

interface JobDetailProps {
  job: Job;
  onBack: () => void;
  showBanner?: boolean;
  onViewDiagnostics?: () => void;
}

// Mock Data for Charts
const UTILIZATION_TREND = [
  { time: '10:00', util: 45 },
  { time: '10:05', util: 50 },
  { time: '10:10', util: 85 },
  { time: '10:15', util: 88 },
  { time: '10:20', util: 92 },
  { time: '10:25', util: 90 },
  { time: '10:30', util: 94 },
  { time: '10:35', util: 93 },
  { time: '10:40', util: 95 },
];

// Enhanced Loss Data for TensorBoard Chart
const LOSS_DATA = Array.from({ length: 30 }, (_, i) => {
  const step = i * 50;
  // Simulating a loss curve: exponentially decaying + some random noise + occasional spikes
  let baseLoss = 2.5 * Math.exp(-0.003 * step); 
  const noise = (Math.random() - 0.5) * 0.15;
  if (i === 15) baseLoss += 0.4; // Simulate a spike
  return { step, loss: Math.max(0.1, parseFloat((baseLoss + noise).toFixed(3))) };
});

// Enhanced Profile Data for xProf Chart
const PROFILE_DATA = [
  { step: 'MatMul', compute: 75, comm: 5, idle: 0 },
  { step: 'AllReduce', compute: 0, comm: 65, idle: 15 },
  { step: 'Attention', compute: 60, comm: 10, idle: 2 },
  { step: 'Softmax', compute: 25, comm: 0, idle: 0 },
  { step: 'LayerNorm', compute: 20, comm: 0, idle: 0 },
  { step: 'GeLU', compute: 15, comm: 0, idle: 0 },
  { step: 'Conv2D', compute: 50, comm: 5, idle: 5 },
  { step: 'FusedOp', compute: 35, comm: 2, idle: 0 },
];

export const JobDetail: React.FC<JobDetailProps> = ({ job, onBack, showBanner, onViewDiagnostics }) => {
  // --- DYNAMIC LOGIC ---
  const isTraining = ['LLM Training', 'Training', 'Fine-tuning'].includes(job.jobType || '');
  const isGke = job.orchestrator?.includes('GKE');
  const isTpu = job.accelerator?.includes('TPU') || job.accelerator?.includes('v4') || job.accelerator?.includes('v5');
  
  // PDF Requirement: Chips & Infrastructure
  const totalChips = isTpu ? 64 : 8; 

  // PDF Requirement: Training Goodput Logic
  const productivePct = job.goodput || 87;
  // GKE Specific: Splits efficiency into Scheduling vs Runtime
  const gkeSchedulingGoodput = isGke ? 98 : null;
  const gkeRuntimeGoodput = isGke ? productivePct : null;
  const unproductivePct = 100 - productivePct;

  // PDF Requirement: Interruptions & Stability
  // GKE Specific: Tracks JobSet MTTR (Mean Time To Recovery) and MTBI (Mean Time Between Interruptions)
  const stabilityMetrics = isGke ? {
    mttr: '4m 12s',
    mtbi: '42h 30m',
    jobSetStatus: '4/4 Replicas Ready',
    uptime: '2d 4h'
  } : {
    mttr: '-',
    mtbi: '-'
  };

  // PDF Requirement: Hardware Performance Mock Data
  const hardwarePerf = {
    hbmUtil: '82%',
    networkLatency: '145us'
  };

  // GCP Style Status Rendering
  const renderStatus = (status: JobStatus) => {
    switch(status) {
      case JobStatus.RUNNING: 
        return <span className="flex items-center gap-1.5 text-emerald-700 font-medium"><CheckCircle2 size={14} className="fill-emerald-100 text-emerald-600"/> Running</span>;
      case JobStatus.FAILED: 
        return <span className="flex items-center gap-1.5 text-rose-700 font-medium"><AlertOctagon size={14} className="fill-rose-100 text-rose-600"/> Failed</span>;
      case JobStatus.HANGING: 
        return <span className="flex items-center gap-1.5 text-amber-700 font-medium"><AlertTriangle size={14} className="fill-amber-100 text-amber-600"/> Hanging</span>;
      case JobStatus.QUEUED: 
        return <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Clock size={14} className="text-slate-500"/> Queued</span>;
      default: 
        return <span className="text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10 font-sans text-xs">
      
      {/* --- HEADER SECTION (Job Identity & Actions) --- */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button onClick={onBack} className="mt-1 text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={16} />
            </button>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-normal text-slate-900">{job.name}</h1>
                  <div className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600">
                    {job.id}
                  </div>
               </div>
               <div className="flex items-center gap-2 text-xs">
                  {renderStatus(job.status)}
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600">Region: <span className="text-slate-900">us-west1</span></span>
                  {isGke && (
                    <>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-600 flex items-center gap-1">
                        <Layers size={12} className="text-blue-600"/> 
                        JobSet: <span className="text-emerald-600 font-medium">{stabilityMetrics.jobSetStatus}</span>
                      </span>
                    </>
                  )}
               </div>
            </div>
          </div>

          {/* Action Toolbar - Right Aligned */}
          <div className="flex items-center gap-2">
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded shadow-sm font-medium transition-colors text-xs">
                <RefreshCw size={12} /> Refresh
             </button>
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded shadow-sm font-medium transition-colors text-xs">
                <FileText size={12} /> View Logs
             </button>
             
             {/* PDF Requirement: Job Identity & Actions - View in GKE Button */}
             {isGke && (
               <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#1967D2] rounded shadow-sm font-medium transition-colors text-xs">
                  <Box size={12} /> View in GKE Console <ExternalLink size={10} />
               </button>
             )}

             {job.status === JobStatus.RUNNING && (
               <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded shadow-sm font-medium transition-colors text-xs">
                  <PauseCircle size={12} /> Stop Job
               </button>
             )}
          </div>
        </div>
      </div>

      {/* --- ALERT BANNER --- */}
      {(job.status === JobStatus.HANGING || job.status === JobStatus.FAILED) && (
        <div className={`border-l-4 p-3 rounded-r-md flex items-start gap-3 shadow-sm ${job.status === JobStatus.FAILED ? 'bg-rose-50 border-rose-500' : 'bg-amber-50 border-amber-500'}`}>
           {job.status === JobStatus.FAILED ? <AlertOctagon className="text-rose-600 mt-0.5" size={16} /> : <AlertTriangle className="text-amber-600 mt-0.5" size={16} />}
           <div>
              <h3 className={`font-medium text-sm ${job.status === JobStatus.FAILED ? 'text-rose-900' : 'text-amber-900'}`}>
                 {job.status === JobStatus.FAILED ? 'Job Failed' : 'Job Hanging Detected'}
              </h3>
              <p className={`mt-0.5 text-xs ${job.status === JobStatus.FAILED ? 'text-rose-800' : 'text-amber-800'}`}>
                 {job.status === JobStatus.FAILED 
                    ? 'The job terminated unexpectedly due to hardware failure on node-4.' 
                    : 'Heartbeat lost for 10 minutes. Step time has degraded by 200%. Diagon++ analysis suggests a deadlock.'}
              </p>
              <button 
                onClick={onViewDiagnostics}
                className={`mt-1.5 text-xs font-bold hover:underline ${job.status === JobStatus.FAILED ? 'text-rose-900' : 'text-amber-900'}`}
              >
                 View Diagnostics Analysis
              </button>
           </div>
        </div>
      )}

      {/* --- STABILITY SECTION (Moved to Top) --- */}
      <div>
        <h3 className="text-sm font-normal text-slate-900 mb-2">Stability & Interruptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <StatCard 
              label="Total Interruptions" 
              value={job.interruptions} 
              trend="Past 24h"
           />
           {isGke && (
             <>
               <StatCard 
                  label="JobSet MTTR" 
                  value={stabilityMetrics.mttr} 
                  trend="Avg Recovery Time"
                  tooltip="Mean Time To Recovery for the JobSet"
               />
               <StatCard 
                  label="JobSet MTBI" 
                  value={stabilityMetrics.mtbi} 
                  trend="Time Between Interruptions"
                  tooltip="Mean Time Between Interruptions"
               />
             </>
           )}
           {!isGke && (
              <StatCard 
                label="System Uptime" 
                value="99.9%" 
                trend="Stable"
              />
           )}
        </div>
      </div>

      {/* --- CONSOLIDATED PERFORMANCE & INFO --- */}
      <h3 className="text-sm font-normal text-slate-900 pt-2 flex items-center gap-2">
         Performance & Utilization
         <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">Live</span>
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* CARD 1: JOB INFO (Consolidated) */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm flex flex-col">
             <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-md">
                <h2 className="font-medium text-slate-900 text-xs">Job info</h2>
             </div>
             <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Orchestrator</label>
                   <div className="text-slate-900 text-xs flex items-center gap-1">
                     {job.orchestrator}
                     <ExternalLink size={10} className="text-slate-400"/>
                   </div>
                </div>
                <div className="border-t border-slate-50"></div>
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Start Time</label>
                   <div className="text-slate-900 text-xs">{job.submitted}</div>
                </div>
                <div className="border-t border-slate-50"></div>
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Duration</label>
                   <div className="text-slate-900 text-xs">{job.duration} <span className="text-slate-400">({job.estimatedRemaining} left)</span></div>
                </div>
                <div className="border-t border-slate-50"></div>
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Accelerator</label>
                   <div className="text-slate-900 text-xs flex items-center gap-1">
                      {isTpu ? <Cpu size={12} className="text-purple-600"/> : <Zap size={12} className="text-emerald-600"/>}
                      {job.accelerator}
                   </div>
                </div>
                <div className="border-t border-slate-50"></div>
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Total Chips</label>
                   <div className="text-slate-900 text-xs font-mono">{totalChips}</div>
                </div>
             </div>
          </div>

          {/* CARD 2: ACCELERATOR UTILIZATION */}
          <div className={`bg-white border border-slate-200 rounded-md shadow-sm flex flex-col ${!isTraining ? 'lg:col-span-2' : ''}`}>
             <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-medium text-slate-900 text-xs">Accelerator Utilization (TensorCore)</h4>
                <div className="text-lg font-normal text-slate-900">{job.tensorCoreUtil}% <span className="text-[10px] text-slate-500 font-normal ml-0.5">avg</span></div>
             </div>
             <div className="p-4 flex-1">
                 <div className="h-32 w-full mb-4">
                     <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                        <AreaChart data={UTILIZATION_TREND}>
                           <defs>
                              <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#1967D2" stopOpacity={0.1} />
                                 <stop offset="95%" stopColor="#1967D2" stopOpacity={0} />
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                           <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                           <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                           <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '4px' }} />
                           <Area type="monotone" dataKey="util" stroke="#1967D2" strokeWidth={1.5} fill="url(#colorUtil)" />
                        </AreaChart>
                     </ResponsiveContainer>
                 </div>
                 
                 {/* PDF Requirement: Hardware Performance (HBM / Network) */}
                 <div className="flex gap-4 text-[10px] text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                       <Database size={12} className="text-slate-400" />
                       HBM Util: <strong className="text-slate-900">{hardwarePerf.hbmUtil}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Network size={12} className="text-slate-400" />
                       Network Latency: <strong className="text-slate-900">{hardwarePerf.networkLatency}</strong>
                    </div>
                    <button className="ml-auto text-[#1967D2] font-medium hover:underline flex items-center gap-1">
                       View Fleet Details <ArrowRight size={10} />
                    </button>
                 </div>
             </div>
          </div>

          {/* CARD 3: GOODPUT (Conditional) */}
          {isTraining && (
             <div className="bg-white border border-slate-200 rounded-md shadow-sm flex flex-col">
                <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <h4 className="font-medium text-slate-900 text-xs">Training Goodput</h4>
                    <div className="text-lg font-normal text-slate-900">{productivePct}%</div>
                </div>
                <div className="p-4 flex flex-col justify-between h-full">
                    {/* Visual Bar */}
                    <div className="mb-4">
                       <div className="flex justify-between text-[10px] mb-1">
                          <span className="font-medium text-emerald-700">Productive (Step time)</span>
                          <span className="font-medium text-amber-700">Overhead (Ckpt, Load, Stall)</span>
                       </div>
                       <div className="h-4 w-full bg-amber-100 rounded-sm overflow-hidden flex">
                          <div className="h-full bg-emerald-500" style={{ width: `${productivePct}%` }}></div>
                       </div>
                    </div>

                    {/* PDF Requirement: GKE Scheduling Goodput vs Runtime Goodput */}
                    {isGke && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                         <div className="p-2 bg-blue-50/50 border border-blue-100 rounded">
                            <div className="text-[9px] text-slate-500 uppercase tracking-wide font-bold">Scheduling Goodput</div>
                            <div className="text-sm font-medium text-slate-900 mt-0.5">{gkeSchedulingGoodput}%</div>
                            <div className="text-[9px] text-slate-400">Orchestration Overhead</div>
                         </div>
                         <div className="p-2 bg-emerald-50/50 border border-emerald-100 rounded">
                            <div className="text-[9px] text-slate-500 uppercase tracking-wide font-bold">Runtime Goodput</div>
                            <div className="text-sm font-medium text-slate-900 mt-0.5">{gkeRuntimeGoodput}%</div>
                            <div className="text-[9px] text-slate-400">Workload Efficiency</div>
                         </div>
                      </div>
                    )}

                    {/* Basic Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-2 bg-slate-50 border border-slate-100 rounded">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide">Step Time</div>
                          <div className="text-base font-medium text-slate-900">5.12 ms <span className="text-[10px] text-slate-400 font-normal">/ step</span></div>
                       </div>
                       <div className="p-2 bg-slate-50 border border-slate-100 rounded">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide">Throughput</div>
                          <div className="text-base font-medium text-slate-900">4,200 <span className="text-[10px] text-slate-400 font-normal">tokens/s</span></div>
                       </div>
                    </div>
                </div>
             </div>
          )}
      </div>

      {/* --- PROFILING & DIAGNOSTICS (PDF Requirement) --- */}
      <h3 className="text-sm font-normal text-slate-900 pt-2">Profiling & Diagnostics</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Card 1: Main Diagnostics */}
         <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4 lg:col-span-2">
            <div className="flex justify-between items-start mb-3">
               <div>
                  <h4 className="font-medium text-slate-900 text-sm">Deep-dive Analysis</h4>
                  <p className="text-xs text-slate-500">Access advanced profiling tools for root cause analysis.</p>
               </div>
            </div>
            
            {/* NEW CHART GRID */}
            <div className="grid grid-cols-2 gap-4">
                {/* TensorBoard Chart Preview */}
                <div 
                  onClick={onViewDiagnostics}
                  className="bg-slate-50 border border-slate-200 rounded p-3 hover:border-[#1967D2] hover:bg-white hover:shadow-md cursor-pointer transition-all group"
                >
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-orange-100 text-orange-600 rounded">
                                <LayoutDashboard size={14} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-[#1967D2]">TensorBoard</span>
                        </div>
                        <ExternalLink size={12} className="text-slate-400 group-hover:text-[#1967D2]" />
                    </div>
                    {/* Enhanced TensorBoard Chart */}
                    <div className="h-36 w-full bg-white rounded border border-slate-100 mb-2 p-2">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                            <LineChart data={LOSS_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="step" 
                                    tick={{fontSize: 9, fill: '#94a3b8'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    minTickGap={20}
                                />
                                <YAxis 
                                    domain={['dataMin', 'dataMax']} 
                                    hide={false} 
                                    tick={{fontSize: 9, fill: '#94a3b8'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={25}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '4px', fontSize: '10px', padding: '4px' }}
                                    itemStyle={{ color: '#ea580c' }}
                                    formatter={(val) => [val, 'Loss']}
                                    labelFormatter={(label) => `Step ${label}`}
                                />
                                <Line type="monotone" dataKey="loss" stroke="#ea580c" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                        <span>Metric: Training Loss</span>
                        <span className="text-slate-700 font-mono">0.82</span>
                    </div>
                </div>

                {/* xProf Chart Preview */}
                <div 
                  onClick={onViewDiagnostics}
                  className="bg-slate-50 border border-slate-200 rounded p-3 hover:border-[#1967D2] hover:bg-white hover:shadow-md cursor-pointer transition-all group"
                >
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-purple-100 text-purple-600 rounded">
                                <Microscope size={14} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-[#1967D2]">xProf</span>
                        </div>
                        <ExternalLink size={12} className="text-slate-400 group-hover:text-[#1967D2]" />
                    </div>
                    {/* Enhanced xProf Chart */}
                    <div className="h-36 w-full bg-white rounded border border-slate-100 mb-2 p-2">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                            <BarChart data={PROFILE_DATA} layout="vertical" barSize={10} margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    type="category" 
                                    dataKey="step" 
                                    tick={{fontSize: 9, fill: '#64748b'}} 
                                    width={55} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '4px', fontSize: '10px', padding: '4px' }} 
                                />
                                <Bar dataKey="compute" stackId="a" fill="#3b82f6" radius={[0,0,0,0]} name="Compute" />
                                <Bar dataKey="comm" stackId="a" fill="#eab308" radius={[0,0,0,0]} name="Comm" />
                                <Bar dataKey="idle" stackId="a" fill="#ef4444" radius={[0,2,2,0]} name="Idle" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-start gap-3 text-[9px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Compute</span>
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> Comm</span>
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Idle</span>
                    </div>
                </div>
            </div>
         </div>

         {/* Card 2: Logs Preview */}
         <div className="bg-white border border-slate-200 rounded-md shadow-sm p-0 flex flex-col">
             <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
                <h4 className="font-medium text-slate-900 text-xs">Recent Events</h4>
             </div>
             <div className="p-0 flex-1 overflow-y-auto max-h-[120px]">
                <table className="w-full text-left text-[10px]">
                   <tbody className="divide-y divide-slate-100">
                      <tr>
                         <td className="px-4 py-2 text-slate-500">10:45:00</td>
                         <td className="px-4 py-2 font-medium text-emerald-600">Checkpoint Saved</td>
                      </tr>
                      <tr>
                         <td className="px-4 py-2 text-slate-500">10:42:05</td>
                         <td className="px-4 py-2 font-medium text-amber-600">Network Flap (Recovered)</td>
                      </tr>
                      {job.status === JobStatus.FAILED && (
                        <tr>
                           <td className="px-4 py-2 text-slate-500">10:40:00</td>
                           <td className="px-4 py-2 font-bold text-rose-600">Node Failure</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
             <div className="p-2 border-t border-slate-200 text-center">
                <button className="text-xs font-medium text-[#1967D2] hover:underline">View all logs</button>
             </div>
         </div>
      </div>

      {/* --- RUNS HISTORY --- */}
      <h3 className="text-sm font-normal text-slate-900 pt-2">Run History</h3>
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mb-6">
         <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
               <tr>
                  <th className="px-4 py-2 w-8">Status</th>
                  <th className="px-4 py-2">Run ID</th>
                  <th className="px-4 py-2">Run Group</th>
                  <th className="px-4 py-2">Monitoring</th>
                  <th className="px-4 py-2">TPU Util</th>
                  <th className="px-4 py-2">Throughput</th>
                  <th className="px-4 py-2">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
               <tr className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    {job.status === JobStatus.RUNNING ? <Play size={16} className="text-emerald-600" /> : 
                     job.status === JobStatus.FAILED ? <AlertOctagon size={16} className="text-rose-600" /> :
                     job.status === JobStatus.HANGING ? <AlertTriangle size={16} className="text-amber-600" /> :
                     <CheckCircle2 size={16} className="text-slate-400" />}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-900">{job.recentRun || `run-${job.id}-latest`}</td>
                  <td className="px-4 py-2 text-slate-600">{job.jobType === 'LLM Training' ? 'nightly-training' : 'standard-run'}</td>
                  <td className="px-4 py-2">
                      {job.status === JobStatus.HANGING ? <span className="text-rose-600 flex items-center gap-1"><AlertOctagon size={12}/> Hang detected</span> : 
                       job.status === JobStatus.FAILED ? <span className="text-rose-600 flex items-center gap-1"><AlertTriangle size={12}/> Failed</span> :
                       <span className="text-emerald-600 flex items-center gap-1"><Activity size={12}/> Active</span>}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{job.tensorCoreUtil}%</td>
                  <td className="px-4 py-2 text-slate-600">4,200 tokens/s</td>
                  <td className="px-4 py-2"><button onClick={onViewDiagnostics} className="text-[#1967D2] hover:underline font-medium">View</button></td>
               </tr>
               <tr className="hover:bg-slate-50">
                  <td className="px-4 py-2"><CheckCircle2 size={16} className="text-emerald-600" /></td>
                  <td className="px-4 py-2 font-medium text-slate-600">run-20241024-alpha-02</td>
                  <td className="px-4 py-2 text-slate-600">nightly-training</td>
                  <td className="px-4 py-2 text-slate-500">Complete</td>
                  <td className="px-4 py-2 text-slate-600">89%</td>
                  <td className="px-4 py-2 text-slate-600">4,150 tokens/s</td>
                  <td className="px-4 py-2"><button onClick={onViewDiagnostics} className="text-[#1967D2] hover:underline font-medium">View</button></td>
               </tr>
               <tr className="hover:bg-slate-50">
                   <td className="px-4 py-2"><AlertOctagon size={16} className="text-rose-600" /></td>
                   <td className="px-4 py-2 font-medium text-slate-600">run-20241023-alpha-01</td>
                   <td className="px-4 py-2 text-slate-600">nightly-training</td>
                   <td className="px-4 py-2 text-slate-500">Failed (OOM)</td>
                   <td className="px-4 py-2 text-slate-600">45%</td>
                   <td className="px-4 py-2 text-slate-600">-</td>
                   <td className="px-4 py-2"><button onClick={onViewDiagnostics} className="text-[#1967D2] hover:underline font-medium">View</button></td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
};
