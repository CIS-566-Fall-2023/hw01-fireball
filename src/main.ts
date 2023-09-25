import {vec3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import BgSphere from './geometry/BgSphere';

import Square from './geometry/Square';
import Rectangle from './geometry/Rectangle';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 2,
  color: [188, 103, 0] as [number, number, number],
 // 'Load Scene': loadScene, // A function pointer, essentially
  speed: 2,
  'Reset': reset, // A function pointer, essentially
  //restore: -1,
  // time: 0,
};

let icosphere: Icosphere;
let square: Square;
let rect: Rectangle;
let bgIco: Icosphere;
let eye1: Icosphere;
let eye2: Icosphere;

let arm1: Icosphere;
let arm2: Icosphere;

//let cube: Cube;
let prevTesselations: number = 2;
//let prevSpeed: number = 1;
let time: GLfloat = 0;
let isCube: Boolean = true;
let gui = new DAT.GUI();
//let cameraLook: vec3;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  // cube = new Cube(vec3.fromValues(0, 0, 0));
  // cube.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  rect = new Rectangle(vec3.fromValues(0, 0, 0));
  rect.create();
  bgIco = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  bgIco.create();

  eye1 = new Icosphere(vec3.fromValues(0, 0, 0), 0.5, controls.tesselations);
  eye1.create();

  eye2 = new Icosphere(vec3.fromValues(0, 0, 0), 0.5, controls.tesselations);
  eye2.create();

  arm1 = new Icosphere(vec3.fromValues(0, 0, 0), 0.5, controls.tesselations);
  arm1.create();

  arm2 = new Icosphere(vec3.fromValues(0, 0, 0), 0.5, controls.tesselations);
  arm2.create();

  isCube = !isCube;
}

function reset() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, 2);
  icosphere.create();
  controls.speed = 2;
  controls.tesselations = 2;
  controls.color = [188, 103, 0];
  gui.updateDisplay();
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
  gui.addColor(controls, 'color');
  gui.add(controls, 'tesselations', 0, 4).step(1);
  gui.add(controls, 'speed', 0, 4).step(1);
  gui.add(controls, 'Reset');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0, 0, 0, 1);   // set background to black
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const bgShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/star-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/star-frag.glsl')),
  ]);

  const eyeShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/eye1-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/eye1-frag.glsl')),
  ]);

  const eyeShader2 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/eye2-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/eye2-frag.glsl')),
  ]);

  const armShader1 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/arm1-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/arm1-frag.glsl')),
  ]);

  const armShader2 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/arm2-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/arm2-frag.glsl')),
  ]);
  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    lambert.setTime(time);
    bgShader.setTime(time);
    eyeShader.setTime(time);
    eyeShader2.setTime(time);
    armShader1.setTime(time);
    armShader2.setTime(time);

    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();

      bgIco = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      bgIco.create();
      
    }

    lambert.setGeometryColor(vec4.fromValues(controls.color[0] / 255, controls.color[1] / 255, controls.color[2] / 255, 1));
    lambert.setSpeed(controls.speed);

    bgShader.setGeometryColor(vec4.fromValues(controls.color[0] / 255, controls.color[1] / 255, controls.color[2] / 255, 1));
    bgShader.setSpeed(controls.speed);

    eyeShader.setGeometryColor(vec4.fromValues(controls.color[0] / 255, controls.color[1] / 255, controls.color[2] / 255, 1));
    eyeShader.setSpeed(controls.speed);

    eyeShader2.setGeometryColor(vec4.fromValues(controls.color[0] / 255, controls.color[1] / 255, controls.color[2] / 255, 1));
    eyeShader2.setSpeed(controls.speed);

    armShader1.setGeometryColor(vec4.fromValues(controls.color[0] / 255, controls.color[1] / 255, controls.color[2] / 255, 1));
    armShader1.setSpeed(controls.speed);

    armShader2.setGeometryColor(vec4.fromValues(controls.color[0] / 255, controls.color[1] / 255, controls.color[2] / 255, 1));
    armShader2.setSpeed(controls.speed);

    const obj = isCube ? square : icosphere;

    // render objects
    renderer.render(camera, bgShader, [
      bgIco,
    ]);
    renderer.render(camera, lambert, [
      obj,
    ]);

    renderer.render(camera, eyeShader, [
      eye1,
    ]);

    renderer.render(camera, eyeShader2, [
      eye2,
    ]);

    renderer.render(camera, armShader1, [
      arm1,
    ]);
    
    renderer.render(camera, armShader2, [
      arm2,
    ]);
    
    stats.end();
    time++;

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
