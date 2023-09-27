import {mat4, vec2, vec4} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  constructor(public canvas: HTMLCanvasElement) {
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  render(
    camera: Camera, 
    prog: ShaderProgram, 
    drawables: Array<Drawable>,
    fColor: vec4 = vec4.fromValues(1, 0, 0, 1),
    FBMOctaves: number = 8,
    FBMFreq: number = 16.0,
    FBMAmp: number = 1.0,
    ) 
    {
    let model = mat4.create();
    let viewProj = mat4.create();

    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    prog.setModelMatrix(model);
    prog.setViewProjMatrix(viewProj);

    prog.setFireColor(fColor);

    prog.setCanvasSize(vec2.fromValues(this.canvas.width, this.canvas.height))

    prog.setFBMOctaves(FBMOctaves);
    prog.setFBMFreq(FBMFreq);
    prog.setFBMAmp(FBMAmp);

    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }
};

export default OpenGLRenderer;
