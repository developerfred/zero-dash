import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { DataPoint } from '@/app/types';
import { formatDate, formatNumber, formatCurrency, formatToMillion } from '@/lib/utils';
import './Chart.css';
import { HiEllipsisVertical } from "react-icons/hi2";

interface ChartProps {
    data: DataPoint[];
    dataKey: string;
    title: string;
    isCurrency?: boolean;
}

const CustomTooltip = ({ active, payload, label, isCurrency }: any) => {
    if (active && payload && payload.length) {
        const value = isCurrency ? formatToMillion(payload[0].value) : formatNumber(payload[0].value);
        return (
            <div className="custom-tooltip">
                <p className="label">{`${formatDate(label)}`}</p>
                <p className="value">{value}</p>
            </div>
        );
    }

    return null;
};

const AreaChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value", title, isCurrency = false }) => {
    return (
        <div className="chart-wrapper">
            <div className="chart-header">
                <h3 className="chart-title">{title}</h3>
                <HiEllipsisVertical className="chart-icon" />
            </div>
            <ResponsiveContainer width="100%" height={300} minWidth={300}>
                <AreaChart data={data} margin={{ top: 50, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorMatrix" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(1, 244, 203, 0.5)" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" stopOpacity={0} />
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
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke="rgba(1, 244, 203, 1)"
                        fillOpacity={1}
                        fill="url(#colorMatrix)"
                        dot={{ fill: '#01F4CB', r: 3 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AreaChartComponent;
