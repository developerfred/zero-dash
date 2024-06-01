// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Filters from '@/components/Filters';
import Chart from '@/components/Chart';
import Card from '@/components/Card';
import axios from 'axios';
import { subDays, startOfToday, startOfYesterday, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

type FilterType = '24h' | '7d' | '30d' | '90d' | '365d' | 'today' | 'yesterday' | 'last_week' | 'last_month' | 'last_year' | string;

interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface DataPoint {
    openPRs: number;
    closedPRs: number;
    mergedPRs: number;
    openIssues: number;
    closedIssues: number;
    contributors: { length: number }[];
    reviewers: { length: number }[];
    averageMergeTime: number;
    averageResolutionTime: number;
    totalOpenIssues: number;
    totalClosedIssues: number;
}

interface Totals {
    openPRs: number;
    closedPRs: number;
    mergedPRs: number;
    openIssues: number;
    closedIssues: number;
    averageMergeTime: number;
    averageResolutionTime: number;
    contributors: number;
    reviewers: number;
    totalOpenIssues: number;
    totalClosedIssues: number;
}

interface FetchData {
    prData: DataPoint[];
    issuesData: DataPoint[];
    reviewsData: DataPoint[];
    mergeTimes: DataPoint[];
    resolutionTimes: DataPoint[];
}

const calculateDateRange = (filter: FilterType): DateRange => {
    let startDate = new Date();
    let endDate = new Date();

    switch (filter) {
        case '24h':
            startDate = subDays(endDate, 1);
            break;
        case '7d':
            startDate = subDays(endDate, 7);
            break;
        case '30d':
            startDate = subDays(endDate, 30);
            break;
        case '90d':
            startDate = subDays(endDate, 90);
            break;
        case '365d':
            startDate = subDays(endDate, 365);
            break;
        case 'today':
            startDate = startOfToday();
            break;
        case 'yesterday':
            startDate = startOfYesterday();
            endDate = startOfToday();
            break;
        case 'last_week':
            startDate = startOfWeek(subDays(startOfToday(), 7));
            endDate = startOfWeek(startOfToday());
            break;
        case 'last_month':
            startDate = startOfMonth(subDays(startOfToday(), 30));
            endDate = startOfMonth(startOfToday());
            break;
        case 'last_year':
            startDate = startOfYear(subDays(startOfToday(), 365));
            endDate = startOfYear(startOfToday());
            break;
        default:
            if (filter.startsWith('custom_')) {
                const dates = filter.split('_').slice(1);
                startDate = new Date(dates[0]);
                endDate = new Date(dates[1]);
            }
            break;
    }

    return { startDate, endDate };
};

const ProductivitySection: React.FC = () => {
    const [filter, setFilter] = useState<FilterType>('24h');
    const [data, setData] = useState<FetchData>({
        prData: [],
        issuesData: [],
        reviewsData: [],
        mergeTimes: [],
        resolutionTimes: []
    });
    const [totals, setTotals] = useState<Totals>({
        openPRs: 0,
        closedPRs: 0,
        mergedPRs: 0,
        openIssues: 0,
        closedIssues: 0,
        averageMergeTime: 0,
        averageResolutionTime: 0,
        contributors: 0,
        reviewers: 0,
        totalOpenIssues: 0,
        totalClosedIssues: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const organization = 'zer0-os';
                const { startDate, endDate } = calculateDateRange(filter);

                const prDataResponse = await axios.get('/api/github/pullRequests', { params: { organization, startDate, endDate } });
                const issuesDataResponse = await axios.get('/api/github/issues', { params: { organization, startDate, endDate } });
                const reviewsDataResponse = await axios.get('/api/github/discussionsAndReviews', { params: { organization, startDate, endDate } });
                const mergeTimesResponse = await axios.get('/api/github/averagePRMergeTime', { params: { organization, startDate, endDate } });
                const resolutionTimesResponse = await axios.get('/api/github/averageIssueResolutionTime', { params: { organization, startDate, endDate } });

                setData({
                    prData: prDataResponse.data,
                    issuesData: issuesDataResponse.data.issuesData,
                    reviewsData: reviewsDataResponse.data,
                    mergeTimes: mergeTimesResponse.data,
                    resolutionTimes: resolutionTimesResponse.data
                });

                const totalOpenPRs = prDataResponse.data.reduce((acc: number, repo: DataPoint) => acc + repo.openPRs, 0);
                const totalClosedPRs = prDataResponse.data.reduce((acc: number, repo: DataPoint) => acc + repo.closedPRs, 0);
                const totalMergedPRs = prDataResponse.data.reduce((acc: number, repo: DataPoint) => acc + repo.mergedPRs, 0);
                const totalOpenIssues = issuesDataResponse.data.issuesData.reduce((acc: number, repo: DataPoint) => acc + repo.openIssues, 0);
                const totalClosedIssues = issuesDataResponse.data.issuesData.reduce((acc: number, repo: DataPoint) => acc + repo.closedIssues, 0);
                const totalContributors = issuesDataResponse.data.issuesData.reduce((acc: number, repo: DataPoint) => acc + repo.contributors.length, 0);
                const totalReviewers = reviewsDataResponse.data.reduce((acc: number, repo: DataPoint) => acc + repo.reviewers.length, 0);
                const averageMergeTime = mergeTimesResponse.data.reduce((acc: number, repo: DataPoint) => acc + repo.averageMergeTime, 0) / mergeTimesResponse.data.length;
                const averageResolutionTime = resolutionTimesResponse.data.reduce((acc: number, repo: DataPoint) => acc + repo.averageResolutionTime, 0) / resolutionTimesResponse.data.length;

                setTotals({
                    openPRs: totalOpenPRs,
                    closedPRs: totalClosedPRs,
                    mergedPRs: totalMergedPRs,
                    openIssues: totalOpenIssues,
                    closedIssues: totalClosedIssues,
                    averageMergeTime,
                    averageResolutionTime,
                    contributors: totalContributors,
                    reviewers: totalReviewers,
                    totalOpenIssues: issuesDataResponse.data.totalOpenIssues,
                    totalClosedIssues: issuesDataResponse.data.totalClosedIssues
                });
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, [filter]);

    return (
        <div className="section">
            <h2 id="zero-productivity">Productivity</h2>
            <div className="zero-productivity">
                <Filters setFilter={setFilter} />
                <div className="cards">
                    <Card title="Open PRs" value={totals.openPRs} />
                    <Card title="Closed PRs" value={totals.closedPRs} />
                    <Card title="Merged PRs" value={totals.mergedPRs} />
                    <Card title="Open Issues" value={totals.totalOpenIssues} />
                    <Card title="Closed Issues" value={totals.totalClosedIssues} />
                    <Card title="Average Merge Time (days)" value={Number(totals.averageMergeTime.toFixed(2))} />
                    <Card title="Average Resolution Time (days)" value={Number(totals.averageResolutionTime.toFixed(2))} />
                    <Card title="Contributors" value={totals.contributors} />
                    <Card title="Reviewers" value={totals.reviewers} />
                </div>
                <div className="charts">
                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>Open PRs</h3>                            
                            <Chart data={!!data.prData} dataKey="openPRs" chartType="line" />
                        </div>
                        <div className="chart-container">
                            <h3>Closed PRs</h3>
                            <Chart data={!!data.prData} dataKey="closedPRs" chartType="line" />
                        </div>
                    </div>
                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>Merged PRs</h3>
                            <Chart data={!!data.prData} dataKey="mergedPRs" chartType="line" />
                        </div>
                        <div className="chart-container">
                            <h3>Open Issues</h3>
                            <Chart data={!!data.issuesData} dataKey="openIssues" chartType="line" />
                        </div>
                    </div>
                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>Closed Issues</h3>
                            <Chart data={data.issuesData} dataKey="closedIssues" chartType="line" />
                        </div>
                        <div className="chart-container">
                            <h3>Average Merge Time (days)</h3>
                            <Chart data={data.mergeTimes} dataKey="averageMergeTime" chartType="line" />
                        </div>
                    </div>
                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>Average Resolution Time (days)</h3>
                            <Chart data={data.resolutionTimes} dataKey="averageResolutionTime" chartType="line" />
                        </div>
                        <div className="chart-container">
                            <h3>Contributors</h3>
                            <Chart data={data.issuesData} dataKey="contributors.length" chartType="line" />
                        </div>
                        <div className="chart-container">
                            <h3>Reviewers</h3>
                            <Chart data={data.reviewsData} dataKey="reviewers.length" chartType="line" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductivitySection;
