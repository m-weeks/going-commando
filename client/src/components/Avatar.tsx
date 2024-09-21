import { useLoader } from '@react-three/fiber';
import { TextureLoader, SpriteMaterial, Sprite } from 'three';
import avatar from './assets/avatar.png';
import { Player } from '../types';

const Avatar = ({ player }: { player: Player }) => {
  const texture = useLoader(TextureLoader, avatar);
  const material = new SpriteMaterial({ map: texture })

  return (
    <sprite
      material={material}
      position={[
        player.x,
        0 - (0.1 / 2),
        player.z
      ]}
      scale={[0.75, 0.9, 0.75]}
    >
      <primitive object={new Sprite(material)} />
    </sprite>
  );
};

export default Avatar;