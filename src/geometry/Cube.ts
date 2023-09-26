import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;

  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
    1, 2, 3,
    4, 5, 6,
    5, 6, 7,
    8, 9, 10,
    9, 10, 11,
    12, 13, 14,
    13, 14, 15,
    16, 17, 18,
    17, 18, 19,
    20, 21, 22,
    21, 22, 23]);


    this.positions = new Float32Array([-1, -1, 1, 1,  
        -1, -1, 1, 1,  
        -1, -1, 1, 1,  
        1, -1, 1, 1,   
        1, -1, 1, 1,   
        1, -1, 1, 1,   
        1, 1, 1, 1,    
        1, 1, 1, 1,    
        1, 1, 1, 1,    
        -1, 1, 1, 1,   
        -1, 1, 1, 1,   
        -1, 1, 1, 1,   
        -1, -1, -1, 1, 
        -1, -1, -1, 1, 
        -1, -1, -1, 1, 
        1, -1, -1, 1,  
        1, -1, -1, 1,  
        1, -1, -1, 1,  
        1, 1, -1, 1,   
        1, 1, -1, 1,   
        1, 1, -1, 1,   
        -1, 1, -1, 1,  
        -1, 1, -1, 1,  
        -1, 1, -1, 1]); 

    this.normals = new Float32Array([0, 0, 1, 0,
        0, -1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, -1, 0,
        0, -1, 0, 0,
        -1, 0, 0, 0,
        0, 0, -1, 0,
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, -1, 0,
        0, 1, 0, 0,
        1, 0, 0, 0,
        0, 0, -1, 0,
        0, 1, 0, 0,
        -1, 0, 0, 0,]);
    
    // flip normals
    for (let i = 0; i < this.normals.length; i++) {
        this.normals[i] *= -1;
    }
    this.indices = new Uint32Array([0, 3, 6,
                                0, 6, 9,
                                5, 17, 8,
                                8, 17, 20,
                                10, 7, 19,
                                10, 19, 22,
                                2, 14, 23,
                                2, 23, 11,
                                12, 15, 18,
                                12, 18, 21,
                                1, 4, 16,
                                1, 16, 13]);
    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created Cube`);
  }
};

export default Cube;
