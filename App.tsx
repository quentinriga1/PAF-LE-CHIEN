import React, { useState, useCallback, useMemo, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState, RunHistory } from './types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  
  // Unlocks
  const [rocketUnlocked, setRocketUnlocked] = useState(false);
  const [propellerUnlocked, setPropellerUnlocked] = useState(false);
  const [jetUnlocked, setJetUnlocked] = useState(false);
  const [ultimateUnlocked, setUltimateUnlocked] = useState(false);
  const [ironManUnlocked, setIronManUnlocked] = useState(false);
  const [spidermanUnlocked, setSpidermanUnlocked] = useState(false);
  
  // Equipment
  const [rocketEquipped, setRocketEquipped] = useState(false);
  const [propellerEquipped, setPropellerEquipped] = useState(false);
  const [jetEquipped, setJetEquipped] = useState(false);
  const [ironManEquipped, setIronManEquipped] = useState(false);
  const [spidermanEquipped, setSpidermanEquipped] = useState(false);
  
  // Active State
  const [isRocketIgnited, setRocketIgnited] = useState(false);
  const [isPropellerActive, setPropellerActive] = useState(false);
  const [isJetActive, setJetActive] = useState(false);
  const [isIronManActive, setIronManActive] = useState(false);
  const [isSpidermanActive, setSpidermanActive] = useState(false);
  
  const [triggerLaunch, setTriggerLaunch] = useState(false);
  
  const [score, setScore] = useState(0);
  const [fuels, setFuels] = useState({ rocket: 0, propeller: 0, jet: 0, ironMan: 0, spiderman: 0 });
  const [history, setHistory] = useState<RunHistory[]>([]);

  // Spiderman Minigame State
  const [spiderTargets, setSpiderTargets] = useState<{id: number, x: number, y: number}[]>([]);
  const [webShotCount, setWebShotCount] = useState(0);

  const bestScore = useMemo(() => {
      if (history.length === 0) return 0;
      return Math.max(...history.map(h => h.distance));
  }, [history]);

  const handleStartGame = () => {
    setGameState(GameState.CHARGING);
    setTriggerLaunch(false);
    setScore(0);
    setWebShotCount(0);
  };

  const handleLaunchClick = () => {
    if (gameState === GameState.CHARGING) {
        setTriggerLaunch(true);
    }
  };

  const handleRocketToggle = () => {
      if (rocketUnlocked) {
          const newState = !rocketEquipped;
          setRocketEquipped(newState);
          if (newState && !ultimateUnlocked) { setPropellerEquipped(false); setJetEquipped(false); }
          if (newState) { setIronManEquipped(false); setSpidermanEquipped(false); }
      }
  };

  const handlePropellerToggle = () => {
      if (propellerUnlocked) {
          const newState = !propellerEquipped;
          setPropellerEquipped(newState);
          if (newState && !ultimateUnlocked) { setRocketEquipped(false); setJetEquipped(false); }
          if (newState) { setIronManEquipped(false); setSpidermanEquipped(false); }
      }
  };

  const handleJetToggle = () => {
      if (jetUnlocked) {
          const newState = !jetEquipped;
          setJetEquipped(newState);
          if (newState && !ultimateUnlocked) { setRocketEquipped(false); setPropellerEquipped(false); }
          if (newState) { setIronManEquipped(false); setSpidermanEquipped(false); }
      }
  };
  
  const handleUltimateSelect = () => {
      if (ultimateUnlocked) {
          setRocketEquipped(true);
          setPropellerEquipped(true);
          setJetEquipped(true);
          setIronManEquipped(false);
          setSpidermanEquipped(false);
      }
  };

  const handleIronManToggle = () => {
      if (ironManUnlocked) {
          const newState = !ironManEquipped;
          setIronManEquipped(newState);
          if (newState) { 
              setRocketEquipped(false); 
              setPropellerEquipped(false); 
              setJetEquipped(false);
              setSpidermanEquipped(false);
          }
      }
  };

  const handleSpidermanToggle = () => {
      if (spidermanUnlocked) {
          const newState = !spidermanEquipped;
          setSpidermanEquipped(newState);
          if (newState) { 
              setRocketEquipped(false); 
              setPropellerEquipped(false); 
              setJetEquipped(false);
              setIronManEquipped(false);
          }
      }
  };

  const handleGameOver = useCallback((finalScore: number) => {
      setGameState(GameState.STOPPED);
      setRocketIgnited(false);
      setPropellerActive(false);
      setJetActive(false);
      setIronManActive(false);
      setSpidermanActive(false);
      setSpiderTargets([]);
      
      if (finalScore >= 500 && !rocketUnlocked) setRocketUnlocked(true);
      if (finalScore >= 1000 && !propellerUnlocked) setPropellerUnlocked(true);
      if (finalScore >= 2000 && !jetUnlocked) setJetUnlocked(true);
      if (finalScore >= 3000 && !ultimateUnlocked) setUltimateUnlocked(true);
      if (finalScore >= 5000 && !ironManUnlocked) setIronManUnlocked(true);
      if (finalScore >= 6000 && !spidermanUnlocked) setSpidermanUnlocked(true);
      
      setHistory(prev => {
        const newHistory = [...prev, { id: Date.now(), distance: finalScore, timestamp: new Date().toLocaleTimeString() }];
        return newHistory.slice(-10); // Keep last 10
      });
  }, [rocketUnlocked, propellerUnlocked, jetUnlocked, ultimateUnlocked, ironManUnlocked, spidermanUnlocked]);

  const handleRestart = () => {
      setGameState(GameState.MENU);
      setTriggerLaunch(false);
  };

  // Spiderman Mini-game Logic
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isSpidermanActive) {
          interval = setInterval(() => {
              setSpiderTargets(current => {
                  if (current.length >= 3) return current; // Max 3 targets
                  return [...current, {
                      id: Math.random(),
                      x: 10 + Math.random() * 80, // 10-90%
                      y: 20 + Math.random() * 60, // 20-80%
                  }];
              });
          }, 500); // New target every 500ms
      } else {
          setSpiderTargets([]);
      }
      return () => clearInterval(interval);
  }, [isSpidermanActive]);

  const handleTargetClick = (id: number) => {
      setSpiderTargets(current => current.filter(t => t.id !== id));
      setWebShotCount(c => c + 1);
  };

  // Helper to determine if we are in standard single-equip mode or manual override
  const isUltimateMode = rocketEquipped && propellerEquipped && jetEquipped && !ironManEquipped && !spidermanEquipped;

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden font-sans">
      {/* Game Layer */}
      <GameCanvas 
        gameState={gameState}
        setGameState={setGameState}
        
        rocketEquipped={rocketEquipped}
        isRocketIgnited={isRocketIgnited}
        setRocketIgnited={setRocketIgnited}
        
        propellerEquipped={propellerEquipped}
        isPropellerActive={isPropellerActive}
        setPropellerActive={setPropellerActive}

        jetEquipped={jetEquipped}
        isJetActive={isJetActive}
        setJetActive={setJetActive}

        ironManEquipped={ironManEquipped}
        isIronManActive={isIronManActive}
        setIronManActive={setIronManActive}

        spidermanEquipped={spidermanEquipped}
        isSpidermanActive={isSpidermanActive}
        setSpidermanActive={setSpidermanActive}
        webShotCount={webShotCount}
        
        onDistanceUpdate={setScore}
        onFuelUpdate={setFuels}
        onGameOver={handleGameOver}
        triggerLaunch={triggerLaunch}
        bestScore={bestScore}
      />

      {/* Spiderman Mini-Game Overlay */}
      {isSpidermanActive && (
          <div className="absolute inset-0 z-20 pointer-events-none">
              {spiderTargets.map(target => (
                  <button
                      key={target.id}
                      className="absolute w-16 h-16 bg-white rounded-full border-4 border-red-600 shadow-lg flex items-center justify-center pointer-events-auto animate-ping-slow transform transition-transform hover:scale-110 active:scale-95"
                      style={{ left: `${target.x}%`, top: `${target.y}%` }}
                      onClick={() => handleTargetClick(target.id)}
                  >
                      <span className="text-3xl">🕷️</span>
                  </button>
              ))}
          </div>
      )}

      {/* Input Layer for Charging */}
      {gameState === GameState.CHARGING && (
          <div 
            className="absolute inset-0 z-10 cursor-crosshair"
            onMouseDown={handleLaunchClick}
            onTouchStart={(e) => { e.preventDefault(); handleLaunchClick(); }}
          >
             {/* Power Bar Overlay */}
             <div className="absolute top-32 left-10 w-10 h-48 bg-gray-800 border-4 border-white rounded-lg overflow-hidden shadow-xl flex flex-col justify-end">
                 <div className="w-full bg-gradient-to-t from-yellow-400 to-red-600 animate-pulse-height h-full origin-bottom" style={{ animation: 'ping-pong 1s infinite alternate ease-in-out' }}></div>
             </div>
             <div className="absolute top-80 left-10 text-white font-bold text-xl drop-shadow-md animate-bounce whitespace-nowrap">CLICK TO LAUNCH!</div>
          </div>
      )}

      {/* UI Layer */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
          
          {/* HUD */}
          <div className="flex justify-between items-start">
              <div className="text-4xl font-black text-white drop-shadow-[2px_2px_0_#000]">
                  {score} <span className="text-2xl font-medium text-gray-300">m</span>
              </div>
              {bestScore > 0 && (
                  <div className="text-xl font-bold text-yellow-400 drop-shadow-md">
                      BEST: {bestScore}m
                  </div>
              )}
          </div>

          {/* Active Ability Buttons Stack */}
          {gameState === GameState.FLYING && (
              <div className="pointer-events-auto self-end flex flex-col items-end gap-4">
                  
                  {/* Spiderman Control */}
                  {spidermanEquipped && (
                    <div className="flex items-center gap-2">
                        <div className="bg-black/50 backdrop-blur-sm p-1 rounded h-4 w-24 border border-white/20">
                            <div className="h-full bg-red-500 rounded-sm" style={{ width: `${Math.min(100, (fuels.spiderman / 600) * 100)}%` }} />
                        </div>
                        <button
                            className={`w-24 h-24 rounded-full border-4 border-blue-600 shadow-[0_0_15px_rgba(255,0,0,0.6)] flex items-center justify-center text-4xl transition-all active:scale-95 touch-manipulation
                                ${fuels.spiderman > 0 ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-500 grayscale'}
                                ${isSpidermanActive ? 'animate-pulse ring-4 ring-white scale-110' : ''}
                            `}
                            onClick={() => setSpidermanActive(!isSpidermanActive)}
                            disabled={fuels.spiderman <= 0}
                        >
                            🕷️
                        </button>
                    </div>
                  )}

                  {/* Iron Man Control */}
                  {ironManEquipped && (
                    <div className="flex items-center gap-2">
                       <div className="bg-black/50 backdrop-blur-sm p-1 rounded h-4 w-24 border border-white/20">
                          <div className="h-full bg-yellow-500 rounded-sm" style={{ width: `${Math.min(100, (fuels.ironMan / 240) * 100)}%` }} />
                       </div>
                       <button
                          className={`w-24 h-24 rounded-full border-4 border-red-600 shadow-[0_0_15px_rgba(255,0,0,0.6)] flex items-center justify-center text-4xl transition-all active:scale-95 touch-manipulation
                            ${fuels.ironMan > 0 ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-500 grayscale'}
                            ${isIronManActive ? 'animate-pulse ring-4 ring-yellow-400 scale-110' : ''}
                          `}
                          onClick={() => setIronManActive(!isIronManActive)}
                          disabled={fuels.ironMan <= 0}
                        >
                          🦾
                        </button>
                    </div>
                  )}

                  {/* Jet Control */}
                  {jetEquipped && !ironManEquipped && !spidermanEquipped && (
                    <div className="flex items-center gap-2">
                       <div className="bg-black/50 backdrop-blur-sm p-1 rounded h-4 w-24 border border-white/20">
                          <div className="h-full bg-cyan-500 rounded-sm" style={{ width: `${Math.min(100, (fuels.jet / 180) * 100)}%` }} />
                       </div>
                       <button
                          className={`w-20 h-20 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl transition-all active:scale-95 touch-manipulation
                            ${fuels.jet > 0 ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-500 grayscale'}
                            ${isJetActive ? 'animate-pulse ring-4 ring-cyan-400 scale-105' : ''}
                          `}
                          onClick={() => setJetActive(!isJetActive)}
                          disabled={fuels.jet <= 0}
                        >
                          ✈️
                        </button>
                    </div>
                  )}

                  {/* Rocket Control */}
                  {rocketEquipped && !ironManEquipped && !spidermanEquipped && (
                    <div className="flex items-center gap-2">
                       <div className="bg-black/50 backdrop-blur-sm p-1 rounded h-4 w-24 border border-white/20">
                          <div className="h-full bg-orange-500 rounded-sm" style={{ width: `${Math.min(100, (fuels.rocket / 100) * 100)}%` }} />
                       </div>
                       <button
                          className={`w-20 h-20 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl transition-all active:scale-95 touch-manipulation
                            ${fuels.rocket > 0 ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-500 grayscale'}
                            ${isRocketIgnited ? 'animate-pulse ring-4 ring-yellow-400 scale-105' : ''}
                          `}
                          onClick={() => {
                             if(isJetActive) return; // Cannot use in jet
                             setRocketIgnited(!isRocketIgnited);
                          }}
                          disabled={fuels.rocket <= 0 || isJetActive}
                        >
                          🚀
                        </button>
                    </div>
                  )}

                  {/* Propeller Control */}
                  {propellerEquipped && !ironManEquipped && !spidermanEquipped && (
                    <div className="flex items-center gap-2">
                       <div className="bg-black/50 backdrop-blur-sm p-1 rounded h-4 w-24 border border-white/20">
                          <div className="h-full bg-green-500 rounded-sm" style={{ width: `${Math.min(100, (fuels.propeller / 300) * 100)}%` }} />
                       </div>
                       <button
                          className={`w-20 h-20 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl transition-all active:scale-95 touch-manipulation
                            ${fuels.propeller > 0 ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-500 grayscale'}
                            ${isPropellerActive ? 'animate-pulse ring-4 ring-green-300 scale-105' : ''}
                          `}
                          onClick={() => {
                             if(isJetActive) return; 
                             setPropellerActive(!isPropellerActive);
                          }}
                          disabled={fuels.propeller <= 0 || isJetActive}
                        >
                          🚁
                        </button>
                    </div>
                  )}
              </div>
          )}
      </div>

      {/* MENUS */}
      {gameState === GameState.MENU && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
              <div className="bg-white p-8 rounded-3xl shadow-[10px_10px_0_rgba(0,0,0,0.2)] border-4 border-gray-800 max-w-md w-full text-center transform transition-all max-h-[90vh] overflow-y-auto">
                  <h1 className="text-5xl font-black text-gray-800 mb-6">PAF LE CHIEN</h1>
                  
                  <div className="mb-8 bg-gray-100 p-4 rounded-xl border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 font-bold mb-3 uppercase tracking-widest text-xs">Select Equipment</p>
                      
                      <div className="flex flex-col gap-2">
                        {/* Individual Selectors */}
                        <button onClick={handleRocketToggle} className={`px-4 py-3 rounded-xl text-lg border-b-4 transition-all w-full flex items-center justify-between gap-3 ${rocketUnlocked ? (rocketEquipped ? 'bg-green-500 border-green-700 text-white' : 'bg-white border-gray-300 text-gray-700') : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'}`}>
                            <span className="flex items-center gap-2">🚀 Rocket</span>
                            <span className="text-xs font-bold">{!rocketUnlocked ? 'LOCKED (500m)' : (rocketEquipped ? 'SELECTED' : 'SELECT')}</span>
                        </button>

                        <button onClick={handlePropellerToggle} className={`px-4 py-3 rounded-xl text-lg border-b-4 transition-all w-full flex items-center justify-between gap-3 ${propellerUnlocked ? (propellerEquipped ? 'bg-green-500 border-green-700 text-white' : 'bg-white border-gray-300 text-gray-700') : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'}`}>
                            <span className="flex items-center gap-2">🚁 Propeller</span>
                            <span className="text-xs font-bold">{!propellerUnlocked ? 'LOCKED (1000m)' : (propellerEquipped ? 'SELECTED' : 'SELECT')}</span>
                        </button>

                        <button onClick={handleJetToggle} className={`px-4 py-3 rounded-xl text-lg border-b-4 transition-all w-full flex items-center justify-between gap-3 ${jetUnlocked ? (jetEquipped ? 'bg-green-500 border-green-700 text-white' : 'bg-white border-gray-300 text-gray-700') : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'}`}>
                            <span className="flex items-center gap-2">✈️ Fighter Jet</span>
                            <span className="text-xs font-bold">{!jetUnlocked ? 'LOCKED (2000m)' : (jetEquipped ? 'SELECTED' : 'SELECT')}</span>
                        </button>

                        {/* ULTIMATE BUTTON */}
                        <button 
                            onClick={handleUltimateSelect}
                            className={`mt-4 px-4 py-4 rounded-xl text-xl font-black border-b-4 transition-all w-full flex items-center justify-between gap-3
                                ${ultimateUnlocked 
                                    ? (isUltimateMode ? 'bg-purple-600 border-purple-800 text-white ring-4 ring-purple-300' : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 text-purple-800 hover:bg-purple-50') 
                                    : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-50'}`}
                        >
                            <span className="flex items-center gap-2">👑 ULTIMATE PACK</span>
                            <span className="text-[10px] font-bold tracking-tight">{!ultimateUnlocked ? 'REACH 3000m' : 'EQUIP ALL'}</span>
                        </button>

                        {/* IRON MAN BUTTON */}
                        <button 
                            onClick={handleIronManToggle}
                            className={`mt-2 px-4 py-4 rounded-xl text-xl font-black border-b-4 transition-all w-full flex items-center justify-between gap-3
                                ${ironManUnlocked 
                                    ? (ironManEquipped ? 'bg-red-600 border-red-800 text-yellow-300 ring-4 ring-yellow-400' : 'bg-gradient-to-r from-red-100 to-yellow-100 border-red-300 text-red-800 hover:bg-red-50') 
                                    : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-50'}`}
                        >
                            <span className="flex items-center gap-2">🦾 IRON DOG</span>
                            <span className="text-[10px] font-bold tracking-tight">{!ironManUnlocked ? 'REACH 5000m' : 'MK-50 ARMOR'}</span>
                        </button>

                         {/* SPIDERMAN BUTTON */}
                        <button 
                            onClick={handleSpidermanToggle}
                            className={`mt-2 px-4 py-4 rounded-xl text-xl font-black border-b-4 transition-all w-full flex items-center justify-between gap-3
                                ${spidermanUnlocked 
                                    ? (spidermanEquipped ? 'bg-blue-600 border-blue-800 text-white ring-4 ring-red-500' : 'bg-gradient-to-r from-blue-100 to-red-100 border-blue-300 text-blue-800 hover:bg-blue-50') 
                                    : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-50'}`}
                        >
                            <span className="flex items-center gap-2">🕷️ SPIDER-DOG</span>
                            <span className="text-[10px] font-bold tracking-tight">{!spidermanUnlocked ? 'REACH 6000m' : 'WEB SHOOTER'}</span>
                        </button>
                      </div>
                  </div>

                  <button onClick={handleStartGame} className="w-full bg-[#ff4757] text-white text-3xl font-bold py-4 rounded-xl border-b-[6px] border-[#c0392b] active:border-b-0 active:translate-y-[6px] transition-all">
                      PLAY
                  </button>
              </div>
          </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.STOPPED && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-4">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-gray-800 max-w-lg w-full text-center relative overflow-hidden">
                  <h2 className="text-4xl font-black text-gray-800 mb-2">FINISHED!</h2>
                  <div className="text-6xl font-black text-[#ff4757] mb-4 drop-shadow-sm">
                      {score}<span className="text-3xl text-gray-400">m</span>
                  </div>
                  
                  <p className="text-gray-500 italic mb-6 text-lg">
                      {score < 500 ? "Keep trying!" :
                       score < 2000 ? "Awesome run!" : 
                       score < 5000 ? "Almost Legendary!" : "AVENGER STATUS!"}
                  </p>

                  {score >= 500 && !rocketUnlocked && <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-2 border border-yellow-300 font-bold">🎉 ROCKET UNLOCKED!</div>}
                  {score >= 1000 && !propellerUnlocked && <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-2 border border-blue-300 font-bold">🚁 PROPELLER UNLOCKED!</div>}
                  {score >= 2000 && !jetUnlocked && <div className="bg-gray-100 text-gray-800 p-3 rounded-lg mb-2 border border-gray-300 font-bold">✈️ JET UNLOCKED!</div>}
                  {score >= 3000 && !ultimateUnlocked && <div className="bg-purple-100 text-purple-800 p-3 rounded-lg mb-2 border border-purple-300 font-bold animate-bounce">👑 ULTIMATE PACK UNLOCKED!</div>}
                  {score >= 5000 && !ironManUnlocked && <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-2 border border-red-300 font-bold animate-pulse">🦾 IRON DOG ARMOR UNLOCKED!</div>}
                  {score >= 6000 && !spidermanUnlocked && <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-2 border border-blue-300 font-bold animate-bounce">🕷️ SPIDER-DOG SUIT UNLOCKED!</div>}

                  <div className="h-32 w-full mb-6">
                      <p className="text-xs text-left font-bold text-gray-400 mb-1 uppercase">Recent Attempts</p>
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={history}>
                              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} cursor={{fill: 'transparent'}} />
                              <Bar dataKey="distance" fill="#87CEEB" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>

                  <button onClick={handleRestart} className="w-full bg-[#2ecc71] text-white text-2xl font-bold py-4 rounded-xl border-b-[6px] border-[#27ae60] active:border-b-0 active:translate-y-[6px] transition-all">
                      TRY AGAIN
                  </button>
              </div>
          </div>
      )}
      
      <style>{`
        @keyframes ping-pong {
            0% { height: 0%; }
            100% { height: 100%; }
        }
        @keyframes ping-slow {
            75%, 100% {
                transform: scale(1.2);
                opacity: 0;
            }
        }
        .animate-ping-slow {
            animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default App;