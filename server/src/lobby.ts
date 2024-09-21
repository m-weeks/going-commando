import _ from 'lodash';
import { LOBBY_SIZE } from './constants';
import { initializePlayer, Player } from './player';
import { broadcastMsg } from '.';

const gameState = {
  players: {} as Record<string, Player>
}

export const getGameState = () => {
  return gameState
}

export const addToLobby = (clientId: string) => {
  if (Object.keys(gameState.players).length >= LOBBY_SIZE) {
    console.log('LOBBY FULL, REJECTING');
    return;
  }

  gameState.players[clientId] = initializePlayer();

  console.log('PLAYER JOINED', clientId)
  console.log('NUM PLAYERS', Object.keys(gameState.players).length);
}

export const removeFromLobby = (clientId: string) => {
  delete gameState.players[clientId];
}

export const updatePlayerState = (clientId: string, newPlayerState: { x: number, z: number, angle: number }) => {
  const prevState = gameState.players[clientId];
  if (!prevState) {
    return;
  }

  gameState.players[clientId] = {
    ...prevState,
    ...newPlayerState,
  }
};

const CONE_ANGLE = Math.PI / 3;
const CONE_RANGE = 2.5; // Range of the cone

const isPlayerInCone = (shooter: Player, target: Player): { hit: boolean, distance: number } => {
  const shooterDirX = Math.sin(-shooter.angle);
  const shooterDirZ = -Math.cos(-shooter.angle);

  // Calculate the vector from the shooter to the target
  const vectorToTargetX = target.x - shooter.x;
  const vectorToTargetZ = target.z - shooter.z;

  // Calculate the distance to the target
  const distance = Math.sqrt(vectorToTargetX * vectorToTargetX + vectorToTargetZ * vectorToTargetZ);

  // Check if the target is within the cone's range
  if (distance > CONE_RANGE) {
    return { hit: false, distance: 0 }; // Target is out of range
  }

  // Normalize the vector to the target
  const normalizedVectorToTargetX = vectorToTargetX / distance;
  const normalizedVectorToTargetZ = vectorToTargetZ / distance;

  // Calculate the dot product between the shooter's direction and the normalized vector to the target
  const dotProduct = shooterDirX * normalizedVectorToTargetX + shooterDirZ * normalizedVectorToTargetZ;

  // Check if the target is within the shooter's cone (by comparing the dot product to the cosine of the half angle)
  return { hit: dotProduct >= Math.cos(CONE_ANGLE / 2), distance };
};

export const fire = (clientId) => {
  const player = gameState.players[clientId];
  if (!player || !player?.ammo) {
    return;
  }

  Object.entries(gameState.players).forEach(([playerId, otherPlayer]) => {
    if (playerId === clientId) return;
    const { hit, distance } = isPlayerInCone(player, otherPlayer);
    if (hit) {
      const maxDamage = 80;
      const minDamage = 10;
      const damage = maxDamage - ((maxDamage - minDamage) * (distance / CONE_RANGE));
      gameState.players[playerId].health -= Math.max(minDamage, damage);
    }
  })

  gameState.players[clientId].ammo -= 1;

  setTimeout(() => {
    if (gameState.players[clientId]){
      gameState.players[clientId].ammo += 1;
    }
  }, 3000) // 3s reload

  broadcastMsg({
    type: 'FIRED',
    data: {
      clientId
    }
  });
}