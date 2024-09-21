import _ from 'lodash';
import { LOBBY_SIZE } from './constants';
import { initializePlayer, Player } from './player';
import { broadcastMsg, singleMsg } from '.';

type Lobby = {
  id: string,
  gameState: GameState,
}

type GameState = {
  players: Record<string, Player>,
  started: boolean,
  winner: string | null,
  reloadTimer: number | null
}

export const lobbies: Record<string, Lobby> = {
}

const createLobby = (): Lobby => {
  const id = _.uniqueId('lobby_');
  const lobby: Lobby = {
    id,
    gameState: {
      players: {},
      started: false,
      winner: null,
      reloadTimer: null,
    }
  };
  lobbies[id] = lobby;
  return lobby;
};

export const getLobby = (clientId: string): Lobby | undefined => {
  return Object.values(lobbies).find((lobby) => clientId in lobby.gameState.players);
}

export const addToLobby = (clientId: string, player?: Player) => {
  // Find a lobby with room for the player
  let lobby = Object.values(lobbies).find((lobby) => Object.keys(lobby.gameState.players).length < LOBBY_SIZE && !lobby.gameState.started);
  if (!lobby) { // if one doesn't exist, create a new lobby
    lobby = createLobby();
  }

  lobby.gameState.players[clientId] = player ?? initializePlayer();

  if (Object.values(lobby.gameState.players).length >= LOBBY_SIZE) {
    lobby.gameState.started = true;
  }

  console.log('PLAYER JOINED', clientId)
  console.log('NUM PLAYERS', Object.keys(lobby.gameState.players).length);

  return lobby;
}

export const removeFromLobby = (clientId: string) => {
  const lobby = getLobby(clientId);
  if (!lobby) return;

  delete lobby.gameState.players[clientId];

  if (Object.keys(lobby.gameState.players).length === 0) {
    delete lobbies[lobby.id];
    console.log(`LOBBY ${lobby.id} DELETED`);
  } else if (Object.keys(lobby.gameState.players).length === 1) { // award victory to remaining player
    lobby.gameState.winner = Object.keys(lobby.gameState.players)[0];
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

  const playersWithAmmo = Object.values(lobby.gameState.players).filter((player) => player.ammo > 0);

  if (playersWithAmmo.length === 0) {
    lobby.gameState.reloadTimer = 3;
  }
  
  if (!lobby.gameState.reloadTimer) {
    lobby.gameState.reloadTimer = 10;

    const timerInterval = setInterval(() => {
      if (lobby.gameState.reloadTimer != undefined) {
        lobby.gameState.reloadTimer -= 1;
      }

      if ((lobby.gameState.reloadTimer ?? 0) <= 0 || !playersWithAmmo.length) {
        clearInterval(timerInterval);
        lobby.gameState.reloadTimer = null;
        _.forEach(lobby.gameState.players, (_, playerId) => {
          lobby.gameState.players[playerId].ammo = 1;
        })
      }
    }, 1000);
  }


  broadcastMsg(lobby.id, {
    type: 'FIRED',
    data: {
      clientId
    }
  });

  const livingPlayers = Object.entries(lobby.gameState.players).filter(([id, player]) => player.health > 0);

  if (livingPlayers.length === 1) {
    lobby.gameState.winner = livingPlayers[0][0]; // award victory to last living player
  } else if (livingPlayers.length === 0) {
    delete lobbies[lobby.id];
    console.log(`LOBBY ${lobby.id} DELETED`);
  }
}

export const rematch = (clientId) => {
  const lobby = getLobby(clientId);
  if (!lobby || !lobby.gameState.winner) return;

  const player = lobby.gameState.players[clientId];
  if (!player) {
    return;
  }

  const playerData: Player = {
    ...initializePlayer(),
  }

  if (lobby.gameState.winner === clientId) {
    playerData.score = (player.score ?? 0) + 1;
  }

  removeFromLobby(clientId);
  addToLobby(clientId, playerData);

  singleMsg(clientId, {
    type: 'RESET_PLAYER',
    data: {
      player: playerData,
    }
  })
}