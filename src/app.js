"use strict";
const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const timeout = require("connect-timeout");
const { spawn } = require("child_process");

const { PORT, API_VERSION } = require("./config");
const errorHandler = require("./helpers/error-handler");
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(timeout("20s"));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(`/api/${API_VERSION}`, require("./api/v1"));
app.get("/generate", (req, res) => {
  const { prompt } = req.query;
  try {
    // Start the image resizing task in a separate worker process
    const childProcess = spawn("node", ["./src/generateImage.js", prompt]);

    childProcess.stdout.on("data", (url) => {
      console.log(`Worker output: ${url}`);
      res.status(200).json({ image: url.toString() });
      //   io.emit("resizedImage", { message: data.toString() });
    });

    childProcess.stderr.on("data", (data) => {
      console.error(`Worker error: ${data}`);
    });

    childProcess.on("close", (code) => {
      console.log(`Worker process exited with code ${code}`);
    });

    // res.send("Image resizing task started.");
  } catch (error) {
    console.error("Error occurred during the task:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Handle timeout errors
app.use((req, res, next) => {
  if (!req.timedout) next();
});
app.use(errorHandler);

module.exports = app;
