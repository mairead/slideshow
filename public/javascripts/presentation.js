$(function() {

  // Get the canvas DOM element 

  var canvas = $("#canvas")[0];

  // Creates our Leap Controller
  var controller = new Leap.Controller();

  var frameCounter = 0;

  var handPoints = [];

  var controlTimer = 0;
  var pauseTimer = 0;

  var arrowState = 0;

  var disableFlag = false;

  var pauseControlsFlag = false;

  var currentSlide = 1;

  var arrowsImg = $("#arrows");
  var lightsImg = $("#lights");

  var slideshow = $("#slideshow");

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

    if (controlTimer >= 15) {
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

        //end current slideshow state and reset pauseTimer
        endPauseMode();

      };

      //reset controls timer
      resetControls();
    }
  }

  function moveSlides(){

    // console.log("in move Slides pause is", pauseControlsFlag);


    controlTimer ++;

    //if the arrows were disabled set to active count state
    if (arrowState === 0) {
      arrowState = 1;
      updateArrows();
    };

    //move slides when count is reached
    if (controlTimer >= 20 && arrowState === 1) {

      console.log("stage 2 - GO", controlTimer)

      //console.log("control timer in moveSlides", controlTimer)
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
    console.log("scroll next called");

    // var currentPos = slideshow.offset().top;
    // var newPos = currentPos+ (650 * (currentSlide));
    // newPos = newPos + "px";

    var newSlide = currentSlide+1;
    //console.log(newSlide, $('#slide-'+newSlide))

    var anchor = $('#slide-'+newSlide);

    var anchorTop = anchor.offset().top;


    //scroll to function to animate slides upwards in vertical direction
    $("html, body").animate({ scrollTop: anchorTop-225 }, 1000).promise().done(function(){

   
        //once callback from animation is complete
        updateSlideState();
        //console.log("animate callback called")
      
    });

    //fake setTimeout here to mimic slide controls and then trigger changeSlideState function
    //var timeoutID = window.setTimeout(updateSlideState, 2000);

  }

  function updateSlideState(){
    //console.log("slide moved", $(".active"))
    //remove active state from previous slide
    $(".active").removeClass("active");

    //set active state on current slide
    //currentSlide ++;

    //console.log(currentSlide, $(".slide").eq(currentSlide).find("h1").text());

    $(".slide").eq(currentSlide).addClass("active");

     //set active state on current slide
    currentSlide ++;

    //reset control Timer
    //resetControls();

    //start pause
    startPauseMode();
  };

  function startPauseMode(){

    console.log("start Pause");
    //reset control states
    arrowState = 3;
    updateArrows();

    //set pauseFlag
    pauseControlsFlag = true;
    pauseTimer = 0;
  }

  function endPauseMode(){

    console.log("end pause called");
    //reset control states
    arrowState = 0;
    updateArrows();

    //reset pauseFlag 
    pauseControlsFlag = false;
    pauseTimer = 0;

  }

  function resetControls(){
    //reset counter to prevent control being activated
    controlTimer = 0;
    console.log("reset")
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
      case 3:
        arrows.src = "images/arrows-paused.png";
        break;
    }
  }


  // Tells the controller what to do every time it sees a frame
  controller.on( 'frame' , function(frame){

  
    //if pause has been triggered
    if (pauseControlsFlag) { 
      //increment pauseTimer to unlock controls
      pauseTimer ++;

      //console.log("pause", pauseTimer);
      //when it is done reset flag back to false and reset to 0;
      if (pauseTimer >= 120) {
        endPauseMode();
      };

      //pause doesn't stop control from changing?

    };

      //console.log("state of pause", pauseControlsFlag)
      //console.log(handPos[1])


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

          //add a hand position item to array
          handPoints.push(newPoint);
          fadeHandPoints();

          //listen for move slides
          if (handPos[1] > 250) {
            //listen for disable controls

            console.log("paused",pauseControlsFlag)
            if (!pauseControlsFlag && !disableFlag) {
              //console.log("pauseFlag and disable", pauseControlsFlag, disableFlag)
              moveSlides();
            };
            
          }else if(handPos[1] >= 60 && handPos[1] <= 175) {
            if (!pauseControlsFlag) {
              disableSlides();
            };

          }else{
            resetControls();
            //start pause
            //startPauseMode();
          }

          //reset counter
          frameCounter = 0;
        }
      }else{
        resetControls();
        //start pause
        //startPauseMode();
        c.clearRect( 0 , 0 , width , height );
      }
    }

  });

  // Get frames rolling by connecting the controller
  controller.connect();


});