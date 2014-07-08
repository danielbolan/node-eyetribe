//An EyeTribe client
//Essentially a modified json-socket to better handle errors
var jot = require('json-over-tcp'),
    EventEmitter = require('events').EventEmitter;

var socket = null;
var eventEmitter = new EventEmitter();

var settings = {
  push: null,
  heartbeatinterval: null,
  version: null,
  trackerstate: null,
  framerate: null,
  iscalibrated: null,
  iscalibrating: null,
  calibresult: null,
  frame: null,
  screenIndex: null,
  screenresw: null,
  screenresh: null,
  screenpsyw: null,
  screenpsyh: null
};

function raiseError(err) {
  var msg = err.category + ' error ' +
            err.statuscode + ': ' +
            err.values.statusmessage;
  eventEmitter.emit('error', msg);
}

function heartbeat() {
  socket.write({ category: 'heartbeat' });

  var waitForResponse = function(data) {
    if (data.category === 'heartbeat') {
      socket.removeListener(waitForResponse);
      if (data.statuscode !== 200) raiseError(data);
    }
  };
  socket.on('data', waitForResponse);
}

function getData(keys, callback) {
  socket.write({
    category: 'tracker',
    request: 'get',
    values: keys
  });

  var waitForResponse = function(data) {
    if (data.category === 'tracker' && data.request === 'get') {
      socket.removeListener('data', waitForResponse);
      if (data.statuscode === 200) {
        for (key in data.values) settings[key] = data[key];
      } else {
        callback(data)
      }
      callback(null);
    }
  };
  socket.on('data', waitForResponse);
}

var connect = function connect(port, host) {
  port = port || 6555;
  host = host || 'localhost';

  socket = jot.connect(port, host, function() {

    var keys = [];
    for (var key in settings) keys.push(key);
    getData(keys, function(err) {
      if (err) return raiseError(err);
      setInterval(heartbeat, settings.heartbeatInterval);
    })
  });
}
