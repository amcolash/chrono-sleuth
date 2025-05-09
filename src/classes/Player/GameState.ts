import { Game } from '../../scenes/Game';
import { setDaytime, setNighttime } from '../../utils/lighting';
import { autosave } from '../../utils/save';
import { Player } from './Player';

export type GameData = {
  mazeSolved: boolean;
  mazeSeed: number;
  sphinxFail: boolean;
  sphinxMoved: boolean;
  day: number;
  night: boolean;
};

export const defaultState: GameData = {
  mazeSolved: false,
  mazeSeed: 0,
  sphinxFail: false,
  sphinxMoved: false,
  day: 1,
  night: false,
};

export class GameState {
  scene: Game;
  player: Player;

  initialized: boolean;
  data: GameData;

  constructor(scene: Game, player: Player) {
    this.scene = scene;
    this.player = player;
    this.initialized = false;

    this.data = { ...defaultState };
  }

  updateData(data: Partial<GameData>, silent?: boolean) {
    this.data = { ...this.data, ...data };

    Object.entries(data).forEach(([key, value]) => {
      this.handleSideEffects(key as keyof GameData, value, silent);
    });

    if (!silent) autosave(this.scene);
    this.initialized = true;
  }

  handleSideEffects(key: keyof GameData, value: any, silent?: boolean) {
    if (key === 'night') {
      if (value) setNighttime(this.scene, !silent);
      else setDaytime(this.scene, !silent);
    }
  }
}
