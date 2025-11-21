import React, { useEffect, useRef, useMemo } from 'react';
import { ENVIRONMENTS, GRAVITY, GROUND_Y_OFFSET } from '../constants';
import { Dog, GameState } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;

  rocketEquipped: boolean;
  isRocketIgnited: boolean;
  setRocketIgnited: (value: boolean) => void;

  propellerEquipped: boolean;
  isPropellerActive: boolean;
  setPropellerActive: (value: boolean) => void;

  jetEquipped: boolean;
  isJetActive: boolean;
  setJetActive: (value: boolean) => void;

  ironManEquipped: boolean;
  isIronManActive: boolean;
  setIronManActive: (value: boolean) => void;

  spidermanEquipped: boolean;
  isSpidermanActive: boolean;
  setSpidermanActive: (value: boolean) => void;
  webShotCount: number;

  onDistanceUpdate: (distance: number) => void;
  onFuelUpdate: (fuels: { rocket: number; propeller: number; jet: number; ironMan: number; spiderman: number; }) => void;
  onGameOver: (score: number) => void;
  triggerLaunch: boolean;
  bestScore: number;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  rocketEquipped,
  isRocketIgnited,
  setRocketIgnited,
  propellerEquipped,
  isPropellerActive,
  setPropellerActive,
  jetEquipped,
  isJetActive,
  setJetActive,
  ironManEquipped,
  isIronManActive,
  setIronManActive,
  spidermanEquipped,
  isSpidermanActive,
  setSpidermanActive,
  webShotCount,
  onDistanceUpdate,
  onFuelUpdate,
  onGameOver,
  triggerLaunch,
  bestScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number>();
  const environmentIndex = useMemo(() => Math.floor(Math.random() * ENVIRONMENTS.length), []);

  const dogRef = useRef<Dog>({
    x: 60,
    y: CANVAS_HEIGHT - GROUND_Y_OFFSET - 40,
    vx: 0,
    vy: 0,
    radius: 30,
    angle: 0,
  });

  const fuelsRef = useRef({ rocket: 0, propeller: 0, jet: 0, ironMan: 0, spiderman: 0 });
  const hasLaunchedRef = useRef(false);

  const resetRun = () => {
    hasLaunchedRef.current = false;
    dogRef.current = {
      x: 60,
      y: CANVAS_HEIGHT - GROUND_Y_OFFSET - 40,
      vx: 0,
      vy: 0,
      radius: 30,
      angle: 0,
    };
    fuelsRef.current = { rocket: 0, propeller: 0, jet: 0, ironMan: 0, spiderman: 0 };
    onFuelUpdate(fuelsRef.current);
  };

  useEffect(() => {
    if (gameState === GameState.MENU || gameState === GameState.STOPPED) {
      cancelAnimationFrame(requestRef.current ?? 0);
      resetRun();
    }
  }, [gameState]);

  useEffect(() => {
    if (triggerLaunch && gameState === GameState.CHARGING) {
      const baseVX = 16 + Math.random() * 8;
      const baseVY = -(12 + Math.random() * 4);

      const initialFuels = {
        rocket: rocketEquipped ? 100 : 0,
        propeller: propellerEquipped ? 300 : 0,
        jet: jetEquipped ? 180 : 0,
        ironMan: ironManEquipped ? 240 : 0,
        spiderman: spidermanEquipped ? 600 : 0,
      };

      fuelsRef.current = initialFuels;
      onFuelUpdate(initialFuels);

      dogRef.current = {
        x: 60,
        y: CANVAS_HEIGHT - GROUND_Y_OFFSET - 40,
        vx: baseVX,
        vy: baseVY,
        radius: 30,
        angle: 0,
      };

      setGameState(GameState.FLYING);
      hasLaunchedRef.current = true;
    }
  }, [triggerLaunch, gameState, setGameState, rocketEquipped, propellerEquipped, jetEquipped, ironManEquipped, spidermanEquipped, onFuelUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let lastTimestamp = performance.now();

    const drawBackground = () => {
      const env = ENVIRONMENTS[environmentIndex];
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, env.sky);
      gradient.addColorStop(1, '#0b1724');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Ground
      ctx.fillStyle = env.ground;
      ctx.fillRect(0, CANVAS_HEIGHT - GROUND_Y_OFFSET, CANVAS_WIDTH, GROUND_Y_OFFSET);
      ctx.fillStyle = env.groundDetail;
      ctx.fillRect(0, CANVAS_HEIGHT - GROUND_Y_OFFSET, CANVAS_WIDTH, 12);

      // Decorative elements
      ctx.fillStyle = `${env.decoColor}55`;
      for (let i = 0; i < 12; i++) {
        const x = (i * 160 + (dogRef.current.x % 160)) % CANVAS_WIDTH;
        const height = 40 + (i % 3) * 30;
        if (env.decoType === 'building') {
          ctx.fillRect(x, CANVAS_HEIGHT - GROUND_Y_OFFSET - height, 60, height);
        } else if (env.decoType === 'tree') {
          ctx.beginPath();
          ctx.moveTo(x + 20, CANVAS_HEIGHT - GROUND_Y_OFFSET - height);
          ctx.lineTo(x, CANVAS_HEIGHT - GROUND_Y_OFFSET);
          ctx.lineTo(x + 40, CANVAS_HEIGHT - GROUND_Y_OFFSET);
          ctx.closePath();
          ctx.fill();
        } else if (env.decoType === 'mountain') {
          ctx.beginPath();
          ctx.moveTo(x + 40, CANVAS_HEIGHT - GROUND_Y_OFFSET - height);
          ctx.lineTo(x - 20, CANVAS_HEIGHT - GROUND_Y_OFFSET);
          ctx.lineTo(x + 100, CANVAS_HEIGHT - GROUND_Y_OFFSET);
          ctx.closePath();
          ctx.fill();
        } else {
          // palm
          ctx.fillRect(x + 18, CANVAS_HEIGHT - GROUND_Y_OFFSET - height, 8, height);
          ctx.beginPath();
          ctx.arc(x + 22, CANVAS_HEIGHT - GROUND_Y_OFFSET - height, 18, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawDog = () => {
      const { x, y, angle, radius } = dogRef.current;
      ctx.save();
      ctx.translate(200, y);
      ctx.rotate(angle);

      // Body
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.ellipse(0, 0, radius + 5, radius, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ear
      ctx.fillStyle = '#f77f00';
      ctx.beginPath();
      ctx.ellipse(-radius / 2, -radius / 1.3, radius / 2, radius / 3, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(radius / 2, -radius / 3, 4, 0, Math.PI * 2);
      ctx.fill();

      // Jet flames
      if (isRocketIgnited || isJetActive || isIronManActive) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.moveTo(-radius - 16, 6);
        ctx.lineTo(-radius - 32, 6 + Math.random() * 20);
        ctx.lineTo(-radius - 12, -2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    const drawHUD = (distance: number) => {
      ctx.fillStyle = '#ffffffaa';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText(`DISTANCE: ${Math.floor(distance)}m`, 20, 30);
      ctx.fillText(`BEST: ${bestScore}m`, 20, 50);

      ctx.fillStyle = '#ffffff80';
      ctx.font = '12px sans-serif';
      ctx.fillText('Click during CHARGING to launch. Use abilities while flying!', 20, 70);
    };

    const updatePhysics = (delta: number) => {
      const dt = delta / 16.67; // Normalize to 60fps steps
      const dog = dogRef.current;
      const fuels = fuelsRef.current;

      // Ability modifiers
      if (isRocketIgnited && fuels.rocket > 0) {
        dog.vx += 0.12 * dt;
        dog.vy -= 0.18 * dt;
        fuels.rocket = Math.max(0, fuels.rocket - 0.6 * dt);
        if (fuels.rocket <= 0) setRocketIgnited(false);
      }

      if (isPropellerActive && fuels.propeller > 0) {
        dog.vy -= 0.35 * dt;
        dog.vx += 0.02 * dt;
        fuels.propeller = Math.max(0, fuels.propeller - 0.45 * dt);
        if (fuels.propeller <= 0) setPropellerActive(false);
      }

      if (isJetActive && fuels.jet > 0) {
        dog.vx += 0.45 * dt;
        dog.vy -= 0.22 * dt;
        fuels.jet = Math.max(0, fuels.jet - 0.85 * dt);
        if (fuels.jet <= 0) setJetActive(false);
      }

      if (isIronManActive && fuels.ironMan > 0) {
        dog.vx += 0.25 * dt;
        dog.vy -= 0.28 * dt;
        fuels.ironMan = Math.max(0, fuels.ironMan - 0.7 * dt);
        if (fuels.ironMan <= 0) setIronManActive(false);
      }

      if (isSpidermanActive && fuels.spiderman > 0) {
        // Spiderman gives softer glide and speed boost per web shot
        const bonus = 0.05 * Math.min(5, webShotCount);
        dog.vx += (0.12 + bonus) * dt;
        dog.vy -= 0.15 * dt;
        fuels.spiderman = Math.max(0, fuels.spiderman - 0.5 * dt);
        if (fuels.spiderman <= 0) setSpidermanActive(false);
      }

      onFuelUpdate({ ...fuels });

      dog.vy += GRAVITY * dt;
      dog.x += dog.vx * dt;
      dog.y += dog.vy * dt;
      dog.angle = clamp(dog.vy / 12, -0.6, 0.8);

      const groundLevel = CANVAS_HEIGHT - GROUND_Y_OFFSET - dog.radius;
      if (dog.y >= groundLevel) {
        dog.y = groundLevel;
        setGameState(GameState.STOPPED);
        onGameOver(Math.floor(dog.x));
        return false;
      }

      onDistanceUpdate(Math.max(0, Math.floor(dog.x)));
      return true;
    };

    const render = (timestamp: number) => {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      drawBackground();
      const keepRunning = updatePhysics(delta);
      drawDog();
      drawHUD(dogRef.current.x);

      if (gameState === GameState.FLYING && keepRunning) {
        requestRef.current = requestAnimationFrame(render);
      }
    };

    if (gameState === GameState.FLYING && hasLaunchedRef.current) {
      requestRef.current = requestAnimationFrame(render);
    }

    return () => cancelAnimationFrame(requestRef.current ?? 0);
  }, [gameState, environmentIndex, bestScore, isRocketIgnited, isPropellerActive, isJetActive, isIronManActive, isSpidermanActive, setGameState, setRocketIgnited, setPropellerActive, setJetActive, setIronManActive, setSpidermanActive, webShotCount, onDistanceUpdate, onFuelUpdate, onGameOver]);

  return (
    <div className="absolute inset-0 bg-black">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full" aria-label="Paf le chien game canvas" />
      {gameState === GameState.MENU && (
        <div className="sr-only">Choisissez votre équipement puis appuyez sur PLAY pour lancer le chien.</div>
      )}
      {gameState === GameState.CHARGING && (
        <div className="sr-only">Cliquez sur l'écran pour lancer. Les propulseurs fonctionnent en vol.</div>
      )}
      {gameState === GameState.STOPPED && (
        <div className="sr-only">Run terminé. Cliquez sur Try Again pour relancer.</div>
      )}
    </div>
  );
};

export default GameCanvas;
