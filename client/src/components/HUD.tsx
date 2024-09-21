import { GameData, GameState, LocalState } from "../types";
import shellImage from './assets/shell.png'
import Ellipsis from "./Ellipsis";

const HUD = ({ localState, gameState, sendMessage } : { localState: LocalState, gameState: GameState } & Pick<GameData, 'sendMessage'>) => {
    const { player } = localState;


    const won = gameState.winner === localState.clientId;
    const handleRematchClick = () => {
        sendMessage('REMATCH', null);
    }

    return (
        <>
            {
                (gameState.reloadTimer) && (
                    <div style={{ position: 'fixed', zIndex: 2, top: '50px', width: '100%', color: 'white', textAlign: 'center', fontSize: '24px' }}>
                        <div>
                            Reloading in<Ellipsis/>
                        </div>
                        {gameState.reloadTimer}
                    </div>
                )
            }
            <div style={{ position: 'fixed', zIndex: 2, top: '50px', left: '50px', display: 'flex', alignItems: 'center', height: 40 }}>
                <div style={{ position: 'relative', width: 100, marginRight: '10px', height: 40 }}>
                    <div style={{ backgroundColor: 'red', width: 100, height: 25, position: 'absolute', top: 7.5 }}>
                    </div>
                    <div style={{ backgroundColor: 'green', width: Math.max(player?.health ?? 100, 0), height: 25, position: 'absolute',  top: 7.5 }}>
                    </div>
                </div>
                <div>
                    {
                        Array.from(new Array(player.ammo)).map((_, i) => (
                            <img
                                key={i}
                                src={shellImage}
                                style={{ height: '40px', marginRight: '5px' }}
                            />
                        ))
                    }
                </div>
            </div>
            {
                gameState.winner && (
                    <div style={{ fontSize: '72px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 4, color: 'white' }}>
                        {won ? 'You win!' : 'You lose!'}
                        <div>
                            <button style={{ fontSize: '32px', backgroundColor: 'white', padding: '20px', borderRadius: '15px' }} onClick={handleRematchClick}>
                                RUN IT BACK
                            </button>
                        </div>
                    </div>
                )
            }
            {
                player.score && (
                    <div style={{ position: 'fixed', zIndex: 2, top: '50px', right: '50px', color: 'white', fontSize: '24px' }}>
                        Score: {player.score}
                    </div>
                )
            }
        </>
    )
}

export default HUD;