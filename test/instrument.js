var test = require('tape'),
  fs = require('fs'),
  instrument = require('../instrument');

function fixture(t, name) {
  var input = fs.readFileSync(__dirname + '/fixture/' + name + '.js');

  var modes = ['node', 'node-export', 'browser-export', 'browser', 'browser-export-fancy'];

  var outputs = modes.map(function(mode) {
    return instrument(input, 0, mode);
  });

  var paths = modes.map(function(mode) {
    return __dirname + '/fixture/' + name + '.js.' + mode;
  });

  if (process.env.UPDATE) {
    outputs.forEach(function(output, i) {
      fs.writeFileSync(paths[i], output.source);
    });
  }

  outputs.forEach(function(output, i) {
    t.equal(output.source, fs.readFileSync(paths[i], 'utf8'), name + ' ' + modes[i]);
  });
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
