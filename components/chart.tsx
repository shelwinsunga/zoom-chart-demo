'use client'
import { useState, useEffect, useMemo } from "react"
import { Area, CartesianGrid, XAxis, YAxis, ComposedChart, ReferenceArea, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
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
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"

const chartConfig = {
    events: {
        label: "Events",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

type DataPoint = {
    date: string;
    events: number;
};

const seedRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

// Fancy data simulation written by Claude
const simulateData = (start = '2024-01-01T00:00:00Z', end = '2024-01-02T00:00:00Z') => {
    const simulatedData = [];
    let baseValue = 50;
    for (let currentDate = new Date(start); currentDate <= new Date(end); currentDate.setTime(currentDate.getTime() + 600000)) {
        const seed = currentDate.getTime();
        baseValue = Math.max(
            (baseValue + 0.5 * (currentDate.getTime() - new Date(start).getTime()) / (new Date(end).getTime() - new Date(start).getTime()) * 100 +
                (seedRandom(seed) - 0.5) * 20 +
                (seedRandom(seed + 1) < 0.1 ? (seedRandom(seed + 2) - 0.5) * 50 : 0) +
                Math.sin(currentDate.getTime() / 3600000) * 10) *
            (1 + (seedRandom(seed + 3) - 0.5) * 0.2),
            1
        );
        simulatedData.push({
            date: currentDate.toISOString(),
            events: Math.max(Math.floor(baseValue), 1)
        });
    }
    return simulatedData;
};

export function ZoomableChart() {
    const [data, setData] = useState<DataPoint[]>([]);
    const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
    const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [endTime, setEndTime] = useState<string | null>(null);
    const [originalData, setOriginalData] = useState<DataPoint[]>([]);

    // Simulate data
    useEffect(() => {
        const simulatedData = simulateData();
        setData(simulatedData);
        setOriginalData(simulatedData);
    }, []);

    // Calculate total
    const total = useMemo(
        () => data.reduce((acc, curr) => acc + curr.events, 0),
        [data]
    )

    const handleMouseDown = (e: any) => {
        if (e.activeLabel) {
            setRefAreaLeft(e.activeLabel);
        }
    };

    const handleMouseMove = (e: any) => {
        if (refAreaLeft && e.activeLabel) {
            setRefAreaRight(e.activeLabel);
        }
    };

    const handleMouseUp = () => {
        if (refAreaLeft && refAreaRight) {
            const [left, right] = [refAreaLeft, refAreaRight].sort();
            setStartTime(left);
            setEndTime(right);
            // Filter data to only show the zoomed in range
            const zoomedData = originalData.filter(
                (d) => d.date >= left && d.date <= right
            );
            setData(zoomedData);
        }
        setRefAreaLeft(null);
        setRefAreaRight(null);
    };

    const handleZoomOut = () => {
        setStartTime(null);
        setEndTime(null);
        setData(originalData);
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
                    <CardDescription>
                        Basic Implementation of a zooming
                    </CardDescription>
                </div>
                <div className="flex">
                    <div
                        className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l bg-muted/10 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
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
                    <div className="h-full">
                        <div className="flex justify-end mb-4">
                            <Button variant="outline" onClick={handleZoomOut} disabled={!startTime && !endTime}>
                                Reset
                            </Button>
                        </div>
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
                                <defs>
                                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartConfig.events.color} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={chartConfig.events.color} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatXAxis}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    style={{ userSelect: 'none' }}
                                />
                                <YAxis tickLine={false} axisLine={false} style={{ userSelect: 'none' }} />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            className="w-[200px] font-mono"
                                            nameKey="events"
                                            labelFormatter={(value) => new Date(value).toLocaleString()}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Area
                                    type="monotone"
                                    dataKey="events"
                                    stroke={chartConfig.events.color}
                                    fillOpacity={1}
                                    fill="url(#colorEvents)"
                                    isAnimationActive={false}
                                />
                                {refAreaLeft && refAreaRight && (
                                    <ReferenceArea
                                        x1={refAreaLeft}
                                        x2={refAreaRight}
                                        strokeOpacity={0.3}
                                        fill="hsl(var(--foreground))"
                                        fillOpacity={0.05}
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}