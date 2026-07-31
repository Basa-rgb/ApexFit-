const express = require("express");
const router = express.Router();

const {
initiateEsewaPayment,
  esewaSuccess,
  esewaFailure,
} = require("../controllers/esewaController");

router.post("/initiate", initiateEsewaPayment);


router.get("/success", esewaSuccess);

router.get("/failure", esewaFailure);

module.exports = router;