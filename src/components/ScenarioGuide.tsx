
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, X, AlertCircle, CheckCircle2, Play, Server, Zap, Activity, Layers, GripVertical, Camera } from 'lucide-react';

export interface ScenarioStep {
  title: string;
  content: React.ReactNode;
  actionLabel?: string;
}

export interface ScenarioDef {
  id: string;
  title: string;
  description: string;
  steps: ScenarioStep[];
}

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'job-failure',
    title: 'User Journey 1: Job Investigation',
    description: 'Top-Down investigation: From Job List to Straggler Detection.',
    steps: [
      {
        title: "Scenario: Sluggish Training Job",
        content: (
          <div>
            <p className="mb-3 text-slate-600">
              <strong>User Journey 1: The Job-Centric (Top-Down) Investigation</strong>
            </p>
            <p className="mb-3 text-slate-600">
               An ML engineer notices their training job is running slower than expected. They need to find out why.
            </p>
            <p className="text-slate-600">
              <strong>Objective:</strong> Trace a Goodput drop to a specific "Node Degraded" event and identify the root cause (Straggler).
            </p>
          </div>
        ),
        actionLabel: "Start Investigation"
      },
      {
        title: "Step 1: Identify the Problematic Job",
        content: (
          <div>
            <p className="mb-3 text-slate-600">
              Review the Jobs list to identify jobs in critical states.
            </p>
            <p className="mb-3 text-slate-600">
              Locate <strong>GPT-5-MoE-Training</strong> and observe its high-level metrics:
            </p>
            <ul className="list-disc pl-4 text-slate-600 space-y-1 text-xs mb-3">
              <li><strong>Status:</strong> Confirm if it is Hanging or Degraded.</li>
              <li><strong>Goodput:</strong> Check for low efficiency scores.</li>
            </ul>
             <div className="mt-2 bg-[#1967D2]/10 p-2 rounded border border-[#1967D2]/20 text-[#1557B0] text-xs">
               Select the job to view details.
            </div>
          </div>
        ),
        actionLabel: "View Jobs"
      },
      {
        title: "Step 2: Analyze Performance Context",
        content: (
          <div>
            <p className="mb-3 text-slate-600">
              Examine the <strong>Job Dashboard</strong> to understand the timeline of the failure.
            </p>
            <div className="space-y-2 text-xs text-slate-600">
               <div className="flex gap-2">
                  <Activity size={14} className="shrink-0 text-[#1967D2]" />
                  <span><strong>Timeline Analysis:</strong> Look for where the ML Productivity Goodput drops unexpectedly.</span>
               </div>
               <div className="flex gap-2">
                  <Layers size={14} className="shrink-0 text-[#1967D2]" />
                  <span><strong>Event Correlation:</strong> Check if any system events coincide with the performance drop.</span>
               </div>
            </div>
            <p className="mt-3 text-slate-600 text-sm">
              Proceed to diagnostics to pinpoint the error.
            </p>
          </div>
        ),
        actionLabel: "View Details"
      },
      {
        title: "Step 3: Determine Root Cause",
        content: (
          <div>
            <p className="mb-3 text-slate-600">
              Investigate the specific diagnostics findings.
            </p>
            <ul className="list-disc pl-4 text-slate-600 space-y-2 text-xs">
              <li>
                <strong>Event Marker:</strong> Confirm the "Node Degraded" timestamp matches the Goodput drop.
              </li>
              <li>
                <strong>Automated Diagnosis:</strong> Review the system-generated RCA to confirm if the issue is a "Straggler" or hardware failure.
              </li>
            </ul>
          </div>
        ),
        actionLabel: "Finish"
      }
    ]
  },
  {
    id: 'infra-failure',
    title: 'User Journey 2: Infrastructure Audit',
    description: 'Bottom-Up audit: From Fleet View to Job Impact.',
    steps: [
      {
        title: "Scenario: Infrastructure-Centric Audit",
        content: (
          <div>
            <p className="mb-3 text-slate-600">
              <strong>User Journey 2: The Infrastructure-Centric (Bottom-Up) Audit</strong>
            </p>
            <p className="mb-3 text-slate-600">
              A Platform Admin wants to assess the health of their TPU fleet and identify hardware impacting production.
            </p>
            <p className="text-slate-600">
              <strong>Objective:</strong> Identify degraded infrastructure and map it to the impacted jobs.
            </p>
          </div>
        ),
        actionLabel: "Start Audit"
      },
      {
        title: "Step 1: Assess Fleet-Wide Health",
        content: (
          <div>
            <p className="mb-3 text-slate-600">
              Navigate to the <strong>Fleet Efficiency</strong> view.
            </p>
            <p className="mb-3 text-slate-600">
              Review high-level KPIs across Slurm, GKE, and GCE to identify efficiency gaps.
            </p>
            <ul className="list-disc pl-4 text-slate-600 space-y-1 text-xs mb-3">
               <li><strong>Availability Rate:</strong> Are chips falling offline?</li>
               <li><strong>Utilization Rate:</strong> Is capacity being wasted?</li>
            </ul>
          </div>
        ),
        actionLabel: "View Fleet"
      },
      {
        title: "Step 2: Target Degraded Infrastructure",
        content: (
          <div>
             <p className="mb-3 text-slate-600">
               Locate the specific hardware slice or partition showing signs of degradation.
             </p>
             <p className="mb-3 text-slate-600">
                Look for the <span className="font-bold text-amber-600">Warning</span> status in the "Least Available" or "Least Utilized" lists to find the bottleneck.
             </p>
          </div>
        ),
        actionLabel: "Investigate Slice"
      },
      {
        title: "Step 3: Isolate Hardware Failure",
        content: (
          <div>
             <p className="mb-3 text-slate-600">
               Drill down to the individual Node level to find the culprit.
             </p>
             <ul className="list-disc pl-4 text-slate-600 space-y-1 text-xs mb-3">
               <li>Identify the specific node ID marked as Unhealthy.</li>
               <li>Note the specific error code (e.g., Hang Detected).</li>
               <li>Identify the Job ID currently running on this compromised node.</li>
             </ul>
          </div>
        ),
        actionLabel: "View Impact"
      },
      {
         title: "Step 4: Verify Job Impact",
         content: (
            <div>
               <p className="mb-3 text-slate-600">
                 Follow the Job ID link to the <strong>Job Dashboard</strong>.
               </p>
               <p className="text-slate-600">
                 Confirm that the hardware failure identified in the previous step corresponds to a critical failure or stall in the application layer.
               </p>
            </div>
         ),
         actionLabel: "Finish"
      }
    ]
  }
];

interface ScenarioGuideProps {
  scenario: ScenarioDef;
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  autoCapture: boolean;
  onToggleAutoCapture: () => void;
  isCapturing: boolean;
}

export const ScenarioGuide: React.FC<ScenarioGuideProps> = ({ 
  scenario, 
  step, 
  onNext, 
  onPrev, 
  onClose,
  autoCapture,
  onToggleAutoCapture,
  isCapturing
}) => {
  const steps = scenario.steps;
  const currentStepData = steps[step] || steps[0];

  // Draggable Logic
  const [position, setPosition] = useState<{x: number, y: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // If first time dragging (position is null), calculate initial position based on current rect
      if (!position) {
         // We are 'catching' it from its CSS fixed position
         setPosition({ x: rect.left, y: rect.top });
      }
      
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Style Calculation: Use fixed CSS class initially, then inline styles once dragged
  const style: React.CSSProperties = position 
    ? { 
        position: 'fixed', 
        left: position.x, 
        top: position.y,
        bottom: 'auto',
        right: 'auto'
      } 
    : {};

  return (
    <div 
      ref={panelRef}
      className={`fixed ${!position ? 'right-6 bottom-6' : ''} w-80 bg-white border border-[#1967D2]/20 shadow-xl rounded-xl z-50 animate-fadeIn overflow-hidden`}
      style={style}
      data-html2canvas-ignore="true" // Ignore this element when taking screenshots
    >
      {/* Header (Drag Handle) */}
      <div 
        className="bg-[#1967D2] px-4 py-3 flex justify-between items-center cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <GripVertical size={14} className="text-[#1967D2]/30" /> 
          {scenario.title}
        </h3>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="text-white hover:text-white/80 transition-colors"
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking close
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-100 w-full flex">
         {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-full flex-1 transition-colors ${idx <= step ? 'bg-[#1967D2]' : 'bg-slate-200'}`}
            />
         ))}
      </div>

      {/* Content */}
      <div className="p-5">
         <div className="text-xs font-bold text-[#1967D2] uppercase tracking-wider mb-2">
           Step {step + 1} of {steps.length}
         </div>
         <h4 className="text-lg font-bold text-slate-900 mb-3">
           {currentStepData.title}
         </h4>
         <div className="text-sm text-slate-600 leading-relaxed mb-6">
           {currentStepData.content}
         </div>

         {/* Navigation */}
         <div className="flex justify-between items-center mt-auto">
            {/* Auto Capture Toggle */}
            <button
              onClick={onToggleAutoCapture}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors border px-2 py-1 rounded ${
                autoCapture ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-400 border-transparent hover:bg-slate-50'
              }`}
              title="Automatically save a screenshot of each step"
            >
              <Camera size={14} className={autoCapture ? 'fill-indigo-700' : ''} />
              {autoCapture ? 'Auto-save ON' : 'Auto-save'}
            </button>

            <div className="flex gap-2">
              <button 
                onClick={onPrev} 
                disabled={step === 0 || isCapturing}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors p-2"
              >
                <ArrowLeft size={20} />
              </button>
              
              {step < steps.length - 1 ? (
                <button 
                  onClick={onNext} 
                  disabled={isCapturing}
                  className={`bg-[#1967D2] hover:bg-[#1557B0] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm ${isCapturing ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isCapturing ? 'Saving...' : (currentStepData.actionLabel || "Next")} {!isCapturing && <ArrowRight size={16} />}
                </button>
              ) : (
                <button 
                  onClick={onClose} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                  Complete <CheckCircle2 size={16} />
                </button>
              )}
            </div>
         </div>
      </div>
    </div>
  );
};
