import React, { useEffect } from "react";
import { Play, Download } from "lucide-react";

// Text color breathing animation for icons
const breathingStyle = `
@keyframes rose-text-breathing {
  0%, 100% { color: #fb7185; }
  50% { color: #f43f5e; }
}
.rose-text-breathing {
  animation: rose-text-breathing 2s infinite;
}
`;

// Accent button style: rose text/border, black background, hover inverts
const addProcessBtnStyle = `
.btn {
  color: #fb7185;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid #fb7185;
  padding: 10px 20px;
  font-size: 17px;
  cursor: pointer;
  font-weight: bold;
  background: #000;
  position: relative;
  transition: all 1s;
  overflow: hidden;
  border-radius: 9999px;
  letter-spacing: 0.03em;
}
.btn:hover {
  color: #000;
  background: #fb7185;
  border-color: #000;
}
.btn::before {
  content: "";
  position: absolute;
  height: 100%;
  width: 0%;
  top: 0;
  left: -40px;
  transform: skewX(45deg);
  background-color: #fb7185;
  z-index: -1;
  transition: all 1s;
  border-radius: 9999px;
}
.btn:hover::before {
  width: 160%;
}
`;

// Next button style (copied from AlgorithmSelector)
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

function ArrowButtons({ value, min, onChange }) {
  return (
    <div className="flex flex-col ml-2">
      <button
        type="button"
        className="rose-text-breathing hover:text-rose-500 p-0 leading-none"
        style={{ fontSize: "1.1rem", lineHeight: "1" }}
        onClick={() => onChange(Math.max(Number(value) + 1, min))}
        tabIndex={-1}
      >
        ▲
      </button>
      <button
        type="button"
        className="rose-text-breathing hover:text-rose-500 p-0 leading-none"
        style={{ fontSize: "1.1rem", lineHeight: "1" }}
        onClick={() => onChange(Math.max(Number(value) - 1, min))}
        tabIndex={-1}
      >
        ▼
      </button>
    </div>
  );
}

const Loader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
    <div className="ai-matrix-loader">
      <div className="digit">0</div>
      <div className="digit">1</div>
      <div className="digit">0</div>
      <div className="digit">1</div>
      <div className="digit">1</div>
      <div className="digit">0</div>
      <div className="digit">0</div>
      <div className="digit">1</div>
      <div className="glow"></div>
    </div>
    <style>{`
      .ai-matrix-loader {
        width: 120px;
        height: 160px;
        margin: 30px auto;
        position: relative;
        perspective: 800px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5px;
      }
      .digit {
        color: #fb7185;
        font-family: monospace;
        font-size: 32px;
        text-align: center;
        text-shadow: 0 0 8px #fb7185;
        animation:
          matrix-fall 2s infinite,
          matrix-flicker 0.5s infinite;
        opacity: 0;
      }
      .digit:nth-child(1) { animation-delay: 0.1s; }
      .digit:nth-child(2) { animation-delay: 0.3s; }
      .digit:nth-child(3) { animation-delay: 0.5s; }
      .digit:nth-child(4) { animation-delay: 0.7s; }
      .digit:nth-child(5) { animation-delay: 0.9s; }
      .digit:nth-child(6) { animation-delay: 1.1s; }
      .digit:nth-child(7) { animation-delay: 1.3s; }
      .digit:nth-child(8) { animation-delay: 1.5s; }
      .glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
          circle,
          rgba(251, 113, 133, 0.1) 0%,
          transparent 70%
        );
        animation: matrix-pulse 2s infinite;
      }
      @keyframes matrix-fall {
        0% {
          transform: translateY(-50px) rotateX(90deg);
          opacity: 0;
        }
        20%, 80% {
          transform: translateY(0) rotateX(0deg);
          opacity: 0.8;
        }
        100% {
          transform: translateY(50px) rotateX(-90deg);
          opacity: 0;
        }
      }
      @keyframes matrix-flicker {
        0%, 19%, 21%, 100% { opacity: 0.8; }
        20% { opacity: 0.2; }
      }
      @keyframes matrix-pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.7; }
      }
    `}</style>
  </div>
);

// Mobile detection hook
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

// Mobile UI component
function MobileProcessConfigPanel({
  workload,
  onWorkloadChange,
  addWorkloadRow,
  removeWorkloadRow,
  contextSwitch,
  onContextSwitchChange,
  timeQuantum,
  onTimeQuantumChange,
  onRun,
  isWorkloadValid,
  loading,
  error,
  schedulingReports
}) {
  const DEFAULT_COLUMNS = [
    { key: 'process', label: 'Name', type: 'text', min: 0 },
    { key: 'arrival', label: 'Arrival', type: 'number', min: 0 },
    { key: 'burst', label: 'Burst', type: 'number', min: 1 },
    { key: 'priority', label: 'Priority', type: 'number', min: 1 }
  ];

  const numberInputClass =
    "bg-neutral-900 text-white rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 text-base font-bold border border-neutral-700 w-full appearance-none hide-spin text-center";

  const settingsInputClass =
    "bg-neutral-900 text-white rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 text-base font-bold border border-neutral-700 w-full appearance-none hide-spin text-center";

  const simulateButtonHeight = 72; // px

  const roseScrollbar = {
    scrollbarColor: "#fb7185 #222",
    scrollbarWidth: "thin"
  };

  // Defensive: Ensure workload is always an array
  const safeWorkload = Array.isArray(workload) ? workload : [];

  return (
    <div className="w-full bg-black relative flex flex-col items-center overflow-hidden pt-16 sm:pt-24" style={{ height: "100vh", maxHeight: "100vh" }}>
      <style>{nextBtnStyles}</style>
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top bloom center */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-rose-400 opacity-20 rounded-full blur-2xl animate-pulse"></div>
        {/* Bottom bloom center */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-rose-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      <div className="w-full max-w-md pb-2 px-4 sm:px-8" style={{ marginLeft: "8px" }}>
        <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 text-left" style={{ marginLeft: "2px" }}>
          <span className="text-white">Configure </span>
          <span className="text-rose-400">Processes & Settings</span>
        </h2>
        <div className="flex items-center justify-center gap-2" style={{ height: "48px", marginTop: "18px", marginBottom: "10px" }}>
          <button
            type="button"
            className="btn"
            onClick={addWorkloadRow}
            style={{
              minWidth: "100px",
              fontSize: "15px",
              padding: "8px 14px"
            }}
          >
            + Add Process
          </button>
        </div>
      </div>
      <div className="w-full max-w-md flex flex-row gap-2 items-center justify-center h-[48px] px-4 sm:px-8"
        style={{ minWidth: 0, marginTop: "12px", marginBottom: "16px" }}>
        <div className="flex flex-col items-center justify-center w-1/2">
          <label
            className="font-extrabold text-rose-400 text-xs tracking-tight text-center whitespace-nowrap"
            style={{ marginBottom: "8px", marginTop: "-4px" }}
          >
            Context Switch (ms)
          </label>
          <div className="flex flex-row items-center gap-1">
            <input
              type="number"
              min="0"
              value={contextSwitch}
              onChange={e => onContextSwitchChange(e)}
              className={settingsInputClass}
              style={{
                width: "2.8rem",
                fontVariantNumeric: "tabular-nums",
                height: "28px",
                marginLeft: "4px"
              }}
              required
            />
            <ArrowButtons
              value={contextSwitch}
              min={0}
              onChange={val => onContextSwitchChange({ target: { value: val } })}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-1/2">
          <label
            className="font-extrabold text-rose-400 text-xs tracking-tight text-center whitespace-nowrap"
            style={{ marginBottom: "8px", marginTop: "-4px" }}
          >
            Time Quantum (ms)
          </label>
          <div className="flex flex-row items-center gap-1">
            <input
              type="number"
              min="1"
              value={timeQuantum}
              onChange={onTimeQuantumChange}
              className={settingsInputClass}
              style={{
                width: "2.8rem",
                fontVariantNumeric: "tabular-nums",
                height: "28px",
                marginLeft: "4px"
              }}
              required
            />
            <ArrowButtons
              value={timeQuantum}
              min={1}
              onChange={val => onTimeQuantumChange({ target: { value: val } })}
            />
          </div>
        </div>
      </div>
      <div
        className="w-full max-w-md rounded-2xl bg-transparent p-1 overflow-y-auto"
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          marginBottom: `${simulateButtonHeight}px`,
          ...roseScrollbar,
          border: "none",
          marginLeft: "0px",
          marginRight: "0px"
        }}
      >
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl">
            <tr>
              {DEFAULT_COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="text-rose-400 font-extrabold px-1 py-1 text-xs tracking-tight"
                  style={{ textAlign: "center" }}
                >
                  {col.label}
                </th>
              ))}
              <th
                className="text-rose-400 font-extrabold px-1 py-1 text-xs tracking-tight"
                style={{ textAlign: "center" }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {safeWorkload.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr className="rounded-xl" style={{ height: "36px" }}>
                  {DEFAULT_COLUMNS.map(col => (
                    <td key={col.key} className="px-1 py-1 align-middle" style={{ textAlign: "center", verticalAlign: "top" }}>
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center">
                          <input
                            type={col.type}
                            min={col.min}
                            value={row[col.key]}
                            onChange={e =>
                              onWorkloadChange(idx, col.key,
                                col.type === 'number'
                                  ? Math.max(Number(e.target.value), col.min)
                                  : e.target.value
                              )
                            }
                            className={col.type === 'number'
                              ? `${numberInputClass} text-center text-xs`
                              : "bg-neutral-900 text-white rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs font-bold border border-neutral-700 text-center"
                            }
                            style={{
                              width: col.key === 'process' ? "2.5rem" : col.type === 'number' ? "2.8rem" : "100%",
                              fontVariantNumeric: "tabular-nums",
                              marginRight: col.key === 'process' ? "0.15rem" : undefined,
                              paddingLeft: col.key === 'process' ? "0.3rem" : undefined,
                              paddingRight: col.key === 'process' ? "0.3rem" : undefined,
                              textAlign: "center"
                            }}
                            required
                            inputMode={col.type === 'number' ? "numeric" : undefined}
                          />
                          {col.type === 'number' && (
                            <ArrowButtons
                              value={row[col.key]}
                              min={col.min}
                              onChange={val => onWorkloadChange(idx, col.key, val)}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                  ))}
                  <td className="px-1 py-1 align-middle" style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className={`border-2 border-rose-500 text-rose-500 bg-black rounded-xl px-2 py-1 font-extrabold shadow hover:shadow-xl transition text-xs tracking-tight ${
                        safeWorkload.length === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-950'
                      }`}
                      onClick={() => removeWorkloadRow(idx)}
                      disabled={safeWorkload.length === 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={DEFAULT_COLUMNS.length + 1} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        height: "18px",
                        borderBottom: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <svg width="90%" height="18px" style={{ display: "block", margin: "0 auto" }}>
                        <g>
                          {Array.from({ length: 40 }).map((_, i) => (
                            <rect
                              key={i}
                              x={i * 8}
                              y={6}
                              width={6}
                              height={2}
                              rx={1}
                              fill="#22262A"
                            />
                          ))}
                        </g>
                      </svg>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {Array.isArray(schedulingReports) && schedulingReports.length > 0 && (
        <div className="fixed bottom-20 left-4 sm:bottom-8 sm:left-8 z-20">
          <button
            className="flex items-center gap-2 bg-rose-400 hover:bg-rose-500 text-black font-bold py-2 px-3 rounded-lg shadow transition text-xs"
            onClick={() => {
              window.open(`http://localhost:5000/api/reports/${schedulingReports[0]}`, "_blank");
            }}
            tabIndex={0}
          >
            <Download size={16} color="black" aria-label="Download PDF Report" />
            <span className="font-bold">Download Report</span>
          </button>
        </div>
      )}
      {/* Next button with blurred background behind only the button, not the accent border or arrow */}
      <div className="styled-wrapper fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-30" style={{ width: 76, height: 76 }}>
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
          onClick={onRun}
          disabled={!isWorkloadValid()}
          aria-label="Simulate"
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
      {error && <p className="text-center text-base mt-8 text-red-400">Error: {error}</p>}
      <style>{`
        .rounded-2xl::-webkit-scrollbar, .bg-neutral-950::-webkit-scrollbar {
          width: 8px;
          background: #222;
        }
        .rounded-2xl::-webkit-scrollbar-thumb, .bg-neutral-950::-webkit-scrollbar-thumb {
          background: #fb7185;
          border-radius: 8px;
        }
        input[type=number].hide-spin::-webkit-inner-spin-button, 
        input[type=number].hide-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number].hide-spin {
          -moz-appearance: textfield;
        }
      `}</style>
      <style>{breathingStyle}</style>
      <style>{addProcessBtnStyle}</style>
    </div>
  );
}

export default function ProcessConfigPanel(props) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Defensive: Ensure workload is always an array
  const workload = Array.isArray(props.workload) ? props.workload : [];

  if (props.loading) {
    return <Loader />;
  }

  if (isMobile) {
    return <MobileProcessConfigPanel {...props} workload={workload} />;
  }

  // Desktop UI (original code)
  const {
    onWorkloadChange,
    addWorkloadRow,
    removeWorkloadRow,
    contextSwitch,
    onContextSwitchChange,
    timeQuantum,
    onTimeQuantumChange,
    onRun,
    isWorkloadValid,
    error,
    schedulingReports
  } = props;

  const DEFAULT_COLUMNS = [
    { key: 'process', label: 'Name', type: 'text', min: 0 },
    { key: 'arrival', label: 'Arrival', type: 'number', min: 0 },
    { key: 'burst', label: 'Burst', type: 'number', min: 1 },
    { key: 'priority', label: 'Priority', type: 'number', min: 1 }
  ];

  const numberInputClass =
    "bg-neutral-900 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 text-lg font-bold border border-neutral-700 w-full appearance-none hide-spin text-center";

  const settingsInputClass =
    "bg-neutral-900 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 text-lg font-bold border border-neutral-700 w-full appearance-none hide-spin text-center";

  const simulateButtonHeight = 72; // px

  const roseScrollbar = {
    scrollbarColor: "#fb7185 #222",
    scrollbarWidth: "thin"
  };

  return (
    <div className="w-full bg-black relative flex flex-col items-center overflow-hidden pt-28" style={{ height: "100vh", maxHeight: "100vh" }}>
      <style>{nextBtnStyles}</style>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-rose-400 opacity-20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-rose-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-rose-400 opacity-10 rounded-full blur-2xl"></div>
      </div>
      <div className="w-full max-w-6xl pb-2 px-4">
        <h2 className="text-5xl font-extrabold mb-2 text-left">
          <span className="text-white">Configure </span>
          <span className="text-rose-400">Processes & Settings</span>
        </h2>
      </div>
      <div className="w-full max-w-6xl flex justify-start flex-1 overflow-hidden px-4 mt-2" style={{ minHeight: 0, marginBottom: "10px" }}>
        <div
          className="flex-1 bg-transparent backdrop-blur-2xl rounded-3xl shadow-2xl p-8 min-w-[400px] flex flex-col overflow-hidden relative"
          style={{
            position: "relative",
            border: "none",
            minHeight: "calc(100vh - 120px)",
            maxHeight: "calc(100vh - 120px)",
            height: "calc(100vh - 120px)",
            justifyContent: "flex-start"
          }}
        >
          <div className="flex items-center justify-between mb-10 w-full">
            <div className="flex items-center gap-4" style={{ height: "84px" }}>
              <button
                type="button"
                className="btn"
                onClick={addWorkloadRow}
                style={{
                  minWidth: "120px"
                }}
              >
                + Add Process
              </button>
            </div>
            <div
              className="flex flex-row gap-8 items-center justify-center h-[84px]"
              style={{ minWidth: 370 }}
            >
              <div className="flex flex-col items-center justify-center">
                <label
                  className="font-extrabold text-rose-400 text-base tracking-tight text-center whitespace-nowrap"
                  style={{ marginBottom: "8px", marginTop: "-8px" }}
                >
                  Context Switch (ms)
                </label>
                <div className="flex flex-row items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={contextSwitch}
                    onChange={e => onContextSwitchChange(e)}
                    className={settingsInputClass}
                    style={{
                      width: "6rem",
                      fontVariantNumeric: "tabular-nums",
                      height: "40px",
                      marginLeft: "8px"
                    }}
                    required
                  />
                  <ArrowButtons
                    value={contextSwitch}
                    min={0}
                    onChange={val => onContextSwitchChange({ target: { value: val } })}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <label
                  className="font-extrabold text-rose-400 text-base tracking-tight text-center whitespace-nowrap"
                  style={{ marginBottom: "8px", marginTop: "-8px" }}
                >
                  Time Quantum (ms)
                </label>
                <div className="flex flex-row items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={timeQuantum}
                    onChange={onTimeQuantumChange}
                    className={settingsInputClass}
                    style={{
                      width: "6rem",
                      fontVariantNumeric: "tabular-nums",
                      height: "40px",
                      marginLeft: "8px"
                    }}
                    required
                  />
                  <ArrowButtons
                    value={timeQuantum}
                    min={1}
                    onChange={val => onTimeQuantumChange({ target: { value: val } })}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl bg-transparent p-2 overflow-y-auto"
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              marginBottom: `${simulateButtonHeight}px`,
              ...roseScrollbar,
              border: "none",
              width: "calc(100% + 4rem)",
              marginLeft: "-2rem",
              marginRight: "-2rem"
            }}
          >
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl">
                <tr>
                  {DEFAULT_COLUMNS.map(col => (
                    <th
                      key={col.key}
                      className="text-rose-400 font-extrabold px-2 py-2 text-base tracking-tight"
                      style={{ textAlign: "center" }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th
                    className="text-rose-400 font-extrabold px-2 py-2 text-base tracking-tight"
                    style={{ textAlign: "center" }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {workload.map((row, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="rounded-xl" style={{ height: "56px" }}>
                      {DEFAULT_COLUMNS.map(col => (
                        <td key={col.key} className="px-2 py-3 align-middle" style={{ textAlign: "center", verticalAlign: "top" }}>
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center">
                              <input
                                type={col.type}
                                min={col.min}
                                value={row[col.key]}
                                onChange={e =>
                                  onWorkloadChange(idx, col.key,
                                    col.type === 'number'
                                      ? Math.max(Number(e.target.value), col.min)
                                      : e.target.value
                                  )
                                }
                                className={col.type === 'number'
                                  ? `${numberInputClass} text-center`
                                  : "bg-neutral-900 text-white rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 text-base font-bold border border-neutral-700 text-center"
                                }
                                style={{
                                  width: col.key === 'process' ? "5rem" : col.type === 'number' ? "6rem" : "100%",
                                  fontVariantNumeric: "tabular-nums",
                                  marginRight: col.key === 'process' ? "0.25rem" : undefined,
                                  paddingLeft: col.key === 'process' ? "0.5rem" : undefined,
                                  paddingRight: col.key === 'process' ? "0.5rem" : undefined,
                                  textAlign: "center"
                                }}
                                required
                                inputMode={col.type === 'number' ? "numeric" : undefined}
                              />
                              {col.type === 'number' && (
                                <ArrowButtons
                                  value={row[col.key]}
                                  min={col.min}
                                  onChange={val => onWorkloadChange(idx, col.key, val)}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-3 align-middle" style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className={`border-2 border-rose-500 text-rose-500 bg-black rounded-xl px-3 py-2 font-extrabold shadow hover:shadow-xl transition text-base tracking-tight ${
                            workload.length === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-950'
                          }`}
                          onClick={() => removeWorkloadRow(idx)}
                          disabled={workload.length === 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={DEFAULT_COLUMNS.length + 1} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            height: "32px",
                            borderBottom: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <svg width="90%" height="32px" style={{ display: "block", margin: "0 auto" }}>
                            <g>
                              {Array.from({ length: 40 }).map((_, i) => (
                                <rect
                                  key={i}
                                  x={i * 24}
                                  y={14}
                                  width={18}
                                  height={4}
                                  rx={2}
                                  fill="#22262A"
                                />
                              ))}
                            </g>
                          </svg>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {Array.isArray(schedulingReports) && schedulingReports.length > 0 && (
            <div className="fixed bottom-8 left-8 z-20">
              <button
                className="flex items-center gap-2 bg-rose-400 hover:bg-rose-500 text-black font-bold py-2 px-5 rounded-lg shadow transition"
                onClick={() => {
                  window.open(`http://localhost:5000/api/reports/${schedulingReports[0]}`, "_blank");
                }}
                tabIndex={0}
              >
                <Download size={20} color="black" aria-label="Download PDF Report" />
                <span className="font-bold">Download Scheduling Report (PDF)</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Next button with blurred background behind only the button, not the accent border or arrow */}
      <div className="styled-wrapper fixed bottom-8 right-8 z-30" style={{ width: 76, height: 76 }}>
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
          onClick={onRun}
          disabled={!isWorkloadValid()}
          aria-label="Simulate"
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
      {error && <p className="text-center text-base mt-8 text-red-400">Error: {error}</p>}
      <style>{`
        .rounded-2xl::-webkit-scrollbar, .bg-neutral-950::-webkit-scrollbar {
          width: 8px;
          background: #222;
        }
        .rounded-2xl::-webkit-scrollbar-thumb, .bg-neutral-950::-webkit-scrollbar-thumb {
          background: #fb7185;
          border-radius: 8px;
        }
        input[type=number].hide-spin::-webkit-inner-spin-button, 
        input[type=number].hide-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number].hide-spin {
          -moz-appearance: textfield;
        }
      `}</style>
      <style>{breathingStyle}</style>
      <style>{addProcessBtnStyle}</style>
    </div>
  );
}