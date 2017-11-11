var cmd = 'gst-launch-1.0';

/*
// Original one for USB Webcam
var args = ['autovideosrc', 'horizontal-speed=1', 'is-live=true',
    '!', 'videoconvert',
    '!', 'vp8enc', 'cpu-used=5', 'deadline=1', 'keyframe-max-dist=10',
    '!', 'queue', 'leaky=1',
    '!', 'm.', 'autoaudiosrc',
    '!', 'audioconvert',
    '!', 'vorbisenc',
    '!', 'queue', 'leaky=1',
    '!', 'm.', 'webmmux', 'name=m', 'streamable=true',
    '!', 'queue', 'leaky=1',
    '!', 'tcpserversink', 'host=127.0.0.1', 'port=9001', 'sync-method=2'];
*/

/*
// Original one for USB Webcam
var args = ['v4l2src', 'horizontal-speed=1', 'is-live=true',
    '!', 'videoconvert',
    '!', 'vp8enc', 'cpu-used=5', 'deadline=1', 'keyframe-max-dist=10',
    '!', 'queue', 'leaky=1',
    '!', 'm.', 'webmmux', 'name=m', 'streamable=true',
    '!', 'queue', 'leaky=1',
    '!', 'tcpserversink', 'host=127.0.0.1', 'port=9001', 'sync-method=2'];
*/

// Modified one for RaspiCam
var args = ['v4l2src', 'device=/dev/video0',
    '!', 'video/x-raw,width=640,height=480,framerate=30/1',
    '!', 'videoconvert',
    '!', 'jpegenc',
    '!', 'rtpjpegpay',
    '!', 'udpsink', 'host=127.0.0.1', 'port=9001'];

var child = require('child_process');
var gstreamer = child.spawn(cmd, args, {stdio: 'inherit'});
    
gstreamer.on('exit', function (code) {
    if (code != null) {
        console.log('GStreamer error, exit code ' + code);
    }
    process.exit();
});

var express = require('express')
var app = express();
var http = require('http')
var httpServer = http.createServer(app);

app.get('/', function (req, res) {
    var date = new Date();

    res.writeHead(200, {
        'Date': date.toUTCString(),
        'Connection': 'close',
        'Cache-Control': 'private',
        'Content-Type': 'video/webm',
        'Server': 'CustomStreamer/0.0.1',
    });

    var net = require('net');
    var socket = net.connect(9001, function () {
        socket.on('close', function (had_error) {
            res.end();
        });
        socket.on('data', function (data) {
            res.write(data);
        });
    });
    socket.on('error', function (error) {
        console.log(error);
    });
});

httpServer.listen(8001);