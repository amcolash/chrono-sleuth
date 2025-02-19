/**
 * stats.js (heavily modified)
 * @linkcode github https://github.com/mrdoob/stats.js
 * @author mrdoob / http://mrdoob.com/
 */

type StatsType = {
  REVISION: number;
  dom: HTMLDivElement;
  fps: HTMLDivElement;
  panels: PanelType[];
  addPanel: (panel: PanelType) => PanelType;
};

type PanelType = {
  dom: HTMLCanvasElement;
  update: (value: number) => void;
};

const Stats = (): StatsType => {
  const container = document.createElement('div');
  container.id = 'stats';
  container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';

  const fullStats = !(localStorage.getItem('chrono-sleuth-stats') === 'false');
  container.classList.toggle('hidden', !fullStats);

  const img = document.createElement('img');
  img.src = 'bar-chart-2.svg';
  img.width = 24;
  img.height = 24;

  const button = document.createElement('button');
  button.style.cssText =
    'background-color:transparent;border:none;padding:0;bottom:8px;right:8px;position:fixed;cursor:pointer';
  button.appendChild(img);
  button.onclick = () => {
    const current = !container.classList.contains('hidden');

    container.classList.toggle('hidden', current);
    localStorage.setItem('chrono-sleuth-stats', (!current).toString());
  };

  container.appendChild(button);

  const fps = document.createElement('div');
  fps.style.cssText =
    'position:fixed;top:6px;left:6px;color:white;font-family:Helvetica,Arial,sans-serif;text-shadow:1px 1px 1px black';
  container.appendChild(fps);

  const panels: PanelType[] = [];

  function addPanel(panel: PanelType) {
    container.appendChild(panel.dom);
    panels.push(panel);
    return panel;
  }

  return {
    REVISION: 17,

    dom: container,
    fps,
    panels,

    addPanel,
  };
};

const Panel = (name: string, fg: string, bg: string): PanelType => {
  var min = Infinity,
    max = 0,
    round = Math.round;

  const scale = 1.25;
  const PR = round(window.devicePixelRatio || 1) * scale;

  const WIDTH = 100 * PR,
    HEIGHT = 65 * PR,
    TEXT_X = 3 * PR,
    TEXT_Y = 2 * PR,
    GRAPH_X = 3 * PR,
    GRAPH_Y = 23 * PR,
    GRAPH_WIDTH = Math.floor(WIDTH - GRAPH_X * 2),
    GRAPH_HEIGHT = HEIGHT - GRAPH_Y - 2 * PR;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const context = canvas.getContext('2d')!;
  context.font = 'bold ' + 9 * PR + 'px Helvetica,Arial,sans-serif';
  context.textBaseline = 'top';

  context.fillStyle = bg;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = fg; // text color
  context.fillText(name, TEXT_X, TEXT_Y);
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  context.fillStyle = bg;
  context.globalAlpha = 0.9;
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  let lastUpdate = 0;
  let index = 0;
  let data = new Array(Math.floor(GRAPH_WIDTH / PR)).fill(0);

  return {
    dom: canvas,

    update: function (value) {
      if (performance.now() - lastUpdate < 100) return;

      data[index] = value;
      index = (index + 1) % data.length;

      min = Math.min(...data);
      max = Math.max(...data);

      context.fillStyle = bg;
      context.globalAlpha = 1;
      context.fillRect(0, 0, WIDTH, GRAPH_Y);

      context.fillStyle = fg;
      context.fillText(`${name}: ${value.toFixed(1)}`, TEXT_X, TEXT_Y);
      context.fillText(`[${min.toFixed(1)} - ${max.toFixed(1)}]`, TEXT_X, TEXT_Y + 10 * PR);

      context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

      context.fillStyle = bg;
      context.globalAlpha = 0.8;
      for (let i = 0; i < data.length; i++) {
        const offset = (index + i) % data.length;
        const percent = data[offset] / max;

        context.fillRect(
          GRAPH_X + PR * i,
          GRAPH_Y,
          PR + (2 - scale),
          Math.min(GRAPH_HEIGHT - PR, Math.max(PR, round((1 - percent) * GRAPH_HEIGHT)))
        );
      }

      lastUpdate = performance.now();
    },
  };
};

let globalStats: StatsType;

// New helper function for phaser
function createStats(game: Phaser.Game) {
  globalStats = Stats();

  document.body.appendChild(globalStats.dom);

  const style = globalStats.dom.style;
  style.display = 'flex';
  style.justifyContent = 'center';
  style.flexWrap = 'wrap';
  style.gap = '6px';
  style.cursor = '';
  style.right = '0';
  style.top = '';
  style.bottom = '10px';
  style.opacity = '0.7';

  const fpsPanel = globalStats.addPanel(Panel('FPS', '#9ad8e4', '#064b62'));
  const framePanel = globalStats.addPanel(Panel('Frame Time', '#f3b0c3', '#6b1e3d'));
  const memoryPanel = globalStats.addPanel(Panel('Memory (mb)', '#ffd59a', '#6b3e06'));
  const renderPanel = globalStats.addPanel(Panel('Render', '#e9f3a3', '#4c6b1a'));
  const stepPanel = globalStats.addPanel(Panel('Step', '#c3c3f3', '#1d1d6b'));

  let preStep = 0;
  let preRender = 0;

  game.events.on(Phaser.Core.Events.PRE_STEP, () => (preStep = performance.now()));
  game.events.on(Phaser.Core.Events.POST_STEP, () => stepPanel.update(performance.now() - preStep));
  game.events.on(Phaser.Core.Events.PRE_RENDER, () => (preRender = performance.now()));

  game.events.on(Phaser.Core.Events.POST_RENDER, () => {
    const avgFps = game.loop.deltaHistory.slice(0, 10).reduce((a, b) => a + b, 0) / 10;

    renderPanel.update(performance.now() - preRender);
    fpsPanel.update(1000 / avgFps);
    framePanel.update(performance.now() - preStep);

    globalStats.fps.textContent = `${Math.floor(1000 / avgFps)}`;

    // This might not work in all browsers
    if (performance.memory) memoryPanel.update(performance.memory.usedJSHeapSize / 1048576);
  });
}

export { createStats, globalStats, Panel, Stats };
export type { PanelType, StatsType };
