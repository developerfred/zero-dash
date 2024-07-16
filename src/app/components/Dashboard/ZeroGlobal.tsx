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
                    <Card title="Active users" value={totals.dailyActiveUsers} isLoading={isLoadingDashboard} />
                    <Card title="Messages sent" value={totals.totalMessagesSent} isLoading={isLoadingDashboard} />
                    <Card title="Registrations" value={totals.userSignUps} isLoading={isLoadingDashboard} />
                    <Card title="Rewards earned" value={totals.totalRewardsEarned} isLoading={isLoadingDashboard} />
                </div>
                <div className="charts">
                    <div className="chart-row">                                                           
                        <Chart data={zosData} dataKey="dailyActiveUsers" chartType="area" title="Active users" isCurrency={false} isHourly={isHourly} />                                                     
                        <Chart data={zosData} dataKey="totalMessagesSent" chartType="area" title="Messages sent" isCurrency={false} isHourly={isHourly} />                            
                    </div>
                    <div className="chart-row">                            
                        <Chart data={zosData} dataKey="userSignUps" chartType="area" title="Registrations" isCurrency={false} isHourly={isHourly} />                                                        
                        <Chart data={rewardsData} dataKey="totalRewardsEarned" chartType="area" isCurrency={true} title="Rewards earned" isHourly={isHourly} />
                        
                    </div>
                </div>
            </div>            
        </div>
    );
};

export default ZeroGlobal;
