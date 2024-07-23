// @ts-nocheck

import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const API_RACING = process.env.NEXT_PUBLIC_API_RACING!;

const endpoints = [
    `${API_RACING}player-lap-count`,
    `${API_RACING}top-ten-lap-count`,
    `${API_RACING}bottom-ten-lap-count`,
    `${API_RACING}players-count-per-day`,
    `${API_RACING}solo-races-count`,
    `${API_RACING}mp-races-count`,
    `${API_RACING}lap-time-per-day`
];

const fetchData = async (url, body) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
    }

    return response.json();
};

const getDatesFromFilter = (filter) => {
    const now = new Date();
    let startDate;

    switch (filter) {
        case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '48h':
            startDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
            break;
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case '365d':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        default:
            throw new Error('Invalid filter');
    }

    const endDate = now;
    return { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        return res.status(200).json({ message: 'Please use POST request with appropriate filters.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const { filter } = req.body;

    if (!filter) {
        return res.status(400).json({ message: 'Filter is required' });
    }

    try {
        const { startDate, endDate } = getDatesFromFilter(filter);
        console.log(`Fetching data for filter ${filter} from ${startDate} to ${endDate}`);

        const requests = endpoints.map(endpoint => fetchData(endpoint, { startDate, endDate, daysCount: 0 }));
        const results = await Promise.all(requests);

        const data = {
            playerLapCount: results[0],
            topTenLapCount: results[1],
            bottomTenLapCount: results[2],
            playersCountPerDay: results[3],
            soloRacesCount: results[4],
            mpRacesCount: results[5],
            lapTimePerDay: results[6],
        };

        const totalPlayers = Object.values(data.playersCountPerDay.average_players_count).reduce((acc, count) => acc + count, 0);
        const totalSoloRaces = Object.values(data.soloRacesCount.solo_sessions_count).reduce((acc, count) => acc + count, 0);
        const totalMpRaces = Object.values(data.mpRacesCount.mp_sessions_count).reduce((acc, count) => acc + count, 0);
        const totalLaps = Object.values(data.playerLapCount.player_name_count).reduce((acc, count) => acc + count, 0);
        const totalLapTimes = Object.values(data.lapTimePerDay.laptime_count).reduce((acc, time) => acc + time, 0);
        const averageLapTime = (totalLapTimes / Object.keys(data.lapTimePerDay.laptime_count).length).toFixed(2);
        const uniquePlayersCount = data.playerLapCount.unique_players_count.length;

        const maxLapsPlayer = Object.entries(data.playerLapCount.player_name_count).reduce((max, player) => player[1] > max[1] ? player : max, ["", 0]);
        const minLapsPlayer = Object.entries(data.playerLapCount.player_name_count).reduce((min, player) => player[1] < min[1] ? player : min, ["", Infinity]);

        const averageLapsPerPlayer = (totalLaps / uniquePlayersCount).toFixed(2);
        const retentionRate = ((uniquePlayersCount / totalPlayers) * 100).toFixed(2);
        const lapTimeDistribution = {
            fast: Object.values(data.lapTimePerDay.laptime_count).filter(time => time < 60).length,
            medium: Object.values(data.lapTimePerDay.laptime_count).filter(time => time >= 60 && time < 120).length,
            slow: Object.values(data.lapTimePerDay.laptime_count).filter(time => time >= 120).length,
        };

        const cardsData = {
            totalPlayers,
            totalSoloRaces,
            totalMpRaces,
            totalLaps,
            averageLapTime,
            uniquePlayersCount,
            maxLapsPlayer: maxLapsPlayer[0],
            minLapsPlayer: minLapsPlayer[0],
            averageLapsPerPlayer,
            retentionRate,
            lapTimeDistribution
        };

        const rechartsData = {
            playerLapCount: Object.entries(data.playerLapCount.player_name_count).map(([name, count]) => ({ name, count })),
            topTenLapCount: Object.entries(data.topTenLapCount.top_ten).map(([name, count]) => ({ name, count })),
            bottomTenLapCount: Object.entries(data.bottomTenLapCount.bottom_ten).map(([name, count]) => ({ name, count })),
            playersCountPerDay: Object.entries(data.playersCountPerDay.average_players_count).map(([date, players]) => ({ date, players })),
            soloRacesCount: Object.entries(data.soloRacesCount.solo_sessions_count).map(([date, soloRaces]) => ({ date, soloRaces })),
            mpRacesCount: Object.entries(data.mpRacesCount.mp_sessions_count).map(([date, mpRaces]) => ({ date, mpRaces })),
            lapTimePerDay: Object.entries(data.lapTimePerDay.laptime_count).map(([date, lapTime]) => ({ date, lapTime })),
        };

        const formattedData = {
            data,
            cardsData,
            rechartsData,
        };

        res.status(200).json(formattedData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export default handler;
