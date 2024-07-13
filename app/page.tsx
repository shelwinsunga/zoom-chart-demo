import Image from "next/image";
import { ZoomableChart } from "@/components/chart";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-[800px] h-[600px] flex items-center justify-center">
        <ZoomableChart />
      </div>
    </main>
  );
}
