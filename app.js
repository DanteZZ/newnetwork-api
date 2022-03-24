require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var registerPayRouter = require('./routes/registerPay');
var clearRouter = require('./routes/clear');
var registerOrderRouter = require('./routes/registerOrder');

var sberPay = require('./routes/sberPay');

const cors = require('cors');

var app = express();

app.use(cors({
    origin: "*"
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/registerPay', registerPayRouter);
app.use('/pay', indexRouter);
app.use('/clear', clearRouter);
app.use('/registerOrder', registerOrderRouter);

app.use('/payment_app.cgi', sberPay);

module.exports = app;
