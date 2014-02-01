// Get the canvas DOM element 
var canvas = document.getElementById('canvas');

// Creates our Leap Controller
var controller = new Leap.Controller();
var frameCounter = 0;

var handPoints = [];

var controlTimer = 0;
var pauseTimer = 0;

var arrowState = 0;

var disableFlag = false;

var pauseControlsFlag = false;

var arrowsImg = document.getElementById('arrows');
var lightsImg = document.getElementById('lights');

	// Making sure we have the proper aspect ratio for our canvas
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Create the context we will use for drawing
var c =  canvas.getContext('2d');

// Save the canvas width and canvas height
// as easily accesible variables
var width = canvas.width;
var height = canvas.height;


/*
  
  The leapToScene function takes a position in leap space 
  and converts it to the space in the canvas.

  It does this by using the interaction box, in order to 
  make sure that every part of the canvas is accesible 
  in the interaction area of the leap

*/
function leapToScene( frame , leapPos ){

  // Gets the interaction box of the current frame
  var iBox = frame.interactionBox;

  // Gets the left border and top border of the box
  // In order to convert the position to the proper
  // location for the canvas
  var left = iBox.center[0] - iBox.size[0]/2;
  var top = iBox.center[1] + iBox.size[1]/2;

  // Takes our leap coordinates, and changes them so
  // that the origin is in the top left corner 
  var x = leapPos[0] - left;
  var y = leapPos[1] - top;

  // Divides the position by the size of the box
  // so that x and y values will range from 0 to 1
  // as they lay within the interaction box
  x /= iBox.size[0];
  y /= iBox.size[1];

  // Uses the height and width of the canvas to scale
  // the x and y coordinates in a way that they 
  // take up the entire canvas
  x *= width;
  y *= height;

  // Returns the values, making sure to negate the sign 
  // of the y coordinate, because the y basis in canvas 
  // points down instead of up
  return [ x , -y ];

}

//each circle to get lighter and smaller as it fades 
function fadeHandPoints(){

  for (var i = handPoints.length - 1; i >= 0; i--) {

    //for each item in array decrement age property to decay size by 5
    handPoints[i].age = handPoints[i].age-2;

    //if age in array === 0 then remove it from the array.
    if (handPoints[i].age <= 0) {
      handPoints.splice(handPoints[i], 1);
    };

    if (i===1) {
      //call drawHandPoint from items in new array
      drawHandPoints();
    };
  };
  

}

function drawHandPoints(){

  var handPos, size, alpha;

  for (var i = handPoints.length - 1; i >= 0; i--) {
  
    handPos = handPoints[i].handPos;
    size = handPoints[i].age;

    //divide by upper floor to get value between 0 and 1;
    alpha = handPoints[i].age /25;

    // Setting up the style for the fill  //use age to decay alpha
      c.fillStyle = "rgba(98, 199, 204, "+alpha+")";

      // Creating the path for the hand circle
      c.beginPath();

      // Draw a full circle of radius 10 at the hand position
      c.arc(handPos[0], handPos[1], size, 0, Math.PI*2);

      c.closePath();
      c.fill();

    };

}

function disableSlides(){
  controlTimer ++;

  if (controlTimer >= 20) {
    //reset controlTimer 
    controlTimer = 0;

    //detect toggle state

    if (disableFlag) {
      //if currently disabled re-enable slides
      disableFlag = false;

      //swap lights image to show as on
      lights.src = "images/lights.png";

    }else{
      //set disable Flag
      disableFlag = true;

      //swap lights image to show as off
      lights.src = "images/lights-off.png";
    };

    //reset controls and arrow state to begin again
    resetControls();
  }
}

function moveSlides(){
  controlTimer ++;

  //if the arrows were disabled set to active count state
  if (arrowState === 0) {
    arrowState = 1;
    updateArrows();
  };

  //move slides when count is reached
  if (controlTimer >= 20) {
    //reset controlTimer 
    controlTimer = 0;
    
    //set arrow state to show slides movement active
    arrowState = 2;
    updateArrows();

    //scroll to the next slide
    scrollNextSlide();
  };
}

function scrollNextSlide(){



  //fake setTimeout here to mimic slide controls and then trigger changeSlideState function
  var timeoutID = window.setTimeout(updateSlideState, 2000);

  //scroll to function to animate slides upwards in vertical direction

    //once callback from animation is complete

  

      

}

function updateSlideState(){
  //remove active state from previous slide

  //set active state on current slide

  //reset control Timer
  resetControls();
};

function resetControls(){

  //set pauseFlag every time state is reset;
  pauseControlsFlag = true;
  pauseTimer = 0;

  //reset counter to prevent control being activated
  controlTimer = 0;

  //reset control states
  arrowState = 0;
  updateArrows();

}

function updateArrows(){
  switch(arrowState){
    case 0:
      arrows.src = "images/arrows.png";
      break;
    case 1:
      arrows.src = "images/arrows-active.png";
      break;
    case 2:
      arrows.src = "images/arrows-next.png";
      break;
  }
}


// Tells the controller what to do every time it sees a frame
controller.on( 'frame' , function(frame){

 //determine if Hand is visible and assign variable
  if (frame.hands[0]) {

    // For each hand we define it
    var hand = frame.hands[0];

    // and get its position, so that it can be passed through
    // for drawing the connections
    var handPos = leapToScene( frame , hand.palmPosition );

    //if the X position of the Hand over the leap > 50 
    if (handPos[0] > 50) {

      //add iterator to count to 5 and only display new handPoint every 5th frame
      frameCounter ++;

      if (frameCounter >= 5) {
        var newPoint = {handPos:handPos, age:25};

        //Clears the canvas so we are not drawing multiple frames 
        c.clearRect( 0 , 0 , width , height );

        //increment pauseTimer to unlock controls
        pauseTimer ++;

        //when it is done reset flag back to false and reset to 0;
        if (pauseTimer >= 20) {
          pauseControlsFlag = false;
          pauseTimer = 0;
        };

        //add a hand position item to array
        handPoints.push(newPoint);
        fadeHandPoints();

        //listen for disable controls

        console.log(handPos[1])

        //listen for move slides
        if (handPos[1] > 250) {
          if (!pauseControlsFlag && !disableFlag) {
            moveSlides();
          };
          
        }else if(handPos[1] >= 60 && handPos[1] <= 175) {
          if (!pauseControlsFlag) {
            disableSlides();
          };

        }else{
          resetControls();
        }

        //reset counter
        frameCounter = 0;
      }
    }else{
      resetControls();
      c.clearRect( 0 , 0 , width , height );
    }
  }

});

// Get frames rolling by connecting the controller
controller.connect();