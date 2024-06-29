import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint } from '@/app/types';
import { formatDate, formatCurrency } from '@/lib/utils';

interface ChartProps {
    data: DataPoint[];
    dataKey: string;
}


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{ backgroundColor: '#333', border: 'none', borderRadius: '10px', color: '#fff', padding: '10px' }}>
                <p className="label" style={{ color: '#fff' }}>{`${formatDate(label)}`}</p>
                <p className="value" style={{ color: '#01f4cb' }}>{formatCurrency(payload[0].value)}</p>
            </div>
        );
    }

    return null;
};

const AreaChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value" }) => (
    <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <Area type="monotone" dataKey={dataKey} stroke="#01f4cb" fill="#01f4cb" fillOpacity={0.6} />
                <CartesianGrid stroke="#cccccc1d" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export default AreaChartComponent;
