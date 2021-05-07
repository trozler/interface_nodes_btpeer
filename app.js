const express = require("express");
const { join } = require("path");
const morgan = require("morgan");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan("short"));

app.post("/upload", function (req, res) {
  const encodedImage = req.body.image;
  console.log("encodedImage:\n", encodedImage);

  // TODO: send encoded image.

  res.sendStatus(200);
});

// How to span a child process
// https://stackoverflow.com/questions/13175510/call-python-function-from-javascript-code

app.listen(PORT, () => console.log("::Listening on port", PORT));
