export interface DebugPanelDefinition {
  id: string;
  title: string;
  body: string;
}

export const DEBUG_PANELS: DebugPanelDefinition[] = [
  {
    id: 'runtime',
    title: 'Runtime',
    body: `
      <div class="panel-group__row">
        <button id="pause-toggle" class="shell-button" data-variant="primary" type="button">Pause</button>
        <button id="save-game-config" class="shell-button" type="button">Save config</button>
      </div>
      <p id="config-save-status" class="panel-note">Not saved this session</p>
    `
  },
  {
    id: 'overlays',
    title: 'Overlays',
    body: `
      <label class="toggle-row"><input id="show-world" type="checkbox" /> World bounds</label>
      <label class="toggle-row"><input id="show-visual-bounds" type="checkbox" /> Actor visual bounds</label>
      <label class="toggle-row"><input id="show-collision-bounds" type="checkbox" /> Object collision bounds</label>
      <label class="toggle-row"><input id="show-hit-bounds" type="checkbox" /> Hit / attack bounds</label>
      <label class="toggle-row"><input id="show-asset-labels" type="checkbox" /> Asset labels</label>
      <label class="toggle-row"><input id="show-performance" type="checkbox" /> Performance HUD</label>
    `
  },
  {
    id: 'audio',
    title: 'Audio',
    body: `
      <div class="audio-control-row">
        <span class="audio-control-row__label">SFX</span>
        <input id="debug-sfx-volume" type="range" min="0" max="1" step="0.01" />
        <strong id="debug-sfx-readout" class="audio-control-row__readout">80%</strong>
        <button id="debug-sfx-zero" class="shell-button shell-button--compact" type="button">0</button>
      </div>
      <div class="audio-control-row">
        <span class="audio-control-row__label">Music</span>
        <input id="debug-music-volume" type="range" min="0" max="1" step="0.01" />
        <strong id="debug-music-readout" class="audio-control-row__readout">55%</strong>
        <button id="debug-music-zero" class="shell-button shell-button--compact" type="button">0</button>
      </div>
    `
  },
  {
    id: 'character-gym',
    title: 'Character Gym',
    body: `
      <label class="stack-row">
        <span class="stack-row__label">Character</span>
        <select id="character-select"></select>
      </label>
      <label class="stack-row">
        <span class="stack-row__label">Animation</span>
        <select id="character-animation"></select>
      </label>
      <div id="character-frame-buttons" class="frame-selector" aria-label="Animation frames"></div>
      <div class="panel-group__row panel-group__row--three">
        <button id="character-prev-frame" class="shell-button" type="button">Prev</button>
        <button id="character-play-toggle" class="shell-button" type="button">Pause</button>
        <button id="character-next-frame" class="shell-button" type="button">Next</button>
      </div>
      <div id="character-speed-buttons" class="panel-group__row panel-group__row--three">
        <button class="shell-button" type="button" data-speed="0.5">0.5x</button>
        <button class="shell-button" type="button" data-speed="1">1x</button>
        <button class="shell-button" type="button" data-speed="2">2x</button>
      </div>
      <label class="stack-row">
        <span class="stack-row__label">Bounds</span>
        <select id="character-bounds-kind">
          <option value="visual">Visual</option>
          <option value="collision">Collision</option>
          <option value="hit">Hit</option>
          <option value="attack">Attack</option>
          <option value="guard">Guard</option>
        </select>
      </label>
      <label class="stack-row">
        <span class="stack-row__label">Gizmo</span>
        <span class="panel-note">drag on canvas · Q move · W scale</span>
      </label>
      <div id="character-gizmo-buttons" class="panel-group__row">
        <button class="shell-button" type="button" data-gizmo="translate">Move (Q)</button>
        <button class="shell-button" type="button" data-gizmo="scale">Scale (W)</button>
      </div>
      <label class="toggle-row"><input id="character-bounds-active" type="checkbox" /> Active this frame</label>
      <div class="bounds-editor">
        <label class="number-row"><span>Center X</span><input id="character-bounds-center-x" type="number" min="0" max="256" step="1" /></label>
        <label class="number-row"><span>Center Y</span><input id="character-bounds-center-y" type="number" min="0" max="256" step="1" /></label>
        <label class="number-row"><span>Width</span><input id="character-bounds-width" type="number" min="1" max="256" step="1" /></label>
        <label class="number-row"><span>Height</span><input id="character-bounds-height" type="number" min="1" max="256" step="1" /></label>
      </div>
      <div class="panel-group__row">
        <button id="character-save-frame-bounds" class="shell-button" type="button">Save frame</button>
        <button id="character-apply-bounds-all-frames" class="shell-button" type="button">Apply all</button>
      </div>
      <div class="panel-group__row">
        <button id="character-reset-bounds" class="shell-button" type="button">Reset frame</button>
        <button id="character-save-all" class="shell-button" data-variant="primary" type="button">Save all</button>
      </div>
      <p id="character-save-status" class="panel-note">Loaded from public/configs/character-gym.json</p>
      <div class="metrics metrics--compact">
        <div class="metrics__row"><span>Frame</span><strong id="character-frame-readout">-</strong></div>
        <div class="metrics__row"><span>Active</span><strong id="character-active-readout">-</strong></div>
      </div>
    `
  },
  {
    id: 'fighter-playground',
    title: 'Fighter Playground',
    body: `
      <label class="stack-row">
        <span class="stack-row__label">Fighter</span>
        <select id="fighter-character"></select>
      </label>
      <div class="bounds-editor">
        <label class="number-row"><span>Walk speed</span><input id="fighter-stat-walkSpeed" type="number" min="40" max="600" step="5" /></label>
        <label class="number-row"><span>Air drift</span><input id="fighter-stat-airDrift" type="number" min="0" max="600" step="5" /></label>
        <label class="number-row"><span>Jump power</span><input id="fighter-stat-jump" type="number" min="200" max="2000" step="10" /></label>
        <label class="number-row"><span>Gravity</span><input id="fighter-stat-gravity" type="number" min="400" max="5000" step="25" /></label>
        <label class="number-row"><span>Scale</span><input id="fighter-stat-scale" type="number" min="0.5" max="3" step="0.05" /></label>
      </div>
      <p class="panel-subtitle">Combat (light = high, heavy = low)</p>
      <div class="bounds-editor">
        <label class="number-row"><span>Max HP</span><input id="fighter-combat-maxHealth" type="number" min="50" max="300" step="5" /></label>
        <label class="number-row"><span>High dmg</span><input id="fighter-combat-highDamage" type="number" min="1" max="50" step="1" /></label>
        <label class="number-row"><span>High kb</span><input id="fighter-combat-highKnockback" type="number" min="0" max="800" step="10" /></label>
        <label class="number-row"><span>High stun</span><input id="fighter-combat-highHitstun" type="number" min="0" max="1200" step="20" /></label>
        <label class="number-row"><span>Low dmg</span><input id="fighter-combat-lowDamage" type="number" min="1" max="50" step="1" /></label>
        <label class="number-row"><span>Low kb</span><input id="fighter-combat-lowKnockback" type="number" min="0" max="800" step="10" /></label>
        <label class="number-row"><span>Low stun</span><input id="fighter-combat-lowHitstun" type="number" min="0" max="1200" step="20" /></label>
        <label class="number-row"><span>Special dmg</span><input id="fighter-combat-specialDamage" type="number" min="1" max="50" step="1" /></label>
        <label class="number-row"><span>Special kb</span><input id="fighter-combat-specialKnockback" type="number" min="0" max="800" step="10" /></label>
        <label class="number-row"><span>Special stun</span><input id="fighter-combat-specialHitstun" type="number" min="0" max="1200" step="20" /></label>
      </div>
      <div class="panel-group__row">
        <button id="fighter-reset-stats" class="shell-button" type="button">Reset fighter</button>
        <button id="fighter-save-stats" class="shell-button" data-variant="primary" type="button">Save all</button>
      </div>
      <p id="fighter-save-status" class="panel-note">Loaded from public/configs/fighter-playground.json</p>
      <p class="panel-subtitle">Walk animation</p>
      <label class="toggle-row"><input id="fighter-reverse-walk" type="checkbox" /> Use reverse walk anims</label>
      <p class="panel-note">Plays the forward walk in reverse instead of the dedicated backward walk.</p>
      <p class="panel-subtitle">Special meter</p>
      <label class="toggle-row"><input id="fighter-fill-special" type="checkbox" /> Fill special bar</label>
      <p class="panel-note">Keeps the meter full so you can fire the special (U) on the dummy.</p>
      <p class="panel-subtitle">Debug bounds</p>
      <label class="toggle-row"><input id="fighter-bounds-all" type="checkbox" /> Show all bounds</label>
      <label class="toggle-row"><input id="fighter-bounds-visual" type="checkbox" /> <span class="bounds-swatch" style="background:#38bdf8"></span> Visual</label>
      <label class="toggle-row"><input id="fighter-bounds-collision" type="checkbox" /> <span class="bounds-swatch" style="background:#facc15"></span> Collision</label>
      <label class="toggle-row"><input id="fighter-bounds-hit" type="checkbox" /> <span class="bounds-swatch" style="background:#22c55e"></span> Hit</label>
      <label class="toggle-row"><input id="fighter-bounds-attack" type="checkbox" /> <span class="bounds-swatch" style="background:#f43f5e"></span> Attack</label>
      <label class="toggle-row"><input id="fighter-bounds-guard" type="checkbox" /> <span class="bounds-swatch" style="background:#a855f7"></span> Guard</label>
      <p class="panel-note">Inactive frames render faint; active frames render solid.</p>
    `
  },
  {
    id: 'background-gym',
    title: 'Background Gym',
    body: `
      <label class="stack-row">
        <span class="stack-row__label">Layer</span>
        <select id="background-layer"></select>
      </label>
      <label class="toggle-row"><input id="background-visible" type="checkbox" /> Visible</label>
      <div class="bounds-editor">
        <label class="number-row"><span>Offset X</span><input id="background-offset-x" type="number" min="-1280" max="1280" step="1" /></label>
        <label class="number-row"><span>Offset Y</span><input id="background-offset-y" type="number" min="-720" max="720" step="1" /></label>
        <label class="number-row"><span>Scale</span><input id="background-scale" type="number" min="0.25" max="3" step="0.05" /></label>
        <label class="number-row"><span>K Speed</span><input id="background-speed" type="number" min="-4" max="4" step="0.05" /></label>
        <label class="number-row"><span>Alpha</span><input id="background-alpha" type="number" min="0" max="1" step="0.05" /></label>
      </div>
      <div class="panel-group__row">
        <button id="background-save-layer" class="shell-button" type="button">Save layer</button>
        <button id="background-save-all" class="shell-button" data-variant="primary" type="button">Save all</button>
      </div>
      <p id="background-save-status" class="panel-note">Loaded from public/configs/background-gym.json</p>
    `
  },
  {
    id: 'stage-preview',
    title: 'Stage Preview',
    body: `
      <label class="stack-row">
        <span class="stack-row__label">Stage</span>
        <select id="stage-preview-stage"></select>
      </label>
      <label class="stack-row">
        <span class="stack-row__label">Scroll X</span>
        <input id="stage-preview-scroll" type="range" min="0" max="0" step="1" />
      </label>
      <div class="panel-group__row">
        <button id="stage-preview-center" class="shell-button" type="button">Center</button>
      </div>
      <label class="toggle-row"><input id="stage-preview-autopan" type="checkbox" /> Auto-scroll (ping-pong)</label>
      <label class="number-row"><span>Pan speed</span><input id="stage-preview-speed" type="number" min="20" max="600" step="10" /></label>
      <label class="toggle-row"><input id="stage-preview-guides" type="checkbox" /> Framing guides</label>
      <div class="metrics metrics--compact">
        <div class="metrics__row"><span>Scroll</span><strong id="stage-preview-scroll-readout">-</strong></div>
        <div class="metrics__row"><span>Source</span><strong id="stage-preview-source-readout">-</strong></div>
        <div class="metrics__row"><span>Fitted</span><strong id="stage-preview-fitted-readout">-</strong></div>
      </div>
    `
  },
  {
    id: 'tile-gym',
    title: 'Tile Gym',
    body: `
      <label class="stack-row">
        <span class="stack-row__label">Asset</span>
        <select id="tile-frame"></select>
      </label>
      <label class="stack-row">
        <span class="stack-row__label">Bounds</span>
        <select id="tile-bounds-kind">
          <option value="collision">Collision</option>
          <option value="hit">Hit</option>
        </select>
      </label>
      <label class="toggle-row"><input id="tile-bounds-active" type="checkbox" /> Active</label>
      <div class="bounds-editor">
        <label class="number-row"><span>Center X</span><input id="tile-bounds-center-x" type="number" min="0" max="640" step="1" /></label>
        <label class="number-row"><span>Center Y</span><input id="tile-bounds-center-y" type="number" min="0" max="640" step="1" /></label>
        <label class="number-row"><span>Width</span><input id="tile-bounds-width" type="number" min="1" max="640" step="1" /></label>
        <label class="number-row"><span>Height</span><input id="tile-bounds-height" type="number" min="1" max="640" step="1" /></label>
      </div>
      <div class="panel-group__row">
        <button id="tile-save-bounds" class="shell-button" type="button">Save bounds</button>
        <button id="tile-reset-bounds" class="shell-button" type="button">Reset</button>
      </div>
      <button id="tile-save-all" class="shell-button" data-variant="primary" type="button">Save all</button>
      <p id="tile-save-status" class="panel-note">Loaded from public/configs/tile-gym.json</p>
      <div class="metrics metrics--compact">
        <div class="metrics__row"><span>Kind</span><strong id="tile-kind-readout">-</strong></div>
        <div class="metrics__row"><span>Size</span><strong id="tile-size-readout">-</strong></div>
      </div>
    `
  },
  {
    id: 'game-config',
    title: 'Game Config',
    body: `
      <label class="number-row"><span>Speed</span><input id="config-speed" type="number" min="80" max="720" step="10" /></label>
      <label class="number-row"><span>Jump</span><input id="config-jump" type="number" min="120" max="1200" step="10" /></label>
      <label class="number-row"><span>Gravity</span><input id="config-gravity" type="number" min="200" max="3600" step="25" /></label>
      <label class="number-row"><span>Scale</span><input id="config-scale" type="number" min="0.4" max="2.5" step="0.05" /></label>
    `
  },
  {
    id: 'touch-controls',
    title: 'Touch Controls',
    body: `
      <label class="toggle-row"><input id="show-touch-controls" type="checkbox" /> Enable touch controls</label>
      <p class="panel-note">Desktop debug override for the mobile shell controls.</p>
    `
  },
  {
    id: 'level-editor',
    title: 'Level Editor',
    body: `
      <label class="stack-row">
        <span class="stack-row__label">Level</span>
        <select id="level-editor-level"></select>
      </label>
      <label class="stack-row">
        <span class="stack-row__label">Camera X</span>
        <input id="level-editor-camera-x" type="range" min="0" max="0" step="1" />
      </label>
      <div class="panel-group__row panel-group__row--four">
        <button id="level-editor-camera-start" class="shell-button" type="button">Start</button>
        <button id="level-editor-camera-left" class="shell-button" type="button">Left</button>
        <button id="level-editor-camera-right" class="shell-button" type="button">Right</button>
        <button id="level-editor-camera-end" class="shell-button" type="button">End</button>
      </div>
      <p id="level-editor-camera-readout" class="panel-note">Camera 0 / 0</p>
      <label class="stack-row">
        <span class="stack-row__label">Category</span>
        <select id="level-editor-category"></select>
      </label>
      <label class="stack-row">
        <span class="stack-row__label">Asset</span>
        <select id="level-editor-asset"></select>
      </label>
      <div class="atlas-preview" aria-label="Selected asset preview">
        <div id="level-editor-asset-preview" class="atlas-preview__sprite"></div>
      </div>
      <div class="panel-group__row">
        <button id="level-editor-select-mode" class="shell-button shell-button--icon level-editor-mode-button" type="button">
          <span class="tool-icon tool-icon--cursor" aria-hidden="true"></span>
          <span>Select</span>
        </button>
        <button id="level-editor-place-mode" class="shell-button level-editor-mode-button" type="button">Place</button>
      </div>
      <label class="stack-row">
        <span class="stack-row__label">Gizmo</span>
        <select id="level-editor-gizmo">
          <option value="free">Free</option>
          <option value="x">X axis</option>
          <option value="y">Y axis</option>
        </select>
      </label>
      <label class="toggle-row"><input id="level-editor-snap" type="checkbox" /> Snap to grid</label>
      <label class="number-row"><span>Grid</span><input id="level-editor-snap-size" type="number" min="1" max="256" step="1" /></label>
      <div class="bounds-editor">
        <label class="number-row"><span>X</span><input id="level-editor-object-x" type="number" min="-2000" max="50000" step="1" /></label>
        <label class="number-row"><span>Y</span><input id="level-editor-object-y" type="number" min="-2000" max="10000" step="1" /></label>
        <label class="number-row"><span>Scale</span><input id="level-editor-object-scale" type="number" min="0.1" max="8" step="0.05" /></label>
        <label class="number-row"><span>Depth</span><input id="level-editor-object-depth" type="number" min="-100" max="500" step="1" /></label>
      </div>
      <div class="panel-group__row">
        <button id="level-editor-duplicate" class="shell-button" type="button">Duplicate</button>
        <button id="level-editor-delete" class="shell-button" data-variant="danger" type="button">Delete</button>
      </div>
      <button id="level-editor-save" class="shell-button" data-variant="primary" type="button">Save level</button>
      <p id="level-editor-save-status" class="panel-note">Loaded from public/assets/levels/editor-playground.json</p>
      <div class="metrics metrics--compact">
        <div class="metrics__row"><span>Selected</span><strong id="level-editor-selected-readout">-</strong></div>
        <div class="metrics__row"><span>Objects</span><strong id="level-editor-count-readout">0</strong></div>
      </div>
    `
  },
  {
    id: 'metrics',
    title: 'Metrics',
    body: `
      <div class="metrics">
        <div class="metrics__row"><span>Scene</span><strong id="scene-readout">-</strong></div>
        <div class="metrics__row"><span>Level</span><strong id="level-readout">-</strong></div>
        <div class="metrics__row"><span>Pointer</span><strong id="pointer-readout">0, 0</strong></div>
        <div class="metrics__row"><span>Input</span><strong id="input-readout">idle</strong></div>
        <div class="metrics__row"><span>FPS</span><strong id="fps-readout">-</strong></div>
        <div class="metrics__row"><span>CPU frame</span><strong id="frame-ms-readout">-</strong></div>
        <div class="metrics__row"><span>Heap</span><strong id="heap-readout">-</strong></div>
        <div class="metrics__row"><span>Objects</span><strong id="object-count-readout">-</strong></div>
      </div>
    `
  }
];

export function renderDebugPanels(): string {
  return DEBUG_PANELS.map(
    (panel) => `
      <section class="panel-group" data-panel="${panel.id}">
        <p class="panel-group__title">${panel.title}</p>
        ${panel.body}
      </section>
    `
  ).join('');
}
