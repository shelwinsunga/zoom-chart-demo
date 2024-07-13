// @ts-nocheck
'use client'
import { useState, useEffect, useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ComposedChart, ReferenceArea } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const description = "A histogram of log entries"

const chartConfig = {
    logs: {
        label: "Log Entries",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

const intervalOptions = [
    { value: '1s', label: '1 Second' },
    { value: '10m', label: '10 Minutes (Auto)' },
    { value: '5m', label: '5 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '3h', label: '3 Hours' },
]

const seedRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

export function ZoomableChart() {
    const [data, setData] = useState<any[]>([]);
    const [interval, setInterval] = useState('10m');
    const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
    const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [endTime, setEndTime] = useState<string | null>(null);

    const simulateData = (start?: string, end?: string) => {
        const now = new Date();
        const dataPoints = 50;
        const intervalMs = interval === '1s' ? 1000 :
            interval === '5m' ? 300000 :
                interval === '10m' ? 600000 :
                    interval === '30m' ? 1800000 :
                        interval === '1h' ? 3600000 : 10800000;

        let startDate = start ? new Date(start) : new Date(now.getTime() - dataPoints * intervalMs);
        const endDate = end ? new Date(end) : now;

        const simulatedData = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const seed = currentDate.getTime();
            simulatedData.push({
                date: currentDate.toISOString(),
                logs: Math.floor(seedRandom(seed) * 100) + 1
            });
            currentDate = new Date(currentDate.getTime() + intervalMs);
        }

        setData(simulatedData);
    };

    useEffect(() => {
        simulateData(startTime, endTime);
    }, [interval, startTime, endTime]);

    const total = useMemo(
        () => data.reduce((acc, curr) => acc + curr.logs, 0),
        [data]
    )

    const handleIntervalChange = (value: string) => {
        setInterval(value);
        setStartTime(null);
        setEndTime(null);
    };

    const handleMouseDown = (e: React.MouseEvent<SVGElement>) => {
        if (e.activeLabel) {
            setRefAreaLeft(e.activeLabel);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
        if (refAreaLeft && e.activeLabel) {
            setRefAreaRight(e.activeLabel);
        }
    };

    const handleMouseUp = () => {
        if (refAreaLeft && refAreaRight) {
            const [left, right] = [refAreaLeft, refAreaRight].sort();
            setStartTime(left);
            setEndTime(right);
            simulateData(left, right);
        }
        setRefAreaLeft(null);
        setRefAreaRight(null);
    };

    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        switch (interval) {
            case '1s':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            case '5m':
            case '10m':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            case '30m':
            case '1h':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            case '3h':
                return date.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
            default:
                return date.toLocaleTimeString();
        }
    };

    const renderChart = () => {
        return (
            <ComposedChart
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    style={{ userSelect: 'none' }}
                />
                <YAxis style={{ userSelect: 'none' }} />
                <Tooltip
                    content={
                        <ChartTooltipContent
                            className="w-[200px]"
                            nameKey="logs"
                            labelFormatter={(value) => new Date(value).toLocaleString()}
                        />
                    }
                />
                <Legend />
                <Area type="monotone" dataKey="logs" stroke={chartConfig.logs.color} fill={chartConfig.logs.color} />
                {refAreaLeft && refAreaRight && (
                    <ReferenceArea
                        x1={refAreaLeft}
                        x2={refAreaRight}
                        strokeOpacity={0.3}
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                    />
                )}
            </ComposedChart>
        );
    };

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Log Histogram</CardTitle>
                    <CardDescription>
                        {startTime && endTime
                            ? `Showing log entries from ${new Date(startTime).toLocaleString()} to ${new Date(endTime).toLocaleString()}`
                            : "Showing log entries for the last 24 hours"}
                    </CardDescription>
                </div>
                <div className="flex items-center px-6 py-4 sm:px-8">
                    <Select value={interval} onValueChange={handleIntervalChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                            {intervalOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex">
                    <button
                        data-active={true}
                        className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                    >
                        <span className="text-xs text-muted-foreground">
                            All
                        </span>
                        <span className="text-lg font-bold leading-none sm:text-3xl">
                            {total.toLocaleString()}
                        </span>
                    </button>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    {renderChart()}
                </ChartContainer>
            </CardContent>
        </Card>
    )
}