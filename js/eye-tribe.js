//An EyeTribe client
var net = require('net'),
    EventEmitter = require('events').EventEmitter;

module.exports = function EyeTribe(port,host) {

  var settings = {
    port: port || 6555,
    host: host || 'localhost',
  };

  var emitter = new EventEmitter();
  this.on = function(name,listener) {
    emitter.on(name,listener);
  };
  var heartbeat = null;

  var handleMessage = function(message) {
    if (message.category !== "tracker" || message.request !== "get") return;
    if (!message.values) return console.dir(message);
    if (message.values.frame) { //eye position update
      emitter.emit('data',message.values.frame);
    } else {                    //settings update
      for (var key in message.values) {
        settings[key] = message.values[key];
      }
      if (message.values.heartbeatinterval) {
        if (heartbeat) {
          clearInterval(heartbeat);
        }
        heartbeat = setInterval(function() {
          socket.write(JSON.stringify({
            category: 'heartbeat'
          }));
        }, message.values.heartbeatinterval);
      }
      if (message.values.push === false) {
        socket.write(JSON.stringify({
          category: 'tracker',
          request: 'set',
          values: {
            push: true
          }
        }));
      }
    }
  };

  var parseMessages = function(messages) {
    messages = messages.toString().split('}{');
    if (messages.length > 1) {
      for (var i=0; i<messages.length-1; i++) {
        messages[i] += '}';
      }
      messages[messages.length-1] += '{' + messages[messages.length-1];
    }
    messages.forEach(function(msg) {
      try {
        msg = JSON.parse(msg);
      } catch (err) {
        return console.error(err);
      }
      if (msg.statuscode !== 200) {
        console.log('error packet');
        return emitter.emit('error',msg);
      }
      handleMessage(msg);
    });
  };

  var socket = net.connect(settings.port, settings.host, function(err) {
    socket.on('data', parseMessages);

    socket.write(JSON.stringify({
      category: 'tracker',
      request: 'get',
      values: ['push','heartbeatinterval']
    }));
  });
}; //end module;
