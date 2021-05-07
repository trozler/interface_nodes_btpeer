const express = require("express");
const { join } = require("path");
const morgan = require("morgan");
const { spawn } = require("child_process");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan("short"));

app.post("/upload", function (req, res) {
  const encodedImage = req.body.image;
  const email = req.body.email;
  console.log("email:\n", email);
  console.log("encodedImage:\n", encodedImage);

  sendTcpIpMessage(encodedImage, email);

  res.sendStatus(200);
});

/**
 *
 * @description Will be called when we have received a new email and base64 encoded image.
 * User also has to have paid for the service.
 * @param {String} encodedImage
 * @param {String} email
 */
function sendTcpIpMessage(encodedImage, email) {
  // Send request to current domain at port 1119.

  const sensor = spawn("python", ["sensor.py"]);
  sensor.stdout.on("data", function (data) {
    // convert Buffer object to Float

    console.log(data);
  });
}

app.listen(PORT, () => console.log("::listening on port", PORT));
