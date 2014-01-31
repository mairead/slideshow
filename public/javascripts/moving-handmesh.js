/* global THREE, Leap */

//create 3D canvas - guess this is the ThreeJs stage setup
var container, scene, renderer, camera, light, loader;
var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;


container = document.querySelector('.viewport');

WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;

var width = WIDTH ;
var height = HEIGHT ;

var handPosTxt, handPitchTxt, handYawTxt, handRollTxt, finger0RotTxt, finger1RotTxt, finger2RotTxt, finger3RotTxt, finger4RotTxt, finger5RotTxt, finger0VisTxt, finger1VisTxt, finger2VisTxt, finger3VisTxt, finger4VisTxt, finger5VisTxt;

handPosTxt = document.getElementById('handPosition');
handPitchTxt = document.getElementById('handPitch');
handYawTxt = document.getElementById('handYaw');
handRollTxt = document.getElementById('handRoll');

finger0RotTxt = document.getElementById('finger0Rotation');
finger1RotTxt = document.getElementById('finger1Rotation');
finger2RotTxt = document.getElementById('finger2Rotation');
finger3RotTxt = document.getElementById('finger3Rotation');
finger4RotTxt = document.getElementById('finger4Rotation');

finger0VisTxt = document.getElementById('finger0Visible');
finger1VisTxt = document.getElementById('finger1Visible');
finger2VisTxt = document.getElementById('finger2Visible');
finger3VisTxt = document.getElementById('finger3Visible');
finger4VisTxt = document.getElementById('finger4Visible');


//set id for fingers once and assign bones
var fingers = [
  {id: 0, pointable: {}, textDisplay: finger0VisTxt, rotationDisplay: finger0RotTxt }, //middle
  {id: 0, pointable: {}, textDisplay: finger1VisTxt, rotationDisplay: finger1RotTxt}, //ring
  {id: 0, pointable: {}, textDisplay: finger2VisTxt, rotationDisplay: finger2RotTxt}, //index
  {id: 0, pointable: {}, textDisplay: finger3VisTxt, rotationDisplay: finger3RotTxt}, //little
  {id: 0, pointable: {}, textDisplay: finger4VisTxt, rotationDisplay: finger4RotTxt} //thumb
];
var fingersAssigned = false; //flag to determine if all fingers have been detected and assigned an ID


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

var size = 10;
var step = 1;
var gridHelper = new THREE.GridHelper( size, step );

gridHelper.position = new THREE.Vector3( 5, -5, 0 );
//gridHelper.rotation = new THREE.Euler( 15, 0, 0 );

scene.add( gridHelper );

var sphere; //create global
var hand;

//Instantiate new Mesh object by loading Blender JSON export
var loader = new THREE.JSONLoader();

//load Hand model with ThreeJS Loader
loader.load('javascripts/riggedhand.js', function (geometry, materials) {
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

  //add bones from Hand into fingers array

  //middle
  fingers[0].mainBone = hand.bones[9];
  fingers[0].phalanges = [hand.bones[10], hand.bones[11]];

  //ring
  fingers[1].mainBone = hand.bones[5];
  fingers[1].phalanges = [hand.bones[6], hand.bones[7]];

  //index
  fingers[2].mainBone = hand.bones[13];
  fingers[2].phalanges = [hand.bones[14], hand.bones[15]];

  //little
  fingers[3].mainBone = hand.bones[17];
  fingers[3].phalanges = [hand.bones[18], hand.bones[19]];

  //thumb
  fingers[4].mainBone = hand.bones[2];
  fingers[4].phalanges = [hand.bones[3]];

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


  if (frame.hands.length > 0) {


    //set IDs at beginning for fingers
    if(!fingersAssigned){
      //if all 5 pointables are available
      if (frame.pointables.length === 5) {
        //assign the current ID to the fingers array
        for (var i = frame.pointables.length - 1; i >= 0; i--) {
          fingers[i].id = frame.pointables[i].id;
          //console.log("ASSIGNED ID: ", fingers[i].id)
        };
        fingersAssigned = true; //set flag to prevent IDs being reassigned
      }
    }

    //Setting palm position and rotation to position of hand mesh on screen
    var hand = frame.hands[0];
    var position = leapToScene( frame , hand.palmPosition );//ensures hand appears within Leap Js interaction box
    handMesh.position = position; // apply position

    var rotation = {
      z: hand.pitch(),
      y: hand.yaw(),
      x: hand.roll()
    }

    //write out hand position from leap
    handPosTxt.innerHTML = "<span class='vector-comp'>"+position.x+"</span><span class='vector-comp'>"+position.y+"</span><span class='vector-comp'>"+position.z+"</span>";

    //write out hand angle from leap
    handPitchTxt.innerHTML = rotation.z;
    handYawTxt.innerHTML = rotation.y;
    handRollTxt.innerHTML = rotation.x;

    //Rotate the main bone of the hand and palm around the hand rotation
    handMesh.bones[0].rotation.set(rotation.x, rotation.y, rotation.z); //pitch is in reverse. The user's position is in the negative z axis

    //For each finger in the hand set the rotation of the main finger bone, and the smaller phalanx bones

    for (var i = fingers.length - 1; i >= 0; i--) {
      //console.log("FINGER ID: ", fingers[i].id)

      fingers[i].fingerVisible = false;

      for (var j = frame.pointables.length - 1; j >= 0; j--) {
         //console.log("POINTABLE ID: ", frame.pointables[j].id)

         if (fingers[i].id === frame.pointables[j].id) {

          //console.log("FINGER FOUND");

          fingers[i].fingerVisible = true; //finger ID has been found and therefore the finger is visible

          //push current pointable item into fingers array
          fingers[i].pointable = frame.pointables[j]

          //display message saying finger detected
          fingers[i].textDisplay.innerHTML = "<span class='vector-comp'>ID: "+ fingers[i].id + "</span>";

          rotateBones(fingers[i]);
         }
      }


      if(!fingers[i].fingerVisible){
        fingers[i].textDisplay.innerHTML = "<span class='vector-comp finger-inactive'>FINGER NOT CURRENTLY VISIBLE</span>";
      }

    }


       function rotationCtrl(dir){
        // make sure fingers won't go into weird position. T
        //I think this doctors the direction object for each rotation to prevent large shifts
          for (var i = 0, length = dir.length; i < length; i++) {
            if (dir[i] >= 0.8) {
              dir[i] = 0.8;
            }
            
          }
        return dir;
      }
        
      function rotateBones(finger){
        //treat direction value before applying rotation
        var fingerDir = rotationCtrl(finger.pointable.direction);

        //TODO: Need to add more fine tuning to Direction constraint to prevent them bending backwards but without limiting forward or side movement

        //var fingerDir = finger.pointable.direction;

        finger.rotationDisplay.innerHTML = "<span class='vector-comp'>"+finger.pointable.direction[0]+"</span><span class='vector-comp'>"+finger.pointable.direction[1]+"</span><span class='vector-comp'>"+finger.pointable.direction[2]+"</span>";

        // apply rotation to the main bone
        finger.mainBone.rotation.set(0, -fingerDir[0], fingerDir[1]); 

        // apply rotation to phalanx bones
        for (var i = 0, length = finger.phalanges.length; i < length; i++) {
          var phalange = finger.phalanges[i];
          phalange.rotation.set(0, 0, fingerDir[1]);
        }
      }



      //Update finger rotation
      // for (var i = fingers.length - 1; i >= 0; i--) {
      //   rotateBones(fingers[i]);
      // };
    //}
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
