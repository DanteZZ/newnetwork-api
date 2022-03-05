var express = require('express');
var router = express.Router();
const DB = require("../helpers/db.js");
const SBER = require("../helpers/sberbank.js");
const LB = require("../helpers/billing.js");

router.get('/', async function(req, res, next) {
  try {
    const _db = new DB()
    const _sber = new SBER();
    const _lb = new LB();

    const list = await _db.oldPaymentList();

    if (!list.length) { res.status(200).send({clear:true,message:"Список транзакций пуст"}); return true;}

    const rmids = [];
    const pays = [];
    for (var k in list) {
        const item = list[k];
        const stat = await _sber.status(item.number);
        if (stat == 2) {
            pays.push({
                agrmid:item.agrid,
                amount:item.amount+".0",
                receipt:item.receipt
            })
        } else if ([3,4,6].indexOf(stat) !== -1) {
            rmids.push(item.id);
        };
    };

    if (rmids.length > 0) {
        await _db.clearPayments(rmids);
    }

    if (pays.length > 0) {
        await _lb.init();
        await _lb.login();
        await _lb.payments(pays);
    }

    res.status(200).send({clear:true,message:`Удалено ${rmids.length} транзакций. Выполнено ${pays.length} транзакций`});
  } catch (e) {
    console.log(e)
    res.status(500).send("Ошибка: "+e.toString());
  }
});

module.exports = router;
