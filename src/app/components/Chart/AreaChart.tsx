import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Line, Dot } from 'recharts';
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

const AreaChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value", isCurrency = false }) => {
    return (
        <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                    <defs>
                        <linearGradient id="colorMatrix" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#01f4cb" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                        </linearGradient>
                    </defs>
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
                    <Line
                        name="Rewards Earned By Day"
                        type="monotone"
                        dataKey="totalRewardsEarned"
                        stroke="#01f4cb"
                        dot={{ fill: '#01f4cb', r: 3 }}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke="#01f4cb"
                        fillOpacity={1}
                        fill="url(#colorMatrix)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AreaChartComponent;
