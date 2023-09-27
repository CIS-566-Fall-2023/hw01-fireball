import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifSecColor: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifScale: WebGLUniformLocation;
  unifCamPos: WebGLUniformLocation;
  unifIcoRadius: WebGLUniformLocation;
  unifIrid_a: WebGLUniformLocation;
  unifIrid_b: WebGLUniformLocation;
  unifIrid_c: WebGLUniformLocation;
  unifIrid_d: WebGLUniformLocation;
  unifPerlinFreq: WebGLUniformLocation;
  unifFbmAmp: WebGLUniformLocation;
  unifFbmFreq: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifColor      = gl.getUniformLocation(this.prog, "u_Color");
    this.unifSecColor   = gl.getUniformLocation(this.prog, "u_SecColor");
    this.unifTime       = gl.getUniformLocation(this.prog, "u_Time");
    this.unifScale      = gl.getUniformLocation(this.prog, "u_Scale");
    this.unifCamPos     = gl.getUniformLocation(this.prog, "u_CamPos");
    this.unifIcoRadius  = gl.getUniformLocation(this.prog, "u_IcosphereRadius");
    this.unifIrid_a     = gl.getUniformLocation(this.prog, "u_Irid_a");
    this.unifIrid_b     = gl.getUniformLocation(this.prog, "u_Irid_b");
    this.unifIrid_c     = gl.getUniformLocation(this.prog, "u_Irid_c");
    this.unifIrid_d     = gl.getUniformLocation(this.prog, "u_Irid_d");
    this.unifPerlinFreq = gl.getUniformLocation(this.prog, "u_PerlinFreq");
    this.unifFbmAmp     = gl.getUniformLocation(this.prog, "u_FbmAmp");
    this.unifFbmFreq    = gl.getUniformLocation(this.prog, "u_FbmFreq");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
    }
  }

  setSecondaryColor(color: vec4) {
    this.use();
    if (this.unifSecColor !== -1) {
      gl.uniform4fv(this.unifSecColor, color);
    }
  }

  setIridA(col: vec3) {
    this.use();
    if (this.unifIrid_a !== -1) {
      gl.uniform3fv(this.unifIrid_a, col);
    }
  }

  setIridB(col: vec3) {
    this.use();
    if (this.unifIrid_b !== -1) {
      gl.uniform3fv(this.unifIrid_b, col);
    }
  }

  setIridC(col: vec3) {
    this.use();
    if (this.unifIrid_c !== -1) {
      gl.uniform3fv(this.unifIrid_c, col);
    }
  }

  setIridD(col: vec3) {
    this.use();
    if (this.unifIrid_d !== -1) {
      gl.uniform3fv(this.unifIrid_d, col);
    }
  }


  setTime(time: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, time);
    }
  }

  setScale(scale: number) {
    this.use();
    if (this.unifScale !== -1) {
      gl.uniform1f(this.unifScale, scale);
    }
  }

  setPerlinFrequency(freq: number) {
    this.use();
    if (this.unifPerlinFreq !== -1) {
      gl.uniform1f(this.unifPerlinFreq, freq);
    }
  }

  setFbmAmplitude(amp: number) {
    this.use();
    if (this.unifFbmAmp !== -1) {
      gl.uniform1f(this.unifFbmAmp, amp);
    }
  }

  setFbmFrequency(freq: number) {
    this.use();
    if (this.unifFbmFreq !== -1) {
      gl.uniform1f(this.unifFbmFreq, freq);
    }
  }

  setCamPos(cam_pos: vec3) {
    this.use();
    if (this.unifCamPos !== -1) {
      gl.uniform3fv(this.unifCamPos, cam_pos);
    }
  }

  setRadius(radius: number) {
    this.use();
    if (this.unifIcoRadius !== -1) {
      gl.uniform1f(this.unifIcoRadius, radius);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
  }
};

export default ShaderProgram;
