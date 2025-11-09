import React from "react";
import {
  Timer,
  BarChart2,
  Cpu,
  TrendingUp,
  Shuffle,
  Layers
} from "lucide-react";

const ALGORITHMS = [
  {
    key: 'FCFS',
    label: 'First Come First Serve',
    desc: 'Non-preemptive, processes served in order',
    icon: <Timer className="text-rose-400" size={32} />
  },
  {
    key: 'SJF',
    label: 'Shortest Job First',
    desc: 'Non-preemptive, shortest burst time first',
    icon: <BarChart2 className="text-rose-400" size={32} />
  },
  {
    key: 'SRTF',
    label: 'Shortest Remaining Time First',
    desc: 'Preemptive version of SJF',
    icon: <Shuffle className="text-rose-400" size={32} />
  },
  {
    key: 'RR',
    label: 'Round Robin',
    desc: 'Preemptive with time quantum',
    icon: <Cpu className="text-rose-400" size={32} />
  },
  {
    key: 'Priority',
    label: 'Priority Scheduling',
    desc: 'Based on process priority',
    icon: <TrendingUp className="text-rose-400" size={32} />
  },
  {
    key: 'MLFQ',
    label: 'Multi-Level Feedback Queue',
    desc: 'Dynamic priority adjustment',
    icon: <Layers className="text-rose-400" size={32} />
  }
];

export default function AlgorithmSelector({ onSelect, selected }) {
  // Increased top padding for more space above content
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full bg-black relative overflow-hidden pt-28">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-rose-400 opacity-20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-rose-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-rose-400 opacity-10 rounded-full blur-2xl"></div>
      </div>
      <h2 className="text-5xl font-extrabold mb-10 w-full max-w-md text-center z-10 relative">
        <span className="text-white">Select </span>
        <span className="text-rose-400 animate-pulse">Scheduling Algorithm</span>
      </h2>
      <div className="flex flex-col gap-6 w-full max-w-md z-10 relative">
        {ALGORITHMS.map(alg => (
          <div
            key={alg.key}
            className={`cursor-pointer p-6 rounded-xl border w-full text-left flex items-center gap-4 group
              ${selected === alg.key
                ? 'border-rose-400 bg-neutral-900 shadow-lg scale-105'
                : 'border-neutral-800 bg-neutral-950'
              }`}
            onClick={() => onSelect(alg.key)}
            style={{ transition: "transform 0.4s cubic-bezier(.22,1,.36,1)" }}
            // Smooth magnify on hover
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
            onMouseLeave={e => e.currentTarget.style.transform = selected === alg.key ? "scale(1.05)" : "scale(1)"}
          >
            <div className="flex-shrink-0">{alg.icon}</div>
            <div>
              <div className="text-xl font-bold text-rose-400 group-hover:animate-pulse">{alg.label}</div>
              <div className="text-neutral-400 text-sm mt-1">{alg.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}