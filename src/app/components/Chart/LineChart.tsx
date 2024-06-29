import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
            <div className="custom-tooltip">
                <p className="label">{`${formatDate(label)}`}</p>
                <p className="value">{value}</p>
            </div>
        );
    }

    return null;
};

const LineChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value", isCurrency = false }) => (
    <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#01f4cb"
                    style={{ fontSize: '1.0rem' }}
                    tick={{ transform: 'translate(0, 10)' }}
                />
                <YAxis
                    tickFormatter={isCurrency ? formatCurrency : formatNumber}
                    stroke="#01f4cb"
                    style={{ fontSize: '1.0rem' }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#01f4cc35" strokeWidth={0.5} />
                <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
                <Legend formatter={(value) => formatLabel(value)} wrapperStyle={{ bottom: 2 }} />
                <Line type="monotone" dataKey={dataKey} stroke="#01f4cb" dot={{ fill: '#01f4cb', r: 3 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default LineChartComponent;
