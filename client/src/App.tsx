import _ from 'lodash';
import ServerConnection from './util/ServerConnection';
import { Canvas } from '@react-three/fiber';
import Map from './components/Map'
import CameraControls from './components/CameraControls';
import Avatar from './components/Avatar';
import Controls from './components/controls/Controls';
import HUD from './components/HUD';

function App() {
  return (
    <div style={{ position: 'relative' }}>
      <ServerConnection>
          {
            (({ gameState, localState, updatePlayer, sendMessage }) => (
              <>
                <HUD localState={localState} gameState={gameState} sendMessage={sendMessage} /> 
                <Controls sendMessage={sendMessage}>
                  {({ movementData }) => (
                    <Canvas style={{ width: '100vw', height: '100vh' }} shadows>
                      <CameraControls localState={localState} updatePlayer={updatePlayer} movementData={movementData} gameState={gameState} />
                      {/* <ambientLight intensity={2} /> */}
                      <Map />
                      {
                        _.map(gameState.players, (player, playerId) => {
                          if (playerId === localState.clientId) {
                            return (
                              <Avatar
                                key={playerId}
                                player={localState.player}
                                currentPlayer
                                clientId={playerId}
                              />
                            );
                          }
                          return (
                            <Avatar
                              key={playerId}
                              player={player}
                              clientId={playerId}
                            />
                          );
                        })
                      }
                    </Canvas>
                )}
              </Controls>
              </>
            ))
          }
        </ServerConnection>
    </div>
  );
}

export default App
