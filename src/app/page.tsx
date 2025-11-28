"use client";

import { useState } from "react";
import { ProtectedGuard } from "@/components/AuthGuard";

/* ============================================================
   GLOBAL AGENT ID COUNTER
============================================================ */
let nextAgentId = 1;

/* ============================================================
   RANDOM NAME GENERATOR
============================================================ */
function randomName() {
  const prefixes = [
    "Zir",
    "Mar",
    "Kel",
    "Vor",
    "Ana",
    "Tal",
    "Ren",
    "Sol",
    "Xen",
    "Qua",
  ];
  const suffixes = [
    "on",
    "ex",
    "ar",
    "os",
    "in",
    "a",
    "or",
    "ius",
    "ara",
    "eth",
  ];
  return (
    prefixes[Math.floor(Math.random() * prefixes.length)] +
    suffixes[Math.floor(Math.random() * suffixes.length)] +
    "-" +
    Math.floor(Math.random() * 900 + 100)
  );
}

/* ============================================================
   GRID HELPERS
============================================================ */
function createGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function randomizeGrid(rows, cols, hazardFraction) {
  const total = rows * cols;
  const fillCount = Math.floor(total * hazardFraction); // % of tiles that are red hazards
  const grid = createGrid(rows, cols);
  const cells = Array.from({ length: total }, (_, i) => i);

  // shuffle cells
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  // set 1s as red hazards
  for (let i = 0; i < fillCount; i++) {
    const pos = cells[i];
    const r = Math.floor(pos / cols);
    const c = pos % cols;
    grid[r][c] = 1;
  }

  return grid;
}

/* ============================================================
   AGENT CREATION & SPAWNING
============================================================ */
function createAgent(x, y, hunger) {
  return {
    id: nextAgentId++, // unique ID
    name: randomName(),
    instruction: "",
    memory: [], // history of observations/decisions
    decision: "", // last decision taken
    hunger,
    direction: "up",
    x,
    y,
    foodEaten: 0,
  };
}

function spawnAgents(grid, rows, cols, count, hunger) {
  const empty = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) empty.push({ r, c });
    }
  }

  // shuffle empties
  for (let i = empty.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [empty[i], empty[j]] = [empty[j], empty[i]];
  }

  const newGrid = grid.map((row) => [...row]);
  const agents = [];

  const limit = Math.min(count, empty.length);
  for (let i = 0; i < limit; i++) {
    const { r, c } = empty[i];
    const agent = createAgent(c, r, hunger);
    agents.push(agent);
    newGrid[r][c] = 2; // agent
  }

  return { agents, newGrid };
}

function spawnFood(grid, rows, cols, count) {
  const empty = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) empty.push({ r, c });
    }
  }

  // shuffle empties
  for (let i = empty.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [empty[i], empty[j]] = [empty[j], empty[i]];
  }

  const newGrid = grid.map((row) => [...row]);
  const limit = Math.min(count, empty.length);
  for (let i = 0; i < limit; i++) {
    const { r, c } = empty[i];
    newGrid[r][c] = 3; // food
  }

  return newGrid;
}

/* ============================================================
   DIRECTION & OBSERVATION (CURRENT ONLY)
============================================================ */
const VISION_FORWARD = 10;
const VISION_SIDE = 2;
const VISION_BACK = 2;

// Look in a straight line and return first thing we see
function rayCast(grid, x, y, dx, dy, maxDist) {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let dist = 1; dist <= maxDist; dist++) {
    const nx = x + dx * dist;
    const ny = y + dy * dist;

    // Hit boundary
    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
      return { type: "wall", distance: dist };
    }

    const v = grid[ny][nx];
    if (v !== 0) {
      // hit something: 1, 2, 3, etc.
      return { type: v, distance: dist };
    }
  }

  // Nothing in range
  return { type: "nothing", distance: null };
}

// Pure "what do I see right now?" function
function computeObservation(agent, grid) {
  const { x, y, direction } = agent;

  if (direction === "up") {
    return {
      forward: rayCast(grid, x, y, 0, -1, VISION_FORWARD),
      left: rayCast(grid, x, y, -1, 0, VISION_SIDE),
      right: rayCast(grid, x, y, 1, 0, VISION_SIDE),
      backward: rayCast(grid, x, y, 0, 1, VISION_BACK),
    };
  }

  if (direction === "right") {
    return {
      forward: rayCast(grid, x, y, 1, 0, VISION_FORWARD),
      left: rayCast(grid, x, y, 0, -1, VISION_SIDE),
      right: rayCast(grid, x, y, 0, 1, VISION_SIDE),
      backward: rayCast(grid, x, y, -1, 0, VISION_BACK),
    };
  }

  if (direction === "down") {
    return {
      forward: rayCast(grid, x, y, 0, 1, VISION_FORWARD),
      left: rayCast(grid, x, y, 1, 0, VISION_SIDE),
      right: rayCast(grid, x, y, -1, 0, VISION_SIDE),
      backward: rayCast(grid, x, y, 0, -1, VISION_BACK),
    };
  }

  // direction === "left"
  return {
    forward: rayCast(grid, x, y, -1, 0, VISION_FORWARD),
    left: rayCast(grid, x, y, 0, 1, VISION_SIDE),
    right: rayCast(grid, x, y, 0, -1, VISION_SIDE),
    backward: rayCast(grid, x, y, 1, 0, VISION_BACK),
  };
}

/* ============================================================
   DECISION SYSTEM
============================================================ */
function decide(agent, observation) {
  // Still random for now – later you can plug in LLM / policy
  const choices = [
    "stay",
    "forward",
    "turn-left",
    "turn-right",
    "turn-around",
    "forward-left",
    "forward-right",
    "forward-around",
  ];
  return choices[Math.floor(Math.random() * choices.length)];
}

function describeDecision(dec) {
  const map = {
    stay: "Stay still",
    forward: "Move forward",
    "turn-left": "Turn left (no move)",
    "turn-right": "Turn right (no move)",
    "turn-around": "Turn around (no move)",
    "forward-left": "Turn left then move",
    "forward-right": "Turn right then move",
    "forward-around": "Turn around then move",
  };
  return map[dec] ?? dec;
}

/* ============================================================
   MOVEMENT / ACTIONS
============================================================ */
const turnLeft = { up: "left", left: "down", down: "right", right: "up" };
const turnRight = { up: "right", right: "down", down: "left", left: "up" };
const turnAround = { up: "down", down: "up", left: "right", right: "left" };

const dirVec = {
  up: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
};

function act(agent, decision, grid, foodValue, newGrid) {
  let { x, y, direction } = agent;
  let newDir = direction;
  let newX = x;
  let newY = y;
  let hungerChange = 0;

  // pure turns (no movement)
  if (decision === "turn-left") {
    newDir = turnLeft[direction];
    return { x, y, direction: newDir, hungerChange };
  }
  if (decision === "turn-right") {
    newDir = turnRight[direction];
    return { x, y, direction: newDir, hungerChange };
  }
  if (decision === "turn-around") {
    newDir = turnAround[direction];
    return { x, y, direction: newDir, hungerChange };
  }

  // combination: turn then move
  if (decision === "forward-left") {
    newDir = turnLeft[direction];
    const v = dirVec[newDir];
    newX += v.dx;
    newY += v.dy;
  } else if (decision === "forward-right") {
    newDir = turnRight[direction];
    const v = dirVec[newDir];
    newX += v.dx;
    newY += v.dy;
  } else if (decision === "forward-around") {
    newDir = turnAround[direction];
    const v = dirVec[newDir];
    newX += v.dx;
    newY += v.dy;
  } else if (decision === "forward") {
    const v = dirVec[direction];
    newX += v.dx;
    newY += v.dy;
  } else if (decision === "stay") {
    return { x, y, direction, hungerChange };
  }

  // bounds check
  const rows = grid.length;
  const cols = grid[0].length;
  if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) {
    return { x, y, direction, hungerChange };
  }

  const tile = grid[newY][newX];

  // eat food
  if (tile === 3) {
    hungerChange = foodValue;
    if (newGrid) {
      newGrid[newY][newX] = 0; // remove food
    }
  }

  // can't walk into another agent's tile (2)
  if (tile === 2) {
    return { x, y, direction, hungerChange: 0 };
  }

  // move allowed
  return { x: newX, y: newY, direction: newDir, hungerChange };
}

/* ============================================================
   HUNGER / EVALUATION
============================================================ */
function evaluate(agent, hungerDelta, lossPerStep) {
  return Math.max(0, agent.hunger - lossPerStep + hungerDelta);
}

/* ============================================================
   LOOKUP ON CLICK
============================================================ */
function getAgentAtPosition(x, y, agents) {
  return agents.find((a) => a.x === x && a.y === y) || null;
}

/* ============================================================
   PAGE WRAPPER
============================================================ */
export default function Page() {
  return (
    <ProtectedGuard>
      <Content />
    </ProtectedGuard>
  );
}

/* ============================================================
   MAIN SIM COMPONENT
============================================================ */
function Content() {
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(50);
  const [draftRows, setDraftRows] = useState(50);
  const [draftCols, setDraftCols] = useState(50);

  const [grid, setGrid] = useState(() => createGrid(50, 50));
  const [agents, setAgents] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [selectedAgentName, setSelectedAgentName] = useState(null);

  const [defaultHunger, setDefaultHunger] = useState(100);
  const [foodCount, setFoodCount] = useState(10);
  const [foodValue, setFoodValue] = useState(10);
  const [agentsToSpawn, setAgentsToSpawn] = useState(100);
  const [hungerLossPerStep, setHungerLossPerStep] = useState(1);

  const [hazardPercent, setHazardPercent] = useState(33); // % of red tiles when randomizing

  const [step, setStep] = useState(0);

  /* RESET EVERYTHING / APPLY NEW GRID SIZE */
  function regenerateGrid() {
    setRows(draftRows);
    setCols(draftCols);
    setGrid(createGrid(draftRows, draftCols));
    setAgents([]);
    setGraveyard([]);
    setSelectedAgentName(null);
    setStep(0);
  }

  /* ONE SIMULATION STEP - ONLY IF AGENTS EXIST */
  function runStep() {
    if (grid.length === 0 || agents.length === 0) {
      return; // do nothing if there are no agents
    }

    const stepIndex = step + 1;
    const oldGrid = grid;
    const R = oldGrid.length;
    const C = oldGrid[0].length;

    // Start with a copy of the grid, clear old agent positions
    const newGrid = oldGrid.map((row) => [...row]);
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        if (newGrid[r][c] === 2) newGrid[r][c] = 0;
      }
    }

    let deaths = [];

    const updatedAgents = agents.map((agent) => {
      const observation = computeObservation(agent, oldGrid);
      const decision = decide(agent, observation);
      const action = act(agent, decision, oldGrid, foodValue, newGrid);

      const steppedOnRed = oldGrid[action.y]?.[action.x] === 1;

      let foodEaten = agent.foodEaten;
      if (action.hungerChange === foodValue) {
        foodEaten += 1;
      }

      // Build the memory entry for this step (whether they live or die)
      const memoryEntry = {
        step: stepIndex,
        beforePosition: { x: agent.x, y: agent.y },
        afterPosition: { x: action.x, y: action.y },
        direction: action.direction,
        observation,
        decision,
      };

      // If they stepped on red, they die here – log the final step
      if (steppedOnRed) {
        deaths.push({
          ...agent,
          x: action.x,
          y: action.y,
          direction: action.direction,
          foodEaten,
          memory: [...agent.memory, memoryEntry],
          diedAt: { x: action.x, y: action.y },
          turnDied: stepIndex,
          cause: "Stepped on red hazard",
        });
        return null;
      }

      const newHunger = evaluate(agent, action.hungerChange, hungerLossPerStep);

      const newAgent = {
        ...agent,
        x: action.x,
        y: action.y,
        direction: action.direction,
        hunger: newHunger,
        decision,
        foodEaten,
        memory: [...agent.memory, memoryEntry],
      };

      if (newHunger <= 0) {
        deaths.push({
          ...newAgent,
          diedAt: { x: newAgent.x, y: newAgent.y },
          turnDied: stepIndex,
          cause: "Starvation",
        });
        return null;
      }

      return newAgent;
    });

    const alive = updatedAgents.filter((a) => a !== null);

    // Place alive agents on newGrid
    alive.forEach((a) => {
      newGrid[a.y][a.x] = 2;
    });

    // Commit all new state
    setGrid(newGrid);
    setAgents(alive);
    setStep(stepIndex);

    if (deaths.length > 0) {
      setGraveyard((prev) => {
        const seen = new Set(prev.map((d) => d.id));
        const merged = [...prev];
        for (const d of deaths) {
          if (!seen.has(d.id)) {
            seen.add(d.id);
            merged.push(d);
          }
        }
        return merged;
      });
    }
  }

  const selectedAgent = selectedAgentName
    ? agents.find((a) => a.name === selectedAgentName) || null
    : null;

  // Current observation for selected agent (live from grid)
  const selectedAgentObservation =
    selectedAgent && grid ? computeObservation(selectedAgent, grid) : null;

  /* ============================================================
     UI
  ============================================================ */
  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="flex gap-6">
        {/* LEFT PANEL */}
        <div className="flex-1 bg-gray-50 p-6 rounded shadow">
          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => {
                const fraction = Math.min(
                  1,
                  Math.max(0, hazardPercent / 100)
                );
                setGrid(randomizeGrid(rows, cols, fraction));
                setAgents([]);
                setGraveyard([]);
                setSelectedAgentName(null);
                setStep(0);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Randomize Terrain
            </button>

            <button
              onClick={() => {
                const { agents: newAgents, newGrid } = spawnAgents(
                  grid,
                  rows,
                  cols,
                  agentsToSpawn,
                  defaultHunger
                );
                setGrid(newGrid);
                setAgents((prev) => [...prev, ...newAgents]);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Spawn Agents
            </button>

            <button
              onClick={() =>
                setGrid((prev) => spawnFood(prev, rows, cols, foodCount))
              }
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Spawn Food
            </button>

            <button
              onClick={runStep}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              Next Step
            </button>

            <button
              onClick={regenerateGrid}
              className="px-4 py-2 bg-gray-800 text-white rounded"
            >
              Reset Everything
            </button>
          </div>

          {/* GRID */}
          <div className="flex justify-center mb-6">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                width: "100%",
                maxWidth: "700px",
                aspectRatio: "1/1",
                gap: "1px",
              }}
            >
              {Array.from({ length: rows * cols }).map((_, idx) => {
                const r = Math.floor(idx / cols);
                const c = idx % cols;
                const v = grid[r][c];

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (v === 2) {
                        const agent = getAgentAtPosition(c, r, agents);
                        setSelectedAgentName(agent ? agent.name : null);
                      } else {
                        setSelectedAgentName(null);
                      }
                    }}
                    className={`
                      border border-gray-600 cursor-pointer
                      ${v === 0 ? "bg-gray-300" : ""}
                      ${v === 1 ? "bg-red-600" : ""}
                      ${v === 2 ? "bg-blue-600" : ""}
                      ${v === 3 ? "bg-green-600" : ""}
                    `}
                  ></div>
                );
              })}
            </div>
          </div>

          {/* GRID SETTINGS */}
          <div className="bg-white p-4 border rounded mb-6 space-y-3">
            <h3 className="font-semibold mb-2">Grid Settings</h3>

            <div className="flex gap-6 items-center">
              <div>
                <label>Rows:</label>
                <input
                  type="number"
                  className="border p-1 ml-2 w-20"
                  value={draftRows}
                  onChange={(e) =>
                    setDraftRows(Number(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <label>Columns:</label>
                <input
                  type="number"
                  className="border p-1 ml-2 w-20"
                  value={draftCols}
                  onChange={(e) =>
                    setDraftCols(Number(e.target.value) || 0)
                  }
                />
              </div>

              <button
                onClick={regenerateGrid}
                className="px-3 py-1 bg-black text-white rounded"
              >
                Apply Grid Size
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <span>Red Terrain %:</span>
              <input
                type="number"
                className="border p-1 w-20"
                min={0}
                max={100}
                value={hazardPercent}
                onChange={(e) =>
                  setHazardPercent(
                    Math.max(0, Math.min(100, Number(e.target.value) || 0))
                  )
                }
              />
            </div>
          </div>

          {/* SIMULATION CONTROLS */}
          <div className="bg-white p-4 border rounded space-y-4">
            <h3 className="text-lg font-semibold">Simulation Controls</h3>

            <div className="flex gap-3 items-center">
              <span>Agents to Spawn:</span>
              <input
                type="number"
                className="border p-1 w-24"
                value={agentsToSpawn}
                onChange={(e) =>
                  setAgentsToSpawn(Number(e.target.value) || 0)
                }
              />
            </div>

            <div className="flex gap-3 items-center">
              <span>Food Count:</span>
              <input
                type="number"
                className="border p-1 w-24"
                value={foodCount}
                onChange={(e) =>
                  setFoodCount(Number(e.target.value) || 0)
                }
              />
            </div>

            <div className="flex gap-3 items-center">
              <span>Food Value:</span>
              <input
                type="number"
                className="border p-1 w-24"
                value={foodValue}
                onChange={(e) =>
                  setFoodValue(Number(e.target.value) || 0)
                }
              />
            </div>

            <div className="flex gap-3 items-center">
              <span>Default Hunger:</span>
              <input
                type="number"
                className="border p-1 w-24"
                value={defaultHunger}
                onChange={(e) =>
                  setDefaultHunger(Number(e.target.value) || 0)
                }
              />
            </div>

            <div className="flex gap-3 items-center">
              <span>Hunger Loss Per Step:</span>
              <input
                type="number"
                className="border p-1 w-24"
                value={hungerLossPerStep}
                onChange={(e) =>
                  setHungerLossPerStep(Number(e.target.value) || 0)
                }
              />
            </div>

            <p>
              <strong>Current Turn:</strong> {step}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-80 flex flex-col gap-6">
          {/* SELECTED AGENT PANEL */}
          {selectedAgent && (
            <div className="p-4 bg-white border shadow rounded">
              <h3 className="text-lg font-semibold mb-3">Selected Agent</h3>

              {/* CURRENT STATE */}
              <div className="mb-4">
                <h4 className="font-semibold mb-1">Current Status</h4>
                <p>
                  <strong>Name:</strong> {selectedAgent.name}
                </p>
                <p>
                  <strong>Position:</strong> ({selectedAgent.x},{" "}
                  {selectedAgent.y})
                </p>
                <p>
                  <strong>Direction:</strong> {selectedAgent.direction}
                </p>
                <p>
                  <strong>Hunger:</strong> {selectedAgent.hunger}
                </p>
                <p>
                  <strong>Food Eaten:</strong> {selectedAgent.foodEaten}
                </p>
                <p>
                  <strong>Last Decision:</strong>{" "}
                  {describeDecision(selectedAgent.decision)}
                </p>
              </div>

              {/* CURRENT OBSERVATION (LIVE) */}
              <div className="mb-4">
                <h4 className="font-semibold mb-1">👁️ Current Observation</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm">
{JSON.stringify(selectedAgentObservation, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* GRAVEYARD */}
          <div className="bg-gray-100 p-4 border rounded overflow-auto max-h-[70vh]">
            <h3 className="text-lg font-semibold mb-3">Agent Graveyard</h3>

            {graveyard.length === 0 && (
              <p className="text-gray-600">No agents have died yet.</p>
            )}

            {graveyard
              .slice()
              .sort((a, b) => b.turnDied - a.turnDied) // newest deaths first
              .map((agent) => (
                <div
                  key={agent.id}
                  className="p-3 mb-3 bg-white border rounded shadow"
                >
                  <p>
                    <strong>Name:</strong> {agent.name}
                  </p>
                  <p>
                    <strong>Turn Died:</strong> {agent.turnDied}
                  </p>
                  <p>
                    <strong>Cause:</strong> {agent.cause}
                  </p>
                  <p>
                    <strong>Location:</strong> ({agent.diedAt.x},{" "}
                    {agent.diedAt.y})
                  </p>
                  <p>
                    <strong>Food Eaten:</strong> {agent.foodEaten}
                  </p>

                  <details className="mt-2">
                    <summary className="cursor-pointer font-semibold">
                      Memory ({agent.memory.length})
                    </summary>
                    <pre className="bg-gray-200 p-2 rounded text-sm max-h-64 overflow-auto mt-2">
{JSON.stringify(agent.memory, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
