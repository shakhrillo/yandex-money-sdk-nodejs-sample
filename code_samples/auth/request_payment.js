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
  console.log('You make request payment. Request id is %s', data.request_id);
});
