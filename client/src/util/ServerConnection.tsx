import { useEffect, useState, useRef, useCallback } from 'react'
import _ from 'lodash';
import { GameData, GameState, LocalState } from '../types';

export default ({ children }: { children: (gameData: GameData) => void }) => {
  // Stores the main game state, including all players
  const [gameState, setGameState] = useState<GameState>({ players: {} });

  // Stores client information and the local players state. We will rely on this as the source of truth for the client. This is to prevent rubberbanding movement due to ping
  const [localState, setLocalState] = useState<Partial<LocalState> & { loaded: boolean }>({
    loaded: false,
    clientId: undefined,
    player: undefined,
  })

  const socketRef = useRef<WebSocket | null>(null);
  const localStateRef = useRef(localState)
  localStateRef.current = localState

  const [disconnected, setDisconnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WEBSOCKET_SERVER);
    socketRef.current = socket;

    socket.onopen = (e) => {
      console.log('Connected');
      setLocalState((oldState) => ({
        ...oldState,
        loaded: true
      }))
      socket.send(JSON.stringify(
        {
          type: 'JOIN',
        }
      ));
    };
  
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
  
      if (msg.type === 'SYNC') {
        const { data, clientId } = msg as { data: GameState, clientId: string }

        setGameState((oldState) => {
          const newState = _.cloneDeep(oldState);
          _.assign(newState, data)
          return newState;
        });
        setLocalState((oldState) => {
          const result = {
            ...oldState,
            clientId: clientId,
          }

          if (!result.player) {
            result.player = msg.data.players[msg.clientId];
          }

          return result;
        })
      } else if (msg.type === 'FIRED') {
        window.dispatchEvent(new CustomEvent('fire', { detail: { clientId: msg.data.clientId } }));
      }
    }
  
    socket.onclose = (e) => {
      setDisconnected(true);
      console.log('Connection closed');
    }
  
    socket.onerror = (e) => {
      console.error('Socket error');
    }

    return () => {
      console.log('CLOSING CONNECTION')
      socket.close();
    }
  }, [])

  const sendMessage = useCallback((type, state) => {
    socketRef.current?.send(JSON.stringify(
      {
        type,
        data: state,
      }
    ))
  }, [])
  
  const updatePlayer = (newValues) => {
    setLocalState((oldState) => ({
      ...oldState,
      player: {
        ...(_.cloneDeep(oldState.player)),
        ...newValues
      }
    }))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (localStateRef.current.loaded) {
        sendMessage('PLAYER_SYNC', localStateRef.current.player);
      }
    }, 15);

    return () => {
      clearInterval(interval)
    }
  }, [sendMessage])

  if (!localState.loaded || !localState.player || !localState.clientId) {
    return null;
  }

  if (disconnected) {
    return <div>Disconnected</div>
  }

  return (
    <>
      {children({ gameState, localState: localState as LocalState, updatePlayer, sendMessage })}
    </>
  )
}