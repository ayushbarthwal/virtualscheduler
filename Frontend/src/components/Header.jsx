import React from 'react'

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-transparent shadow-xl z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <h1 className="text-2xl font-extrabold text-white drop-shadow text-center">
          <span className="text-rose-400">CPU</span> Scheduler Simulator
        </h1>
        <a
          href="https://github.com/ayushbarthwal"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-6 text-rose-400 hover:text-rose-500 font-bold text-lg transition"
          style={{ textDecoration: "none" }}
        >
          About Us
        </a>
      </div>
    </header>
  )
}

export default Header