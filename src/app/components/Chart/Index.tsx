import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { DataPoint } from '@/app/types';
import LineChartComponent from './LineChart';
import BarChartComponent from './BarChart';
import AreaChartComponent from './AreaChart';
import RadarChartComponent from './RadarChart';

interface ChartProps {
    data: DataPoint[];
    dataKey: string;
    chartType: 'line' | 'area' | 'bar' | 'radar';
}

const Chart: React.FC<ChartProps> = ({ data, dataKey, chartType }) => {
    const renderChart = (): React.ReactElement => {
        switch (chartType) {
            case 'line':
                return <LineChartComponent data={data} dataKey={dataKey} />;
            case 'area':
                return <AreaChartComponent data={data} dataKey={dataKey} />;
            case 'bar':
                return <BarChartComponent data={data} dataKey={dataKey} />;
            case 'radar':
                return <RadarChartComponent data={data} dataKey={dataKey} />;
            default:
                return <LineChartComponent data={data} dataKey={dataKey} />; 
        }
    };

    return (
        <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default Chart;
