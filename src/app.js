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
const initiateImageWorker = require("./initiateImageWorker");
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(timeout("5s"));
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
    // Initiate the image generation worker
    initiateImageWorker(prompt);
    res.status(200).json({ message: "Image generation started" });
  } catch (error) {
    next(error);
    logger.error({ statusCode: 500, message: error });
  }
});

// Handle timeout errors
app.use(timeoutHandler);
app.use(errorHandler);

module.exports = app;
