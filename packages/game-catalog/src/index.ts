export type GameId = "flappy-bird";

export interface GameDefinition {
  id: GameId;
  title: string;
  description: string;
  href: string;
  tags: string[];
}

export const games: GameDefinition[] = [
  {
    id: "flappy-bird",
    title: "Flappy Bird",
    description: "WebGPU remake focused on deterministic gameplay and offline support.",
    href: "/flappy/",
    tags: ["webgpu", "arcade", "offline"]
  }
];
