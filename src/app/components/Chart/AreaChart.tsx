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
        hour: "numeric",
        minute: "numeric"
    });
};

const getStartDateOfISOWeek = (week: number, year: number): Date => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isCurrency, isHourly }) => {
    if (active && payload && payload.length) {
        const value = isCurrency ? formatToMillion(payload[0].value) : formatNumberWithCommas(payload[0].value);
        const date = new Date(label as string);
        let formattedLabel: string;

        if (isHourly) {
            formattedLabel = formatTime(date.toISOString(), 'HH:mm');
        } else {
            formattedLabel = convertUTCToPST(date);
        }

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
        return data.map(item => {
            let timestamp: number;
            let periodType: 'hour' | 'day' | 'week' | 'month' = 'day';

            if (item.timestamp) {
                timestamp = typeof item.timestamp === 'number' && item.timestamp.toString().length === 10
                    ? item.timestamp * 1000
                    : item.timestamp;
                periodType = 'hour';
            } else if (item.date) {
                timestamp = new Date(item.date).getTime();
            } else if (item.period) {
                if (item.period.includes('-W')) {
                    const [year, week] = item.period.split('-W').map(Number);
                    timestamp = getStartDateOfISOWeek(week, year).getTime();
                    periodType = 'week';
                } else if (item.period.includes('-')) {
                    const parts = item.period.split('-').map(Number);
                    if (parts.length === 3) {
                        // Format: YYYY-MM-DD
                        timestamp = new Date(item.period).getTime();
                    } else if (parts.length === 2) {
                        // Format: YYYY-MM
                        timestamp = new Date(parts[0], parts[1] - 1).getTime();
                        periodType = 'month';
                    }
                }
            } else {
                console.error('Invalid date format in item:', item);
                return null;
            }

            const date = new Date(timestamp);
            let formattedDate: string;

            if (isHourly) {
                formattedDate = date.toISOString().slice(0, 13) + ":00:00";
            } else if (periodType === 'month') {
                formattedDate = date.toISOString().slice(0, 7); 
            } else if (periodType === 'week') {
                formattedDate = date.toISOString().slice(0, 10); 
            } else {
                formattedDate = date.toISOString().slice(0, 10); 
            }

            return {
                ...item,
                date: formattedDate,
                [dataKey]: isCurrency && typeof item[dataKey] === 'string'
                    ? parseFloat(item[dataKey].replace(/[^0-9.-]+/g, ""))
                    : item[dataKey]
            };
        }).filter(Boolean);
    }, [data, isHourly, dataKey, isCurrency]);

    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        if (isNaN(date.getTime())) {
            console.error(`Invalid date value for tick: ${tickItem}`);
            return '';
        }

        if (tickItem.length === 7) {
            return date.toLocaleString('en-US', { month: 'short', year: '2-digit' }); 
        } else if (isHourly) {
            return date.toLocaleString('en-US', { hour: 'numeric', hour12: true }); 
        } else if (tickItem.length === 10) {
            return date.toLocaleString('en-US', { day: 'numeric', month: 'short' }); 
        } else {
            const weekNumber = Math.ceil(date.getDate() / 7);
            return `Week ${weekNumber}`; 
        }
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