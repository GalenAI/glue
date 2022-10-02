const http = require('http');
const WebSocketServer = require('websocket').server;
const WebSocket = require('ws');

var wav    = require('wav');

let wavhelper = require('./wavhelper.js');

const fs = require('fs');
const server = http.createServer();
server.listen(9898);

const wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);

    var writer = new wav.FileWriter('output.wav', {
  "channels": 1,
  "sampleRate": 48000,
  "bitDepth": 32
});


let socket = new WebSocket("ws://omega.rpad.cs.cmu.edu:6969/");

socket.onopen = function(e) {
  socket.send("My name is John");
};

socket.onmessage = function(event) {
  console.log(`[message] Data received from server: ${event.data}`);
    connection.sendUTF(event.data);
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log('[close] Connection died');
    setTimeout(function() {
        socket = new WebSocket("ws://omega.rpad.cs.cmu.edu:6969/");
    }, 500);
  }
};

socket.onerror = function(error) {
  console.log(`[error] ${error.message}`);
};

    var allData = [];

    var additional = "";
    setInterval(function() {
        connection.sendUTF(`{"mt":"transcription", "m":"asdf! ${additional}"}`);
        additional += `hasdjfhkj ${additional.length}? `;
    }, 500);

    connection.on('message', function(message) {
      //console.log('Received Message:', message.binaryData);
      //connection.sendBytes(message.binaryData);
      //writer.write(message.binaryData);
      //allData.push(message.binaryData);
    });
    connection.on('close', function(reasonCode, description) {
        console.log('Client has disconnected.');
        writer.end();
        let rawData = Float32Array.from(Buffer.concat(allData));
        const wavData = wavhelper(48000, [rawData]);
        fs.writeFile('output2.wav', wavData, function (err) {
            if (err) return console.log(err);
            console.log('Hello World > output2.wav');
        });
    });
});


