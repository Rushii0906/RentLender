"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface ExpiryChartProps {
  data: {
    range: string;
    agreements: number;
  }[];
}

export default function ExpiryChart({ data }: ExpiryChartProps) {
  return (
    <div className="w-full h-80 bg-white border border-surface-border p-5 rounded-xl">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
        90-Day Expiry Forecast
      </h2>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E7" />
            <XAxis 
              dataKey="range" 
              stroke="#6B7280" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: "#F7F7F8" }}
              contentStyle={{ 
                backgroundColor: "#FFFFFF", 
                borderColor: "#E5E5E7", 
                borderRadius: "8px", 
                fontSize: "12px" 
              }}
            />
            <Bar 
              dataKey="agreements" 
              fill="#F5B301" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
