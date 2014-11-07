api = new ym.ExternalPayment(instance_id);
var options = {
  pattern_id: "p2p",
  to: wallet, // recipient's account number from input form
  amount_due: value, // amount_due from html form
  comment: "sample test payment",
  message: "sample test payment"
};
api.request(options, function (err, data, response) {
  if(err || data.status !== "success") {
    //process error
  }
  var request_id = data.request_id;
});
