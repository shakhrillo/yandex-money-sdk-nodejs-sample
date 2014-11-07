var express = require('express');
var router = express.Router();
var ym = require('yandex-money-sdk');
var async = require('async');
var util = require('util');

var constants = require('../constants');
var utils = require('../utils');
var readSample = utils.readSample;

function fake(callback) {
  callback(null, {});
}

function templateMeta(method, index) {
  method.includes = [
    {
      is_collapsed: false,
      title: "Souce code",
      id: index,
      body: method.code
    },
    {
      is_collapsed: true,
      title: "Response",
      id: index + 100,
      body: JSON.stringify(method.response, undefined, 2)
    }
  ];
  return method;
}

router.get('/redirect/', function (req, res, next) {
  var code = req.query.code;

  //fake(
  ym.Wallet.getAccessToken(
    constants.CLIENT_ID, code, constants.REDIRECT_URI, constants.CLIENT_SECRET,
    function(err, data) {
      var access_token = data.access_token;
      var api = new ym.Wallet(access_token);
      context = {
        accountInfo: null,
        operationHistory: null,
        operationDetails: null,
        paymentRequest: null,
        paymentResult: null
      };
      async.series({
        accountInfo: function(callback) {
          api.accountInfo(function res(err, data) {
            callback(err, data);
          });
        },
        operationHistory: function(callback) {
          api.operationHistory({"records": 3}, function res(err, data) {
            callback(err, data);
          });
        },
        payment: function(callback) {
          async.waterfall([
            function request(callback_) {
              var options = {
                "pattern_id": "p2p",
                "to": "410011161616877",
                "amount_due": "0.02",
                "comment": "test payment comment from yandex-money-nodejs",
                "message": "test payment message from yandex-money-nodejs",
                "label": "testPayment",
                "test_payment": "true",
                "test_result": "success" 
              };
              api.requestPayment(options, function res(err, data) {
                callback_(err, data);
              });
            },
            function process(request_data) {
              var options = {
                "request_id": request_data.request_id,
                "test_payment": "true",
                "test_result": "success"
              };
              api.processPayment(options, function res(err, process_data) {
                callback(err, {
                  request: request_data,
                  process: process_data
                });
              });
            }
          ]);
        },
      },
        function gatherResults(err, results) {
          var operations_info, methods;
          if(err) {
            next(err);
          }
          if(results.operationHistory.operations.length < 3) {
            operations_info = "You have less than 3 payment operations";
          }
          else {
            operations_info = util.format(
              "The last 3 payment titles are: %s, %s, %s",
              results.operationHistory.operations[0].title,
              results.operationHistory.operations[1].title,
              results.operationHistory.operations[2].title
            );
          }
          methods = [
            {
              info: util.format('You wallet balance is %s RUB',
                                results.accountInfo.balance),
              code: readSample("auth/account_info.js"),
              name: 'Account-info',
              response: results.accountInfo
            },
            {
              info: operations_info,
              code: readSample("auth/operation_history.js"),
              name: 'Operation-history',
              response: results.operationHistory
            },
            {
              info: util.format('You make request payment. Request id is %s',
                               results.payment.request.request_id),
              code: readSample("auth/request_payment.js"),
              name: 'Request-payment',
              response: results.payment.request
            },
            {
              info: util.format('You have made process payment. Payment id is %s',
                               results.payment.process.payment_id),
              code: readSample("auth/process_payment.js"),
              name: 'Process-payment',
              response: results.payment.process
            }
          ].map(templateMeta);
          var result = utils.render("auth.html", {
            methods: methods,
            home: "",
          });
          res.send(result);
          //res.json(methods);
        });
    });
});


module.exports = function(prefix, app) {
  app.use(prefix, router);
};
