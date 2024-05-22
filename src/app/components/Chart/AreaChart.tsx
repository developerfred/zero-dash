import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint } from '@/app/types';

interface ChartProps {
    data: DataPoint[];
    dataKey: string;
}

const AreaChartComponent: React.FC<ChartProps> = ({ data, dataKey }) => (
    <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <Area type="monotone" dataKey={dataKey} stroke="#01f4cb" fill="#01f4cb" fillOpacity={0.6} />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '10px', color: '#fff' }}
                    itemStyle={{ color: '#01f4cb' }}
                    labelStyle={{ color: '#fff' }}
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export default AreaChartComponent;
