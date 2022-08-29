const Acquiring = require('sberbank-acquiring');

const { SBER_LOGIN, SBER_PASS, SBER_TEST } = process.env;

class SBER {
    constructor(backurl="http://lk.new-network.ru:3003/registerPay") {
        this.acquiring = new Acquiring({ userName: SBER_LOGIN, password: SBER_PASS }, backurl, SBER_TEST == "true" ? true : false);
    }
    register = async (amount,receipt,description)=> await this.acquiring.register(receipt,amount,description)
    status = async (a) => await this.acquiring.status(a)
}

module.exports = SBER;