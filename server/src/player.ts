export type Player = {
  x: number,
  z: number,
  angle: number,
  ammo: number,
  health: number,
  score?: number,
}

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const rand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getStartingPosition = () => {
  return [1, 1];

  const zeroIndices: [number, number][] = [];
  map.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === 0) {
        zeroIndices.push([colIndex, rowIndex]);
      }
    });
  });
  const randomIndex = rand(0, zeroIndices.length - 1);
  const [z, x] = zeroIndices[randomIndex];

  return [x, z]
};

export const initializePlayer = (): Player => {
  const [x, z] = getStartingPosition();

  return {
    x: x,
    z: z,
    angle: Math.PI,
    ammo: 1,
    health: 100,
  };
}