//I know it's bad practice, but it's easier to debug in the console
// process.on('uncaughtException', function(e) {console.error(e)});

var net = require('net'),
    gui = require('nw.gui'),
    $ = require('jquery'),
    EyeTribe = require(process.cwd() + '\\js\\eye-tribe.js');


//set up interface
var nwWindow = gui.Window.get();
$(window).on('keydown', function(e) {
  if (e.which === 116) {//F5
    nwWindow.reload();
  } else if (e.which === 122) { //F11
    nwWindow.toggleKioskMode();
  } else if (e.which === 123) { //F12
    nwWindow.showDevTools();
  } else if (e.which === 27) { //Esc
    nwWindow.close();
  }
});
nwWindow.showDevTools();

var eyeTribe = new EyeTribe();
var currentPosition = {x:0,y:0};
var steadyStateError = {x:0,y:0};

var update = function(gaze) {
  currentPosition = {
    x: gaze.avg.x - window.screenX,
    y: gaze.avg.y - window.screenY
  };
  var markerPosition = {
    left: currentPosition.x + steadyStateError.x,
    top: currentPosition.y + steadyStateError.y
  };
  $("#averageMarker").offset(markerPosition);

  markerPosition = {
    left: gaze.lefteye.avg.x - window.screenX + steadyStateError.x,
    top: gaze.lefteye.avg.y - window.screenY + steadyStateError.y
  };
  $("#leftMarker").offset(markerPosition);

  markerPosition = {
    left: gaze.righteye.avg.x - window.screenX + steadyStateError.x,
    top: gaze.righteye.avg.y - window.screenY + steadyStateError.y
  };
  $("#rightMarker").offset(markerPosition);
};
eyeTribe.on('data', update);
eyeTribe.on('error', function(err) { console.error(err); });

$('#content').click(function(event) {
  steadyStateError.x = event.clientX + window.screenX - currentPosition.x;
  steadyStateError.y = event.clientY + window.screenY - currentPosition.y;
})
