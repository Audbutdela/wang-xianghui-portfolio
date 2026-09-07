import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../public/landing-pages/portfolio-detail.html", import.meta.url), "utf8");
const radius = Number(source.match(/const RADIUS=(\d+);/)?.[1]);
const levelsSource = source.match(/const difficultyLevels=(\[[\s\S]*?\]);\n  const reachableSize=/)?.[1];

if (!Number.isInteger(radius) || !levelsSource) throw new Error("Unable to read vine-game configuration");
if (radius !== 4) throw new Error(`Expected a four-ring board, received radius ${radius}`);

const levels = Function(`"use strict";return (${levelsSource})`)();
const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];
const keyOf = ([q, r]) => `${q},${r}`;
const distance = ([q, r]) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
const cells = [];

for (let r = -radius; r <= radius; r += 1) {
  const qMin = Math.max(-radius, -r - radius);
  const qMax = Math.min(radius, -r + radius);
  for (let q = qMin; q <= qMax; q += 1) cells.push([q, r]);
}

const cellKeys = new Set(cells.map(keyOf));
const isEdge = (position) => distance(position) === radius;
const neighbors = ([q, r]) => directions
  .map(([dq, dr]) => [q + dq, r + dr])
  .filter((position) => cellKeys.has(keyOf(position)));

function pathFrom(start, blocked) {
  const queue = [[start]];
  const seen = new Set([keyOf(start)]);
  while (queue.length) {
    const path = queue.shift();
    const current = path.at(-1);
    if (isEdge(current)) return path;
    for (const next of neighbors(current)) {
      const nextKey = keyOf(next);
      if (!blocked.has(nextKey) && !seen.has(nextKey)) {
        seen.add(nextKey);
        queue.push([...path, next]);
      }
    }
  }
  return null;
}

function reachableSize(start, blocked) {
  const queue = [start];
  const seen = new Set([keyOf(start)]);
  while (queue.length) {
    for (const next of neighbors(queue.shift())) {
      const nextKey = keyOf(next);
      if (!blocked.has(nextKey) && !seen.has(nextKey)) {
        seen.add(nextKey);
        queue.push(next);
      }
    }
  }
  return seen.size;
}

function chooseCatStep(start, blocked, smart) {
  const direct = pathFrom(start, blocked);
  if (!direct || direct.length < 2) return null;
  if (!smart) return direct[1];
  const options = neighbors(start).filter((position) => !blocked.has(keyOf(position))).map((position, index) => {
    const path = pathFrom(position, blocked);
    return path ? {
      position,
      index,
      length: path.length,
      freedom: neighbors(position).filter((next) => !blocked.has(keyOf(next))).length,
      space: reachableSize(position, blocked),
    } : null;
  }).filter(Boolean);
  if (!options.length) return null;
  const shortest = Math.min(...options.map((option) => option.length));
  const candidates = options.filter((option) => option.length === shortest);
  candidates.sort((a, b) => smart === 1
    ? b.freedom - a.freedom || a.index - b.index
    : b.space - a.space || b.freedom - a.freedom || a.index - b.index);
  return candidates[0].position;
}

if (cells.length !== 61 || cells.filter(isEdge).length !== 24) {
  throw new Error("The board must contain 61 cells with all 24 outer cells treated as exits");
}

const difficultySummary = [];

levels.forEach((level, levelIndex) => {
  if (level.layouts.length < 2) throw new Error(`${level.name} needs at least two layouts`);
  const blockedCounts = new Set();
  const solutionLengths = new Set();
  level.layouts.forEach((layout, layoutIndex) => {
    blockedCounts.add(layout.blocked.length);
    solutionLengths.add(layout.solution.length);
    let cat = [0, 0];
    const blocked = new Set(layout.blocked.map(keyOf));
    if (!pathFrom(cat, blocked)) throw new Error(`${level.name} layout ${layoutIndex + 1} starts already closed`);
    for (const move of layout.solution) {
      const moveKey = keyOf(move);
      if (!cellKeys.has(moveKey) || isEdge(move) || blocked.has(moveKey) || moveKey === keyOf(cat)) {
        throw new Error(`${level.name} layout ${layoutIndex + 1} contains an invalid move ${moveKey}`);
      }
      blocked.add(moveKey);
      if (!pathFrom(cat, blocked)) return;
      const next = chooseCatStep(cat, blocked, level.smart);
      if (!next || isEdge(next)) throw new Error(`${level.name} layout ${layoutIndex + 1} lets the cat escape`);
      cat = next;
    }
    if (pathFrom(cat, blocked)) throw new Error(`${level.name} layout ${layoutIndex + 1} solution does not close every edge path`);
  });
  if (blockedCounts.size !== 1 || solutionLengths.size !== 1) {
    throw new Error(`${level.name} layouts must have a consistent difficulty profile`);
  }
  difficultySummary.push({
    name: level.name,
    initialVines: [...blockedCounts][0],
    solutionMoves: [...solutionLengths][0],
  });
});

for (let index = 1; index < difficultySummary.length; index += 1) {
  const previous = difficultySummary[index - 1];
  const current = difficultySummary[index];
  if (current.initialVines >= previous.initialVines || current.solutionMoves <= previous.solutionMoves) {
    throw new Error(`${current.name} must be harder than ${previous.name}`);
  }
}

const profile = difficultySummary
  .map(({ name, initialVines, solutionMoves }) => `${name} ${initialVines} vines/${solutionMoves} moves`)
  .join(" · ");
console.log(`PASS vine game: ${cells.length} cells, ${cells.filter(isEdge).length} edge exits · ${profile}`);
