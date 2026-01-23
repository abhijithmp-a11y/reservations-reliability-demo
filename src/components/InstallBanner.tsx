
import React, { useState } from 'react';
import { Download, Terminal, CheckCircle2 } from 'lucide-react';

export const InstallBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-[#1967D2]/5 to-purple-50 border border-[#1967D2]/20 rounded-lg p-6 mb-8 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Terminal size={120} className="text-[#1557B0]" />
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold text-[#1557B0] flex items-center gap-2">
            <Download size={20} className="text-[#1967D2]" />
            Install Diagon SDK for Full Fidelity
          </h3>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Unlock <strong>ML Productivity Goodput</strong> metrics, precise <strong>step-time analysis</strong>, and real-time <strong>TensorCore utilization</strong> tracking. Move beyond basic GKE metrics.
          </p>
          <div className="flex gap-4 mt-3 text-sm text-slate-600">
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600"/> Enables Step Time</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600"/> TensorCore Metrics</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600"/> Granular Interruptions</span>
          </div>
        </div>
        
        <div className="flex gap-3">
           <div className="bg-white border border-[#1967D2]/20 shadow-sm rounded px-3 py-2 font-mono text-sm text-[#1557B0]">
             pip install diagon-sdk
           </div>
           <button className="bg-[#1967D2] hover:bg-[#1557B0] text-white px-4 py-2 rounded-md font-medium transition-colors text-sm shadow-sm">
             View Docs
           </button>
        </div>
      </div>
    </div>
  );
};
