import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { DataPoint } from '@/app/types';

interface ChartProps {
    data: DataPoint[];
    dataKey: string;
}

const RadarChartComponent: React.FC<ChartProps> = ({ data, dataKey }) => (
    <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#ccc" />
                <PolarAngleAxis dataKey="date" />
                <PolarRadiusAxis angle={30} domain={[0, 150]} />
                <Radar name="Data" dataKey={dataKey} stroke="#01f4cb" fill="#01f4cb" fillOpacity={0.6} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '10px', color: '#fff' }}
                    itemStyle={{ color: '#01f4cb' }}
                    labelStyle={{ color: '#fff' }}
                />
            </RadarChart>
        </ResponsiveContainer>
    </div>
);

export default RadarChartComponent;
