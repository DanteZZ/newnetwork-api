const sqlite3 = require('sqlite3').verbose();

const { CLEAR_LIMIT } = process.env;

class DB {
    constructor() {
        this.db = new sqlite3.Database("./base.db");
    }

    paymentList = () => new Promise((res,rej)=>{
        this.db.serialize(()=>{
            this.db.all("SELECT * FROM payments",(err,rows)=>err ? rej(err) : res(rows));
        })
    })

    oldPaymentList = () => new Promise((res,rej)=>{
        this.db.serialize(()=>{
            this.db.all("SELECT * FROM payments LIMIT "+CLEAR_LIMIT, (err,rows)=>err ? rej(err) : res(rows));
        })
    })

    getPayment = (number) => new Promise((res,rej)=>{
        this.db.serialize(()=>{
            this.db.all(`SELECT * FROM payments WHERE number = "${number}"`,
                (err,rows)=>
                err 
                    ? rej(err) 
                    : rows?.[0] 
                        ? res(rows?.[0]) 
                        : rej(new Error("Неизвестный платёж. Просьба связаться с тех. поддержкой для уточнения."))
            );
        })
    })

    regPayment = (number,amount,agrid,receipt) => new Promise((res,rej)=>{
        this.db.run(`INSERT INTO payments (number,amount,agrid,receipt) VALUES ('${number}',${amount},${agrid}, "${receipt}")`, (err)=>{
            if (err) {
                rej(err)
            } else {
                res(true);
            }
        });
    })

    clearPayments = async (ids) => {
        for (let k in ids) {
            let id = ids[k];
            await this.closePayment(id);
        };
        return true;
    }

    closePayment = (id) => new Promise((res,rej)=>{
        this.db.run(`DELETE FROM payments WHERE id = ${id}`, (err)=>{
            if (err) {
                rej(err)
            } else {
                res(true);
            }
        });
    })

    close = () => {
        this.db.close();
    }
}

module.exports = DB