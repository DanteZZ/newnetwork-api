const soap = require('strong-soap').soap;
var uniqid = require('uniqid'); 

const { API_HOST, API_LOGIN, API_PASS } = process.env;

class LB {
    constructor(host=API_HOST) {
        this.host = host;
        this._wsdl = soap.WSDL;
        this.header = {};
    }

    _createClient = (url,options={}) => new Promise((res,rej)=>{
        soap.createClient(url,options,(err,cl)=>{
            if (err) {rej(err)} else {res(cl)};
        })
    })

    _openWsdl = (url,options={}) => new Promise((res,rej)=>{
        this._wsdl.open(url,options,(err,wsdl)=>{
            if (err) {rej(err)} else {res(wsdl)}
        })
    })

    _callMethod = (method,args) => new Promise((res,rej)=>{
        method(
            args,
            (err,result,env,header)=> err ? rej(err) : res(result),
            null,
            this.header
        )
    })

    init = async () => {
        this.wsdl = await this._openWsdl(this.host+"/?wsdl");
        this.client = await this._createClient('wsdl',{WSDL_CACHE:{wsdl:this.wsdl}},null,this.header);
    }

    login = async (login=API_LOGIN,pass=API_PASS) => {
        const res = await this._callMethod(this.client.Login,{login,pass});
        this.header = this.client.lastResponseHeaders;
        const curs = await this.getCurrencies();
        this.rur = curs?.ret.find(e=>e.def === 1) || { "id":1,"def":1,"codeokv":643,"symbol":"руб","name":"RUR" };
        return res;
    }

    getAgrm = async (agrmnum) => {
        const agrms = await this._callMethod(this.client.getAgreements);
        const find = agrms?.ret.find(e=>e.number === agrmnum);
        if (find) {
            return find;
        }
        throw {code:3,message:"Договор не найден"};
    }

    getCurrencies = async () => await this._callMethod(this.client.getCurrencies,{})
    getPayments = async (agrmid) => await this._callMethod(this.client.getPayments,{agrmid})
    payment = async (agrmid,amount,receipt) => {
        const payload = {
            val:{
                agrmid,
                amount,
                receipt,
                comment: "Оплата онлайн",
                curid: this.rur
            },
            cashcode: 2
        };
        return await this._callMethod(this.client.Payment,payload)
    }
    payments = async (pays) => {
        for (let k in pays) {
            const {agrmid,amount,receipt} = pays[k];
            await this.payment(agrmid,amount,receipt);
        }
        return true;
    }
}

module.exports = LB;