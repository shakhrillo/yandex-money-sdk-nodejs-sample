var ym = require('yandex-money-sdk');

var wallet = req.body.wallet; // recipient's account number
var value = req.body.value; // amount_due

ym.ExternalPayment.getInstanceId(
  constants.CLIENT_ID, function (err, data, response) {
    if(err || data.status !== "success") {
      //process error
    }
    var instance_id = data.instance_id;
  });
