// @ts-nocheck

import React, { useEffect } from 'react';
import useRacingStore from '@/store/useRacingStore';
import Filters from '@/components/Filters';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import useDashboardStore from '@/store/useDashboardStore';

const RacingSection: React.FC = () => {
    const { data, cardsData, rechartsData, fetchRacingData, isLoading } = useRacingStore();
    const { filter } = useDashboardStore();

    useEffect(() => {
        if (filter) {
            fetchRacingData(filter);
        }
    }, [filter, fetchRacingData]);

    return (
        <div className="section">            
            <div className="racing-metrics">
                <div className="cards">
                    <Card title="Total Players" value={cardsData.totalPlayers} isLoading={isLoading} />
                    <Card title="Total Solo Races" value={cardsData.totalSoloRaces} isLoading={isLoading} />
                    <Card title="Total Multiplayer Races" value={cardsData.totalMpRaces} isLoading={isLoading} />
                    <Card title="Total Laps" value={cardsData.totalLaps} isLoading={isLoading} />
                    <Card title="Average Lap Time" value={cardsData.averageLapTime} isLoading={isLoading} />
                    <Card title="Unique Players Count" value={cardsData.uniquePlayersCount} isLoading={isLoading} />
                    <Card title="Max Laps by a Player" value={cardsData.maxLapsPlayer} isLoading={isLoading} />
                    <Card title="Min Laps by a Player" value={cardsData.minLapsPlayer} isLoading={isLoading} />
                    <Card title="Average Laps per Player" value={cardsData.averageLapsPerPlayer} isLoading={isLoading} />
                    <Card title="Retention Rate" value={cardsData.retentionRate} isLoading={isLoading} />
                    <Card title="Fast Lap Time Distribution" value={cardsData.lapTimeDistribution.fast} isLoading={isLoading} />
                    <Card title="Medium Lap Time Distribution" value={cardsData.lapTimeDistribution.medium} isLoading={isLoading} />
                    <Card title="Slow Lap Time Distribution" value={cardsData.lapTimeDistribution.slow} isLoading={isLoading} />
                </div>
                <div className="charts">
                    <div className="chart-row">
                        <Chart data={rechartsData.playersCountPerDay} dataKey="players" chartType="Area" title="Players Count Per Day" />
                        <Chart data={rechartsData.soloRacesCount} dataKey="soloRaces" chartType="Area" title="Solo Races Count" />
                    </div>
                    <div className="chart-row">
                        <Chart data={rechartsData.mpRacesCount} dataKey="mpRaces" chartType="Area" title="Multiplayer Races Count" />
                        <Chart data={rechartsData.lapTimePerDay} dataKey="lapTime" chartType="Area" title="Lap Time Per Day" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RacingSection;
