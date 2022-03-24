var express = require('express');
var router = express.Router();
var axios = require("axios").default;
const Client = require('../helpers/espocrm.js');

const { ESPO_HOST, ESPO_TOKEN } = process.env;

router.post('/', async function(req, res, next) {
  const body = req.body;
  try {
    
    const client = new Client(
        ESPO_HOST,
        ESPO_TOKEN
    );

    let params = {
        name:body.address,
        amount:body.amount,
        stage:"Qualification",
        probability:20,
        description:body.description,
        phone:body.phone,
        amountCurrency:"RUB",
    };

    const opp = await client.request('POST', 'Opportunity', params);
    await axios.get(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
      params: {
        chat_id: process.env.TG_CHAT,
        text:["[Новая запрос на подключение]",params.description,`http://crm.new-network.ru/#Opportunity/view/`+opp.id].join("\n")
      }
    })
    res.status(200).send({result:true});
  } catch (e) {
    res.status(500).send({error:"Онлайн подача заявок временно недоступна. Вы можете связаться с нами по телефону горячей линии. Извините за предоставленные нудобства."});
  }
});

module.exports = router;
