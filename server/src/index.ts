import express from 'express';
import _ from 'lodash';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { addToLobby, removeFromLobby, updatePlayerState } from './lobby';
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
    }
  });

  ws.on('close', () => {
    console.log('CLOSED');
    delete clients[clientId];
    removeFromLobby(clientId);
  });
});

const broadcastMsg = (data = {}) => {
  _.forEach(clients, (ws, clientId) => {
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