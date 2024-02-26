const { Worker } = require("worker_threads");

const initiateWorker = (prompt) => {
  const worker = new Worker("./src/generateImage.worker.js", {
    workerData: { prompt },
  });

  worker.once("message", (response) => {
    console.log(`Worker output: ${response}`);
    global.io.emit("image-generated", response);
  });

  worker.on("error", (err) => {
    console.error(`Worker error: ${err}`);
    throw new Error(err);
  });
};
module.exports = initiateWorker;
