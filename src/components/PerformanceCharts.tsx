
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ComposedChart,
  BarChart,
  Bar,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

// --- DATA SETS FOR TIME RANGES ---

// Goodput Data
const goodputDataHour = [
  { time: '15:00', value: 95 },
  { time: '15:10', value: 96 },
  { time: '15:20', value: 94 },
  { time: '15:30', value: 98 },
  { time: '15:40', value: 97 },
  { time: '15:50', value: 99 },
];

const goodputDataDay = [
  { time: '00:00', value: 88 },
  { time: '04:00', value: 90 },
  { time: '08:00', value: 92 },
  { time: '12:00', value: 94 },
  { time: '16:00', value: 91 },
  { time: '20:00', value: 95 },
  { time: '23:59', value: 93 },
];

const goodputDataWeek = [
  { time: 'Mon', value: 85 },
  { time: 'Tue', value: 88 },
  { time: 'Wed', value: 92 },
  { time: 'Thu', value: 89 },
  { time: 'Fri', value: 94 },
  { time: 'Sat', value: 96 },
  { time: 'Sun', value: 95 },
];

// Interruptions Data
const interruptionDataHour = [
  { date: '15:00', count: 0 },
  { date: '15:15', count: 0 },
  { date: '15:30', count: 1 },
  { date: '15:45', count: 0 },
];

const interruptionDataDay = [
  { date: '00-06h', count: 1 },
  { date: '06-12h', count: 3 },
  { date: '12-18h', count: 2 },
  { date: '18-24h', count: 1 },
];

const interruptionDataWeek = [
  { date: 'Mon', count: 2 },
  { date: 'Tue', count: 1 },
  { date: 'Wed', count: 5 },
  { date: 'Thu', count: 0 },
  { date: 'Fri', count: 3 },
  { date: 'Sat', count: 1 },
  { date: 'Sun', count: 0 },
];

// Other Static Data
const coreUsageData = [
  { step: 100, tensorCore: 45, gpuUtil: 80 },
  { step: 200, tensorCore: 55, gpuUtil: 85 },
  { step: 300, tensorCore: 80, gpuUtil: 95 },
  { step: 400, tensorCore: 82, gpuUtil: 96 },
  { step: 500, tensorCore: 12, gpuUtil: 20 }, // Drop/Stall
  { step: 600, tensorCore: 78, gpuUtil: 94 },
  { step: 700, tensorCore: 85, gpuUtil: 98 },
];

const stepTimeData = [
  { step: 1000, duration: 120, status: 'Normal' },
  { step: 1001, duration: 118, status: 'Normal' },
  { step: 1002, duration: 122, status: 'Normal' },
  { step: 1003, duration: 125, status: 'Normal' },
  { step: 1004, duration: 119, status: 'Normal' },
  { step: 1005, duration: 850, status: 'Warning' },
  { step: 1006, duration: 4500, status: 'Critical' },
  { step: 1007, duration: 28000, status: 'Hanging' },
  { step: 1008, duration: null, status: 'Timeout' }, // Flatline
];

interface ChartProps {
  timeRange?: string;
}

export const GoodputChart: React.FC<ChartProps> = ({ timeRange = 'Last 24 hours' }) => {
  let data = goodputDataDay;
  if (timeRange === 'Last 1 hour') data = goodputDataHour;
  else if (timeRange === 'Last 7 days' || timeRange === 'All time') data = goodputDataWeek;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGoodput" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[80, 100]} />
          <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', padding: '4px 8px' }}
              itemStyle={{ color: '#6366f1', fontWeight: 600 }}
              formatter={(value: number) => [`${value}%`, 'Goodput']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            name="Training Goodput" 
            stroke="#6366f1" 
            fill="url(#colorGoodput)" 
            strokeWidth={2} 
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const InterruptionsChart: React.FC<ChartProps> = ({ timeRange = 'Last 24 hours' }) => {
  let data = interruptionDataDay;
  if (timeRange === 'Last 1 hour') data = interruptionDataHour;
  else if (timeRange === 'Last 7 days' || timeRange === 'All time') data = interruptionDataWeek;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip 
            cursor={{fill: '#f1f5f9'}} 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', fontSize: '12px', padding: '4px 8px' }} 
          />
          <Bar dataKey="count" name="Interruptions" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TensorCoreChart: React.FC = () => (
  <div className="h-32 w-full">
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
      <LineChart data={coreUsageData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="step" stroke="#64748b" fontSize={10} />
        <YAxis stroke="#64748b" fontSize={10} />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', fontSize: '12px', padding: '4px 8px' }} />
        <Legend wrapperStyle={{ paddingTop: '0px', fontSize: '10px' }} />
        <Line type="monotone" dataKey="tensorCore" name="TensorCore %" stroke="#10b981" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="gpuUtil" name="GPU util %" stroke="#f59e0b" dot={false} strokeWidth={1} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const StepTimeChart: React.FC = () => (
  <div className="h-32 w-full">
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
      <LineChart data={stepTimeData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis 
          dataKey="step" 
          stroke="#64748b" 
          fontSize={10} 
          label={{ value: 'Training step', position: 'insideBottom', offset: -5, fontSize: 9 }}
        />
        <YAxis 
          stroke="#64748b" 
          fontSize={10} 
          label={{ value: 'Step time (ms)', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#64748b' }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', fontSize: '12px', padding: '4px 8px' }}
          formatter={(value: number) => [`${value} ms`, 'Duration']}
        />
        <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target (120ms)', fontSize: 9, fill: '#10b981', position: 'insideBottomRight' }} />
        <ReferenceLine x={1006} stroke="#f43f5e" label={{ value: 'Stall Detected', fontSize: 9, fill: '#f43f5e', angle: 90, position: 'insideLeft' }} />
        <Line type="stepAfter" dataKey="duration" name="Step duration" stroke="#f43f5e" dot={{r: 3}} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
