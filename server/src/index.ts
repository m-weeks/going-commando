import express from 'express';
import _ from 'lodash';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { addToLobby, fire, removeFromLobby, updatePlayerState } from './lobby';
import { getGameState } from './lobby';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients: Record<string, WebSocket> = {};

wss.on('connection', (ws) => {
  const clientId = _.uniqueId('client_');
  clients[clientId] = ws;

  ws.on('message', (message) => {
    const msg = JSON.parse(message.toString());

    switch (msg.type) {
      case 'JOIN':
        addToLobby(clientId);
        break;
      case 'PLAYER_SYNC':
        const newPlayerData = _.pick(msg.data, ['x', 'z', 'angle']);
        updatePlayerState(clientId, newPlayerData);
        break;
      case 'FIRE':
        fire(clientId);
        break;
    }
  });

  ws.on('close', (code, reason) => {
    console.log('CLOSED', clientId);
    console.log('Close Code: ', code);
    console.log('Close Reason: ', reason.toString());
    delete clients[clientId];
    removeFromLobby(clientId);
  });
});

export const broadcastMsg = (data = {}, excludedClients: string[] = []) => {
  _.forEach(clients, (ws, clientId) => {
    if (excludedClients.includes(clientId)) {
      return;
    }
    ws.send(JSON.stringify({
      ...data,
      clientId,
    }))
  });
}

export const updateClients = () => {
  broadcastMsg({
    type: 'SYNC',
    data: getGameState(),
  });
};

setInterval(() => {
  updateClients();
}, 15);

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});