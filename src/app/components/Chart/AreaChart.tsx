import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Line } from 'recharts';
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
                <p className="value" style={{ color: '#01f4cb' }}>{value}</p>
            </div>
        );
    }

    return null;
};

const AreaChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value", isCurrency = false }) => (
    <div className="chart-wrapper" style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '10px', border: '2px solid #01f4cb' }}>
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorMatrix" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#01f4cb" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#000000" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#ccc" />
                <YAxis tickFormatter={isCurrency ? formatCurrency : formatNumber} stroke="#ccc" />
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />
                <Legend />
                <Line name="Rewards Earned By Day" type="monotone" dataKey="totalRewardsEarned" stroke="#01f4cb" />
                <Area type="monotone" dataKey={dataKey} stroke="#01f4cb" fillOpacity={1} fill="url(#colorMatrix)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export default AreaChartComponent;
