import { Joystick, JoystickShape } from 'react-joystick-component';
import { useKeyboardControls } from './useKeyboardControls';
import { ReactNode, useRef } from 'react';
import { IJoystickUpdateEvent } from 'react-joystick-component/build/lib/Joystick';

export type MovementData = {
  x: number;
  y: number;
  speed: number;
  rotateLeft: boolean;
  rotateRight: boolean;
  rotationSpeed: number;
};

const Controls = ({ children }: { children: ({ movementData } : { movementData: MovementData}) => ReactNode }) => {
  // Mostly just exists for debugging purposes
  const keyboardMovementData = useKeyboardControls();

  const joystickMovementData = useRef<MovementData>({
    x: 0,
    y: 0,
    speed: 0,
    rotateLeft: false,
    rotateRight: false,
    rotationSpeed: 0,
  });

  const handleMove = (stick: IJoystickUpdateEvent) => {
    const { x, y, distance } = stick;
    const threshold = 40; // Minimum distance to consider movement

    if (!distance) {
      return;
    }

    joystickMovementData.current = {
      ...joystickMovementData.current,
      x: distance > threshold ? (x ?? 0) : 0,
      y: distance > threshold ? (y ?? 0) : 0 ,
      speed: distance / 100.0
    };
  };

  const handleStop = () => {
    joystickMovementData.current = {
      ...joystickMovementData.current,
      x: 0,
      y: 0,
      speed: 0,
    };
  };

  const handleRotate = (stick: IJoystickUpdateEvent) => {
    const { direction, distance } = stick;
    const threshold = 20; // Minimum distance to consider movement

    if (!distance) {
      return;
    }

    joystickMovementData.current = {
      ...joystickMovementData.current,
      rotateLeft: distance > threshold && direction === 'LEFT',
      rotateRight: distance > threshold && direction === 'RIGHT',
      rotationSpeed: distance / 100.0
    };
  }

  const handleStopRotate = () => {
    joystickMovementData.current = {
      ...joystickMovementData.current,
      rotateLeft: false,
      rotateRight: false,
      rotationSpeed: 0,
    };
  }

  return (
    <>
      {
        children({
          movementData: {
            x: keyboardMovementData.x || joystickMovementData.current.x,
            y: keyboardMovementData.y || joystickMovementData.current.y,
            speed: keyboardMovementData.speed || joystickMovementData.current.speed,
            rotateLeft: keyboardMovementData.rotateLeft || joystickMovementData.current.rotateLeft,
            rotateRight: keyboardMovementData.rotateRight || joystickMovementData.current.rotateRight,
            rotationSpeed: keyboardMovementData.rotationSpeed || joystickMovementData.current.rotationSpeed,
          }
        })
      }

      <div style={{ position: 'fixed', zIndex: '1', bottom: '20vh', right: '15vw', opacity: 0.5 }}>
        <Joystick
          size={100}
          baseColor="rgba(0,0,0,0.5)"
          stickColor="rgba(255,255,255,0.8)"
          move={handleRotate}
          stop={handleStopRotate}
          throttle={100}
          controlPlaneShape={JoystickShape.AxisX}
          baseShape={JoystickShape.Square}
          stickShape={JoystickShape.Square}
        />
      </div>
      <div style={{ position: 'fixed', zIndex: '1', bottom: '20vh', left: '15vw', opacity: 0.5 }}>
        <Joystick
          size={100}
          baseColor="rgba(0,0,0,0.5)"
          stickColor="rgba(255,255,255,0.8)"
          move={handleMove}
          stop={handleStop}
          throttle={100}
        />
      </div>
    </>
  );
};

export default Controls;