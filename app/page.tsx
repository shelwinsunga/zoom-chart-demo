import { ZoomableChart } from "@/components/chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-[1500px] mb-8 -mt-8">
        <Button asChild className="float-right">
          <Link href="https://github.com/shelwinsunga/zoom-chart-demo" target="_blank" rel="noopener noreferrer">
            <Star className="mr-2 h-4 w-4" /> Star on GitHub
          </Link>
        </Button>
      </div>
      <div className="flex justify-center w-full">
        <div className="flex flex-col lg:flex-row items-center max-w-[1500px] w-full">
          <div className="w-full lg:w-1/3 lg:pr-8 mb-8 lg:mb-0">
            <ul className="list-disc space-y-2 font-mono text-xs sm:text-sm">
              <li>Built with <pre className="bg-muted p-1 rounded inline">shadcn charts</pre> / <pre className="bg-muted p-1 rounded inline">recharts</pre></li>
              <li>Zoom in by clicking and dragging on the chart.</li>
              <li>Simulated event data</li>
              <li>Scroll to zoom in/out</li>
              <li>260 line <Link href="https://github.com/shelwinsunga/zoom-chart-demo/blob/main/components/chart.tsx"><u>source code</u></Link></li>
            </ul>
            <div className="border-t mt-4 pt-4 text-left text-sm text-foreground">
              made by <Link href="https://twitter.com/shelwin_" target="_blank" rel="noopener noreferrer"><u>shelwin</u></Link>
            </div>
          </div>
          <div className="w-full lg:w-2/3 h-[300px] sm:h-[400px] md:h-[500px]">
            <ZoomableChart />
          </div>
        </div>
      </div>
    </main>
  );
}
