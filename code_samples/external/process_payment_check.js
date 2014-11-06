context.api = new ym.ExternalPayment(context.instance_id);

async.whilst(function (data, r) {
  if(context.process_response === null) {
    return true;
  }
  return context.process_response.status === "in_progress";
},
function checkStatus(callback) {
  context.api.process({
    request_id: context.request_id, // request_id is equal of request_id from request-payment
    ext_auth_success_uri: success_url, // urls is equal to urls from process-payment
    ext_auth_fail_uri: fail_url
  }, function(err, data) {
    context.process_response = data;
    callback();
  });
},
function complete(err) {
  // now context.process_response.status contains status of overall operation
});
