
function MySphere(scene, radius, slices, stacks) {
 	CGFobject.call(this,scene);

 	this.radius=radius;
	this.slices=slices;
	this.stacks=stacks;

 	this.initBuffers();
 };

MySphere.prototype = Object.create(CGFobject.prototype);
MySphere.prototype.constructor = MySphere;

MySphere.prototype.initBuffers = function() {
	var ang_perimeter = Math.PI*2/this.slices;
	var ang_height = Math.PI/this.stacks;

 	this.indices = [];
 	this.vertices = [];
 	this.normals = [];
 	this.texCoords = [];

 	for(var j = 0; j <= this.slices; j++)
 	{
 		for(var i = 0; i <= this.stacks; i++)
 		{
 			var temp = Math.PI-ang_height*i;
			this.vertices.push( Math.sin(temp)*Math.cos(j*ang_perimeter)*this.radius,
					Math.sin(temp)*Math.sin(j*ang_perimeter)*this.radius,
					Math.cos(temp)*this.radius );
			this.normals.push( Math.sin(temp) * Math.cos(j*ang_perimeter),
					Math.sin(temp) * Math.sin(j*ang_perimeter),
					Math.cos(temp) );
			this.texCoords.push( j/this.slices,
					1 - i/this.stacks );

			if(i > 0 && j > 0) {
					var verts = this.vertices.length/3;
					this.indices.push(verts-2, verts-1, verts-this.stacks-2);
					this.indices.push(verts-this.stacks-2, verts-this.stacks-3, verts-2);
			}
 		}
 	}

	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };

MySphere.prototype.setTexCoords = function(ampli_factor_s, ampli_factor_t) {};
