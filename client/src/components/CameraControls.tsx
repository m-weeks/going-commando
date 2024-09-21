import _ from 'lodash';
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { mapData } from './Map';
import { Vector3 } from 'three'
import { GameData } from '../types';
import { MOVE_SPEED, ROTATION_SPEED } from '../constants'
import { MovementData } from './controls/Controls';

export default function CameraControls({ localState, updatePlayer, movementData }: Pick<GameData, 'localState' | 'updatePlayer'> & { movementData: MovementData}) {
  const { player } = localState;
  
  const {
    camera,
  } = useThree();

  const originalPlayerRef = useRef(player);

  useEffect(() => {
    camera.position.x = originalPlayerRef.current.x;
    camera.position.z = originalPlayerRef.current.z;
    camera.position.y = 0.15;
    camera.rotation.y = originalPlayerRef.current.angle;
  }, []);

  const checkCollision = (newPosition) => {
    const buffer = 0.2;

    // Check the area around the camera, including the buffer
    for (let x = Math.round(newPosition.x - buffer); x <= Math.round(newPosition.x + buffer); x++) {
      for (let z = Math.round(newPosition.z - buffer); z <= Math.round(newPosition.z + buffer); z++) {
        // Check if the grid position is within the map bounds
        if (x < 0 || x >= mapData.length || z < 0 || z >= mapData[0].length) {
          return true; // Collision detected (out of bounds)
        }

        // Check if the grid position is a wall
        if (mapData[x][z] === 1) {
          return true; // Collision detected (wall)
        }
      }
    }

    return false; // No collision
  };

  const { x, y, speed, rotateLeft, rotateRight, rotationSpeed } = movementData;

  useFrame((_state, delta) => {
    const speedPerFrame = MOVE_SPEED * delta * speed;
    const rotationPerFrame = ROTATION_SPEED * delta * rotationSpeed;
    const forwardDirection = new Vector3();
    const rightDirection = new Vector3();
    camera.getWorldDirection(forwardDirection);
    rightDirection.copy(forwardDirection).applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2);
  
    // Calculate new positions
    const newPositionX = camera.position.x + forwardDirection.x * y * speedPerFrame + rightDirection.x * x * speedPerFrame;
    const newPositionZ = camera.position.z + forwardDirection.z * y * speedPerFrame + rightDirection.z * x * speedPerFrame;
  
    if (!checkCollision({ x: newPositionX, z: camera.position.z })) {
      camera.position.x = newPositionX;
    }
    if (!checkCollision({ x: camera.position.x, z: newPositionZ })) {
      camera.position.z = newPositionZ;
    }
  
    if (rotateLeft) {
      camera.rotation.y += rotationPerFrame;
    }
    if (rotateRight) {
      camera.rotation.y -= rotationPerFrame;
    }

    // Update local state copy to have new position. This will get synced with the server at a regular interval
    updatePlayer({
      x: camera.position.x,
      z: camera.position.z,
      angle: camera.rotation.y % (Math.PI * 2),
    });
  });

  return null;
}