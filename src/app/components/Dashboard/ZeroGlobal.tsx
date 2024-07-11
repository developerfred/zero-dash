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
    
    const isHourly = filter === '24h' || filter === '48h';
    return (
        <div className="section">                       
            <div className="zero-global">                    
                <div className="cards">
                    <Card title="Daily active users" value={totals.dailyActiveUsers} isLoading={isLoadingDashboard} />
                    <Card title="Total messages sent" value={totals.totalMessagesSent} isLoading={isLoadingDashboard} />
                    <Card title="User sign ups" value={totals.userSignUps} isLoading={isLoadingDashboard} />
                    <Card title="Total rewards earned" value={totals.totalRewardsEarned} isLoading={isLoadingDashboard} />
                </div>
                <div className="charts">
                    <div className="chart-row">                                                           
                        <Chart data={zosData} dataKey="dailyActiveUsers" chartType="area" title="Daily active users" isCurrency={false} isHourly={isHourly} />                                                     
                        <Chart data={zosData} dataKey="totalMessagesSent" chartType="area" title="Total messages sent" isCurrency={false} isHourly={isHourly} />                            
                    </div>
                    <div className="chart-row">                            
                        <Chart data={zosData} dataKey="userSignUps" chartType="area" title="User sign ups" isCurrency={false} isHourly={isHourly} />                                                        
                        <Chart data={rewardsData} dataKey="totalRewardsEarned" chartType="area" isCurrency={true} title="Total rewards earned" isHourly={isHourly} />
                        
                    </div>
                </div>
            </div>            
        </div>
    );
};

export default ZeroGlobal;
