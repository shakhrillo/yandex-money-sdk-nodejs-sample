var url = require("url");

var options = {
  request_id: request_id,
  ext_auth_success_uri: success_url, // success redirect url
  ext_auth_fail_uri: fail_url // fail redirect url
};
api.process(options, function(err, data) {
  if(err || data.status !== "ext_auth_required") {
    //process error
  }
  redirect(url.format({
    pathname: data.acs_uri,
    query: data.acs_params
  })); // redirect user to Yandex.Money page for filling payment information.
});
