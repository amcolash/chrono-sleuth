import { updateSphinx } from '../../data/cutscene';
import { Game } from '../../scenes/Game';
import { Player } from './Player';

export enum SphinxPosition {
  Ground,
  Ledge,
}

export type GameData = {
  mazeSolved: boolean;
  mazeSeed: number;
  sphinxFail: boolean;
  sphinxPosition: SphinxPosition;
};

export const defaultState: GameData = {
  mazeSolved: false,
  mazeSeed: 0,
  sphinxFail: false,
  sphinxPosition: SphinxPosition.Ground,
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
  }

  handleSideEffects(key: keyof GameData, value: any, silent?: boolean) {
    // By using a state instead of side effects in various different places,
    // we can consistently move the sphinx back and forth and not have to worry
    // about ordering of effects.
    if (key === 'sphinxPosition') {
      updateSphinx(this.scene, value === SphinxPosition.Ledge, silent);
    }
  }
}
