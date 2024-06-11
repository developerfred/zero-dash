import React, { useEffect } from 'react';
import useChartStore from '@/store/useChartStore';
import Filters from '@/components/Filters';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import useDashboardStore from '@/store/useDashboardStore';
import { formatUSD } from '@/app/lib/currencyUtils';

const MeowSection: React.FC = () => {
    const { chartData, fetchChartData, isLoadingChart } = useChartStore();
    const { filter, setFilter, fetchPairData, isLoadingPairData, pairData } = useDashboardStore();

    useEffect(() => {
        if (!filter) {
            console.error('Filter is undefined');
            return;
        }

        const now = new Date();
        let start: Date;

        switch (filter) {
            case '24h':
                start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '365d':
                start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            case 'today':
                start = new Date();
                start.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last_week':
                start = new Date(now.getTime() - (now.getDay() + 7) * 24 * 60 * 60 * 1000);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last_month':
                start = new Date();
                start.setMonth(now.getMonth() - 1);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last_year':
                start = new Date();
                start.setFullYear(now.getFullYear() - 1);
                start.setHours(0, 0, 0, 0);
                break;
            default:
                if (filter.startsWith('custom')) {
                    const dates = filter.split('_');
                    start = new Date(dates[1]);
                    const end = new Date(dates[2]);
                    fetchChartData('ethereum:0x0ec78ed49c2d27b315d462d43b5bab94d2c79bf8', start, end);
                    return;
                } else {
                    throw new Error(`Invalid filter format: ${filter}`);
                }
        }

        fetchChartData('ethereum:0x0ec78ed49c2d27b315d462d43b5bab94d2c79bf8', start, now);
        fetchPairData();
    }, [filter, fetchChartData, fetchPairData]);

    const getVolume = (pairData: any, filter: string) => {
        if (!pairData || pairData.length === 0) return 0;

        switch (filter) {
            case '24h':
            case 'today':
            case 'yesterday':
                return pairData[0].one_day_volume;
            case '7d':
            case 'last_week':
                return pairData[0].seven_day_volume;
            case '30d':
            case 'last_month':
                return pairData[0].thirty_day_volume;
            case '90d':
                return pairData[0].thirty_day_volume * 3;
            case '365d':
            case 'last_year':
                return pairData[0].thirty_day_volume * 12;
            default:
                if (filter.startsWith('custom')) {
                    const days = (new Date(filter.split('_')[2]).getTime() - new Date(filter.split('_')[1]).getTime()) / (1000 * 60 * 60 * 24);
                    return pairData[0].thirty_day_volume / 30 * days;
                }
                return pairData[0].one_day_volume + pairData[0].seven_day_volume + pairData[0].thirty_day_volume;
        }
    };

    return (
        <div className="section">
            <h2 id="zero-meow">MEOW</h2>            
            <div className="zero-meow">
                <div className="cards">
                    <Card title="Token Price" value={formatUSD(chartData[0]?.price) || 0} isLoading={isLoadingChart} />
                    <Card title="Volume" value={formatUSD(getVolume(pairData, filter))} isLoading={isLoadingPairData} />
                </div>
                <div className="charts">
                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>Token Price Over Time</h3>
                            <Chart data={chartData} dataKey="price" chartType="area" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeowSection;
