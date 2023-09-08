const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const admin = require("firebase-admin");

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const express = require("express");
const cors = require("cors");

// Main app
const app = express();
app.use(cors({ origin: true }))

// Routes
app.get('/', (req, res) => {
    return res.status(200).send('Hi there');
});
// Create -> post()

// Get


exports.app  = functions.https.onRequest(app);