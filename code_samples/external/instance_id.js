var ym = require('yandex-money-sdk');

ym.ExternalPayment.getInstanceId(
  constants.CLIENT_ID, function (err, data, response) {
    if(err || data.status !== "success") {
      //process error
    }
    var instance_id = data.instance_id;
  });
