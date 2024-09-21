import { useFrame } from '@react-three/fiber';
import { Object3D } from 'three';
import { Player } from '../types';
import { useEffect, useRef, useState } from 'react';
import FiringCone from './FiringCone';

const Avatar = ({ player, currentPlayer = false, clientId }: { player: Player, currentPlayer?: boolean, clientId: string }) => {
  const targetRef = useRef(new Object3D());

  useFrame(() => {
    if (targetRef.current) {
      targetRef.current.position.set(
        player.x,
        0.75,
        player.z,
      );
    }
  });

  return (
    <>
      {/* <sprite
        material={material}
        position={[
          player.x,
          0 - (0.1 / 2),
          player.z
        ]}
        scale={[0.75, 0.9, 0.75]}
      >
        <primitive object={new Sprite(material)} />
      </sprite> */}
      <mesh position={[
          player.x,
          0,
          player.z
        ]}
        rotation={[0, player.angle, 0]}
      >
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color={"green"} />
      </mesh>
      {
        currentPlayer && (
          <spotLight
            position={[
              player.x + Math.sin(player.angle) * 3,
              0.75,
              player.z + Math.cos(player.angle) * 3
            ]}
            target={targetRef.current}
            angle={Math.PI / 6}
            intensity={2}
            distance={7}
            decay={0.1}
            castShadow
          />
        )
      }

      {/* Invisible object that the spotlight is targeting */}
      <primitive object={targetRef.current} />

      <FiringCone player={player} clientId={clientId} />
    </>
  );
};

export default Avatar;