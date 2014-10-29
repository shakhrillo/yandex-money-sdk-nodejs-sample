var swig = require('swig');

function render(file_name, locals) {
  if(!locals) {
    locals = {};
  }
  var template = swig.compileFile(file_name);
  locals.lang = 'Node';
  return template(locals);
}

module.exports = {
  render: render
};


