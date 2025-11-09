import React, { useState } from "react";
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

function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

function MobileResultsPanel({ metrics, selectedAlgos, activeTab, setActiveTab }) {
  const fmt = v => typeof v === "number" ? v.toFixed(2) : v;
  const charts = metrics?.[selectedAlgos[0]]?.charts || [];
  const reports = metrics?.[selectedAlgos[0]]?.reports || [];
  const turnaroundArr = selectedAlgos.map(algo => ({
    algo,
    turnaround: metrics[algo]?.metrics?.metrics?.avg_turnaround ?? Infinity
  }));
  const minTurnaround = Math.min(...turnaroundArr.map(t => t.turnaround));
  const maxTurnaround = Math.max(...turnaroundArr.map(t => t.turnaround));
  const fastestAlgos = turnaroundArr.filter(t => t.turnaround === minTurnaround).map(t => t.algo);
  const slowestAlgos = turnaroundArr.filter(t => t.turnaround === maxTurnaround).map(t => t.algo);
  const combinedPrefix = selectedAlgos.map(a => a.toLowerCase()).join("_");
  const comparisonChart = charts.find(c =>
    c.toLowerCase().includes("comparison_bar_chart") &&
    c.toLowerCase().includes(combinedPrefix)
  );
  const throughputChart = charts.find(c =>
    c.toLowerCase().includes("throughput_cpuutil") &&
    c.toLowerCase().includes(combinedPrefix)
  );
  const ganttChart = activeTab !== "summary"
    ? charts.find(c =>
        c.toLowerCase().includes("gantt") &&
        c.toLowerCase().includes(activeTab.toLowerCase())
      )
    : null;
  const algoMetrics = activeTab !== "summary"
    ? metrics[activeTab]?.metrics?.metrics
    : null;

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden pt-16">
      {/* Mobile bloom effect: top and bottom center */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-rose-400 opacity-20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-rose-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      <div className="w-full flex flex-col justify-between items-center mt-6 mb-2 px-4 z-10 relative">
        <h1
          className="text-2xl font-extrabold text-white drop-shadow mb-2 text-left w-full"
          style={{ marginLeft: 8, marginRight: 8 }}
        >
          Result Dashboard
        </h1>
        {reports.length > 0 && (
          <div className="w-full flex justify-center items-center my-4">
            <button
              className="flex items-center gap-2 bg-rose-400 hover:bg-rose-500 text-black font-bold py-2 px-4 rounded-lg shadow transition text-xs"
              style={{ marginLeft: 8, marginRight: 8 }}
              onClick={() => {
                window.open(`http://localhost:5000/api/reports/${reports[0]}`, "_blank");
              }}
              tabIndex={0}
            >
              <Download size={16} color="black" aria-label="Download PDF Report" />
              <span className="font-bold">Download Report</span>
            </button>
          </div>
        )}
      </div>
      <div className="w-full flex flex-row gap-2 mb-4 px-4 z-10 relative justify-center">
        <button
          key="summary"
          className={`px-3 py-2 rounded-full font-bold text-xs border-2 transition-all
            ${activeTab === "summary"
              ? "bg-rose-400 text-black border-rose-400 shadow"
              : "bg-neutral-950 text-rose-400 border-neutral-800 hover:bg-rose-950 hover:border-rose-400"
            }`}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
        {selectedAlgos.map(algo => (
          <button
            key={algo}
            className={`px-3 py-2 rounded-full font-bold text-xs border-2 transition-all
              ${activeTab === algo
                ? "bg-rose-400 text-black border-rose-400 shadow"
                : "bg-neutral-950 text-rose-400 border-neutral-800 hover:bg-rose-950 hover:border-rose-400"
              }`}
            onClick={() => setActiveTab(algo)}
          >
            {algo}
          </button>
        ))}
      </div>
      {activeTab === "summary" && (
        <div className="w-full px-4 mx-auto z-10 relative">
          <div className="w-full flex flex-col gap-2 mb-4 items-center justify-center">
            <button
              className="inline-block cursor-pointer items-center justify-center rounded-xl border border-rose-400 bg-zinc-950 px-4 py-2 font-bold text-rose-400 shadow-md transition-all duration-300 hover:[transform:translateY(-.2rem)] hover:shadow-xl flex gap-2 text-xs"
              style={{ minWidth: "140px", marginLeft: 8, marginRight: 8 }}
              tabIndex={-1}
              disabled
            >
              <span>
                Fastest: {fastestAlgos.join(", ")}
                <span className="text-rose-300/85"> ─ {fmt(minTurnaround)} ms</span>
              </span>
            </button>
            <button
              className="inline-block cursor-pointer items-center justify-center rounded-xl border border-rose-400 bg-zinc-950 px-4 py-2 font-bold text-rose-400 shadow-md transition-all duration-300 hover:[transform:translateY(-.2rem)] hover:shadow-xl flex gap-2 text-xs"
              style={{ minWidth: "140px", marginLeft: 8, marginRight: 8 }}
              tabIndex={-1}
              disabled
            >
              <span>
                Slowest: {slowestAlgos.join(", ")}
                <span className="text-rose-300/85"> ─ {fmt(maxTurnaround)} ms</span>
              </span>
            </button>
          </div>
          {selectedAlgos.map(algo => {
            const m = metrics[algo]?.metrics?.metrics;
            return (
              <div key={algo} className="mb-4" style={{ marginLeft: 8, marginRight: 8 }}>
                <div className="text-lg font-bold text-rose-400 mb-2 text-left">{algo}</div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {[
                    {
                      icon: <Timer size={18} className="rose-text-breathing" />,
                      label: "Turnaround",
                      value: `${fmt(m?.avg_turnaround)} `,
                      unit: "ms"
                    },
                    {
                      icon: <Clock size={18} className="rose-text-breathing" />,
                      label: "Waiting",
                      value: `${fmt(m?.avg_waiting)} `,
                      unit: "ms"
                    },
                    {
                      icon: <Cpu size={18} className="rose-text-breathing" />,
                      label: "CPU %",
                      value: `${fmt(m?.cpu_utilization * 100)} `,
                      unit: "%"
                    },
                    {
                      icon: <TrendingUp size={18} className="rose-text-breathing" />,
                      label: "Throughput",
                      value: `${fmt(m?.throughput)} `,
                      unit: "ops/s"
                    },
                    {
                      icon: <BarChart2 size={18} className="rose-text-breathing" />,
                      label: "Total",
                      value: `${fmt(m?.total_time)} `,
                      unit: "s"
                    }
                  ].map((card, idx) => (
                    <div
                      key={card.label}
                      className="bg-transparent border border-neutral-800 shadow px-3 py-3 flex flex-col items-start justify-center min-h-[60px] transition-all rounded-xl mb-2"
                      style={{ marginLeft: 4, marginRight: 4 }}
                    >
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1 drop-shadow">
                        {card.icon}
                        <span>{card.label}</span>
                      </div>
                      <div className="text-lg font-extrabold text-white drop-shadow">
                        {card.value}
                        <span className="text-xs font-normal text-neutral-400">{card.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {(comparisonChart || throughputChart) && (
            <div className="flex flex-col gap-4 justify-center items-stretch w-full mb-4 mt-4">
              {comparisonChart && (
                <div className="bg-transparent border border-neutral-800 rounded-xl shadow p-2 flex flex-col items-center w-full" style={{ marginLeft: 8, marginRight: 8 }}>
                  <img
                    src={`http://localhost:5000/api/charts/${comparisonChart}`}
                    alt={comparisonChart}
                    className="max-w-full border border-neutral-800 bg-black rounded-lg"
                  />
                </div>
              )}
              {throughputChart && (
                <div className="bg-transparent border border-neutral-800 rounded-xl shadow p-2 flex flex-col items-center w-full" style={{ marginLeft: 8, marginRight: 8 }}>
                  <img
                    src={`http://localhost:5000/api/charts/${throughputChart}`}
                    alt={throughputChart}
                    className="max-w-full border border-neutral-800 bg-black rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {activeTab !== "summary" && (
        <div className="w-full px-4 mx-auto mb-4 z-10 relative">
          <div className="mb-4" style={{ marginLeft: 8, marginRight: 8 }}>
            <div className="text-lg font-bold text-rose-400 mb-2 text-left">{activeTab}</div>
            <div className="grid grid-cols-2 gap-2 w-full">
              {[
                {
                  icon: <Timer size={18} className="rose-text-breathing" />,
                  label: "Turnaround",
                  value: `${fmt(algoMetrics?.avg_turnaround)} `,
                  unit: "ms"
                },
                {
                  icon: <Clock size={18} className="rose-text-breathing" />,
                  label: "Waiting",
                  value: `${fmt(algoMetrics?.avg_waiting)} `,
                  unit: "ms"
                },
                {
                  icon: <Cpu size={18} className="rose-text-breathing" />,
                  label: "CPU %",
                  value: `${fmt(algoMetrics?.cpu_utilization * 100)} `,
                  unit: "%"
                },
                {
                  icon: <TrendingUp size={18} className="rose-text-breathing" />,
                  label: "Throughput",
                  value: `${fmt(algoMetrics?.throughput)} `,
                  unit: "ops/s"
                },
                {
                  icon: <BarChart2 size={18} className="rose-text-breathing" />,
                  label: "Total",
                  value: `${fmt(algoMetrics?.total_time)} `,
                  unit: "s"
                }
              ].map((card, idx) => (
                <div
                  key={card.label}
                  className="bg-transparent border border-neutral-800 shadow px-3 py-3 flex flex-col items-start justify-center min-h-[60px] transition-all rounded-xl mb-2"
                  style={{ marginLeft: 4, marginRight: 4 }}
                >
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1 drop-shadow">
                    {card.icon}
                    <span>{card.label}</span>
                  </div>
                  <div className="text-lg font-extrabold text-white drop-shadow">
                    {card.value}
                    <span className="text-xs font-normal text-neutral-400">{card.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {ganttChart && (
            <div className="bg-transparent border border-neutral-800 rounded-xl shadow p-2 flex flex-col items-center w-full mb-4" style={{ marginLeft: 8, marginRight: 8 }}>
              <img
                src={`http://localhost:5000/api/charts/${ganttChart}`}
                alt={ganttChart}
                className="max-w-full border border-neutral-800 bg-black rounded-lg"
              />
            </div>
          )}
        </div>
      )}
      <style>{breathingStyle}</style>
    </div>
  );
}

export default function ResultsPanel({ metrics, selectedAlgos }) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [activeTab, setActiveTab] = useState("summary");

  if (isMobile) {
    return (
      <MobileResultsPanel
        metrics={metrics}
        selectedAlgos={selectedAlgos}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }

  // Desktop UI (original code)
  const fmt = v => typeof v === "number" ? v.toFixed(2) : v;
  const charts = metrics?.[selectedAlgos[0]]?.charts || [];
  const reports = metrics?.[selectedAlgos[0]]?.reports || [];
  const turnaroundArr = selectedAlgos.map(algo => ({
    algo,
    turnaround: metrics[algo]?.metrics?.metrics?.avg_turnaround ?? Infinity
  }));
  const minTurnaround = Math.min(...turnaroundArr.map(t => t.turnaround));
  const maxTurnaround = Math.max(...turnaroundArr.map(t => t.turnaround));
  const fastestAlgos = turnaroundArr.filter(t => t.turnaround === minTurnaround).map(t => t.algo);
  const slowestAlgos = turnaroundArr.filter(t => t.turnaround === maxTurnaround).map(t => t.algo);
  const combinedPrefix = selectedAlgos.map(a => a.toLowerCase()).join("_");
  const comparisonChart = charts.find(c =>
    c.toLowerCase().includes("comparison_bar_chart") &&
    c.toLowerCase().includes(combinedPrefix)
  );
  const throughputChart = charts.find(c =>
    c.toLowerCase().includes("throughput_cpuutil") &&
    c.toLowerCase().includes(combinedPrefix)
  );
  const ganttChart = activeTab !== "summary"
    ? charts.find(c =>
        c.toLowerCase().includes("gantt") &&
        c.toLowerCase().includes(activeTab.toLowerCase())
      )
    : null;
  const algoMetrics = activeTab !== "summary"
    ? metrics[activeTab]?.metrics?.metrics
    : null;

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden pt-28">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-rose-400 opacity-20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-rose-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-rose-400 opacity-10 rounded-full blur-2xl"></div>
      </div>
      {/* Heading and PDF Download */}
      <div className="w-full max-w-7xl mx-auto flex flex-row justify-between items-center mt-12 mb-4 px-8 z-10 relative">
        <h1 className="text-4xl font-extrabold text-white drop-shadow text-left">Result Dashboard</h1>
        {reports.length > 0 && (
          <button
            className="flex items-center gap-2 bg-rose-400 hover:bg-rose-500 text-black font-bold py-2 px-5 rounded-lg shadow transition self-end"
            style={{ marginRight: 8 }}
            onClick={() => {
              window.open(`http://localhost:5000/api/reports/${reports[0]}`, "_blank");
            }}
            tabIndex={0}
          >
            <Download size={20} color="black" aria-label="Download PDF Report" />
            <span className="font-bold">Download Report</span>
          </button>
        )}
      </div>
      {/* Tabs for each algorithm */}
      <div className="w-full max-w-7xl mx-auto flex flex-row gap-2 mb-8 px-8 z-10 relative">
        <button
          key="summary"
          className={`px-6 py-3 rounded-full font-bold text-lg border-2 transition-all
            ${activeTab === "summary"
              ? "bg-rose-400 text-black border-rose-400 shadow"
              : "bg-neutral-950 text-rose-400 border-neutral-800 hover:bg-rose-950 hover:border-rose-400"
            }`}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
        {selectedAlgos.map(algo => (
          <button
            key={algo}
            className={`px-6 py-3 rounded-full font-bold text-lg border-2 transition-all
              ${activeTab === algo
                ? "bg-rose-400 text-black border-rose-400 shadow"
                : "bg-neutral-950 text-rose-400 border-neutral-800 hover:bg-rose-950 hover:border-rose-400"
              }`}
            onClick={() => setActiveTab(algo)}
          >
            {algo}
          </button>
        ))}
      </div>
      {/* Fastest/Slowest summary above boxes */}
      {activeTab === "summary" && (
        <div className="w-full max-w-7xl px-8 mx-auto z-10 relative">
          <div className="w-full flex flex-row gap-8 mb-8 items-center justify-center">
            {/* Fastest Box */}
            <button
              className="inline-block cursor-pointer items-center justify-center rounded-xl border-[1.58px] border-rose-400 bg-zinc-950 px-8 py-4 font-bold text-rose-400 shadow-md transition-all duration-300 hover:[transform:translateY(-.335rem)] hover:shadow-xl flex gap-2"
              style={{ minWidth: "280px", marginLeft: 8 }}
              tabIndex={-1}
              disabled
            >
              <span>
                Fastest: {fastestAlgos.join(", ")}
                <span className="text-rose-300/85"> ─ {fmt(minTurnaround)} ms</span>
              </span>
            </button>
            {/* Slowest Box */}
            <button
              className="inline-block cursor-pointer items-center justify-center rounded-xl border-[1.58px] border-rose-400 bg-zinc-950 px-8 py-4 font-bold text-rose-400 shadow-md transition-all duration-300 hover:[transform:translateY(-.335rem)] hover:shadow-xl flex gap-2"
              style={{ minWidth: "280px", marginRight: 8 }}
              tabIndex={-1}
              disabled
            >
              <span>
                Slowest: {slowestAlgos.join(", ")}
                <span className="text-rose-300/85"> ─ {fmt(maxTurnaround)} ms</span>
              </span>
            </button>
          </div>
          {/* Stat boxes for all algorithms horizontally */}
          {selectedAlgos.map(algo => {
            const m = metrics[algo]?.metrics?.metrics;
            return (
              <div key={algo} className="mb-8" style={{ marginLeft: 8, marginRight: 8 }}>
                <div className="text-2xl font-bold text-rose-400 mb-4 text-left">{algo}</div>
                <div className="grid grid-cols-5 gap-0 w-full">
                  {[
                    {
                      icon: <Timer size={22} className="rose-text-breathing" />,
                      label: "Turnaround",
                      value: `${fmt(m?.avg_turnaround)} `,
                      unit: "ms"
                    },
                    {
                      icon: <Clock size={22} className="rose-text-breathing" />,
                      label: "Waiting",
                      value: `${fmt(m?.avg_waiting)} `,
                      unit: "ms"
                    },
                    {
                      icon: <Cpu size={22} className="rose-text-breathing" />,
                      label: "CPU %",
                      value: `${fmt(m?.cpu_utilization * 100)} `,
                      unit: "%"
                    },
                    {
                      icon: <TrendingUp size={22} className="rose-text-breathing" />,
                      label: "Throughput",
                      value: `${fmt(m?.throughput)} `,
                      unit: "ops/s"
                    },
                    {
                      icon: <BarChart2 size={22} className="rose-text-breathing" />,
                      label: "Total",
                      value: `${fmt(m?.total_time)} `,
                      unit: "s"
                    }
                  ].map((card, idx) => (
                    <div
                      key={card.label}
                      className={`bg-transparent border-2 border-neutral-800 shadow-xl px-10 py-10 flex flex-col items-start justify-center min-h-[150px] transition-all
                        ${idx === 0 ? "rounded-l-2xl" : ""}
                        ${idx === 4 ? "rounded-r-2xl" : ""}
                        `}
                      style={{
                        borderRight: idx === 4 ? "none" : undefined,
                        marginLeft: idx === 0 ? 8 : 0,
                        marginRight: idx === 4 ? 8 : 0
                      }}
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
            );
          })}
          {(comparisonChart || throughputChart) && (
            <div className="flex flex-row gap-8 justify-center items-stretch w-full mb-8 mt-8">
              {comparisonChart && (
                <div className="bg-transparent border-2 border-neutral-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-1/2" style={{ marginLeft: 8 }}>
                  <img
                    src={`http://localhost:5000/api/charts/${comparisonChart}`}
                    alt={comparisonChart}
                    className="max-w-full border border-neutral-800 bg-black rounded-lg"
                  />
                </div>
              )}
              {throughputChart && (
                <div className="bg-transparent border-2 border-neutral-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-1/2" style={{ marginRight: 8 }}>
                  <img
                    src={`http://localhost:5000/api/charts/${throughputChart}`}
                    alt={throughputChart}
                    className="max-w-full border border-neutral-800 bg-black rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {activeTab !== "summary" && (
        <div className="w-full max-w-7xl px-8 mx-auto mb-10 z-10 relative">
          <div className="mb-8" style={{ marginLeft: 8, marginRight: 8 }}>
            <div className="text-2xl font-bold text-rose-400 mb-4 text-left">{activeTab}</div>
            <div className="grid grid-cols-5 gap-0 w-full">
              {[
                {
                  icon: <Timer size={22} className="rose-text-breathing" />,
                  label: "Turnaround",
                  value: `${fmt(algoMetrics?.avg_turnaround)} `,
                  unit: "ms"
                },
                {
                  icon: <Clock size={22} className="rose-text-breathing" />,
                  label: "Waiting",
                  value: `${fmt(algoMetrics?.avg_waiting)} `,
                  unit: "ms"
                },
                {
                  icon: <Cpu size={22} className="rose-text-breathing" />,
                  label: "CPU %",
                  value: `${fmt(algoMetrics?.cpu_utilization * 100)} `,
                  unit: "%"
                },
                {
                  icon: <TrendingUp size={22} className="rose-text-breathing" />,
                  label: "Throughput",
                  value: `${fmt(algoMetrics?.throughput)} `,
                  unit: "ops/s"
                },
                {
                  icon: <BarChart2 size={22} className="rose-text-breathing" />,
                  label: "Total",
                  value: `${fmt(algoMetrics?.total_time)} `,
                  unit: "s"
                }
              ].map((card, idx) => (
                <div
                  key={card.label}
                  className={`bg-transparent border-2 border-neutral-800 shadow-xl px-10 py-10 flex flex-col items-start justify-center min-h-[150px] transition-all
                    ${idx === 0 ? "rounded-l-2xl" : ""}
                    ${idx === 4 ? "rounded-r-2xl" : ""}
                    `}
                  style={{
                    borderRight: idx === 4 ? "none" : undefined,
                    marginLeft: idx === 0 ? 8 : 0,
                    marginRight: idx === 4 ? 8 : 0
                  }}
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
          {ganttChart && (
            <div className="bg-transparent border-2 border-neutral-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full mb-8" style={{ marginLeft: 8, marginRight: 8 }}>
              <img
                src={`http://localhost:5000/api/charts/${ganttChart}`}
                alt={ganttChart}
                className="max-w-full border border-neutral-800 bg-black rounded-lg"
              />
            </div>
          )}
        </div>
      )}
      <style>{breathingStyle}</style>
    </div>
  );
}