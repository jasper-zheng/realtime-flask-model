$(document).ready(function () {
  const FRAME_SIZE    = 256   // input frame size (left)
  let crop_factor     = 0.3     // 0: no crop, 1: crop everything
  const input_quality = 0.75  // quality from client to server
  const FRAME_RATE    = 100   // ms per frame
  
  let namespace = "/demo";
  let video = document.querySelector("#videoElement");
  let canvas = document.querySelector("#inputCanvas");
  canvas.width = FRAME_SIZE;
  canvas.height = FRAME_SIZE;
  let ctx = canvas.getContext('2d');
  ctx.translate(FRAME_SIZE,1);
  ctx.scale(-1,1);
  ctx.filter = 'blur(6px)';
  
  output_canvas = document.getElementById('outputCanvas');
  var localMediaStream = null;

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

  function sendFrame() {

    if (!localMediaStream) {
      return;
    }
    ctx.drawImage(video, 
                  crop_factor/2*video.videoWidth, 
                  crop_factor/2*video.videoHeight, 
                  (1-crop_factor/2)*video.videoWidth, 
                  (1-crop_factor/2)*video.videoHeight,
                  0,0,FRAME_SIZE,FRAME_SIZE);
    let dataURL = canvas.toDataURL('image/jpeg',input_quality);
    socket.emit('input_frame', dataURL);

  }

  socket.on('connect', function() {
    console.log('Connected!');
  });

  var constraints = {
    audio: false,
    video: {
      width: FRAME_SIZE,
      height: FRAME_SIZE,
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    localMediaStream = stream;

    setInterval(function () {
      sendFrame();
    }, FRAME_RATE);

    socket.on('processed_frame',function(data){
      output_canvas.setAttribute('src', data.image_data);
    });

  }).catch(function(error) {
    console.log(error);
  });
});
