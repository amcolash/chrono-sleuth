import { Game } from '../../scenes/Game';
import { autosave } from '../../utils/save';
import { Player } from './Player';

export type GameData = {
  mazeSolved: boolean;
  mazeSeed: number;
  sphinxFail: boolean;
  sphinxMoved: boolean;
  day: number;
};

export const defaultState: GameData = {
  mazeSolved: false,
  mazeSeed: 0,
  sphinxFail: false,
  sphinxMoved: false,
  day: 1,
};

export class GameState {
  scene: Game;
  player: Player;

  data: GameData;

  constructor(scene: Game, player: Player) {
    this.scene = scene;
    this.player = player;

    this.data = { ...defaultState };
  }

  updateData(data: Partial<GameData>, silent?: boolean) {
    this.data = { ...this.data, ...data };

    Object.entries(data).forEach(([key, value]) => {
      this.handleSideEffects(key as keyof GameData, value, silent);
    });

    if (!silent) autosave(this.scene);
  }

  handleSideEffects(key: keyof GameData, value: any, silent?: boolean) {}
}
