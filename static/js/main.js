$(document).ready(function () {
  const FRAME_SIZE = 256
  const FRAME_RATE = 100 //ms per frame
  let namespace = "/test";
  let video = document.querySelector("#videoElement");
  let canvas = document.querySelector("#canvasElement");
  canvas.width = FRAME_SIZE;
  canvas.height = FRAME_SIZE;
  let ctx = canvas.getContext('2d');
  ctx.translate(FRAME_SIZE,1);
  ctx.scale(-1,1);
  crop_factor = 0.5;
  photo = document.getElementById('photo');
  var localMediaStream = null;

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

  function sendSnapshot() {

    if (!localMediaStream) {
      return;
    }

    // ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight,0,0,FRAME_SIZE,FRAME_SIZE);
    ctx.drawImage(video, 
                  crop_factor/2*video.videoWidth, 
                  crop_factor/2*video.videoHeight, 
                  (1-crop_factor/2)*video.videoWidth, 
                  (1-crop_factor/2)*video.videoHeight,
                  0,0,FRAME_SIZE,FRAME_SIZE);
    let dataURL = canvas.toDataURL('image/jpeg',0.7);
    socket.emit('image_in', dataURL);

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
      sendSnapshot();
    }, FRAME_RATE);

    socket.on('image_back',function(data){
      photo.setAttribute('src', data.image_data);
    });

  }).catch(function(error) {
    console.log(error);
  });
});
