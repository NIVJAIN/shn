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

var faceMatcher;

async function start() {
  document.getElementById('detect-faces').addEventListener('click', async () => {
    const image = imageObj;

    const displaySize = {
      width: renderableWidth,
      height: renderableHeight
    };
    
    const labeledDescriptors = await loadLabelledImages();
    faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
    
    const detections = await faceapi.detectAllFaces(image)
      .withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
    //detections.forEach(detection => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString()})
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

function loadLabelledImages() {
  //const labels = ['Black Widow'];
  const labels = ['Sheng Yang'];
  return Promise.all(
    labels.map(async label => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        //const img = await faceapi.fetchImage(`./labelled/${label}/${i}.jpg`);
        const img = await faceapi.fetchImage(`./labelled/${label}/${i}.jpg`);
        console.log(img);
        //const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })

    /*
    labels.map(async label => {
      const descriptions = [];
      const img = await faceapi.fetchImage(localStorage['template']);
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      descriptions.push(detections.descriptor);
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
    */
    /*
    labels.map(async label => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        //const img = await faceapi.fetchImage(`./labelled/${label}/${i}.jpg`);
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
    */
  )
}

function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  var dataURL = canvas.toDataURL("image/png");

  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}