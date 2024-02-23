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
const timeoutHandler = require("./helpers/timeout-handler");
const generateImageSchema = require("./utils/validation/generate-image.schema");
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
app.get("/generate", (req, res, next) => {
  const { prompt } = req.query;
  try {
    // Validate the request query parameters
    const { error } = generateImageSchema.validate({ prompt });
    if (error) {
      throw new Error(error.details[0].message);
    }
    // Start the image resizing task in a separate worker process
    const childProcess = spawn("node", ["./src/generateImage.js", prompt]);

    childProcess.stdout.on("data", (url) => {
      console.log(`Worker output: ${url}`);
      res.status(200).json({ image: url.toString() });
      //   io.emit("resizedImage", { message: data.toString() });
    });
    childProcess.on("error", (err) => {
      console.error(`Worker error: ${err}`);
      throw new Error(err);
    });

    childProcess.on("close", (code) => {
      console.log(`Worker process exited with code ${code}`);
    });

    // res.send("Image resizing task started.");
  } catch (error) {
    next(error);
  }
});

// Handle timeout errors
app.use(timeoutHandler);
app.use(errorHandler);

module.exports = app;
