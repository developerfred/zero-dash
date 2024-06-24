import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint } from '@/app/types';

interface ChartProps {
    data: DataPoint[];
    dataKey: string;
}

const LineChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value" }) => (
    <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <Line type="monotone" dataKey={dataKey} stroke="#01f4cb" />
                <CartesianGrid stroke="#cccccc1d" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '10px', color: '#fff' }}
                    itemStyle={{ color: '#01f4cb' }}
                    labelStyle={{ color: '#fff' }}
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default LineChartComponent;
