
import React from 'react';
import { Info, ChevronUp, ChevronDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = "", action }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-md p-3 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-2">
          {title && <h3 className="text-slate-500 font-semibold text-xs tracking-wider uppercase">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

interface TableHeaderProps {
  label: string;
  tooltip?: string;
  className?: string;
  sortable?: boolean;
  sorted?: boolean;
  ascending?: boolean;
  onClick?: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ label, tooltip, className = "", sortable, sorted, ascending, onClick }) => (
  <th onClick={onClick} className={`px-4 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider group relative ${className} ${sortable ? 'cursor-pointer' : ''}`}>
        <div className={`flex items-center gap-1.5 ${tooltip ? 'cursor-help' : ''} w-fit`}>
            {label}
      {tooltip && <Info size={12} className="text-slate-400 opacity-70 group-hover:opacity-100 transition-opacity" />}
      {sortable && (
        <div className="w-4 h-4 flex items-center justify-center">
          {sorted ? (
            ascending ? <ChevronUp size={12} className="text-slate-600" /> : <ChevronDown size={12} className="text-slate-600" />
          ) : (
            <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600" />
          )}
        </div>
      )}
    </div>
    {tooltip && (
      <div className="absolute top-6 left-0 w-56 bg-white text-slate-700 text-[10px] p-2 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 font-normal normal-case leading-relaxed pointer-events-none border border-slate-200">
        {tooltip}
        <div className="absolute -top-1 left-4 w-2 h-2 bg-white border-t border-l border-slate-200 rotate-45"></div>
      </div>
    )}
  </th>
);

// --- MINI CHARTS ---

export const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = "#6366f1" }) => {
  const chartData = data.map((val, i) => ({ i, val }));
  return (
    <div className="h-8 w-16">
      <AreaChart width={64} height={32} data={chartData}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="val" 
          stroke={color} 
          fill={`url(#gradient-${color})`} 
          strokeWidth={1.5} 
          isAnimationActive={true}
        />
      </AreaChart>
    </div>
  );
};

export const MiniGauge: React.FC<{ value: number; color?: string }> = ({ value, color = "#10b981" }) => {
  const data = [{ name: 'val', value: value, fill: color }];
  
  return (
    <div className="h-10 w-10 relative flex items-center justify-center">
       <RadialBarChart 
          width={40}
          height={40}
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={4} 
          data={[{ name: 'track', value: 100, fill: '#f1f5f9' }]} 
          startAngle={90} 
          endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={10} />
        </RadialBarChart>
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <RadialBarChart 
            width={40}
            height={40}
            innerRadius="70%" 
            outerRadius="100%" 
            barSize={4} 
            data={data} 
            startAngle={90} 
            endAngle={90 - (360 * value / 100)}
          >
            <RadialBar dataKey="value" cornerRadius={10} />
          </RadialBarChart>
       </div>
    </div>
  );
};

export const MiniDonut: React.FC<{ value: number; max: number; color?: string }> = ({ value, max, color = "#4f46e5" }) => {
  const data = [
    { name: 'value', value: value },
    { name: 'rest', value: max - value }
  ];
  const COLORS = [color, '#f1f5f9'];

  return (
    <div className="h-10 w-10">
      <PieChart width={40} height={40}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={12}
          outerRadius={20}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
};

export const DonutChart: React.FC<{ 
  data: { name: string; value: number; color: string }[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
}> = ({ data, size = 100, innerRadius = 30, outerRadius = 45 }) => {
  return (
    <div className="flex items-center gap-4">
      <div style={{ width: size, height: size }}>
        <PieChart width={size} height={size}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div className="flex flex-col gap-1.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-medium text-slate-500 truncate max-w-[80px]">{item.name}</span>
            <span className="text-[10px] font-bold text-slate-900 ml-auto">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- STAT CARD ---

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  visual?: React.ReactNode; // NEW: Accepts a chart
  onClick?: () => void;
  className?: string;
  tooltip?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendUp, icon, visual, onClick, className = "", tooltip }) => (
  <div 
    onClick={onClick}
    className={`bg-white border border-slate-200 rounded-md p-3 shadow-sm relative group ${className} ${onClick ? 'cursor-pointer hover:shadow-md hover:border-[#1967D2]/50 transition-all' : ''}`}
  >
    {tooltip && (
        <div 
          className="absolute top-2 right-2 z-30 group/tooltip"
          onClick={(e) => e.stopPropagation()}
        >
             <div className="bg-slate-100 rounded-full">
               <Info size={12} className="text-slate-500 hover:text-[#1967D2] cursor-help transition-colors" />
             </div>
             <div className="absolute right-0 w-56 bg-white text-slate-700 text-[10px] p-2 rounded shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 translate-y-1 text-left font-normal normal-case leading-relaxed pointer-events-none border border-slate-200">
                {tooltip}
                <div className="absolute -top-1 right-1.5 w-2 h-2 bg-white border-t border-l border-slate-200 rotate-45"></div>
             </div>
        </div>
    )}

    <div className="flex justify-between items-start relative z-10 pointer-events-none">
      <div className="pointer-events-auto">
        <p className="text-slate-500 text-xs font-medium mb-0.5 pr-4 truncate">{label}</p>
        <h4 className="text-xl font-bold text-slate-900 leading-tight">{value}</h4>
        {trend && (
          <div className="mt-1 text-[10px] font-medium">
            <span className={`${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>{trend}</span> <span className="text-slate-500 ml-0.5">vs last 24h</span>
          </div>
        )}
      </div>
      
      {/* Render Visualization OR Icon */}
      <div className="pointer-events-auto pl-2">
        {visual ? (
          visual
        ) : icon ? (
          <div className={`p-1.5 rounded-md transition-colors ${onClick ? 'text-[#1967D2] bg-[#1967D2]/10 group-hover:bg-[#1967D2]/20 group-hover:text-[#1557B0]' : 'text-[#1967D2] bg-[#1967D2]/10'}`}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
          </div>
        ) : null}
      </div>
    </div>
    
    {onClick && (
       <div className="absolute inset-0 bg-[#1967D2]/5 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-md" />
    )}
  </div>
);
