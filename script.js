"use strict";
const imageUpload = document.getElementById("imageUpload");

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(start);

async function start() {
  const container = document.createElement("div");
  container.style.position = "relative";
  document.body.append(container);
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  let image = document.getElementById("imageDisplay");
  let canvas;
  document.getElementById("assetMessage").innerHTML = "Now Upload";
  document.getElementById("assetMessage").style = "color: rgb(0, 143, 12);";

  imageUpload.addEventListener("change", async () => {
    if (image) image.remove();
    if (canvas) canvas.remove();
    image = await faceapi.bufferToImage(imageUpload.files[0]);
    container.append(image);

    document.getElementById("assetMessage").innerHTML = "Upload another";

    image.style = "max-height: 35vh; max-width: 80vh; top: 0";
    canvas = faceapi.createCanvasFromMedia(image);
    canvas.style = "max-height: 35vh; max-width: 80vh; top: 0";
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );
    let count = 0,
      ucount = 0;
    results.forEach((result, i) => {
      if (
        document
          .getElementById("Attendees")
          .innerText.toString()
          .includes(result.label) == false
      ) {
        document.getElementById(
          "Attendees"
        ).innerHTML += `<li>${result.label}</li>`;
        count++;
      }

      if (result.label === "unknown") ucount++;

      console.log(result.label);
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
    });

    document.getElementById(
      "attendees"
    ).innerHTML = `Attendees : ${count} & unknown : ${ucount}`;
  });
}

function loadLabeledImages() {
  const labels = [
    "Abhishek",
    "Akshat",
    "Ayush",
    "Divyanshu",
    "Ocean",
    "Pancham",
    "Piyush",
    "Pranshul",
    "Rohit",
  ];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(
          `https://raw.githubusercontent.com/yashkumarkalyan/aitendance/main/labeled_images/${label}/${i}.jpg`
        );
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
