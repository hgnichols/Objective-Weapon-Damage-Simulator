
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const WeaponSchema = require("./WeaponSchema");
const TalentSchema = require("./TalentSchema");
const RuneSchema = require("./RuneSchema");
const API_PORT = 3001;
const app = express();
const router = express.Router();
const cors = require('cors');

// this is our MongoDB database
const dbRoute = "mongodb+srv://hgnichols:2698jk80@cluster0-llmzd.mongodb.net/RealmRoyaleWeaponData?retryWrites=true";

// connects our back end code with the database
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

//this is our get method
//this method fetches all available data in our database
router.get("/getWeaponData", (req, res) => {
  WeaponSchema.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    let stuff = res.json({ success: true, data: data });
    console.log(data);
    return stuff;
  });
});

router.get("/getTalentData", (req, res) => {
  TalentSchema.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    let stuff = res.json({ success: true, data: data });
    console.log(data);
    return stuff;
  });
});

router.get("/getRuneData", (req, res) => {
  RuneSchema.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    let stuff = res.json({ success: true, data: data });
    console.log(data);
    return stuff;
  });
});

// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));