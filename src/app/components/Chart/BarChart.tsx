import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DataPoint } from '@/app/types';
import { formatDate, formatNumber, formatCurrency, formatLabel } from '@/lib/utils';
import './Chart.css';

interface ChartProps {
    data: DataPoint[];
    dataKey: string;
    title: string;
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

const BarChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value", title, isCurrency = false }) => (
    <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300} minWidth={660}>
            <BarChart data={data} margin={{ top: 50, right: 30, left: 20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorMatrixBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(1, 244, 203, 0.5)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="rgba(117, 122, 128, 1)"
                    style={{ fontSize: '1.0rem' }}
                    tick={{ transform: 'translate(0, 10)' }}
                />
                <YAxis
                    tickFormatter={isCurrency ? formatCurrency : formatNumber}
                    stroke="rgba(117, 122, 128, 1)"
                    style={{ fontSize: '1.0rem' }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#01f4cc35" strokeWidth={0.5} />
                <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
                {title && (
                    <text x={20} y={15} fill="rgba(188, 191, 194, 1)" fontSize="15px" >
                        {title}
                    </text>
                )}
                <Bar dataKey={dataKey} fill="url(#colorMatrixBar)" />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default BarChartComponent;
