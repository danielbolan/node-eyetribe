var net = require('net'),
    gui = require('nw.gui'),
    $ = require('jquery'),
    JsonSocket = ('json-socket');

//set up interface
var nwWindow = gui.Window.get();
$(window).on('keydown', function(e) {
  if (e.which === 122) { //F11
    nwWindow.toggleKioskMode();
  } else if (e.which === 123) { //F12
    nwWindow.showDevTools();
  } else if (e.which === 27) { //Esc
    nwWindow.close();
  }
});

// var position = {
//   x: marker.offset().left - window.screenX - (marker.outerWidth()/2),
//   y: marker.offset().top - window.screenY - (marker.outerHeight()/2)
// };
