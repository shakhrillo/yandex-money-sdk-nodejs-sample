  api.accountInfo(function res(err, data) {
    console.log("You wallet balance is %s", data.balance);
  });
