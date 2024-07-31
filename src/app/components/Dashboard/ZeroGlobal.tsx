// @ts-nocheck

import React, { useEffect } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import useZeroGlobalStore from '@/store/useZeroGlobalStore';

const ZeroGlobal: React.FC = () => {
    const { totals, zosData, filter, setFilter, fetchDashboardDataByFilter, isLoadingDashboard, rewardsData, cardTotals, fetchCardData, isLoadingCards } = useDashboardStore();
    
    useEffect(() => {
        setFilter('7d');
    }, [setFilter]);

    useEffect(() => {
        fetchDashboardDataByFilter(filter);
        fetchCardData(filter);
    }, [filter, fetchDashboardDataByFilter, fetchCardData]);
    
    const isHourly = filter === '24h' || filter === '48h';
    const isQuickFilter = ['24h', '48h', '7d'].includes(filter);    
    return (
        <div className="section">                       
            <div className="zero-global">                    
                <div className="cards">
                    <Card
                        title="Active users"
                        value={isQuickFilter ? cardTotals.dailyActiveUsers : totals.dailyActiveUsers}
                        isLoading={isQuickFilter ? isLoadingCards : isLoadingDashboard}
                    />
                    <Card
                        title="Messages sent"
                        value={isQuickFilter ? cardTotals.totalMessagesSent : totals.totalMessagesSent}
                        isLoading={isQuickFilter ? isLoadingCards : isLoadingDashboard}
                    />
                    <Card
                        title="Registrations"
                        value={isQuickFilter ? cardTotals.userSignUps : totals.userSignUps}
                        isLoading={isQuickFilter ? isLoadingCards : isLoadingDashboard}
                    />
                    <Card title="Rewards earned" value={totals.totalRewardsEarned} isLoading={isLoadingDashboard} />
                </div>
                <div className="charts">
                    <div className="chart-row">                                                           
                        <Chart data={zosData} dataKey="dailyActiveUsers" chartType="area" title="Active users" isCurrency={false} isHourly={isHourly} />                                                     
                        <Chart data={zosData} dataKey="totalMessagesSent" chartType="area" title="Messages sent" isCurrency={false} isHourly={isHourly} />                            
                    </div>
                    <div className="chart-row">                            
                        <Chart data={zosData} dataKey="userSignUps" chartType="area" title="Registrations" isCurrency={false} isHourly={isHourly} />                                                        
                        <Chart data={zosData} dataKey="totalRewardsEarned" chartType="area" isCurrency={true} title="Rewards earned" isHourly={isHourly} />
                        
                    </div>
                </div>
            </div>            
        </div>
    );
};

export default ZeroGlobal;
