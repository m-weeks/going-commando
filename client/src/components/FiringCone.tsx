import { useEffect, useState } from "react";
import { Player } from "../types"
import { useFrame } from "@react-three/fiber";

const FIRING_DURATION = 1000;

const FiringCone = ({ player, clientId }: { player: Player, clientId: string }) => {
  const [firing, setFiring] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const handleFire = (event: CustomEvent) => {
      if (event.detail.clientId !== clientId) {
        return
      }
      setFiring(true);
      setElapsedTime(0);
      setTimeout(() => {
        setFiring(false);
      }, FIRING_DURATION);
    }
    // @ts-ignore
    window.addEventListener('fire', handleFire);

    return () => {
      // @ts-ignore
      window.removeEventListener('fire', handleFire);
    };
  }, [clientId]);

  useFrame((state, delta) => {
    if (firing) {
      setElapsedTime((prev) => prev + delta * 1000);
    }
  });

  if (!firing) {
    return null;
  }

  const t = elapsedTime / FIRING_DURATION;
  const opacity = Math.max(1 - t * t, 0); // Quadratic decay
  
  return (
    <mesh
      position={[
        player.x - Math.sin(player.angle),
        0,
        player.z - Math.cos(player.angle),
      ]}
      rotation={[Math.PI / 2, 0, player.angle * -1]}
    >
      <coneGeometry args={[1, 2, 8]} />
      <meshStandardMaterial color="red" opacity={opacity} transparent />
    </mesh>
  )
}

export default FiringCone