import { describe, expect, it } from "vitest";
import {
  comparison,
  defaults,
  generateAgents,
  getResources,
  simulationStep,
  toCSV,
} from "@/lib/demo";
describe("Workload rules", () => {
  it("supports a minimum of 1 agent", () =>
    expect(generateAgents({ ...defaults, count: 1 })).toHaveLength(1));
  it("supports a maximum of 20 agents", () =>
    expect(generateAgents({ ...defaults, count: 20 })).toHaveLength(20));
  it("clamps workloads to 1–20 agents", () => {
    expect(generateAgents({ ...defaults, count: 0 })).toHaveLength(1);
    expect(generateAgents({ ...defaults, count: 21 })).toHaveLength(20);
  });
  it("keeps the same workload for the same random seed", () =>
    expect(generateAgents(defaults)).toEqual(generateAgents(defaults)));
  it("changes resource requirements when regenerated with a different seed", () =>
    expect(generateAgents({ ...defaults, seed: 43 })).not.toEqual(generateAgents(defaults)));
  it("does not consume resources for waiting agents", () =>
    expect(getResources(generateAgents(defaults), defaults)).toEqual({
      cpu: 0,
      ram: 0,
      tokens: 0,
      cpuPercent: 0,
      ramPercent: 0,
      tokenPercent: 0,
    }));
  it("never exceeds configured capacities", () => {
    const result = getResources(generateAgents(defaults, true), {
      ...defaults,
      cpu: 1,
      ram: 1,
      tokens: 1,
    });
    expect(result.cpu).toBe(1);
    expect(result.ram).toBe(1);
    expect(result.tokens).toBe(1);
  });
});
describe("Mock scheduling", () => {
  it("updates agent execution and starts a waiting agent", () => {
    const agents = generateAgents({ ...defaults, count: 3 });
    const initial = agents.map((a, i) => ({
      ...a,
      status: i === 0 ? ("Running" as const) : ("Pending" as const),
    }));
    const result = simulationStep(initial, 1, "Round Robin");
    expect(result[0]?.status).toBe("Completed");
    expect(result[1]?.status).toBe("Running");
  });
  it("preserves completed agents", () => {
    const agents = generateAgents(defaults, true);
    const result = simulationStep(agents, 1, "Priority");
    expect(result[0]).toEqual(agents[0]);
  });
});
describe("Provided historical averages", () => {
  it("preserves completed agent averages 5.3, 5.3, 5.6, 3.2", () =>
    expect(comparison.map((a) => a.completed)).toEqual([5.3, 5.3, 5.6, 3.2]));
  it("preserves failed agent averages 6.9, 6.9, 6.6, 9.0", () =>
    expect(comparison.map((a) => a.failed)).toEqual([6.9, 6.9, 6.6, 9]));
  it("preserves completion rates 46.5%, 45.6%, 47.9%, 27.5%", () =>
    expect(comparison.map((a) => a.completion)).toEqual([46.5, 45.6, 47.9, 27.5]));
  it("preserves makespans 46.7s, 50.2s, 47.0s, 47.4s", () =>
    expect(comparison.map((a) => a.makespan)).toEqual([46.7, 50.2, 47, 47.4]));
  it("preserves CPU averages 40.8%, 31.9%, 41.6%, 26.0%", () =>
    expect(comparison.map((a) => a.cpu)).toEqual([40.8, 31.9, 41.6, 26]));
  it("preserves RAM averages 38.0%, 32.0%, 34.8%, 21.0%", () =>
    expect(comparison.map((a) => a.ram)).toEqual([38, 32, 34.8, 21]));
  it("preserves token consumption 9988, 10024, 9926, 5876", () =>
    expect(comparison.map((a) => a.tokens)).toEqual([9988, 10024, 9926, 5876]));
});
describe("CSV exports", () => {
  it("exports only supplied filtered rows", () =>
    expect(toCSV([{ agent: "A001", tokens: 123 }])).toBe('"agent","tokens"\r\n"A001","123"'));
  it("escapes commas and quotes in values", () =>
    expect(toCSV([{ task: 'Text, "quoted"' }])).toBe('"task"\r\n"Text, ""quoted"""'));
});
