const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const { join } = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, "btpeer/"));
  },
  filename: function (req, file, cb) {
    console.log(file.originalname);
    cb(null, `tmpImage`);
  },
});

const upload = multer({ storage: storage });

app.use(express.static(join(__dirname, "dist")));
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
app.use(morgan("short"));

app.set("view engine", "ejs");
app.set("views", join(__dirname, "server/views/pages"));

app.get("/", function (req, res) {
  res.render("index", {});
});

app.post("/", upload.single("photo"), function (req, res) {
  const email = req.body.email;
  const region = req.body.region;

  if (region !== "ES" && region !== "IT" && region !== "GR" && region !== "FR") {
    return res.render("index", { error: "please choose a valid region." });
  }

  sendTcpIpMessage(email, region);

  res.render("index", { trxStatus: "Payment succeeded" });
});

/**
 *
 * @description Will be called when we have received a new email and base64 encoded image.
 * User also has to have paid for the service.
 * @param {String} email
 * @param {String} region
 */
function sendTcpIpMessage(email, region) {
  const jsonData = JSON.stringify({ email: email, region: region });

  // 1. Write to file.
  fs.writeFile(join(__dirname, "btpeer/tmpData.json"), jsonData, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("::wrote to file");
  });

  // 2. Send request to current domain at port 1119.

  exec(`python3 ${join(__dirname, "btpeer/btpeer_init_handler.py")}`, function (err, stdout, stderr) {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }

    console.log(`\n::stdout:\n${stdout}`);
  });
}

app.listen(PORT, () => console.log("::listening on port", PORT));
