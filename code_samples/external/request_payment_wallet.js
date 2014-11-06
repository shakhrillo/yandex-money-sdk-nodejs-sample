api = new ym.ExternalPayment(instance_id);
var options = {
  pattern_id: "p2p",
  to: wallet,
  amount_due: value,
  comment: "sample test payment",
  message: "sample test payment"
};
api.request(options, function (err, data, response) {
  if(err || data.status !== "success") {
    //process error
  }
  var request_id = data.request_id;
});
