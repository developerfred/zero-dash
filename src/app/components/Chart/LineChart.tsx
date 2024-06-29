import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DataPoint } from '@/app/types';
import { formatDate, formatNumber, formatCurrency, formatLabel } from '@/lib/utils';

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

const LineChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value", isCurrency = false }) => (
    <div className="chart-wrapper" style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '10px', border: '2px solid #01f4cb' }}>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#ccc" />
                <YAxis tickFormatter={isCurrency ? formatCurrency : formatNumber} stroke="#ccc" />
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
                <Legend formatter={(value) => formatLabel(value)} /> 
                <Line type="monotone" dataKey={dataKey} stroke="#01f4cb" />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default LineChartComponent;
