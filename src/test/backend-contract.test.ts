import { describe, expect, it } from "vitest";
import { latestPpoModel } from "@/lib/backend-contract";
describe("Latest PPO model", () => {
  it("is PPO V5", () => expect(latestPpoModel.version).toBe("PPO V5"));
  it("has a 165-dimension observation space", () =>
    expect(latestPpoModel.observationSpace).toBe(165));
  it("has 21 actions", () => expect(latestPpoModel.actionSpace).toBe(21));
  it("was trained for 300,032 timesteps with seed 42", () => {
    expect(latestPpoModel.timesteps).toBe(300032);
    expect(latestPpoModel.seed).toBe(42);
  });
  it("reports 43.1% completion and -8.93 mean reward over 100 episodes (seed 20000)", () =>
    expect(latestPpoModel.evaluation).toEqual({
      episodes: 100,
      seed: 20000,
      completionRate: 43.1,
      meanReward: -8.93,
    }));
});
