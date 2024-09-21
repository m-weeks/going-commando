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
                {/* Show hud data from most up-to date player info from server */}
                <HUD player={localState.player} /> 
                <Controls sendMessage={sendMessage}>
                  {({ movementData }) => (
                    <Canvas style={{ width: '100vw', height: '100vh' }} shadows>
                      <CameraControls localState={localState} updatePlayer={updatePlayer} movementData={movementData} />
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
