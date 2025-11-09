import React, { useEffect } from "react";
import { Play } from "lucide-react";

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

// Simulation button style (Uiverse.io by Tsiangana, accent gradient, white icon/text)
const simulationBtnStyle = `
.simulation-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition-duration: 0.3s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
  background: linear-gradient(
    250deg,
    #fb7185 15%,
    #f43f5e 65%
  );
}
.simulation-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.simulation-sign {
  width: 100%;
  transition-duration: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.simulation-sign svg {
  width: 17px;
  height: 17px;
}
.simulation-sign svg path {
  fill: #fff;
  transition: fill 0.3s;
}
.simulation-text {
  position: absolute;
  right: 0%;
  width: 0%;
  opacity: 0;
  color: #fff;
  font-size: 1.1em;
  font-weight: 600;
  transition-duration: 0.3s;
  text-align: left;
  padding-left: 0;
}
.simulation-btn:hover {
  width: 125px;
  border-radius: 40px;
  transition-duration: 0.3s;
}
.simulation-btn:hover .simulation-sign {
  width: 30%;
  transition-duration: 0.3s;
  padding-left: 10px;
}
.simulation-btn:hover .simulation-text {
  opacity: 1;
  width: 70%;
  transition-duration: 0.3s;
  padding-right: 10px;
  padding-left: 3px;
}
.simulation-btn:active {
  transform: translate(2px, 2px);
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

export default function ProcessConfigPanel({
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
  error
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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

  // Height of the simulate button
  const simulateButtonHeight = 72; // px

  // Custom rose scrollbar style
  const roseScrollbar = {
    scrollbarColor: "#fb7185 #222",
    scrollbarWidth: "thin"
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full bg-black relative flex flex-col items-center overflow-hidden pt-28" style={{ height: "100vh", maxHeight: "100vh" }}>
      {/* Animated background elements */}
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
          className="flex-1 bg-transparent rounded-3xl shadow-2xl p-8 min-w-[400px] flex flex-col overflow-hidden relative"
          style={{ position: "relative", border: "none" }}
        >
          {/* Header row: Add Process (left), Context Switch & Time Quantum (right) */}
          <div className="flex items-center justify-between mb-10 w-full">
            {/* Left: Add Process */}
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
            {/* Right: Context Switch & Time Quantum */}
            <div
              className="flex flex-row gap-8 items-center justify-center h-[84px]"
              style={{ minWidth: 370 }}
            >
              <div className="flex flex-row items-center gap-2">
                <label className="font-extrabold text-rose-400 text-base tracking-tight text-left whitespace-nowrap mb-1">
                  Context Switch (ms)
                </label>
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
              <div className="flex flex-row items-center gap-2">
                <label className="font-extrabold text-rose-400 text-base tracking-tight text-left whitespace-nowrap mb-1">
                  Time Quantum (ms)
                </label>
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
          {/* Table with scroll, fills remaining space above button */}
          <div
            className="rounded-2xl bg-transparent p-2 overflow-y-auto"
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              marginBottom: `${simulateButtonHeight}px`,
              ...roseScrollbar,
              border: "none"
            }}
          >
            <table className="w-full">
              <thead>
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
          {/* Simulation button as box footer, full width and rose */}
          <div
            className="absolute left-0 bottom-0 w-full flex justify-center items-center"
            style={{
              height: `${simulateButtonHeight}px`,
              background: "transparent",
              borderBottomLeftRadius: "24px",
              borderBottomRightRadius: "24px",
              borderTop: "none",
              zIndex: 10
            }}
          >
            <button
              type="button"
              disabled={!isWorkloadValid()}
              onClick={onRun}
              className="simulation-btn"
            >
              <span className="simulation-sign">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </span>
              <span className="simulation-text">Simulate</span>
            </button>
          </div>
        </div>
      </div>
      {error && <p className="text-center text-base mt-8 text-red-400">Error: {error}</p>}
      {/* Custom scrollbar CSS for rose scroll and hide number input arrows */}
      <style>{`
        .rounded-2xl::-webkit-scrollbar, .bg-neutral-950::-webkit-scrollbar {
          width: 8px;
          background: #222;
        }
        .rounded-2xl::-webkit-scrollbar-thumb, .bg-neutral-950::-webkit-scrollbar-thumb {
          background: #fb7185;
          border-radius: 8px;
        }
        /* Hide number input arrows Chrome, Safari, Edge */
        input[type=number].hide-spin::-webkit-inner-spin-button, 
        input[type=number].hide-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Hide number input arrows Firefox */
        input[type=number].hide-spin {
          -moz-appearance: textfield;
        }
      `}</style>
      <style>{breathingStyle}</style>
      <style>{addProcessBtnStyle}</style>
      <style>{simulationBtnStyle}</style>
    </div>
  );
}