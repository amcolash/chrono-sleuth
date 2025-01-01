// @ts-nocheck

/**
 * stats.js (modified)
 * @linkcode github https://github.com/mrdoob/stats.js
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {
  var mode = 0;

  var container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
  // container.addEventListener(
  //   'click',
  //   function (event) {
  //     event.preventDefault();
  //     showPanel(++mode % container.children.length);
  //   },
  //   false
  // );

  //

  function addPanel(panel) {
    container.appendChild(panel.dom);
    return panel;
  }

  function showPanel(id) {
    for (var i = 0; i < container.children.length; i++) {
      container.children[i].style.display = i === id ? 'block' : 'none';
    }

    mode = id;
  }

  //

  // showPanel(0);

  return {
    REVISION: 16,

    dom: container,

    addPanel: addPanel,
    showPanel: showPanel,

    // Backwards Compatibility

    domElement: container,
    setMode: showPanel,
  };
};

Stats.Panel = function (name, fg, bg) {
  var min = Infinity,
    max = 0,
    round = Math.round;
  var PR = round(window.devicePixelRatio || 1);

  var WIDTH = 90 * PR,
    HEIGHT = 52 * PR,
    TEXT_X = 3 * PR,
    TEXT_Y = 2 * PR,
    GRAPH_X = 3 * PR,
    GRAPH_Y = 23 * PR,
    GRAPH_WIDTH = 84 * PR,
    GRAPH_HEIGHT = 27 * PR;

  var canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.cssText = 'width:80px;height:48px';

  var context = canvas.getContext('2d');
  context.font = 'bold ' + 9 * PR + 'px Helvetica,Arial,sans-serif';
  context.textBaseline = 'top';

  context.fillStyle = bg;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = fg;
  context.fillText(name, TEXT_X, TEXT_Y);
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  context.fillStyle = bg;
  context.globalAlpha = 0.9;
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  var lastUpdate = 0;
  var index = 0;
  var data = [];

  return {
    dom: canvas,

    update: function (value) {
      if (performance.now() - lastUpdate < 100) return;

      data[index] = value;
      index = (index + 1) % GRAPH_WIDTH;

      min = Math.min(...data);
      max = Math.max(...data);

      context.fillStyle = bg;
      context.globalAlpha = 1;
      context.fillRect(0, 0, WIDTH, GRAPH_Y);
      context.fillStyle = fg;

      context.fillText(`${name}: ${round(value)}`, TEXT_X, TEXT_Y);
      context.fillText(`[${round(min)} - ${round(max)}]`, TEXT_X, TEXT_Y + 10);

      context.drawImage(
        canvas,
        GRAPH_X + PR,
        GRAPH_Y,
        GRAPH_WIDTH - PR,
        GRAPH_HEIGHT,
        GRAPH_X,
        GRAPH_Y,
        GRAPH_WIDTH - PR,
        GRAPH_HEIGHT
      );

      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

      context.fillStyle = bg;
      context.globalAlpha = 0.9;
      context.fillRect(
        GRAPH_X + GRAPH_WIDTH - PR,
        GRAPH_Y,
        PR,
        Math.min(GRAPH_HEIGHT - PR, round((1 - value / max) * GRAPH_HEIGHT))
      );

      lastUpdate = performance.now();
    },
  };
};

// New helper function for phaser
function createStats(game: Phaser.Game) {
  const stats = new Stats();

  document.body.appendChild(stats.dom);

  const style = stats.dom.style;
  style.display = 'flex';
  style.justifyContent = 'center';
  style.gap = '6px';
  style.cursor = '';
  style.right = '0';
  style.top = '';
  style.bottom = '10px';
  style.opacity = '0.7';

  const fpsPanel = stats.addPanel(new Stats.Panel('FPS', '#9ad8e4', '#064b62'));
  const framePanel = stats.addPanel(new Stats.Panel('Frame', '#f3b0c3', '#6b1e3d'));
  const memoryPanel = stats.addPanel(new Stats.Panel('Memory', '#ffd59a', '#6b3e06'));
  const renderPanel = stats.addPanel(new Stats.Panel('Render', '#e9f3a3', '#4c6b1a'));
  const stepPanel = stats.addPanel(new Stats.Panel('Step', '#c3c3f3', '#1d1d6b'));

  let last = 0;
  let preStep = 0;
  let preRender = 0;

  game.events.on(Phaser.Core.Events.PRE_STEP, () => (preStep = performance.now()));
  game.events.on(Phaser.Core.Events.POST_STEP, () => stepPanel.update(performance.now() - preStep));
  game.events.on(Phaser.Core.Events.PRE_RENDER, () => (preRender = performance.now()));

  game.events.on(Phaser.Core.Events.POST_RENDER, () => {
    renderPanel.update(performance.now() - preRender);
    fpsPanel.update(1000 / game.loop.delta);
    framePanel.update(performance.now() - preStep);
    memoryPanel.update(performance.memory.usedJSHeapSize / 1048576);

    last = performance.now();
  });
}

export { createStats, Stats };
