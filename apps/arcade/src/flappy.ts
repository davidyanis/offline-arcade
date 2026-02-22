import { createRenderer, type Rect } from "@offline-arcade/webgpu-kit";
import "./flappy.css";

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 600;
const GROUND_Y = 560;
const GRAVITY = 1400;
const FLAP_SPEED = -420;
const PIPE_SPEED = 210;
const PIPE_GAP = 170;
const PIPE_WIDTH = 84;
const PIPE_INTERVAL = 1.25;
const BIRD_X = WORLD_WIDTH * 0.28;
const BIRD_SIZE = 34;
const LAST_SCORE_KEY = "flappy:last-score";

interface PipePair {
  x: number;
  gapTop: number;
  passed: boolean;
}

interface State {
  birdY: number;
  birdVY: number;
  score: number;
  lastScore: number;
  over: boolean;
  started: boolean;
  sinceSpawn: number;
  pipes: PipePair[];
}

const statusNode = document.querySelector<HTMLSpanElement>("#status");
const scoreNode = document.querySelector<HTMLSpanElement>("#score");
const lastScoreNode = document.querySelector<HTMLSpanElement>("#last-score");
const canvasNode = document.querySelector<HTMLCanvasElement>("#game");

if (!statusNode || !scoreNode || !lastScoreNode || !canvasNode) {
  throw new Error("Missing DOM nodes");
}
const statusEl = statusNode;
const scoreEl = scoreNode;
const lastScoreEl = lastScoreNode;
const canvas = canvasNode;

const storedLastScore = Number.parseInt(localStorage.getItem(LAST_SCORE_KEY) ?? "0", 10);
const initialLastScore = Number.isFinite(storedLastScore) ? Math.max(0, storedLastScore) : 0;

const state: State = {
  birdY: WORLD_HEIGHT * 0.45,
  birdVY: 0,
  score: 0,
  lastScore: initialLastScore,
  over: false,
  started: false,
  sinceSpawn: 0,
  pipes: []
};

const randomGapTop = (): number => {
  const min = 90;
  const max = GROUND_Y - PIPE_GAP - 90;
  return min + Math.random() * (max - min);
};

const reset = (): void => {
  state.birdY = WORLD_HEIGHT * 0.45;
  state.birdVY = 0;
  state.score = 0;
  state.over = false;
  state.started = false;
  state.sinceSpawn = 0;
  state.pipes = [];
  statusEl.textContent = "Press Space / Tap";
};

const flap = (): void => {
  if (state.over) {
    reset();
    return;
  }

  state.started = true;
  state.birdVY = FLAP_SPEED;
};

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    flap();
  }
});

canvas.addEventListener("pointerdown", flap);
window.addEventListener("resize", () => renderer?.resize());

let renderer: Awaited<ReturnType<typeof createRenderer>> | null = null;

function collides(pipe: PipePair): boolean {
  const overlapsX = BIRD_X + BIRD_SIZE > pipe.x && BIRD_X < pipe.x + PIPE_WIDTH;
  if (!overlapsX) {
    return false;
  }

  const gapBottom = pipe.gapTop + PIPE_GAP;
  return state.birdY < pipe.gapTop || state.birdY + BIRD_SIZE > gapBottom;
}

function update(dt: number): void {
  const wasOver = state.over;
  if (!state.started || state.over) {
    return;
  }

  state.birdVY += GRAVITY * dt;
  state.birdY += state.birdVY * dt;

  state.sinceSpawn += dt;
  if (state.sinceSpawn >= PIPE_INTERVAL) {
    state.sinceSpawn = 0;
    state.pipes.push({
      x: WORLD_WIDTH + 20,
      gapTop: randomGapTop(),
      passed: false
    });
  }

  const birdMidX = BIRD_X + BIRD_SIZE * 0.5;
  for (const pipe of state.pipes) {
    pipe.x -= PIPE_SPEED * dt;

    const pipeMidX = pipe.x + PIPE_WIDTH * 0.5;
    if (!pipe.passed && pipeMidX <= birdMidX) {
      pipe.passed = true;
      state.score += 1;
    }

    if (collides(pipe)) {
      state.over = true;
    }
  }

  state.pipes = state.pipes.filter((pipe) => pipe.x + PIPE_WIDTH > -80);

  if (state.birdY <= 0 || state.birdY + BIRD_SIZE >= GROUND_Y) {
    state.over = true;
  }

  if (!wasOver && state.over) {
    state.lastScore = state.score;
    localStorage.setItem(LAST_SCORE_KEY, String(state.lastScore));
  }
}

function render(): void {
  if (!renderer) {
    return;
  }

  const rects: Rect[] = [];

  rects.push({
    x: 0,
    y: GROUND_Y,
    w: WORLD_WIDTH,
    h: WORLD_HEIGHT - GROUND_Y,
    color: [0.3, 0.5, 0.25]
  });

  for (const pipe of state.pipes) {
    rects.push({ x: pipe.x, y: 0, w: PIPE_WIDTH, h: pipe.gapTop, color: [0.16, 0.57, 0.21] });

    rects.push({
      x: pipe.x,
      y: pipe.gapTop + PIPE_GAP,
      w: PIPE_WIDTH,
      h: GROUND_Y - (pipe.gapTop + PIPE_GAP),
      color: [0.16, 0.57, 0.21]
    });
  }

  rects.push({
    x: BIRD_X,
    y: state.birdY,
    w: BIRD_SIZE,
    h: BIRD_SIZE,
    color: [0.98, 0.84, 0.15]
  });

  renderer.drawRects(rects);

  scoreEl.textContent = `Score: ${state.score}`;
  lastScoreEl.textContent = `Last: ${state.lastScore}`;
  if (!state.started) {
    statusEl.textContent = "Press Space / Tap";
  } else if (state.over) {
    statusEl.textContent = "Game Over - Tap to Restart";
  } else {
    statusEl.textContent = "Flying";
  }
}

async function bootstrap(): Promise<void> {
  renderer = await createRenderer(canvas);
  renderer.resize();

  let last = performance.now();
  const tick = (now: number): void => {
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;

    update(dt);
    render();

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

bootstrap().catch((error) => {
  statusEl.textContent = "WebGPU unavailable";
  console.error(error);
});

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    await navigator.serviceWorker.register("/sw.js");
  });
}
