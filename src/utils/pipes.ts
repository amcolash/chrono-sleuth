export enum PipeType {
  Straight,
  Corner,
  T,
  Cross,
  Empty,
}

export type Pipe = {
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  type: PipeType;
};

export const PipeShapes: Record<PipeType, number[][]> = {
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
  [PipeType.Empty]: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
};

function generateMainPath(grid: (Pipe | undefined)[][], width: number, height: number): boolean {
  let x = 0,
    y = 0;
  const initialPipe: Pipe = { x, y, type: PipeType.Straight, rotation: 90 }; // Start with a vertical pipe
  grid[y][x] = initialPipe;
  const stack: [number, number][] = [[x, y]]; // Stack for backtracking

  while (stack.length > 0) {
    [x, y] = stack.pop()!;
    const currentPipe = grid[y][x];

    // Determine next positions
    const directions: [number, number][] = [
      [1, 0], // right
      [0, 1], // down
      [-1, 0], // left
      [0, -1], // up
    ];

    // Shuffle directions to add randomness
    directions.sort(() => Math.random() - 0.5);

    let placedPipe = false;

    for (const [dx, dy] of directions) {
      const nextX = x + dx;
      const nextY = y + dy;

      // Ensure next position is within bounds
      if (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height) {
        // Randomly choose a pipe type
        const pipeTypes = Object.values(PipeType).filter((type) => type !== PipeType.Empty && Number.isNaN(type));
        const nextType = Math.floor(Math.random() * 4);
        const nextRotation: 0 | 90 | 180 | 270 = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        const nextPipe: Pipe = { x: nextX, y: nextY, type: nextType, rotation: nextRotation };

        // Check if next pipe connects with the current pipe
        if (currentPipe && areConnected(currentPipe, nextPipe)) {
          // Place the next pipe
          if (!grid[nextY][nextX]) {
            grid[nextY][nextX] = nextPipe;
            stack.push([nextX, nextY]); // Continue from the new position
            placedPipe = true;
            break; // Exit loop to process next pipe placement
          }
        }
      }
    }

    // If no valid pipe was placed, backtrack
    if (!placedPipe) {
      grid[y][x] = undefined; // Remove invalid pipe
      if (stack.length === 0) {
        console.log('Path generation failed. Trying a new start.');
        // Optionally, restart path generation or handle failure here
        return false;
      }
    }
  }

  return true;
}

function determineRotation(nextPipe: Pipe, currentPipe: Pipe): number {
  // Determine appropriate rotation based on pipe types and direction
  // Simple logic here, add more cases as needed for different pipe types
  if (nextPipe.type === PipeType.Corner) {
    if (nextPipe.x !== currentPipe.x) {
      // Horizontal movement
      return nextPipe.y > currentPipe.y ? 90 : 270;
    } else {
      // Vertical movement
      return nextPipe.x > currentPipe.x ? 0 : 180;
    }
  }
  return currentPipe.rotation; // Default to keep current rotation if not corner
}

// Fill the grid with empty spaces and random pipes
function fillGrid(grid: Pipe[][], width: number, height: number): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!grid[y][x]) {
        if (Math.random() < -0.2) {
          const randomPipeType = Math.floor(Math.random() * 4) + 1;
          grid[y][x] = {
            x,
            y,
            type: randomPipeType,
            rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)],
          };
        } else {
          grid[y][x] = { x, y, type: PipeType.Empty, rotation: 0 };
        }
      }
    }
  }
}

export function createLevel(width: number, height: number): Pipe[][] {
  let grid: Pipe[][] = Array.from({ length: height }, () => Array(width).fill(null));

  generateMainPath(grid, width, height);
  fillGrid(grid, width, height);

  return grid;
}

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
  if (!pipeA || !pipeB) return false;

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
  let result: number[][] = PipeShapes[pipe.type];

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
