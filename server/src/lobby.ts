import _ from 'lodash';
import { LOBBY_SIZE } from './constants';
import { initializePlayer } from './player';
import { broadcastMsg } from '.';

const gameState = {
  players: {},
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
    id: clientId, // ensure clientId is not overwritten
  }
};

export const fire = (clientId) => {
  const player = gameState.players[clientId];
  if (!player || !player?.ammo) {
    return;
  }

  player.ammo -= 1;

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