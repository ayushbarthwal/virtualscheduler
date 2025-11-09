import React, { useState, useRef, useEffect } from 'react';

const TEAM = [
  { name: "Ayush Barthwal", img: "ayush.webp" },
  { name: "Akshat Verma", img: "akshat.webp" },
  { name: "Garv Sabharwal", img: "garv.webp" },
  { name: "Manas Thapa", img: "manas.webp" }
];

function Header() {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    if (!showModal) return;
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") setShowModal(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showModal]);

  const getProfilePic = (img, name) => (
    <img
      src={`/pics/${img}`}
      alt={name}
      className="w-12 h-12 object-cover rounded-full"
      onError={e => {
        e.target.onerror = null;
        e.target.style.display = 'none';
        e.target.parentNode.innerHTML = `<span class='w-12 h-12 flex items-center justify-center bg-neutral-800 rounded-full text-xs text-neutral-400 text-center'>img</span>`;
      }}
    />
  );

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-black/30 backdrop-blur-md shadow-xl z-50">
        <div className="max-w-6xl mx-auto flex flex-row items-center justify-between h-16 px-4 sm:px-6">
          <h1 className="text-lg sm:text-2xl font-extrabold text-white drop-shadow text-left">
            <span className="text-rose-400">CPU</span> Scheduler Simulator
          </h1>
          <button
            className="text-rose-400 hover:text-rose-500 font-bold text-base sm:text-lg transition bg-transparent border-none outline-none px-2 py-1"
            style={{ textDecoration: "none" }}
            onClick={() => setShowModal(true)}
          >
            About Us
          </button>
        </div>
      </header>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="bg-neutral-950/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 sm:p-8 min-w-[90vw] sm:min-w-[340px] max-w-[95vw] flex flex-col items-center relative"
            style={{
              boxShadow: "0 8px 32px 0 rgba(0,0,0,0.37)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            {/* Close button above modal content */}
            <div className="w-full flex justify-end mb-2">
              <button
                className="text-neutral-400 hover:text-rose-400 text-2xl sm:text-2xl font-bold rounded-full bg-black/30 backdrop-blur px-3 py-2 sm:px-2 sm:py-1 transition shadow hover:scale-110"
                onClick={() => setShowModal(false)}
                aria-label="Close"
                tabIndex={0}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15"/>
                  <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-rose-400 mb-2 text-center">
              Cloud-Based Virtual Scheduling Machine
            </h2>
            <div className="text-xs sm:text-base text-neutral-400 mb-4 text-center">
              <span className="text-xs text-neutral-500">B.Tech CSE Project</span>
            </div>
            <div className="w-full mb-2 flex flex-col gap-4 sm:gap-6 items-center">
              {TEAM.map(member => (
                <div key={member.name} className="flex flex-row items-center gap-2 sm:gap-4">
                  <div>
                    {getProfilePic(member.img, member.name)}
                  </div>
                  <div className="text-base sm:text-2xl font-bold text-white text-center">{member.name}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-neutral-500 mt-4 text-center">
              This project simulates and visualizes CPU scheduling algorithms, providing a modular sandbox for analysis and comparison.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;