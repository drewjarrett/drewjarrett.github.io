const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

/* Tensor */

const bodyPixProperties = {
  architecture: 'MobileNetV1',
  outputStride: 16,
  multiplier: 0.75,
  quantBytes: 4
};

// 90% confidence to reduce the number of false positives.
const segmentationProperties = {
  flipHorizontal: false,
  internalResolution: 'high',
  segmentationThreshold: 0.7
};

var modelHasLoaded = false;
var model = undefined;

model = bodyPix.load(bodyPixProperties).then(function (loadedModel) {
  model = loadedModel;
  modelHasLoaded = true;
});

async function removebackground() {
  const { data:map } = await model.segmentPerson(canvas, segmentationProperties);

  const { data:imgData } = context.getImageData(0, 0, canvas.width, canvas.height);

  const newImg = context.createImageData(canvas.width, canvas.height);
  const newImgData = newImg.data;

  for(let i=0; i<map.length; i++) {
    //The data array stores four values for each pixel
    const [r, g, b, a] = [imgData[i*4], imgData[i*4+1], imgData[i*4+2], imgData[i*4+3]];
    [
      newImgData[i*4],
      newImgData[i*4+1],
      newImgData[i*4+2],
      newImgData[i*4+3]
    ] = !map[i] ? [255, 255, 255, 0] : [r, g, b, a];
  }
  
  // Draw the new image back to canvas
  context.putImageData(newImg, 0, 0);
} 


/* Capture Image bit */

const player = document.getElementById('player');
const captureButton = document.getElementById('capture');

const constraints = {
  video: true,
  audio: false
};

function startCamera() {

  captureButton.addEventListener('click', () => {
    // Draw the video frame to the canvas.
    context.drawImage(player, 0, 0, canvas.width, canvas.height);

    // Stop all video streams.
    player.srcObject.getVideoTracks().forEach(track => track.stop());

    removebackground();

    // Draw to PNG
    //let image_data_url = canvas.toDataURL('image/png');
    //console.log(image_data_url);
  });

  // Attach the video stream to the video element and autoplay.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    player.srcObject = stream;
  });
}

/* Init */

const start = document.getElementById('start');

start.addEventListener('click', () => {
  if (!modelHasLoaded) {
    return;
  }

  startCamera();
});



