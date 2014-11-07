var express = require('express');
var router = express.Router();
var ym = require('yandex-money-sdk');
var async = require('async');
var util = require('util');
var url = require('url');
var fs = require('fs');

var constants = require('../constants');
var utils = require('../utils');

var URL = {
  success: "/process-external-success/",
  fail: "/process-external-fail/"
};

function template_meta(method, index) {
  return [
    {
      is_collapsed: false,
      title: "Source code",
      id: index,
      body: method.code
    },
    {
      is_collapsed: true,
      title: "Response",
      id: index + 100,
      body: method.response
    }
  ];
}

router.post("/process-external/", function (req, res, next) {
  var phone = req.body.phone;
  var value = req.body.value;

  var context = {
  };
  req.session.responses = {};
  req.session.to_wallet = false;

  async.waterfall([
    function getInstanceId(callback) {
      ym.ExternalPayment.getInstanceId(
        constants.CLIENT_ID, callback);
    },
    function getRequestId(data, r, callback) {
      if(data.status !== "success") {
        callback(data);
        return;
      }
      req.session.responses.instance_id = JSON.stringify(data, undefined, 2);
      req.session.instance_id = data.instance_id;
      context.api = new ym.ExternalPayment(data.instance_id);
      var options = {
        pattern_id: "phone-topup",
        "phone-number": phone,
        amount: value
      };
      context.api.request(options, callback);
    },
    function getAuthUrl(data, r, callback) {
      if(data.status !== "success") {
        callback(data);
        return;
      }
      req.session.request_id = data.request_id;
      req.session.responses.request_payment = JSON.stringify(data, undefined, 2);
      var success_url = util.format(
        "http://%s%s", req.headers.host, URL.success);
      var fail_url = util.format(
        "http://%s%s", req.headers.host, URL.fail);
      var options = {
        request_id: data.request_id,
        ext_auth_success_uri: success_url,
        ext_auth_fail_uri: fail_url
      };
      context.api.process(options, callback);
    },
    function makeRedirect(data, r, callback) {
      if(data.status !== "ext_auth_required") {
        callback(data);
        return;
      }
      req.session.responses.process_payment1 = JSON.stringify(data, undefined, 2);
      res.redirect(url.format({
        pathname: data.acs_uri,
        query: data.acs_params
      }));
    }
  ], function complete(err) {
    if(err) {
      next({
        home: "../",
        err: err
      });
    }
  });
});

function readSample(file_name) {
  return fs.readFileSync(__dirname + "/../code_samples/external/" + file_name,
                        "utf-8");
}

router.get(URL.success, function (req, res) {
  var context = {
    request_id: req.session.request_id,
    instance_id: req.session.instance_id,
    process_response: null,
    process_payment2: null
  };
  var success_url = util.format(
    "http://%s%s", req.headers.host, URL.success);
  var fail_url = util.format(
    "http://%s%s", req.headers.host, URL.fail);
  if(!context.request_id || !context.instance_id) {
    //TODO: show error
    res.send(context);
    return;
  }
  context.api = new ym.ExternalPayment(context.instance_id);

  async.whilst(function (data, r) {
    if(context.process_response === null) {
      return true;
    }
    return context.process_response.status === "in_progress";
  },
  function checkStatus(callback) {
    context.api.process({
      request_id: context.request_id,
      ext_auth_success_uri: success_url,
      ext_auth_fail_uri: fail_url
    }, function(err, data) {
      context.process_response = data;
      callback();
    });
  },
  function complete(err) {
    var response = utils.render("cards.html", {
      "payment_result": context.process_response,
      "panels": {
        "instance_id": template_meta({
          code: readSample("instance_id.js"),
          response: req.session.responses.instance_id
        }, 1),
        "request_payment": template_meta({
          code: readSample(
            req.session.to_wallet?"request_payment_wallet.js"
            :"request_payment_phone.js"),
          response: req.session.responses.request_payment
        }, 2),
        "process_payment1": template_meta({
          code: readSample("process_payment_auth.js"),
          response: req.session.responses.process_payment1
        }, 3),
        "process_payment2": template_meta({
          code: readSample("process_payment_check.js"),
          response: JSON.stringify(context.process_response, undefined, 2)
        }, 4)
      },
      "home": "/"
    });
    res.send(response);
  });

});

// -----------
router.post("/wallet/process-external/", function (req, res, next) {
  var wallet = req.body.wallet;
  var value = req.body.value;

  var context = {
  };
  req.session.responses = {};
  req.session.to_wallet = true;

  async.waterfall([
    function getInstanceId(callback) {
      if(data.status !== "success") {
        callback(data);
        return;
      }
      ym.ExternalPayment.getInstanceId(
        constants.CLIENT_ID, callback);
    },
    function getRequestId(data, r, callback) {
      if(data.status !== "success") {
        callback(data);
        return;
      }
      req.session.responses.instance_id = JSON.stringify(data, undefined, 2);
      req.session.instance_id = data.instance_id;
      context.api = new ym.ExternalPayment(data.instance_id);
      var options = {
        pattern_id: "p2p",
        to: wallet,
        amount_due: value,
        comment: "sample test payment",
        message: "sample test payment"
      };
      context.api.request(options, callback);
    },
    function getAuthUrl(data, r, callback) {
      if(data.status !== "status") {
        callback(data);
        return;
      }
      req.session.request_id = data.request_id;
      req.session.responses.request_payment = JSON.stringify(data, undefined, 2);
      var success_url = util.format(
        "http://%s%s", req.headers.host, URL.success);
      var fail_url = util.format(
        "http://%s%s", req.headers.host, URL.fail);
      var options = {
        request_id: data.request_id,
        ext_auth_success_uri: success_url,
        ext_auth_fail_uri: fail_url
      };
      context.api.process(options, callback);
    },
    function makeRedirect(data, r, callback) {
      if(data.status !== "ext_auth_required") {
        callback(data);
        return;
      }
      req.session.responses.process_payment1 = JSON.stringify(data, undefined, 2);
      res.redirect(url.format({
        pathname: data.acs_uri,
        query: data.acs_params
      }));
    }
  ], function complete(err) {
    if(err) {
      next({
        home: "../",
        err: err
      });
    }
  });
});

module.exports = function(prefix, app) {
  app.use(prefix, router);
};
