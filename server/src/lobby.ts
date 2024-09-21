import _ from 'lodash';
import { LOBBY_SIZE } from './constants';
import { initializePlayer, Player } from './player';
import { broadcastMsg } from '.';

type Lobby = {
  id: string,
  gameState: GameState,
}

type GameState = {
  players: Record<string, Player>
}

export const lobbies: Record<string, Lobby> = {
}

const createLobby = (): Lobby => {
  const id = _.uniqueId('lobby_');
  const lobby: Lobby = {
    id,
    gameState: {
      players: {},
    }
  };
  lobbies[id] = lobby;
  return lobby;
};

export const getLobby = (clientId: string): Lobby | undefined => {
  return Object.values(lobbies).find((lobby) => clientId in lobby.gameState.players);
}

export const addToLobby = (clientId: string) => {
  // Find a lobby with room for the player
  let lobby = Object.values(lobbies).find((lobby) => Object.keys(lobby.gameState.players).length < LOBBY_SIZE);
  if (!lobby) { // if one doesn't exist, create a new lobby
    lobby = createLobby();
  }

  lobby.gameState.players[clientId] = initializePlayer();

  console.log('PLAYER JOINED', clientId)
  console.log('NUM PLAYERS', Object.keys(lobby.gameState.players).length);
}

export const removeFromLobby = (clientId: string) => {
  const lobby = getLobby(clientId);
  if (!lobby) return;

  delete lobby.gameState.players[clientId];

  if (Object.keys(lobby.gameState.players).length === 0) {
    delete lobbies[lobby.id];
    console.log(`LOBBY ${lobby.id} DELETED`);
  }
}

export const updatePlayerState = (clientId: string, newPlayerState: { x: number, z: number, angle: number }) => {
  const lobby = getLobby(clientId);
  if (!lobby) {
    return;
  }

  const prevState = lobby.gameState.players[clientId];
  if (!prevState) {
    return;
  }

  lobby.gameState.players[clientId] = {
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
  const lobby = getLobby(clientId);
  if (!lobby) return;

  const player = lobby.gameState.players[clientId];
  if (!player || !player?.ammo) {
    return;
  }

  Object.entries(lobby.gameState.players).forEach(([playerId, otherPlayer]) => {
    if (playerId === clientId) return;
    const { hit, distance } = isPlayerInCone(player, otherPlayer);
    if (hit) {
      const maxDamage = 80;
      const minDamage = 10;
      const damage = maxDamage - ((maxDamage - minDamage) * (distance / CONE_RANGE));
      lobby.gameState.players[playerId].health -= Math.max(minDamage, damage);
    }
  })

  lobby.gameState.players[clientId].ammo -= 1;

  setTimeout(() => {
    if (lobby.gameState.players[clientId]){
      lobby.gameState.players[clientId].ammo += 1;
    }
  }, 3000) // 3s reload

  broadcastMsg(lobby.id, {
    type: 'FIRED',
    data: {
      clientId
    }
  });
}