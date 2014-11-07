api.operationHistory({"records": 3}, function res(err, data) {
  var operations_info;
  if(data.operations.length < 3) {
    operations_info = "You have less than 3 payment operations";
  }
  else {
    operations_info = util.format(
      "The last 3 payment titles are: %s, %s, %s",
      data.operations[0].title,
      data.operations[1].title,
      data.operations[2].title
    );
  }
  console.log(operations_info);
});
