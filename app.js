const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const { join } = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const ethers = require("ethers");

// Start time should be stored in html and sent with return time.

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
  res.render("index", { start: Date.now() });
});

app.post("/", upload.single("photo"), async function (req, res) {
  const email = req.body.email;
  const region = req.body.region;
  const start = Number(req.body.start);
  const end = Date.now();

  console.log(`start: ${start}, end: ${end}.`);
  if (start > end) {
    console.error("Tampering with start time.");
    return res.render("index", { start: Date.now(), error: "Please don't tamper with the start value." });
  }

  if (region !== "ES" && region !== "IT" && region !== "GR" && region !== "FR") {
    return res.render("index", { error: "please choose a valid region." });
  }

  sendTcpIpMessage(email, region);

  try {
    await sendTransaction(start, end);
  } catch (e) {}

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

/********************************************************************************************** */
// Set up Alchemy Ethereum connection.
const alchemyRopsten = "https://eth-ropsten.alchemyapi.io/v2/w2yVZl8OVNGGfzZeo83uTEozBjC7xzmy";
const loggerAbi = [
  "event LogTransaction(address indexed _from, uint256 start, uint256 end)",
  "function logRequest(uint256 start, uint256 end) public",
];

// Here is public key we will use to send address.
// Ether scanner url: https://ropsten.etherscan.io/address/0xa09a8dA457e5282BD9D018A9BeA6e5Ac65aBB466
const contractAddress = "0xFC210aBC64a68965A8695751262946F573053791";
const provider = ethers.getDefaultProvider(alchemyRopsten);
const mnemonic =
  "ice kitten symbol cinnamon banana liquid nominee dust call boring unlock make survey myself embrace soap series thing wedding badge cement strike leg rib";

const signer = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

const contract = new ethers.Contract(contractAddress, loggerAbi, signer);

contract.on("LogTransaction", function (from, start, end, event) {
  console.log("::Transaction mined.");
  console.log(`::${from}, start time: ${start}, end time: ${end}`);
  console.log(event);
});

/**
 *
 * @param {Number} start
 * @param {Number} end
 */
async function sendTransaction(start, end) {
  const trx = await contract.logRequest(start, end);
  console.log("::Transaction hash:");
  console.log(trx);
  console.log("\n\n");
}

/********************************************************************************************** */

app.listen(PORT, () => console.log("::listening on port", PORT));
