'use strict';
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { PORT, API_VERSION } = require('./config');
const errorHandler = require('./helpers/error-handler');
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(`/api/${API_VERSION}`, require('./api/v1'));
app.use(errorHandler);

module.exports = app;