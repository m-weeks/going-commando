import { GameState, Player } from "../types";
import shellImage from './assets/shell.png'

const HUD = ({ player, gameState } : { player: Player, gameState: GameState }) => {
    return (
        <>
            {
                (gameState.reloadTimer) && (
                    <div style={{ position: 'fixed', zIndex: 2, top: '50px', width: '100%', color: 'white', textAlign: 'center', fontSize: '24px' }}>
                        <div>
                            Reloading in...
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
        </>
    )
}

export default HUD;