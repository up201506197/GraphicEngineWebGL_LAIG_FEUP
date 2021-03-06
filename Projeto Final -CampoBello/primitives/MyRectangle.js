/**
 * MyRectangle
 * @constructor
 */
 function MyRectangle(scene, left_top_x, left_top_y, right_bottom_x, right_bottom_y) {
 	CGFobject.call(this,scene);

  this.left_top_x = left_top_x;
  this.left_top_y = left_top_y;
  this.right_bottom_x = right_bottom_x;
  this.right_bottom_y = right_bottom_y;

  if(typeof minS == 'undefined' || typeof maxS == 'undefined' || typeof minT == 'undefined' || typeof maxT == 'undefined'){
    this.minS = 0;
  this.maxS = 1;
  this.minT = 0;
  this.maxT = 1;
} else {
  this.minS = minS;
  this.maxS = maxS;
  this.minT = minT;
  this.maxT = maxT;
}

this.height = this.left_top_y - this.right_bottom_y;
this.width = this.right_bottom_x - this.left_top_x;

 	this.initBuffers();
 };

 MyRectangle.prototype = Object.create(CGFobject.prototype);
 MyRectangle.prototype.constructor = MyRectangle;

 MyRectangle.prototype.initBuffers = function() {

  this.vertices = [
    this.left_top_x, this.left_top_y, 0,
    this.right_bottom_x, this.left_top_y, 0,
    this.right_bottom_x, this.right_bottom_y, 0,
    this.left_top_x, this.right_bottom_y, 0
 	];

 	this.indices = [
 	    2, 1, 0,
      0, 3, 2
 	];

  this.normals = [
 	0, 0, 1,
 	0, 0, 1,
 	0, 0, 1,
 	0, 0, 1
 	];

 this.texCoords = [
     this.minS, this.maxT,
     this.maxS, this.maxT,
     this.maxS, this.minT,
     this.minS, this.minT
 ]

 	this.primitiveType = this.scene.gl.TRIANGLES;



 	this.initGLBuffers();
 };

 MyRectangle.prototype.setTexCoords = function(ampli_factor_s, ampli_factor_t) {
    this.texCoords= [
      0, this.height/ampli_factor_t,
      this.width/ampli_factor_s, this.height/ampli_factor_t,
      this.width/ampli_factor_s,0,
      0,0
    ];


}
