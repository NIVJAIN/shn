Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
]).then(start);

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
var imageObj = new Image();
imageObj.onload = function() {
  fitImageOn(canvas, imageObj);
};
var renderableHeight, renderableWidth, xStart, yStart;

function start() {
  document.getElementById('detect-faces').addEventListener('click', async () => {
    const image = imageObj;

    const displaySize = {
      width: renderableWidth,
      height: renderableHeight
    };
    /*
    faceapi.matchDimensions(canvas, displaySize);*/
    
    const detections = await faceapi.detectAllFaces(image)
      .withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    if (detections.length > 1) {
      alert(`Detected ${detections.length} faces!`);
    }

    var count = 0;
    resizedDetections.forEach(detection => {
    //detections.forEach(detection => {
      count += 1;
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, { label: `Face ${count}`})
      drawBox.draw(canvas);
    });
    localStorage['foo'] = canvas.toDataURL();
  });
}

var fitImageOn = function(canvas, imageObj) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  var imageDimensionRatio = imageObj.width / imageObj.height;
  var canvasDimensionRatio = canvas.width / canvas.height;
  //var renderableHeight, renderableWidth, xStart, yStart;
  if (imageDimensionRatio < canvasDimensionRatio) {
    renderableHeight = canvas.height;
    renderableWidth = imageObj.width * (renderableHeight / imageObj.height);
    //xStart = (canvas.width - renderableWidth) / 2;
    //yStart = 0;
  } else if (imageDimensionRatio > canvasDimensionRatio) {
    renderableWidth = canvas.width
    renderableHeight = imageObj.height * (renderableWidth / imageObj.width);
    //xStart = 0;
    //yStart = (canvas.height - renderableHeight) / 2;
  } else {
    renderableHeight = canvas.height;
    renderableWidth = canvas.width;
    //xStart = 0;
    //yStart = 0;
  }
  //context.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight);
  context.drawImage(imageObj, 0, 0, renderableWidth, renderableHeight);
};

document.getElementById("fit-image").addEventListener('click', () => {
  imageObj.crossOrigin = "anonymous";
  imageObj.src = document.getElementById("image-url").value;
});

document.getElementById("get-image").addEventListener('click', () => {
  if (localStorage['foo']) {
    imageObj.src = localStorage['foo'];
  }
});

document.getElementById("image-upload").addEventListener('change', (event) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  localStorage['foo'] = URL.createObjectURL(event.target.files[0]);
  imageObj.src = localStorage['foo'];
});

function contrastImage(imgData, contrast){  //input range [-100..100]
  var d = imgData.data;
  contrast = (contrast/100) + 1;  //convert to decimal & shift range: [0..2]
  var intercept = 128 * (1 - contrast);
  for(var i=0;i<d.length;i+=4){   //r,g,b,a
      d[i] = d[i]*contrast + intercept;
      d[i+1] = d[i+1]*contrast + intercept;
      d[i+2] = d[i+2]*contrast + intercept;
  }
  return imgData;
}
