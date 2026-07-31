const crypto = require("crypto");
const axios = require("axios");

const generateSignature = (message) => {
  const secret = process.env.ESEWA_SECRET_KEY;

  return crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64");
};

const verifyPayment = async (transaction_uuid, total_amount) => {
  const response = await axios.get(
    `${process.env.ESEWA_STATUS_CHECK_URL}?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`
  );

  return response.data;
};

module.exports = {
  generateSignature,
  verifyPayment,
};