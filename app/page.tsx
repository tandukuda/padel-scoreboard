"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Settings2, Play, Pause } from "lucide-react";

// --- PADEL SCORING LOGIC ---
const POINTS = ["0", "15", "30", "40", "AD"];

const initialScore = {
  p1: 0,
  p2: 0,
  winner: null,
};

// --- COMPONENT: LED BOARD (1800x100) ---
const LEDBoard = ({ data }) => {
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setMounted(true);

    // Auto-scale logic
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const newScale = Math.min(windowWidth / 1840, 1);
      setScale(newScale);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const timer = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      );
    }, 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!mounted) return null;

  const DiagonalSeparator = () => (
    <div className="h-[50px] w-[2px] bg-[#FFF6E5] opacity-50 transform rotate-[25deg] mx-2"></div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      {scale < 0.9 && (
        <div className="absolute top-4 text-gray-500 text-xs font-mono">
          PREVIEW MODE (Scaled {(scale * 100).toFixed(0)}%) - OBS WILL SEE FULL
          1800px
        </div>
      )}

      {/* SCALE WRAPPER */}
      <div style={{ transform: `scale(${scale})` }}>
        {/* THE MAIN BOARD CONTAINER */}
        <div
          className="relative bg-[#E38035] rounded-[30px] shadow-2xl overflow-hidden"
          style={{ width: "1800px", height: "100px" }}
        >
          {/* MODE 1: SCOREBOARD */}
          {data.mode === "score" && (
            <>
              {/* LEFT COURT */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 h-[84px] min-w-[320px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-6">
                {data.left.winner ? (
                  <span className="text-4xl font-bold tracking-wider text-[#E38035] font-mono animate-pulse">
                    WINNER
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-6xl font-bold text-[#FFF6E5] font-mono w-[80px] text-right">
                      {POINTS[data.left.p1]}
                    </span>
                    <DiagonalSeparator />
                    <span className="text-6xl font-bold text-[#FFF6E5] font-mono w-[80px] text-left">
                      {POINTS[data.left.p2]}
                    </span>
                  </div>
                )}
              </div>

              {/* CENTER CLOCK */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[84px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-10 border-4 border-[#E38035]">
                <span className="text-6xl font-bold text-[#FFF6E5] font-mono tracking-widest mt-1">
                  {time}
                </span>
              </div>

              {/* RIGHT COURT */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-[84px] min-w-[320px] bg-[#0C0C0C] rounded-2xl flex items-center justify-center px-6">
                {data.right.winner ? (
                  <span className="text-4xl font-bold tracking-wider text-[#E38035] font-mono animate-pulse">
                    WINNER
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-6xl font-bold text-[#FFF6E5] font-mono w-[80px] text-right">
                      {POINTS[data.right.p1]}
                    </span>
                    <DiagonalSeparator />
                    <span className="text-6xl font-bold text-[#FFF6E5] font-mono w-[80px] text-left">
                      {POINTS[data.right.p2]}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODE 2: RUNNING TEXT */}
          {data.mode === "text" && (
            <>
              {/* Scrolling Text Layer */}
              <div className="absolute inset-0 flex items-center overflow-hidden">
                <div
                  // If isAnimating is true, use 'animate-marquee'.
                  // If false, use 'translate-x-[1800px]' to hold it off-screen to the right.
                  className={`whitespace-nowrap text-[70px] font-bold text-black uppercase ${data.isAnimating ? "animate-marquee" : "translate-x-[1800px]"}`}
                  style={{ animationDuration: "5s" }}
                >
                  {data.runningText ||
                    "WELCOME TO PADEL CHAMPIONS • ENJOY THE GAME •"}
                </div>
              </div>

              {/* Clock Overlay */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-[#0C0C0C] text-[#FFF6E5] rounded-xl px-8 py-2 shadow-2xl border-2 border-[#E38035]">
                  <span className="text-5xl font-bold font-mono tracking-widest">
                    {time}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: CONTROLLER (Admin Panel) ---
const ControlPanel = ({ broadcastScore }) => {
  const [mode, setMode] = useState("score");
  const [runningText, setRunningText] = useState(
    "CHAMPIONS DE PADEL • FINALE 2024 •",
  );
  const [isAnimating, setIsAnimating] = useState(false); // New State for Animation

  const [left, setLeft] = useState({ ...initialScore });
  const [right, setRight] = useState({ ...initialScore });

  useEffect(() => {
    // Broadcast isAnimating along with everything else
    broadcastScore({ mode, runningText, left, right, isAnimating });
  }, [mode, runningText, left, right, isAnimating]);

  const handlePoint = (court, player) => {
    const setCourt = court === "left" ? setLeft : setRight;

    setCourt((prev) => {
      if (prev.winner) return prev;
      let p1 = prev.p1;
      let p2 = prev.p2;

      if (player === 1) p1++;
      else p2++;

      if (p1 > 3 && p2 > 3) {
        if (p1 === p2) {
          p1 = 3;
          p2 = 3;
        } else if (p1 - p2 > 1) {
          return { ...prev, winner: 1 };
        } else if (p2 - p1 > 1) {
          return { ...prev, winner: 2 };
        }
      } else if (p1 > 3) {
        return { ...prev, winner: 1 };
      } else if (p2 > 3) {
        return { ...prev, winner: 2 };
      }

      return { ...prev, p1, p2 };
    });
  };

  const resetGame = (court) => {
    if (court === "left") setLeft({ ...initialScore });
    else setRight({ ...initialScore });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#E38035] tracking-wider">
          PADEL CONTROL
        </h1>
        <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
          <button
            onClick={() => setMode("score")}
            className={`px-6 py-2 rounded-md font-bold transition-all ${mode === "score" ? "bg-[#E38035] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            SCOREBOARD
          </button>
          <button
            onClick={() => setMode("text")}
            className={`px-6 py-2 rounded-md font-bold transition-all ${mode === "text" ? "bg-[#E38035] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            RUNNING TEXT
          </button>
        </div>
      </div>

      {mode === "text" && (
        <div className="bg-gray-900 p-6 rounded-xl mb-6 border border-gray-800 flex flex-col gap-4">
          <div>
            <label className="block mb-2 text-sm font-bold text-[#E38035]">
              EDIT RUNNING TEXT
            </label>
            <input
              value={runningText}
              onChange={(e) => setRunningText(e.target.value)}
              className="w-full bg-black border border-gray-700 p-4 text-xl rounded-lg text-white font-mono focus:border-[#E38035] outline-none"
              placeholder="Type message here..."
            />
          </div>

          {/* ANIMATION CONTROL BUTTON */}
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${isAnimating ? "bg-red-600 hover:bg-red-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"}`}
          >
            {isAnimating ? (
              <>
                <Pause size={24} /> STOP ANIMATION
              </>
            ) : (
              <>
                <Play size={24} /> START ANIMATION
              </>
            )}
          </button>
        </div>
      )}

      {/* ONLY SHOW SCORES IF IN SCORE MODE */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${mode === "text" ? "opacity-50 pointer-events-none grayscale" : ""}`}
      >
        <CourtController
          name="Left Court"
          color="blue"
          scoreData={left}
          onPoint={(p) => handlePoint("left", p)}
          onReset={() => resetGame("left")}
        />
        <CourtController
          name="Right Court"
          color="green"
          scoreData={right}
          onPoint={(p) => handlePoint("right", p)}
          onReset={() => resetGame("right")}
        />
      </div>
    </div>
  );
};

const CourtController = ({ name, color, scoreData, onPoint, onReset }) => {
  const colorClasses = {
    blue: {
      border: "border-blue-500",
      bg: "bg-blue-600 hover:bg-blue-500",
      text: "text-blue-100",
    },
    green: {
      border: "border-green-500",
      bg: "bg-green-600 hover:bg-green-500",
      text: "text-green-100",
    },
  };
  const colors = colorClasses[color];

  return (
    <div
      className={`bg-gray-900 p-6 rounded-2xl border-t-4 ${colors.border} shadow-xl`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-wide">{name}</h2>
        <button
          onClick={onReset}
          className="text-xs bg-red-950/50 hover:bg-red-900 text-red-200 px-4 py-2 rounded-full font-bold uppercase"
        >
          Reset
        </button>
      </div>
      <div className="text-center bg-[#0C0C0C] rounded-xl py-6 mb-6 border border-gray-800 relative overflow-hidden h-32 flex items-center justify-center">
        {scoreData.winner && (
          <div className={`absolute inset-0 opacity-20 ${colors.bg}`}></div>
        )}
        <span className="text-6xl font-mono text-white relative z-10 font-bold">
          {scoreData.winner
            ? `P${scoreData.winner} WIN`
            : `${POINTS[scoreData.p1]} - ${POINTS[scoreData.p2]}`}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onPoint(1)}
          disabled={scoreData.winner}
          className={`${colors.bg} ${colors.text} py-4 rounded-xl font-bold text-xl active:scale-95 shadow-lg`}
        >
          Player A +
        </button>
        <button
          onClick={() => onPoint(2)}
          disabled={scoreData.winner}
          className={`${colors.bg} ${colors.text} py-4 rounded-xl font-bold text-xl active:scale-95 shadow-lg`}
        >
          Player B +
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [view, setView] = useState("landing");
  const [channel, setChannel] = useState(null);
  const [boardData, setBoardData] = useState({
    mode: "score",
    left: initialScore,
    right: initialScore,
    isAnimating: false,
  });

  useEffect(() => {
    setIsClient(true);
    const bc = new BroadcastChannel("padel_channel");
    setChannel(bc);
    bc.onmessage = (event) => setBoardData(event.data);
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "board") setView("board");
    if (params.get("view") === "control") setView("control");
    return () => bc.close();
  }, []);

  const sendUpdate = (newData) => {
    if (channel) {
      channel.postMessage(newData);
      setBoardData(newData);
    }
  };

  if (!isClient) return null;
  if (view === "board") return <LEDBoard data={boardData} />;
  if (view === "control") return <ControlPanel broadcastScore={sendUpdate} />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 gap-10 font-sans text-white p-4">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-[#E38035] mb-2">
          PADEL SYSTEM
        </h1>
        <p className="text-gray-400">LED Scoreboard & Controller</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6 max-w-2xl w-full">
        <button
          onClick={() =>
            window.open("?view=board", "padel_board", "width=1800,height=100")
          }
          className="flex-1 bg-gray-900/50 p-8 rounded-2xl border-2 border-[#E38035] hover:bg-gray-900 transition-all shadow-lg text-center font-bold"
        >
          Launch LED Board (OBS)
        </button>
        <button
          onClick={() => setView("control")}
          className="flex-1 bg-gray-900/50 p-8 rounded-2xl border-2 border-blue-500 hover:bg-gray-900 transition-all shadow-lg text-center font-bold"
        >
          Open Controller
        </button>
      </div>
    </div>
  );
}
