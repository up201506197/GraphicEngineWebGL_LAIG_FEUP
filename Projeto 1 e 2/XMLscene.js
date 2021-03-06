var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 * @constructor
 */
function XMLscene(interface) {
    CGFscene.call(this);

    this.interface = interface;
    this.lightValues = {};

    this.texture = null;
    this.appearance = null;
    this.selectedExampleShader=0;
    this.objects=0;
    this.objectsSelectable = [];
    this.objectsSelectableNames = {'Nothing': null};
    this.objectsSelectableID = 0;
    this.wireframe=false;
    this.scaleFactor=50.0;
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

/**
 * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
 */
XMLscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.enableTextures(true);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);
    this.appearance = new CGFappearance(this);
  	this.appearance.setAmbient(0.3, 0.3, 0.3, 1);
  	this.appearance.setDiffuse(0.7, 0.7, 0.7, 1);
  	this.appearance.setSpecular(0.0, 0.0, 0.0, 1);
  	this.appearance.setShininess(120);

    this.texture = new CGFtexture(this, "textures/texture.jpg");
  	this.appearance.setTexture(this.texture);
  	this.appearance.setTextureWrap ('REPEAT', 'REPEAT');

  	this.shader=
  		new CGFshader(this.gl, "shaders/flat.vert", "shaders/flat.frag");


  	// texture will have to be bound to unit 1 later, when using the shader, with "this.texture2.bind(1);"
  	this.shader.setUniformsValues({uSampler2: 1});
  	this.shader.setUniformsValues({uSampler2: 1});

  	this.texture2 = new CGFtexture(this, "textures/FEUP.jpg");

  	this.updateScaleFactor(0);

}


XMLscene.prototype.updateScaleFactor=function(current_time)
{
	this.shader.setUniformsValues({normScale: 0.5+0.5*Math.sin(current_time/1000)});
}
/**
 * Initializes the scene lights with the values read from the LSX file.
 */
XMLscene.prototype.initLights = function() {
    var i = 0;
    // Lights index.

    // Reads the lights from the scene graph.
    for (var key in this.graph.lights) {
        if (i >= 8)
            break;              // Only eight lights allowed by WebGL.

        if (this.graph.lights.hasOwnProperty(key)) {
            var light = this.graph.lights[key];

            this.lights[i].setPosition(light[1][0], light[1][1], light[1][2], light[1][3]);
            this.lights[i].setAmbient(light[2][0], light[2][1], light[2][2], light[2][3]);
            this.lights[i].setDiffuse(light[3][0], light[3][1], light[3][2], light[3][3]);
            this.lights[i].setSpecular(light[4][0], light[4][1], light[4][2], light[4][3]);

            this.lights[i].setVisible(true);
            if (light[0])
                this.lights[i].enable();
            else
                this.lights[i].disable();

            this.lights[i].update();

            i++;
        }
    }

}

/**
 * Initializes the scene cameras.
 */
XMLscene.prototype.initCameras = function() {
    this.camera = new CGFcamera(0.4,0.1,500,vec3.fromValues(15, 15, 15),vec3.fromValues(0, 0, 0));
}

/* Handler called when the graph is finally loaded.
 * As loading is asynchronous, this may be called already after the application has started the run loop
 */
XMLscene.prototype.onGraphLoaded = function()
{
    this.camera.near = this.graph.near;
    this.camera.far = this.graph.far;
    this.axis = new CGFaxis(this,this.graph.referenceLength);

    this.setGlobalAmbientLight(this.graph.ambientIllumination[0], this.graph.ambientIllumination[1],
    this.graph.ambientIllumination[2], this.graph.ambientIllumination[3]);

    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.initLights();

    this.setUpdatePeriod(1000/60);

    // Adds lights group.
    this.interface.addLightsGroup(this.graph.lights);
    this.interface.dropDown();
}

/**
 * Displays the scene.
 */
XMLscene.prototype.display = function() {
    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.pushMatrix();

    if (this.graph.loadedOk)
    {
        // Applies initial transformations.
        this.multMatrix(this.graph.initialTransforms);

		// Draw axis
		this.axis.display();

        var i = 0;
        for (var key in this.lightValues) {
            if (this.lightValues.hasOwnProperty(key)) {
                if (this.lightValues[key]) {
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                }
                else {
                    this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }
                this.lights[i].update();
                i++;
            }
        }

        // Displays the scene.
        this.graph.displayScene();

    }
	else
	{
		// Draw axis
		this.axis.display();
	}

  	//this.setActiveShader(this.shader);

  	this.pushMatrix();

    this.texture2.bind(1);

  	this.translate(0,-6,0);
  	this.scale(0.5,0.5,0.5);
  	this.rotate(-Math.PI/2, 1, 0, 0);
  	this.popMatrix();

  	//this.setActiveShader(this.defaultShader);

    this.popMatrix();

    // ---- END Background, camera and axis setup

}

/**
* Function that will update the animations over time and also refresh the scale of the selectable object
* @param current_time time of the system
*/
XMLscene.prototype.update = function(current_time){

for(node in this.graph.nodes){
  if(this.graph.nodes[node].animations.length!=0){
    this.graph.nodes[node].updateAnimation(current_time);
  }
}

this.updateScaleFactor(current_time);


}
