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
  // ctx.filter = 'blur(6px)';
  let config_update = "";
  var configs_template = {
    "angle": 0,
    "translateX": 0,
    "translateY": 0,
    "scale": 1,
    "erosion": 0,
    "dilation": 0
  }
  var configs = {}

  let layer_names = document.querySelector("#layerNames");
  let initialisation = false;
  let layer_selection = '';
  let layer_list = {};

  output_canvas = document.getElementById('outputCanvas');
  var localMediaStream = null;

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

  function sendFrame() {

    if (!localMediaStream) {
      return;
    }

    if (config_update){
      socket.emit('config_update', layer_selection, configs[layer_selection]);
      config_update = "";
    }

    ctx.drawImage(video,
                  crop_factor/2*video.videoWidth,
                  crop_factor/2*video.videoHeight,
                  (1-crop_factor/2)*video.videoWidth,
                  (1-crop_factor/2)*video.videoHeight,
                  0,0,FRAME_SIZE,FRAME_SIZE);
    let dataURL = canvas.toDataURL('image/jpeg',input_quality);
    // socket.emit('input_frame', dataURL);
  }

  socket.on('connect', function() {
    console.log('Connected!');
  });

  socket.on('set_layer_names',function(data){
    // output_canvas.setAttribute('src', data.image_data);
    console.log(data.names.length)
    if (!initialisation){


      for (let i=0;i<data.names.length;i++){
        // var name = data.names[i]
        configs[data.names[i]] = {...configs_template}

        var tr = document.createElement('div');
        tr.innerHTML = data.names[i]
        tr.setAttribute('class', 'layerNamesText')
        tr.addEventListener("click", function() {
          updateSelection(data.names[i]);
        });
        layer_names.appendChild(tr)
        layer_list[data.names[i]] = tr

      }

      layer_selection = data.names[0]
      layer_list[data.names[0]].setAttribute('class', 'layerNamesText layerSelected')
      initialisation = true;
    }

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

  var sliders = document.getElementsByClassName("slider");
  var outputs = [];
  for (var i = 0; i < sliders.length; i++){
    output = sliders[i].previousElementSibling
    output.innerHTML = sliders[i].id + ": " + sliders[i].value;

    sliders[i].oninput = function() {
      config_update = layer_selection;
      var v = this.value;
      configs[layer_selection][this.id] = v;
      renderControllers(this, v);
    }
  }

  function renderControllers(slider, v){
    output = slider.previousElementSibling
    output.innerHTML = slider.id + ": " + v;
  }

  function updateSelection(name){
    layer_selection = name
    for (var i = 0; i < sliders.length; i++){
      var v = configs[layer_selection][sliders[i].id]
      sliders[i].value = v;
      output = sliders[i].previousElementSibling
      output.innerHTML = sliders[i].id + ": " + v;
      renderControllers(sliders[i], v);
    }
    var keys = Object.keys(layer_list)
    for (var i = 0; i < keys.length; i++){
      layer_list[keys[i]].setAttribute('class', 'layerNamesText')
    }
    layer_list[name].setAttribute('class', 'layerNamesText layerSelected')

    updateClusterDemo()
  }



  let cluster_dropdown = document.querySelector("#idx");
  let cluster_demo = document.querySelector("#clusterDemo");
  cluster_dropdown.onchange = function () {
    configs[layer_selection]['cluster'] = cluster_dropdown.value;
    updateClusterDemo()
  };

  function updateClusterDemo(){
    console.log(cluster_dropdown.value)
    let dataURL = canvas.toDataURL('image/jpeg',input_quality);
    socket.emit('change_cluster_demo', cluster_dropdown.value, layer_selection, dataURL)
    socket.on('return_cluster_demo',function(data){
      cluster_demo.setAttribute('src', data.image_data);
    });
  }


});
