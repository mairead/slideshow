/* global THREE, Leap */

//create 3D canvas - guess this is the ThreeJs stage setup
var container, scene, renderer, camera, light, loader;
var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;

var pitchValTxt, rollValTxt, yawValTxt;

pitchValTxt = document.getElementById('pitchVal');
rollValTxt = document.getElementById('rollVal');
yawValTxt = document.getElementById('yawVal');

container = document.querySelector('.viewport');

WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;

var width = WIDTH ;
var height = HEIGHT ;

VIEW_ANGLE = 45;
ASPECT = WIDTH / HEIGHT;
NEAR = 1;
FAR = 10000;

// Setup scene
scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(WIDTH, HEIGHT);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMapType = THREE.PCFShadowMap;
renderer.shadowMapAutoUpdate = true;

container.appendChild(renderer.domElement);

camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

camera.position.set(30, 10, 0);
camera.lookAt(scene.position);
scene.add(camera);

renderer.setClearColor( 0xffffff, 1);

light = new THREE.DirectionalLight(0xffffff);

light.position.set(0, 300, 0);
light.castShadow = true;
light.shadowCameraLeft = -60;
light.shadowCameraTop = -60;
light.shadowCameraRight = 60;
light.shadowCameraBottom = 60;
light.shadowCameraNear = 1;
light.shadowCameraFar = 1000;
light.shadowBias = -0.0001;
light.shadowMapWidth = light.shadowMapHeight = 1024;
light.shadowDarkness = 0.7;

scene.add(light);

var sphere; //create global
var hand;

var axisHelper = new THREE.AxisHelper( 15 );

var size = 10;
var step = 1;
var gridHelper = new THREE.GridHelper( size, step );

gridHelper.position = new THREE.Vector3( 10, -5, 0 );

//axisHelper.rotation = new THREE.Euler( 1, 1, 1 );
//gridHelper.rotation = new THREE.Euler( 1, 1, 1 );

scene.add( gridHelper );
scene.add( axisHelper );

//axisHelper.rotation.set(90, 90, 90)

//Instantiate new Mesh object by loading Blender JSON export
var loader = new THREE.JSONLoader();

//load Hand model with ThreeJS Loader
loader.load('javascripts/palm.js', function (geometry, materials) {
  var material;



  hand = new THREE.SkinnedMesh(
    geometry,
    new THREE.MeshFaceMaterial(materials)
  );

  material = hand.material.materials;

  for (var i = 0; i < materials.length; i++) {
    var mat = materials[i];

    mat.skinning = true;
  }

 scene.add(hand);

  render();

  // Init Leap 
  Leap.loop(function (frame) {
    animate(frame, hand); // pass frame and hand model
  });
});

//animate is called after the Hand model has been loaded by ThreeJs
//This is recalled with each Leap frame receieved with the Leap.loop
//This contains all the positioning code for moving the Hand mesh around
function animate (frame, handMesh) {

	//first off try setting palm position to position of sphere mesh on screen
  if (frame.hands.length > 0) {

    var hand = frame.hands[0];
    var position = leapToScene( frame , hand.palmPosition );
    handMesh.position = position; // apply position

    var rotation = {
      z: hand.pitch(),
      y: hand.yaw(),
      x: hand.roll()
    }


    //add in conditional to switch colour of mesh object if axis values are above 0.5 in either direction


    if (Math.abs(rotation.x) >= 0.5) {
      handMesh.material.materials[0].color.setHex( 0xff0000 );
    } else if (Math.abs(rotation.y) >= 0.5) {
      handMesh.material.materials[0].color.setHex( 0x00ff00 );
    } else if (Math.abs(rotation.z) >= 0.5) {
      handMesh.material.materials[0].color.setHex( 0x0000ff );
    }
    else {
      handMesh.material.materials[0].color.setHex( 0xcccccc );
    }

     

    //show Pitch, Roll and Yaw on screen

    pitchValTxt.innerHTML = rotation.z;
    rollValTxt.innerHTML = rotation.x;
    yawValTxt.innerHTML = rotation.y;

    //Rotate the main bone of the hand and palm around the hand rotation
    handMesh.bones[0].rotation.set(rotation.x, rotation.y, -rotation.z); //pitch is in reverse? Why is that?

  }
}

//Interaction Box conversion method to find central co-ordinates for interacting with stage. 
//Does it need third iteration for z co-ordinates? Is Z axis going to be positive or negative
function leapToScene(frame, leapPos){
  var iBox = frame.interactionBox;

	var left = iBox.center[0] - iBox.size[0]/2;
	var top = iBox.center[1] + iBox.size[1]/2;
  var back = iBox.center[2] + iBox.size[2]/2;

	var x = leapPos[2] - left;
	var y = leapPos[1] - top;
  var z = leapPos[0] - back;

  //why are x and z axis swapped round from the Hand position? This is weird.

	x /= iBox.size[0];
	y /= iBox.size[1];
  z /= iBox.size[2];

	// x *= width;
	// y *= height;
 //  z *= 500; //what is depth of interaction box as relates to screen size?


//this is fudging the interaction box positions to map to center of screen
//this is partly to do with the camera positioning. its not flat to stage.
  x *= 10;
  y *= 10;
  z *= 10;

  x += 10;
  y += 10;
  z += 10;

	return {x: x ,y: y ,z: -z};

  //z seems to be working in the x axis and vice versa? 
  //Why does z require the negative value here?
}

//render method is called by the animate function to render each frame, 
//with requestAnimationFrame
function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}


// define connection settings
var leap = new Leap.Controller({
  host: '127.0.0.1',
  port: 6437
});

// connect controller
leap.connect();
