const route = require("express").Router();
const ckoPublicKey = "pk_test_4296fd52-efba-4a38-b6ce-cf0d93639d8a";
const ckoSecretKey = "sk_test_0b9b5db6-f223-49d0-b68f-f6643dd4f808";
const { Checkout } = require("checkout-sdk-node");
const cko = new Checkout(ckoSecretKey, { pk: ckoPublicKey });

route.post("/payWithToken", async (req, res) => {
  const payment = await cko.payments.request({
    source: {
      token: req.body.token,
    },
    currency: "EUR",
    amount: 3000,
    reference: "TEST-ORDER",
  });
  res.send(payment);
});

// Get payment details
route.post("/getPaymentById", async (req, res) => {
  try {
    const details = await cko.payments.get(req.body.id);
    res.send(details);
  } catch (error) {
    res.send(500, error);
  }
});

// !!! Google Pay  ==>

route.post("/payWithGoogle", async (req, res) => {
  const { signature, protocolVersion, signedMessage } = req.body;

  let tokenResponse;

  console.log("Google token: ", req.body);

  try {
    tokenResponse = await cko.tokens.request({
      // type:"googlepay" is inferred
      token_data: {
        signature,
        protocolVersion,
        signedMessage,
      },
    });
  } catch (error) {
    res.send(500, error);
  }

  console.log("CKO token: ", tokenResponse.token);

  /* Do payment request w/ token */
  const token = tokenResponse.token;

  try {
    const payment = await cko.payments.request({
      source: {
        token: token,
      },
      currency: "EUR",
      amount: 3000,
      reference: "GPAY-TEST",
    });
    res.send(payment);
  } catch (error) {
    res.send(500, error);
  }
});

// <== !!! Google Pay

// !!! GiroPay  ==>

route.post('/payGiroPay', async (req, res) => {

  try {
      const payment = await cko.payments.request({
          source: {
              type: "giropay",
              purpose: "Mens t-shirt L"
          },
          amount: 3000,
          currency: "EUR",
          success_url: 'http://localhost:8080/outcome', // route to success
          failure_url: 'http://localhost:8080/outcome', // route to failure
      });
      // Only send back the redirection URL
      res.send({
          redirectionUrl: payment.redirectLink
      });
  } catch (error) {
      res.send(500, error);
  }
});

// <== !!! GiroPay

module.exports = route;
