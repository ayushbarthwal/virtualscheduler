import React from "react";
import {
  Timer,
  BarChart2,
  Cpu,
  TrendingUp,
  Shuffle,
  Layers,
  CheckCircle2
} from "lucide-react";

const nextBtnStyles = `
.styled-wrapper .button {
  display: block;
  position: relative;
  width: 76px;
  height: 76px;
  margin: 0;
  overflow: hidden;
  outline: none;
  background-color: transparent;
  cursor: pointer;
  border: 0;
}
.styled-wrapper .button:before {
  content: "";
  position: absolute;
  border-radius: 50%;
  inset: 7px;
  border: 3px solid #fb7185;
  transition:
    opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
    transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
  z-index: 2;
}
.styled-wrapper .button:after {
  content: "";
  position: absolute;
  border-radius: 50%;
  inset: 7px;
  border: 4px solid #fb7185;
  transform: scale(1.3);
  transition:
    opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
    transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0;
  z-index: 2;
}
.styled-wrapper .button:hover:before,
.styled-wrapper .button:focus:before {
  opacity: 0;
  transform: scale(0.7);
  transition:
    opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
    transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.styled-wrapper .button:hover:after,
.styled-wrapper .button:focus:after {
  opacity: 1;
  transform: scale(1);
  transition:
    opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
    transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
}
.styled-wrapper .button-arrow-container {
  width: 76px;
  height: 76px;
  overflow: hidden;
  position: relative;
  z-index: 3;
}
.styled-wrapper .button-box {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  transition: 0.4s;
}
.styled-wrapper .button-elem {
  display: block;
  width: 30px;
  height: 30px;
  margin: 24px 18px 0 22px;
  fill: #fb7185;
  z-index: 3;
}
.styled-wrapper .button:hover .button-box,
.styled-wrapper .button:focus .button-box {
  transform: translateX(-69px);
}
.styled-wrapper .button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
`;

const cardAnimStyles = `
.card-transition {
  transition:
    border-color 0.35s cubic-bezier(.22,1,.36,1),
    box-shadow 0.35s cubic-bezier(.22,1,.36,1),
    background 0.35s cubic-bezier(.22,1,.36,1);
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

const ALGORITHMS = [
  {
    key: 'FCFS',
    label: 'First Come First Serve',
    desc: 'Non-preemptive, processes served in order',
    icon: <Timer className="text-rose-400" size={24} />
  },
  {
    key: 'SJF',
    label: 'Shortest Job First',
    desc: 'Non-preemptive, shortest burst time first',
    icon: <BarChart2 className="text-rose-400" size={24} />
  },
  {
    key: 'SRTF',
    label: 'Shortest Remaining Time First',
    desc: 'Preemptive version of SJF',
    icon: <Shuffle className="text-rose-400" size={24} />
  },
  {
    key: 'RR',
    label: 'Round Robin',
    desc: 'Preemptive with time quantum',
    icon: <Cpu className="text-rose-400" size={24} />
  },
  {
    key: 'Priority',
    label: 'Priority Scheduling',
    desc: 'Based on process priority',
    icon: <TrendingUp className="text-rose-400" size={24} />
  },
  {
    key: 'MLFQ',
    label: 'Multi-Level Feedback Queue',
    desc: 'Dynamic priority adjustment',
    icon: <Layers className="text-rose-400" size={24} />
  }
];

export default function AlgorithmSelector({ onSelect, selected, onNext }) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const arrowBtnHeight = 76;

  function handleCardClick(key) {
    onSelect(key);
  }

  return (
    <div
      className={`flex flex-col items-center justify-center w-full bg-black relative overflow-hidden ${
        isMobile
          ? "pt-[calc(1.1*76px)] min-h-[100vh]"
          : "pt-16 sm:pt-28 min-h-[calc(100vh-4rem)]"
      }`}
      style={{
        minHeight: isMobile ? "100vh" : undefined,
        paddingTop: isMobile ? `${arrowBtnHeight * 1.1}px` : undefined
      }}
    >
      {/* Inject Next button styles and card animation styles */}
      <style>{nextBtnStyles}</style>
      <style>{cardAnimStyles}</style>
      {/* Bloom background for mobile, matching ProcessConfigPanel */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {isMobile ? (
          <>
            {/* Top bloom center */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-rose-400 opacity-20 rounded-full blur-2xl animate-pulse"></div>
            {/* Bottom bloom center */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-rose-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
          </>
        ) : (
          <>
            <div className="absolute top-6 left-6 w-32 h-32 bg-rose-400 opacity-20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-6 right-6 w-40 h-40 bg-rose-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-rose-400 opacity-10 rounded-full blur-2xl"></div>
          </>
        )}
      </div>
      <h2
        className="text-3xl sm:text-5xl font-extrabold mb-6 sm:mb-10 w-full max-w-xs sm:max-w-md text-center z-10 relative"
        style={{
          marginTop: isMobile ? `${arrowBtnHeight * 0.15}px` : undefined,
          marginBottom: isMobile ? `${arrowBtnHeight * 0.3}px` : undefined
        }}
      >
        <span className="text-white">Select </span>
        <span className="text-rose-400 animate-pulse">Scheduling Algorithm(s)</span>
      </h2>
      <div
        className={`flex flex-col gap-4 sm:gap-6 w-full max-w-xs sm:max-w-md z-10 relative ${
          isMobile ? "" : "mb-6 sm:mb-10"
        }`}
      >
        {ALGORITHMS.map(alg => {
          const isSelected = selected.includes(alg.key);
          return (
            <div
              key={alg.key}
              className={`card-transition relative cursor-pointer p-3 sm:p-6 rounded-lg sm:rounded-xl border w-full text-left flex items-center gap-3 sm:gap-4 group
                ${isSelected
                  ? 'border-rose-400 shadow-lg'
                  : 'border-neutral-800'
                } bg-neutral-950`}
              onClick={() => handleCardClick(alg.key)}
            >
              {/* Accent tick at top-right when selected */}
              {isSelected && (
                <CheckCircle2
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 text-rose-400 drop-shadow-lg"
                  size={20}
                  strokeWidth={2.5}
                />
              )}
              <div className="flex-shrink-0">{alg.icon}</div>
              <div>
                <div className="text-base sm:text-xl font-bold text-rose-400 group-hover:animate-pulse">{alg.label}</div>
                <div className="text-xs sm:text-sm text-neutral-400 mt-1">{alg.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Spacer below last card for mobile */}
      {isMobile && (
        <div
          style={{
            height: `${arrowBtnHeight * 1.3}px`,
            width: "100%"
          }}
        />
      )}
      <div
        className={`styled-wrapper fixed ${isMobile ? "bottom-4 right-4" : "bottom-8 right-8"} z-20`}
        style={{ width: 76, height: 76 }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(24, 24, 27, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            zIndex: 1
          }}
        />
        <button
          className="button relative z-10"
          onClick={onNext}
          disabled={selected.length === 0}
          aria-label="Next"
        >
          <div className="button-arrow-container">
            <div className="button-box">
              <span className="button-elem">
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="arrow-icon"
                >
                  <path
                    fill="#fb7185"
                    d="M4 13h12.17l-5.59 5.59L12 20l8-8-8-8-1.41 1.41L16.17 11H4v2z"
                  ></path>
                </svg>
              </span>
              <span className="button-elem">
                <svg
                  fill="#fb7185"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="arrow-icon"
                >
                  <path
                    d="M4 13h12.17l-5.59 5.59L12 20l8-8-8-8-1.41 1.41L16.17 11H4v2z"
                  ></path>
                </svg>
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}