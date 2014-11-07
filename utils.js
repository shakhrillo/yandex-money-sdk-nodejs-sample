var swig = require('swig');
var fs = require('fs');

function render(file_name, locals) {
  if(!locals) {
    locals = {};
  }
  var template = swig.compileFile(file_name);
  locals.lang = 'NodeJS';
  return template(locals);
}

function readSample(file_name) {
  return fs.readFileSync(__dirname + "/code_samples/" + file_name,
                        "utf-8");
}

module.exports = {
  render: render,
  readSample: readSample
};


