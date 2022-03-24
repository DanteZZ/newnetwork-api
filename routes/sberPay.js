var express = require('express');
var iconv = require('iconv-lite');
const xml = require("xml");

var router = express.Router();

var LB = require("../helpers/billing.js");

var uniqid = require('uniqid'); 

/* GET home page. */
router.get('/', async function(req, res, next) {

  const argnum = req.query?.ACCOUNT || null;
  res.header("Content-Type", "application/xml; charset=windows-1251");
  let code = 0;
  let resxml = ["<?xml version=\"1.0\" encoding=\"windows-1251\"?>","<response>"];
  try {
    if (req?.headers?.['authorization']?.split(' ')[1] !== process.env.SBER_ONLINE_TOKEN) {
      code = 300
      resxml.push(`<CODE>${code}</CODE>`);
      resxml.push(`<MESSAGE>wrong bearer token</MESSAGE>`);
      resxml.push("</response>");
      res.status(200).send(iconv.encode(resxml.join(""), 'win1251'));
      return;
    };
    const _lb = new LB();
    await _lb.init();
    await _lb.login();
    const agr = await _lb.getAgrm(argnum);

    switch (req.query.ACTION) {
      case "check":
        code = 0;
        resxml.push(`<CODE>${code}</CODE>`);
        resxml.push(`<FIO>${agr.username}</FIO>`);
        resxml.push(`<BALANCE>${agr.balance}</BALANCE>`);
        resxml.push("</response>");
        res.status(200).send(iconv.encode(resxml.join(""), 'win1251'));
      break;
      case "payment":
        if (!req.query?.AMOUNT) {
          throw {code:10,message:"amount is too small"};
        };
        const pays = await _lb.getPayments(agr.agrmid)
        let msg = "payment Successful";
        if (pays?.ret && pays?.ret?.find(e=>e.pay?.receipt == req.query?.PAY_ID)) {
          code = 8;
          msg = "payment is duplicated"
        } else {
          const resp = await _lb.payment(agr.agrmid,req.query.AMOUNT,req.query.PAY_ID || "rec_"+uniqid());
          code = 0;
        }
        resxml.push(`<CODE>${code}</CODE>`);
        resxml.push(`<MESSAGE>${msg}</MESSAGE>`);
        resxml.push("</response>");
        res.status(200).send(iconv.encode(resxml.join(""), 'win1251'));
      break;
    }
  } catch (e) {
    let message = "";
    switch (req.query.ACTION) {
      case "check":
        code = 3;
        message = "account not found";
      break;
      case "payment":

        code = e.code || 1;
        message = e.code ? e.message :e.toString();
      break;
    }
    resxml.push(`<MESSAGE>${message}</MESSAGE>`);
    resxml.push(`<CODE>${code}</CODE>`);
    resxml.push("</response>");
    res.status(200).send(iconv.encode(resxml.join(""), 'win1251'));
  }
});

module.exports = router;
