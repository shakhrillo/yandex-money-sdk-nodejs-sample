var options = {
  "request_id": request_data.request_id,
  "test_payment": "true",
  "test_result": "success"
};
api.processPayment(options, function res(err, data) {
  console.log('You have made process payment. Payment id is %s', data.payment_id);
});
