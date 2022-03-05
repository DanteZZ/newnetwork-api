var express = require('express');
var router = express.Router();
var uniqid = require('uniqid'); 

var LB = require("../helpers/billing.js");
const SBER = require("../helpers/sberbank.js");
const DB = require("../helpers/db.js");

/* GET home page. */
router.get('/', async function(req, res, next) {
  const argnum = req.query.agrnum;
  const amount = req.query.amount;
  const receipt = "rec_"+uniqid();
  try {
    const _db = new DB()
    const _lb = new LB();
    await _lb.init();
    await _lb.login();
    const agr = await _lb.getAgrm(argnum);

    const _sber = new SBER();
    const resp = await _sber.register(amount,receipt,`Оплата интернета по договору "${argnum}"`);

    await _db.regPayment(resp.orderId,amount,agr.agrmid,receipt);

    _db.close();
    res.status(200).send(resp);
  } catch (e) {
    res.status(500).send({error:e.toString()});
  }
});

module.exports = router;
