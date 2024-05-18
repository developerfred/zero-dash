import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
    data: Array<{ date: string, [key: string]: number }>;
    dataKey: string;
}

const Chart: React.FC<ChartProps> = ({ data, dataKey }) => (
    <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <Line type="monotone" dataKey={dataKey} stroke="#01f4cb" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '10px', color: '#fff' }}
                    itemStyle={{ color: '#01f4cb' }}
                    labelStyle={{ color: '#fff' }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default Chart;
