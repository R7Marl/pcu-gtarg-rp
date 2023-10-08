const mercadopago = require('mercadopago')
mercadopago.configure({
    access_token: "APP_USR-4237434869134082-091111-3a8a5bd867896e83d167d22e2a319a61-222380220",
  });
async function createPayment(precio, desc) {

    const result = await mercadopago.preferences.create({
    items: [
      {
        title: desc,
        unit_price: precio,
        currency_id: "ARS",
        quantity: 1,
      },
    ],
   // notification_url: "https://e720-190-237-16-208.sa.ngrok.io/webhook",
    back_urls: {
      success: "http://localhost:4000/success",
      // pending: "https://e720-190-237-16-208.sa.ngrok.io/pending",
      // failure: "https://e720-190-237-16-208.sa.ngrok.io/failure",
    },
  });

  return result
}

module.exports = {createPayment}