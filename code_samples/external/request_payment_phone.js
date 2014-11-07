api = new ym.ExternalPayment(instance_id);
var options = {
  pattern_id: "phone-topup",
  "phone-number": phone, // phone number from html form
  amount_due: value // amount_due from html form
};
api.request(options, function (err, data, response) {
  if(err || data.status !== "success") {
    //process error
  }
  var request_id = data.request_id;
});
