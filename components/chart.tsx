// @ts-nocheck
'use client'
import { useState, useEffect, useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ComposedChart, ReferenceArea, ResponsiveContainer } from "recharts"

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

const chartConfig = {
    logs: {
        label: "Log Entries",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

const seedRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

const simulateData = (start?: string, end?: string) => {
    const now = new Date();
    const intervalMs = 600000; // 10 minutes

    let startDate = start ? new Date(start) : new Date(now.getTime() - 50 * intervalMs);
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

    return simulatedData;
};

export function ZoomableChart() {
    const [data, setData] = useState<any[]>([]);
    const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
    const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [endTime, setEndTime] = useState<string | null>(null);

    // Simulate data
    useEffect(() => {
        setData(simulateData(startTime, endTime));
    }, [startTime, endTime]);

    // Calculate total
    const total = useMemo(
        () => data.reduce((acc, curr) => acc + curr.logs, 0),
        [data]
    )

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
        }
        setRefAreaLeft(null);
        setRefAreaRight(null);
    };

    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card className="w-full h-full">
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Zoomable Chart Demo</CardTitle>
                </div>
                <div className="flex">
                    <div
                        className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                    >
                        <span className="text-xs text-muted-foreground">
                            Events
                        </span>
                        <span className="text-lg font-bold leading-none sm:text-3xl">
                            {total.toLocaleString()}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6 h-[calc(100%-150px)]">
                <ChartContainer
                    config={chartConfig}
                    className="w-full h-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
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
                            <Area
                                type="monotone"
                                dataKey="logs"
                                stroke={chartConfig.logs.color}
                                fill={chartConfig.logs.color}
                                isAnimationActive={false}
                            />
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
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}