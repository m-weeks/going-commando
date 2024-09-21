export type Player = {
  x: number,
  z: number,
  angle: number,
}

export type GameState = {
  players: Record<string, Player>
}

export type LocalState = {
  loaded: boolean,
  clientId: string,
  player: Player,
}

export type GameData = {
  localState: LocalState;
  updatePlayer: (newValues: Partial<Player>) => void;
  gameState: GameState;
  sendMessage: (type: string, state: any) => void;
}