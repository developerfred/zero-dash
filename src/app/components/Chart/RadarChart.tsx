import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DataPoint } from '@/app/types';
import { formatDate, formatNumber, formatCurrency } from '@/lib/utils';

interface ChartProps {
    data: DataPoint[];
    dataKey: string;
    isCurrency?: boolean;
}

const CustomTooltip = ({ active, payload, label, isCurrency }: any) => {
    if (active && payload && payload.length) {
        const value = isCurrency ? formatCurrency(payload[0].value) : formatNumber(payload[0].value);
        return (
            <div className="custom-tooltip" style={{ backgroundColor: '#333', border: 'none', borderRadius: '10px', color: '#fff', padding: '10px' }}>
                <p className="label" style={{ color: '#fff' }}>{`${formatDate(label)}`}</p>
                <p className="value" style={{ color: 'rgba(1, 244, 203, 1)' }}>{value}</p>
            </div>
        );
    }

    return null;
};

const RadarChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value", isCurrency = false }) => (
   
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="rgba(1, 244, 203, 1)" />
                <PolarAngleAxis dataKey="date" tickFormatter={(date) => formatDate(date) !== "Invalid Date" ? formatDate(date) : ""} stroke="#ccc" />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tickFormatter={isCurrency ? formatCurrency : formatNumber} stroke="#ccc" />
                <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
                <Legend />
                <Radar name="Data" dataKey={dataKey} stroke="rgba(1, 244, 203, 1)" fill="rgba(1, 244, 203, 1)" fillOpacity={0.6} />
            </RadarChart>
        </ResponsiveContainer>
    
);

export default RadarChartComponent;
