import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DataPoint } from '@/app/types';
import { formatDate, formatNumber, formatCurrency, formatLabel } from '@/lib/utils';
import './Chart.css';

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
                <p className="value" style={{ color: '#01f4cb' }}>{value}</p>
            </div>
        );
    }

    return null;
};

const BarChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value", isCurrency = false }) => (
    
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <defs>
                    <linearGradient id="colorMatrixBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#01f4cb" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#000000" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" tickFormatter={(date) => formatDate(date) !== "Invalid Date" ? formatDate(date) : ""} stroke="#ccc" />
                <YAxis tickFormatter={isCurrency ? formatCurrency : formatNumber} stroke="#ccc" />
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
                <Legend formatter={(value) => formatLabel(value)} />
                <Bar dataKey={dataKey} fill="url(#colorMatrixBar)" />
            </BarChart>
        </ResponsiveContainer>
    
);

export default BarChartComponent;
