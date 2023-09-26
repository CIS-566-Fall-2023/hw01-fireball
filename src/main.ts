import * as DAT from 'dat.gui';
import { vec3, vec4 } from 'gl-matrix';
import Stats from 'stats-js';

import Camera from './Camera';
import { GAMMA } from './constants';
import Cube from './geometry/Cube';
import Icosphere from './geometry/Icosphere';
import { setGL } from './globals';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  color: [146, 245, 5] as [number, number, number],
  'fbm intensity': 0.2,
  'noise scroll speed': 1,
  'tail length': 1,
  'Reset Parameters': resetParams, // A function pointer, essentially
};

let icosphere: Icosphere;
let cube: Cube;
let gui: DAT.GUI;

let prevTesselations: number = controls.tesselations;
let prevColor = [0, 0, 0] as [number, number, number];

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
}

function resetParams() {
  controls.color = [146, 245, 5];
  controls['fbm intensity'] = 0.2;
  controls['noise scroll speed'] = 1;
  controls['tail length'] = 1;

  // eslint-disable-next-line no-underscore-dangle
  gui.__controllers.forEach((controller) => {
    controller.updateDisplay();
  });
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'Load Scene');
  gui.addColor(controls, 'color');
  gui.add(controls, 'fbm intensity', 0, 1);
  gui.add(controls, 'noise scroll speed', 0, 2);
  gui.add(controls, 'tail length', 0.5, 1.5);
  gui.add(controls, 'Reset Parameters');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
  if (!gl) {
    // eslint-disable-next-line no-alert
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  renderer.setStartTime(Date.now());
  gl.enable(gl.DEPTH_TEST);

  const fireShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/fire-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/fire-frag.glsl')),
  ]);
  fireShader.setGeometryColor([1, 0, 0, 1]);

  const skyboxShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/skybox-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/skybox-frag.glsl')),
  ]);
  skyboxShader.setGeometryColor([1, 1, 1, 1]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    if (controls.tesselations !== prevTesselations) {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }
    if (!vec3.equals(controls.color, prevColor)) {
      prevColor = controls.color;
      const newColor = vec4.fromValues(...prevColor, 0);
      vec4.scale(newColor, newColor, 1 / 256);
      for (let component = 0; component < 3; ++component) {
        newColor[component] **= GAMMA;
      }
      newColor[3] = 1;
      fireShader.setGeometryColor(newColor);
    }
    fireShader.setFbmIntensity(controls['fbm intensity']);
    fireShader.setNoiseScrollSpeed(controls['noise scroll speed']);
    fireShader.setTailLength(controls['tail length']);
    renderer.render(camera, skyboxShader, [cube]);
    renderer.render(camera, fireShader, [icosphere]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener(
    'resize',
    () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.setAspectRatio(window.innerWidth / window.innerHeight);
      camera.updateProjectionMatrix();
    },
    false,
  );

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
