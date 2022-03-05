var express = require('express');
var router = express.Router();
const LB = require("../helpers/billing.js");
const DB = require("../helpers/db.js");

router.get('/', async function(req, res, next) {
  const number = req.query.orderId;
  try {
    const _db = new DB()
    const _lb = new LB();
    await _lb.init();
    await _lb.login();

    const payment = await _db.getPayment(number);
    const resp = await _lb.payment(payment.agrid,payment.amount+".0",payment.receipt);
    await _db.closePayment(payment.id);
    res.redirect("//new-network.ru/pages/paysuccess")
  } catch (e) {
    console.log(e)
    res.status(500).send("Ошибка: "+e.toString());
  }
});

module.exports = router;
