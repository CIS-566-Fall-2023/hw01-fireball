import {vec3, vec4, mat4, glMatrix, quat} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  renderOuterFlame: false,
  'Load Scene': loadScene, // A function pointer, essentially
  'irid_a': [0.91 * 255, 0.318 * 255, -0.91 * 255],
  'irid_b': [0.048 * 255, 0.448 * 255, 0.098 * 255],
  'irid_c': [-0.972 * 255, -0.442 * 255, 0.000 * 255],
  'irid_d': [-0.442 * 255, -0.572 * 255, 0.000 * 255],
  'outerFlameCol1': [190,49,49],
  'outerFlameCol2': [205,99,44],
  'featCol': [0.8 * 255, 0.2 * 255, 0.2 * 255],
  perlinFreq: 0.5,
  fbmAmp: 7,
  fbmFreq: 15,
};

const defaults = {
  tesselations: 5,
  renderOuterFlame: false,
  'Load Scene': loadScene, // A function pointer, essentially
  'irid_a': [0.91 * 255, 0.318 * 255, -0.91 * 255],
  'irid_b': [0.048 * 255, 0.448 * 255, 0.098 * 255],
  'irid_c': [-0.972 * 255, -0.442 * 255, 0.000 * 255],
  'irid_d': [-0.442 * 255, -0.572 * 255, 0.000 * 255],
  'outerFlameCol1': [190,49,49],
  'outerFlameCol2': [205,99,44],
  'featCol': [0.8 * 255, 0.2 * 255, 0.2 * 255],
  perlinFreq: 0.5,
  fbmAmp: 7,
  fbmFreq: 15,
};

let icosphere: Icosphere;
let outerFlame: Icosphere;
let leftBrow: Icosphere;
let rightBrow: Icosphere;
let eyeBasic: Icosphere;
let eyelash: Icosphere;
let eyeball: Icosphere;
let nose: Icosphere;
let mouth: Icosphere;
let square: Square;
let cube: Cube;
let prevTesselations: number = 5;
let time: number = 0;
let camPos: vec3 = vec3.fromValues(0, 0, 5);
let lefBrowPos: vec3 = vec3.fromValues(-0.6, -0.7, 2.9);
let leftEyePos: vec3 = vec3.fromValues(-0.55,-0.4, 0.9);
let leftEyeballPos: vec3 = vec3.fromValues(-0.45,-0.363, 0.9);
let nosePos: vec3 = vec3.fromValues(0,-0.68, 0.91);
let mouthPos: vec3 = vec3.fromValues(0,-0.75, 0.83);
let radius: number = 1;
let browRadius: number = radius * 0.25;
let lashRadius: number = radius * 0.32;
let eyeballRadius: number = radius * 0.133;
let noseRadius: number = radius * 0.1;
let outerFlameRadiusScale: number = 1.06;

function loadScene() {  
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), radius, controls.tesselations);
  icosphere.create();
  outerFlame = new Icosphere(vec3.fromValues(0, 0, 0), radius, controls.tesselations);
  outerFlame.create();
  leftBrow = new Icosphere(lefBrowPos, browRadius, controls.tesselations);
  leftBrow.create();
  rightBrow = new Icosphere(vec3.fromValues(-lefBrowPos[0],lefBrowPos[1], lefBrowPos[2]), browRadius, controls.tesselations);
  rightBrow.create();
  eyeBasic = new Icosphere(vec3.fromValues(0, 0, 0), browRadius, controls.tesselations);
  eyeBasic.create();
  eyelash = new Icosphere(vec3.fromValues(0, 0, 0), lashRadius, controls.tesselations);
  eyelash.create();
  eyeball = new Icosphere(vec3.fromValues(0, 0, 0), eyeballRadius, controls.tesselations);
  eyeball.create();
  nose = new Icosphere(vec3.fromValues(0, 0, 0), noseRadius, controls.tesselations);
  nose.create();
  mouth = new Icosphere(vec3.fromValues(0, 0, 0), noseRadius, controls.tesselations);
  mouth.create();
  square = new Square(vec3.fromValues(5, 5, 5));
  square.create();
  cube = new Cube(vec3.fromValues(5, 5, 5));
  cube.create();
  controls.tesselations = defaults.tesselations;
  controls.renderOuterFlame = defaults.renderOuterFlame;
  controls.irid_a = defaults.irid_a;
  controls.irid_b = defaults.irid_b;
  controls.irid_c = defaults.irid_c;
  controls.irid_d = defaults.irid_d;
  controls.outerFlameCol1 = defaults.outerFlameCol1;
  controls.outerFlameCol2 = defaults.outerFlameCol2;
  controls.featCol = defaults.featCol;
  controls.perlinFreq = defaults.perlinFreq;
  controls.fbmAmp = defaults.fbmAmp;
  controls.fbmFreq = defaults.fbmFreq;
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
  const gui = new DAT.GUI();  
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'Load Scene').name("Reset To Defaults");
  var ember = gui.addFolder("Ember!");
  var ember_col = ember.addFolder("Body Color");
  ember_col.addColor(controls, 'irid_a').name("Offset");
  ember_col.addColor(controls, 'irid_b').name("Amplitude");
  ember_col.addColor(controls, 'irid_c').name("Frequency");
  ember_col.addColor(controls, 'irid_d').name("Phase");
  ember.addColor(controls, 'featCol').name("Color of Features");
  ember.add(controls, 'perlinFreq', 0, 2.5).name("Flame Jitter").step(0.1);
  ember.add(controls, 'fbmAmp', 1, 10).name("Noise Amplitude").step(1);
  ember.add(controls, 'fbmFreq', 5, 35).name("Noise Frquency").step(5);
  var outerflame = gui.addFolder("Outer Flame");
  outerflame.add(controls, 'renderOuterFlame').name("Show Outer Flame");  
  outerflame.addColor(controls, 'outerFlameCol1').name("Outer Flame Main");
  outerflame.addColor(controls, 'outerFlameCol2').name("Outer Flame Highlight");
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

  const camera = new Camera(camPos, vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
 
  const baseEmber = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/fireball-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/iridescent-flame-frag.glsl')),
  ]);

  const flame = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/fireball-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/fireball-frag.glsl')),
  ]);

  const browShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/eyebrow-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/iridescent-flame-frag.glsl')),
  ]);

  const eyeShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/eye-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const eyeLashShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/eyelash-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const eyeballShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/eyeball-frag.glsl')),
  ]);

  const noseShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/nose-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const mouthShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/mouth-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    time++;
    
    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), radius, prevTesselations);
      icosphere.create();
      outerFlame = new Icosphere(vec3.fromValues(0, 0, 0), radius, prevTesselations);
      outerFlame.create();
      leftBrow = new Icosphere(lefBrowPos, browRadius, prevTesselations);
      leftBrow.create();
      rightBrow = new Icosphere(vec3.fromValues(-lefBrowPos[0],lefBrowPos[1], lefBrowPos[2]), browRadius, prevTesselations);
      rightBrow.create();
      eyeBasic = new Icosphere(vec3.fromValues(0, 0, 0), browRadius, prevTesselations);
      eyeBasic.create();
      eyelash = new Icosphere(vec3.fromValues(0, 0, 0), lashRadius, prevTesselations);
      eyelash.create();
      eyeball = new Icosphere(vec3.fromValues(0, 0, 0), eyeballRadius, prevTesselations);
      eyeball.create();
      nose = new Icosphere(vec3.fromValues(0, 0, 0), noseRadius, prevTesselations);
      nose.create();
      mouth = new Icosphere(vec3.fromValues(0, 0, 0), noseRadius, prevTesselations);
      mouth.create();
    }

    let identityModel = mat4.create();
    mat4.identity(identityModel);
    baseEmber.setGeometryColor(vec4.fromValues(205/255, 99/255, 44/255, 1));
    baseEmber.setIridA(vec3.fromValues(controls.irid_a[0]/255, controls.irid_a[1]/255, controls.irid_a[2]/255));
    baseEmber.setIridB(vec3.fromValues(controls.irid_b[0]/255, controls.irid_b[1]/255, controls.irid_b[2]/255));
    baseEmber.setIridC(vec3.fromValues(controls.irid_c[0]/255, controls.irid_c[1]/255, controls.irid_c[2]/255));
    baseEmber.setIridD(vec3.fromValues(controls.irid_d[0]/255, controls.irid_d[1]/255, controls.irid_d[2]/255));    
    baseEmber.setTime(time);
    baseEmber.setScale(1);
    baseEmber.setPerlinFrequency(controls.perlinFreq);
    baseEmber.setFbmAmplitude(controls.fbmAmp);
    baseEmber.setFbmFrequency(controls.fbmFreq);
    baseEmber.setModelMatrix(identityModel);
    baseEmber.setCamPos(vec3.fromValues(camera.controls.eye[0], camera.controls.eye[1], camera.controls.eye[2]));
    renderer.render(camera, baseEmber, [
      icosphere,
    ]);

    browShader.setIridA(vec3.fromValues(controls.irid_a[0]/255, controls.irid_a[1]/255, controls.irid_a[2]/255));
    browShader.setIridB(vec3.fromValues(controls.irid_b[0]/255, controls.irid_b[1]/255, controls.irid_b[2]/255));
    browShader.setIridC(vec3.fromValues(controls.irid_c[0]/255, controls.irid_c[1]/255, controls.irid_c[2]/255));
    browShader.setIridD(vec3.fromValues(controls.irid_d[0]/255, controls.irid_d[1]/255, controls.irid_d[2]/255));    
    browShader.setTime(time);
    browShader.setScale(1);
    browShader.setModelMatrix(identityModel);
    browShader.setCamPos(vec3.fromValues(camera.controls.eye[0], camera.controls.eye[1], camera.controls.eye[2]));
    renderer.render(camera, browShader, [
      leftBrow,
      rightBrow
    ]);

    //rendering the two eyes

    //left eye
    let eye_zrot: number = -15;
    let eye_yrot: number = -10;
    eyeShader.setGeometryColor(vec4.fromValues(1, 1, 1, 1));
    let eyeModelMatrix: mat4 = mat4.create();
    let rot: quat = quat.create();
    quat.rotateZ(rot, rot, glMatrix.toRadian(eye_zrot));
    quat.rotateY(rot, rot, glMatrix.toRadian(eye_yrot));
    mat4.fromRotationTranslation(eyeModelMatrix, rot, leftEyePos);
    eyeShader.setModelMatrix(eyeModelMatrix);
    eyeShader.setRadius(browRadius);
    renderer.render(camera, eyeShader, [
      eyeBasic,
    ]);
    

    //right eye
    quat.identity(rot);
    mat4.identity(eyeModelMatrix);
    quat.rotateZ(rot, rot, glMatrix.toRadian(-eye_zrot));
    quat.rotateY(rot, rot, glMatrix.toRadian(-eye_yrot)); 
    mat4.fromRotationTranslationScale(eyeModelMatrix, rot, vec3.fromValues(-leftEyePos[0], leftEyePos[1], leftEyePos[2]), vec3.fromValues(-1,1,1));   
    eyeShader.setModelMatrix(eyeModelMatrix);
    eyeShader.setRadius(browRadius);
    renderer.render(camera, eyeShader, [
      eyeBasic,
    ]);

    //rendering the two eyeslashes

    //left eyelash
    let additional_lash_rot: number = -3.2;
    eyeLashShader.setGeometryColor(vec4.fromValues(controls.featCol[0]/255, controls.featCol[1]/255, controls.featCol[2]/255, 1));
    quat.identity(rot);
    mat4.identity(eyeModelMatrix);
    quat.rotateZ(rot, rot, glMatrix.toRadian(eye_zrot));
    quat.rotateY(rot, rot, glMatrix.toRadian(eye_yrot));
    mat4.fromRotationTranslation(eyeModelMatrix, rot, leftEyePos);
    mat4.translate(eyeModelMatrix, eyeModelMatrix, vec3.fromValues(browRadius - lashRadius + 0.03, 0, -0.01));
    let rot_after_trans: mat4 = mat4.create();
    mat4.rotateZ(rot_after_trans, rot_after_trans, glMatrix.toRadian(additional_lash_rot));
    mat4.multiply(eyeModelMatrix, rot_after_trans, eyeModelMatrix);
    eyeLashShader.setModelMatrix(eyeModelMatrix);
    eyeLashShader.setRadius(lashRadius);
    renderer.render(camera, eyeLashShader, [
      eyelash,
    ]);

    //right eyelash
    quat.identity(rot);
    mat4.identity(eyeModelMatrix);
    quat.rotateZ(rot, rot, glMatrix.toRadian(-eye_zrot));
    quat.rotateY(rot, rot, glMatrix.toRadian(-eye_yrot));
    mat4.fromRotationTranslationScale(eyeModelMatrix, rot, vec3.fromValues(-leftEyePos[0], leftEyePos[1], leftEyePos[2]), vec3.fromValues(-1,1,1));
    mat4.translate(eyeModelMatrix, eyeModelMatrix, vec3.fromValues(browRadius - lashRadius + 0.03, 0, -0.01));
    mat4.identity(rot_after_trans);
    mat4.rotateZ(rot_after_trans, rot_after_trans, glMatrix.toRadian(-additional_lash_rot));
    mat4.multiply(eyeModelMatrix, rot_after_trans, eyeModelMatrix);
    eyeLashShader.setModelMatrix(eyeModelMatrix);
    renderer.render(camera, eyeLashShader, [
      eyelash,
    ]);

    //render the eyeballs

    //left eyeball
    mat4.identity(eyeModelMatrix);
    mat4.fromTranslation(eyeModelMatrix, leftEyeballPos);
    eyeballShader.setGeometryColor(vec4.fromValues(controls.featCol[0]/255, controls.featCol[1]/255, controls.featCol[2]/255, 1));
    eyeballShader.setModelMatrix(eyeModelMatrix);
    eyeballShader.setTime(time);
    eyeballShader.setRadius(eyeballRadius);
    renderer.render(camera, eyeballShader, [
      eyeball
    ]);

    //right eyeball
    mat4.identity(eyeModelMatrix);
    mat4.fromTranslation(eyeModelMatrix, vec3.fromValues(-leftEyeballPos[0], leftEyeballPos[1], leftEyeballPos[2]));
    eyeballShader.setModelMatrix(eyeModelMatrix);
    eyeballShader.setTime(time);
    eyeballShader.setRadius(eyeballRadius);
    renderer.render(camera, eyeballShader, [
      eyeball
    ]);

    //draw the nose now, its high time.
    mat4.identity(eyeModelMatrix);
    mat4.fromTranslation(eyeModelMatrix, nosePos);
    noseShader.setModelMatrix(eyeModelMatrix);
    noseShader.setGeometryColor(vec4.fromValues(controls.featCol[0]/255, controls.featCol[1]/255, controls.featCol[2]/255, 1));
    noseShader.setRadius(noseRadius);
    renderer.render(camera, noseShader, [
      nose
    ]);

    //lets finally draw the mouth
    mat4.identity(eyeModelMatrix);
    mat4.fromTranslation(eyeModelMatrix, mouthPos);
    mouthShader.setModelMatrix(eyeModelMatrix);
    mouthShader.setGeometryColor(vec4.fromValues(controls.featCol[0]/255, controls.featCol[1]/255, controls.featCol[2]/255, 1));
    mouthShader.setRadius(noseRadius);
    renderer.render(camera, mouthShader, [
      mouth
    ]);

    if(controls.renderOuterFlame) {
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    mat4.identity(eyeModelMatrix);
    mat4.fromRotationTranslationScale(eyeModelMatrix, quat.identity(rot),vec3.fromValues(0, 0.0, 0.0),vec3.fromValues(0.85, .9, 1));
    // mat4.fromTranslation(eyeModelMatrix, vec3.fromValues(0, 0.4, 0.0));
    flame.setTime(time);
    flame.setScale(radius * 1.2);
    flame.setModelMatrix(eyeModelMatrix);
    flame.setRadius(radius);
    flame.setCamPos(vec3.fromValues(camera.controls.eye[0], camera.controls.eye[1], camera.controls.eye[2]));
    flame.setGeometryColor(vec4.fromValues(controls.outerFlameCol1[0]/255, controls.outerFlameCol1[1]/255, controls.outerFlameCol1[2]/255, 1));
    flame.setSecondaryColor(vec4.fromValues(controls.outerFlameCol2[0]/255, controls.outerFlameCol2[1]/255, controls.outerFlameCol2[2]/255, 1));
    renderer.render(camera, flame, [
      outerFlame,
    ]);
    mat4.fromRotationTranslationScale(eyeModelMatrix, quat.identity(rot),vec3.fromValues(0, 0.0, 0.0),vec3.fromValues(0.5, .7, 1));
    flame.setModelMatrix(eyeModelMatrix);
    renderer.render(camera, flame, [
      outerFlame,
    ]);
    gl.disable(gl.CULL_FACE);
  }
    stats.end();

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
