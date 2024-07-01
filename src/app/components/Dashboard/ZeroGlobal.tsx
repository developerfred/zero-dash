import React, { useEffect } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import useZeroGlobalStore from '@/store/useZeroGlobalStore';

const ZeroGlobal: React.FC = () => {
    const { totals, zosData, filter, setFilter, fetchDashboardDataByFilter, isLoadingDashboard, rewardsData } = useDashboardStore();
    
    useEffect(() => {
        setFilter('7d');
    }, [setFilter]);

    useEffect(() => {
        fetchDashboardDataByFilter(filter);
    }, [filter]);

    return (
        <div className="section">
            <h2 id="zero-global">ZERO Global</h2>            
                <div className="zero-global">
                    <div className="cards">
                    <Card title="Daily Active Users" value={totals.dailyActiveUsers} isLoading={isLoadingDashboard} />
                    <Card title="Total Messages Sent" value={totals.totalMessagesSent} isLoading={isLoadingDashboard} />
                    <Card title="User Sign Ups" value={totals.userSignUps} isLoading={isLoadingDashboard} />
                    <Card title="Total Rewards Earned" value={totals.totalRewardsEarned} isLoading={isLoadingDashboard} />
                    </div>
                    <div className="charts">
                        <div className="chart-row">
                            <div className="chart-container">
                                <h3>Daily Active Users</h3>
                                <Chart data={zosData} dataKey="dailyActiveUsers" chartType="line" />
                            </div>
                            <div className="chart-container">
                                <h3>Total Messages Sent</h3>
                                <Chart data={zosData} dataKey="totalMessagesSent" chartType="line" />
                            </div>
                        </div>
                        <div className="chart-row">
                            <div className="chart-container">
                                <h3>User Sign Ups</h3>
                                <Chart data={zosData} dataKey="userSignUps" chartType="line" />
                            </div>
                            <div className="chart-container">
                                <h3>Total Rewards Earned</h3>
                            <Chart data={rewardsData} dataKey="totalRewardsEarned" chartType="area" isCurrency={true} />
                            </div>
                        </div>
                    </div>
                </div>            
        </div>
    );
};

export default ZeroGlobal;
