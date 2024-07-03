import React, { useEffect } from 'react';
import useChartStore from '@/store/useChartStore';
import Filters from '@/components/Filters';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import useDashboardStore from '@/store/useDashboardStore';
import { formatUSD } from '@/app/lib/currencyUtils';

const MeowSection: React.FC = () => {
    const { chartData, fetchChartData, isLoadingChart } = useChartStore();
    const { filter, volume, holdersCount, lpHolderCount, isLoadingPairData, fetchMeowInfo, fetchTokenPrice, isInfoLoading } = useDashboardStore();

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
        fetchMeowInfo();        
    }, [filter, fetchChartData, fetchTokenPrice, fetchMeowInfo]);

    

    return (
        <div className="section">                     
            <div className="zero-meow">
                <div className="cards">
                    <Card title="Token Price" value={formatUSD(chartData[0]?.price) || 0} isLoading={isLoadingChart} />                     
                    <Card title="Holders" value={holdersCount} isLoading={isInfoLoading} />
                    <Card title="LP" value={lpHolderCount} isLoading={isInfoLoading} />
                </div>
                <div className="charts">
                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>Token Price Over Time</h3>
                            <Chart data={chartData} dataKey="price" chartType="area" isCurrency={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeowSection;
