import React from "react";
import { BarChart2, Timer, Clock, Cpu, TrendingUp, Download } from "lucide-react";

// Text color breathing animation for icons (except Download)
const breathingStyle = `
@keyframes rose-text-breathing {
  0%, 100% { color: #fb7185; }
  50% { color: #f43f5e; }
}
.rose-text-breathing {
  animation: rose-text-breathing 2s infinite;
}
`;

export default function ResultsPanel({ metrics }) {
  const m = metrics?.metrics?.metrics;

  // Helper to format numbers to 2 decimals
  const fmt = v => typeof v === "number" ? v.toFixed(2) : v;

  // Chart meta info
  const chartMeta = [
    {
      key: "gantt",
      title: "Gantt",
      subtitle: "Execution Timeline",
      icon: <BarChart2 className="rose-text-breathing" size={18} />,
    },
    {
      key: "comparison",
      title: "Comparison",
      subtitle: "Turnaround vs Waiting",
      icon: <TrendingUp className="rose-text-breathing" size={18} />,
    },
    {
      key: "throughput",
      title: "Throughput",
      subtitle: "Ops per Unit Time",
      icon: <Cpu className="rose-text-breathing" size={18} />,
    }
  ];

  // Find chart meta for a chart filename
  const getChartMeta = chart => {
    const lower = chart.toLowerCase();
    return chartMeta.find(meta => lower.includes(meta.key));
  };

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden pt-28">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-rose-400 opacity-20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-rose-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-rose-400 opacity-10 rounded-full blur-2xl"></div>
      </div>
      {/* Heading and PDF Download */}
      <div className="w-full max-w-7xl mx-auto flex flex-row justify-between items-center mt-12 mb-4 px-2 z-10 relative">
        <h1 className="text-4xl font-extrabold text-white drop-shadow">Result Dashboard</h1>
        {metrics?.reports?.length > 0 && (
          <button
            className="flex items-center gap-2 bg-rose-400 hover:bg-rose-500 text-black font-bold py-2 px-5 rounded-lg shadow transition"
            onClick={() => {
              window.open(`http://localhost:5000/api/reports/${metrics.reports[0]}`, "_blank");
            }}
            tabIndex={0}
          >
            <Download size={20} color="black" aria-label="Download PDF Report" />
            <span className="font-bold">Download PDF Report</span>
          </button>
        )}
      </div>
      {/* Stats Cards Row */}
      {m && (
        <div className="w-full max-w-7xl px-2 mx-auto mb-10 z-10 relative">
          <div className="grid grid-cols-5 gap-0 w-full">
            {[
              {
                icon: <Timer size={22} className="rose-text-breathing" />,
                label: "Turnaround",
                value: `${fmt(m.avg_turnaround)} `,
                unit: "ms"
              },
              {
                icon: <Clock size={22} className="rose-text-breathing" />,
                label: "Waiting",
                value: `${fmt(m.avg_waiting)} `,
                unit: "ms"
              },
              {
                icon: <Cpu size={22} className="rose-text-breathing" />,
                label: "CPU %",
                value: `${fmt(m.cpu_utilization * 100)} `,
                unit: "%"
              },
              {
                icon: <TrendingUp size={22} className="rose-text-breathing" />,
                label: "Throughput",
                value: `${fmt(m.throughput)} `,
                unit: "ops/s"
              },
              {
                icon: <BarChart2 size={22} className="rose-text-breathing" />,
                label: "Total",
                value: `${fmt(m.total_time)} `,
                unit: "s"
              }
            ].map((card, idx) => (
              <div
                key={card.label}
                className={`bg-transparent border-2 border-neutral-800 shadow-xl px-10 py-10 flex flex-col items-start justify-center min-h-[150px] transition-all
                  ${idx === 0 ? "rounded-l-2xl" : ""}
                  ${idx === 4 ? "rounded-r-2xl" : ""}
                  `}
                style={{ borderRight: idx === 4 ? "none" : undefined }}
              >
                <div className="flex items-center gap-2 text-rose-400 text-base font-semibold mb-2 drop-shadow">
                  {card.icon}
                  <span>{card.label}</span>
                </div>
                <div className="text-3xl font-extrabold text-white drop-shadow">
                  {card.value}
                  <span className="text-base font-normal text-neutral-400">{card.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Charts Section */}
      {metrics && metrics.charts && metrics.charts.length > 0 && (
        <div className="w-full max-w-7xl flex flex-col gap-8 px-2 items-center z-10 relative">
          {/* Gantt Chart Full Width */}
          {metrics.charts.filter(c => c.toLowerCase().includes("gantt")).map((chart, idx) => {
            const meta = getChartMeta(chart);
            return (
              <div key={idx} className="bg-transparent border-2 border-neutral-800 rounded-2xl shadow-2xl p-8 mb-2 w-full flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1 w-full">
                  {meta?.icon}
                  <span className="text-xl font-bold text-white drop-shadow">{meta?.title || chart}</span>
                </div>
                <div className="text-sm text-neutral-400 mb-4 w-full">{meta?.subtitle}</div>
                <div className="w-full flex justify-center items-center">
                  <img
                    src={`http://localhost:5000/api/charts/${chart}`}
                    alt={chart}
                    className="max-w-full border border-neutral-800 bg-black rounded-lg"
                  />
                </div>
              </div>
            );
          })}
          {/* Comparison & Throughput Charts Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {metrics.charts.filter(c =>
              c.toLowerCase().includes("comparison") ||
              c.toLowerCase().includes("throughput")
            ).map((chart, idx) => {
              const meta = getChartMeta(chart);
              return (
                <div key={idx} className="bg-transparent border-2 border-neutral-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full">
                  <div className="flex items-center gap-2 mb-1 w-full">
                    {meta?.icon}
                    <span className="text-xl font-bold text-white drop-shadow">{meta?.title || chart}</span>
                  </div>
                  <div className="text-sm text-neutral-400 mb-4 w-full">{meta?.subtitle}</div>
                  <div className="w-full flex justify-center items-center">
                    <img
                      src={`http://localhost:5000/api/charts/${chart}`}
                      alt={chart}
                      className="max-w-full border border-neutral-800 bg-black rounded-lg"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style>{breathingStyle}</style>
    </div>
  );
}