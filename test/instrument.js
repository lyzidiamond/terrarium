var test = require('tape'),
  instrument = require('../instrument');

test('instrument', function(t) {
  t.test('empty', function(t) {
    t.equal(instrument('', 0, 'node').source, '');
    t.equal(instrument('', 0, 'browser').source, 'window.onerror=function(e){window.top.ERROR(e);return true;};window.run=function(){};');
    t.end();
  });

  t.end();
});
