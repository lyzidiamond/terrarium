var test = require('tape'),
  instrument = require('../instrument');

test('instrument', function(t) {

  t.test('SyntaxError', function(t) {
    t.throws(function() {
      t.equal(instrument('/', null), '');
    }, /Invalid regular expression/);
    t.end();
  });

  t.test('empty', function(t) {
    t.equal(instrument('', null), 'window.run=function(){};');
    t.end();
  });

  t.test('non-comment', function(t) {
    t.equal(instrument('var x = 10;', null), 'window.run=function(){var x=10;};');
    t.end();
  });

  t.test('comment', function(t) {
    t.equal(instrument('//=10\nvar x = 10;\n//=10\nvar y = 10;\n//=10', null), 'window.run=function(){window.top.INSTRUMENT(10,1,\'10\');var x=10;window.top.INSTRUMENT(10,3,\'10\');var y=10;window.top.INSTRUMENT(10,5,\'10\');};');
    t.end();
  });

  t.end();
});
