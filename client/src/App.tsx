import _ from 'lodash';
import ServerConnection from './util/ServerConnection';
import { Canvas } from '@react-three/fiber';
import Map from './components/Map'
import CameraControls from './components/CameraControls';
import Avatar from './components/Avatar';
import Controls from './components/controls/Controls';

function App() {
  return (
    <div style={{ position: 'relative' }}>
      <ServerConnection>
          {
            (({ gameState, localState, updatePlayer }) => (
              <>
                <Controls>
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
                              />
                            );
                          }
                          return (
                            <Avatar
                              key={playerId}
                              player={player}
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
