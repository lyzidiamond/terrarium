var test = require('tape'),
  fs = require('fs'),
  instrument = require('../instrument');

function fixture(t, name) {
  var input = fs.readFileSync(__dirname + '/fixture/' + name + '.js');
  var nodeOutput = instrument(input, 0, 'node');
  var browserOutput = instrument(input, 0, 'browser');
  var nodePath = __dirname + '/fixture/' + name + '.js.node';
  var browserPath = __dirname + '/fixture/' + name + '.js.browser';
  if (process.env.UPDATE) {
    fs.writeFileSync(nodePath, nodeOutput.source);
    fs.writeFileSync(browserPath, browserOutput.source);
  }
  t.equal(nodeOutput.source, fs.readFileSync(nodePath, 'utf8'), name + ' node');
  t.equal(browserOutput.source, fs.readFileSync(browserPath, 'utf8'), name + ' browser');
}

test('instrument', function(t) {
  t.test('empty', function(t) {
    fixture(t, 'empty');
    fixture(t, 'expression');
    fixture(t, 'comment');
    fixture(t, 'comment_undefined');
    fixture(t, 'bare');
    fixture(t, 'timeout');
    fixture(t, 'interval');
    fixture(t, 'combined');
    t.end();
  });

  t.end();
});
