'use client'
import { useState, useEffect, useMemo, useRef } from "react"
import { Area, CartesianGrid, XAxis, YAxis, ComposedChart, ReferenceArea, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
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

type DataPoint = {
    date: string;
    events: number;
};

const chartConfig = {
    events: {
        label: "Events",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

const seedRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

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
    const [isSelecting, setIsSelecting] = useState(false);
    const [isZooming, setIsZooming] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const simulatedData = simulateData();
        setData(simulatedData);
        setOriginalData(simulatedData);
        setStartTime(simulatedData[0].date);
        setEndTime(simulatedData[simulatedData.length - 1].date);
    }, []);

    useEffect(() => {
        if (startTime && endTime && !isZooming) {
            const zoomedData = originalData.filter(
                (d) => d.date >= startTime && d.date <= endTime
            );
            setData(zoomedData.length > 1 ? zoomedData : originalData.slice(0, 2));
        }
    }, [startTime, endTime, originalData, isZooming]);

    const total = useMemo(
        () => data.reduce((acc, curr) => acc + curr.events, 0),
        [data]
    )

    const handleMouseDown = (e: any) => {
        if (e.activeLabel) {
            setRefAreaLeft(e.activeLabel);
            setIsSelecting(true);
        }
    };

    const handleMouseMove = (e: any) => {
        if (isSelecting && e.activeLabel) {
            setRefAreaRight(e.activeLabel);
        }
    };

    const handleMouseUp = () => {
        if (refAreaLeft && refAreaRight) {
            const [left, right] = [refAreaLeft, refAreaRight].sort();
            setStartTime(left);
            setEndTime(right);
            const zoomedData = originalData.filter(
                (d) => d.date >= left && d.date <= right
            );
            setData(zoomedData.length > 1 ? zoomedData : originalData.slice(0, 2));
        }
        setRefAreaLeft(null);
        setRefAreaRight(null);
        setIsSelecting(false);
    };

    const handleReset = () => {
        setStartTime(originalData[0].date);
        setEndTime(originalData[originalData.length - 1].date);
        setData(originalData);
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!originalData.length || !chartRef.current) return;

        setIsZooming(true);

        const zoomFactor = 0.1;
        const direction = e.deltaY < 0 ? 1 : -1;  // Changed this line
        const currentRange = new Date(endTime || originalData[originalData.length - 1].date).getTime() -
            new Date(startTime || originalData[0].date).getTime();
        const zoomAmount = currentRange * zoomFactor * direction;

        const chartRect = chartRef.current.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        const chartWidth = chartRect.width;
        const mousePercentage = mouseX / chartWidth;

        const currentStartTime = new Date(startTime || originalData[0].date).getTime();
        const currentEndTime = new Date(endTime || originalData[originalData.length - 1].date).getTime();

        const newStartTime = new Date(currentStartTime + zoomAmount * mousePercentage);
        const newEndTime = new Date(currentEndTime - zoomAmount * (1 - mousePercentage));

        setStartTime(newStartTime.toISOString());
        setEndTime(newEndTime.toISOString());

        const zoomedData = originalData.filter(
            (d) => new Date(d.date) >= newStartTime && new Date(d.date) <= newEndTime
        );
        setData(zoomedData.length > 1 ? zoomedData : originalData.slice(0, 2));

        setTimeout(() => setIsZooming(false), 300);
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
                    <div className="h-full" onWheel={handleWheel} ref={chartRef}>
                        <div className="flex justify-end mb-4">
                            <Button variant="outline" onClick={handleReset} disabled={!startTime && !endTime}>
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
                                onMouseLeave={handleMouseUp}
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
                                    isAnimationActive={true}
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