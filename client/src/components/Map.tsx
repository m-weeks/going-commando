import Wall from './Wall'
import wallImage from './assets/wall.png'
import floorImage from './assets/floor.png'
import ceilingImage from './assets/ceiling.png'

// export const mapData = [
//   [1, 1, 1, 1, 1, 1, 1],
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 1, 1, 1, 1, 1, 1]
// ]

export const mapData = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export default function Map() {
  const wallSize: [number, number, number] = [1, 1, 1]; // Assuming each wall is 1x1x1 (WxHxD)

  const floorWidth = mapData.length;
  const floorDepth = mapData[0].length;
  const floorSize: [number, number, number] = [floorWidth, 0, floorDepth];

  return (
    <>
      <Wall
        args={floorSize}
        position={[(floorWidth - 1) / 2, -0.5, (floorDepth - 1) / 2]}
        // textureImage={floorImage}
        color='#632619'
        repeatX={mapData.length}
        repeatY={mapData[0].length}
      />
      <Wall
        args={floorSize}
        position={[(floorWidth - 1) / 2, 0.5, (floorDepth - 1) / 2]}
        // textureImage={ceilingImage}
        color='#000000'
        repeatX={mapData.length * 4}
        repeatY={mapData[0].length  * 4}
      />

      {
        mapData.flatMap((row, i) => (
          row.map((cell, j) => 
            cell === 1 ? <Wall key={`${i}-${j}`} position={[i, 0, j]} args={wallSize} /*textureImage={wallImage}*/ color='#a5a5a5' /> : null
          )
        ))
      }
    </>
  );
}