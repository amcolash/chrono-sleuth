export enum PipeType {
  Straight,
  Corner,
  T,
  Cross,
}

export type Pipe = {
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  type: PipeType;
};

export const pipeShape = {
  [PipeType.Straight]: [
    [0, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [PipeType.Corner]: [
    [0, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
  ],
  [PipeType.T]: [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  [PipeType.Cross]: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
};

export const level = [
  ['C', 'C', 'C', 'C', 'T', 'C', 'C', 'C'],
  ['T', 'X', 'T', 'S', 'T', 'X', 'T', 'T'],
  ['C', 'C', 'S', 'S', 'S', 'C', 'C', 'C'],
  ['C', 'X', 'T', 'S', 'T', 'X', 'T', 'C'],
  ['T', 'S', 'S', 'S', 'S', 'T', 'S', 'T'],
  ['C', 'X', 'C', 'C', 'C', 'X', 'T', 'C'],
  ['T', 'S', 'T', 'S', 'T', 'S', 'T', 'S'],
  ['C', 'X', 'C', 'X', 'C', 'X', 'C', 'C'],
];

export function getConnectedPipes(grid: Pipe[][], startX: number, startY: number): Pipe[] {
  const connectedPipes: Pipe[] = [];
  const visited = new Set<string>(); // Set to track visited pipes
  const rows = grid.length;
  const cols = grid[0].length;

  function dfs(x: number, y: number) {
    const key = `${x},${y}`;
    // Mark the current pipe as visited
    visited.add(key);
    connectedPipes.push(grid[y][x]);

    // Check each possible direction (left, right, up, down)
    // Right
    if (x + 1 < cols && !visited.has(`${x + 1},${y}`) && areConnected(grid[y][x], grid[y][x + 1])) {
      dfs(x + 1, y);
    }
    // Left
    if (x - 1 >= 0 && !visited.has(`${x - 1},${y}`) && areConnected(grid[y][x], grid[y][x - 1])) {
      dfs(x - 1, y);
    }
    // Down
    if (y + 1 < rows && !visited.has(`${x},${y + 1}`) && areConnected(grid[y][x], grid[y + 1][x])) {
      dfs(x, y + 1);
    }
    // Up
    if (y - 1 >= 0 && !visited.has(`${x},${y - 1}`) && areConnected(grid[y][x], grid[y - 1][x])) {
      dfs(x, y - 1);
    }
  }

  // Start DFS from the initial pipe at (0,0)
  dfs(startX, startY);

  return connectedPipes;
}

function areConnected(pipeA: Pipe, pipeB: Pipe): boolean {
  const connectionsA = getPipeConnections(pipeA);
  const connectionsB = getPipeConnections(pipeB);

  // Calculate relative position
  const dx = pipeB.x - pipeA.x;
  const dy = pipeB.y - pipeA.y;

  if (dx === 1 && dy === 0) {
    // B is to the right of A
    return connectionsA.right && connectionsB.left;
  } else if (dx === -1 && dy === 0) {
    // B is to the left of A
    return connectionsA.left && connectionsB.right;
  } else if (dx === 0 && dy === 1) {
    // B is below A
    return connectionsA.bottom && connectionsB.top;
  } else if (dx === 0 && dy === -1) {
    // B is above A
    return connectionsA.top && connectionsB.bottom;
  }

  return false; // Pipes are not adjacent
}

function getPipeConnections(pipe: Pipe) {
  // Rotate the shape based on the provided rotation
  const rotatedShape = rotatePipe(pipe);

  // Get connections based on the rotated shape
  return {
    left: rotatedShape.some((row) => row[0] === 1),
    right: rotatedShape.some((row) => row[row.length - 1] === 1),
    top: rotatedShape[0].some((col) => col === 1),
    bottom: rotatedShape[rotatedShape.length - 1].some((col) => col === 1),
  };
}

function rotatePipe(pipe: Pipe): number[][] {
  const rotation = pipe.rotation;

  let result: number[][] = pipeShape[pipe.type];

  // Rotation count based on degrees
  const rotations = Math.floor(pipe.rotation / 90);

  // Perform rotation on the grid matrix
  for (let i = 0; i < rotations; i++) {
    result = rotateMatrix(result);
  }

  return result;
}

function rotateMatrix(matrix: number[][]): number[][] {
  // Rotate the matrix 90 degrees clockwise
  return matrix[0].map((val, index) => matrix.map((row) => row[index]).reverse());
}

// isConnected(pipe1: Pipe, pipe2: Pipe): boolean {}

export function getPipeType(letter: string): PipeType {
  switch (letter) {
    case 'S':
      return PipeType.Straight;
    case 'C':
      return PipeType.Corner;
    case 'T':
      return PipeType.T;
    case 'X':
    default:
      return PipeType.Cross;
  }
}
