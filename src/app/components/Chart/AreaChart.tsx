// @ts-nocheck

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint } from '@/app/types';
import { formatDate, formatNumberWithCommas, formatToMillion, formatTime } from '@/lib/utils';
import './Chart.css';
import { HiEllipsisVertical } from "react-icons/hi2";

interface ChartProps {
    data: DataPoint[];
    dataKey: string;
    title: string;
    isCurrency?: boolean;
    isHourly?: boolean;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string | number;
    isCurrency: boolean;
    isHourly: boolean;
}

const convertUTCToPST = (utcDate: Date): string => {
    return utcDate.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles", 
        hour12: true,
        year: "numeric",
        month: "numeric",
        day: "numeric",        
    });
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isCurrency, isHourly }) => {
    if (active && payload && payload.length) {
        const value = isCurrency ? formatToMillion(payload[0].value) : formatNumberWithCommas(payload[0].value);
        const date = new Date(label as string);
        const formattedLabel = isHourly ? formatTime(date, 'HH:mm') : convertUTCToPST(date);
        return (
            <div className="custom-tooltip">
                <p className="label">{formattedLabel}</p>
                <p className="value">{value}</p>
            </div>
        );
    }
    return null;
};

const AreaChartComponent: React.FC<ChartProps> = ({ data = [], dataKey = "value", title, isCurrency = false, isHourly = false }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [activeTick, setActiveTick] = useState<string | number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formattedData = useMemo(() => {
        const groupedData: { [key: string]: any } = {};

        data.forEach(item => {
            let timestamp: number | undefined;
            if (item.timestamp) {
                timestamp = typeof item.timestamp === 'number' && item.timestamp.toString().length === 10
                    ? item.timestamp * 1000
                    : item.timestamp;
            } else if (item.date) {
                timestamp = new Date(item.date).getTime();
            }

            if (timestamp === undefined) {
                console.error(`Invalid date value: ${item.timestamp || item.date}`);
                return;
            }

            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                console.error(`Invalid date value: ${timestamp}`);
                return;
            }
            const hourKey = isHourly ? date.toISOString().slice(0, 13) + ":00:00" : date.toISOString().slice(0, 10);

            if (!groupedData[hourKey]) {
                groupedData[hourKey] = { ...item, date: hourKey, totalMessagesSent: 0, dailyActiveUsers: 0, userSignUps: 0, totalRewardsEarned: 0 };
            }

            groupedData[hourKey].totalMessagesSent += item.totalMessagesSent || 0;
            groupedData[hourKey].dailyActiveUsers += item.dailyActiveUsers || 0;
            groupedData[hourKey].userSignUps += item.userSignUps || 0;
            groupedData[hourKey].totalRewardsEarned += item.totalRewardsEarned || 0;
        });

        return Object.values(groupedData);
    }, [data, isHourly]);

    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        if (isNaN(date.getTime())) {
            console.error(`Invalid date value for tick: ${tickItem}`);
            return '';
        }
        if (isHourly) {
            const hours = date.getHours();
            return `${hours}h`;
        }
        return convertUTCToPST(date);
    };

    const handleMouseMove = (state: any) => {
        if (state.isTooltipActive) {
            setActiveTick(state.activeTooltipIndex);
        } else {
            setActiveTick(null);
        }
    };

    return (
        <div className="chart-wrapper">
            <div className="chart-header">
                <h3 className="chart-title">{title}</h3>
                {/* <HiEllipsisVertical className="chart-icon" onClick={() => setMenuVisible(!menuVisible)} />
                {menuVisible && (
                    <div className="menu" ref={menuRef}>
                        {}
                    </div>
                )} */}
            </div>
            <ResponsiveContainer width="100%" height={300} minWidth={300}>
                <AreaChart
                    data={formattedData}
                    margin={{ top: 50, right: 30, left: 20, bottom: 50 }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setActiveTick(null)}
                >
                    <defs>
                        <linearGradient id="colorMatrix" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(1, 244, 203, 0.5)" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatXAxis}
                        stroke="rgba(117, 122, 128, 1)"
                        style={{ fontSize: '1.0rem' }}
                        tick={{ transform: 'translate(0, 10)' }}
                        interval={isHourly ? 2 : 'preserveStartEnd'}
                        textAnchor="end"
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={isCurrency ? formatToMillion : formatNumberWithCommas}
                        stroke="rgba(117, 122, 128, 1)"
                        style={{ fontSize: '1.0rem' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#01f4cc35" strokeWidth={0.5} />
                    <Tooltip content={<CustomTooltip isCurrency={isCurrency} isHourly={isHourly} />} />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke="rgba(1, 244, 203, 1)"
                        fillOpacity={1}
                        fill="url(#colorMatrix)"
                        dot={{ fill: '#01F4CB', r: 3 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AreaChartComponent;
