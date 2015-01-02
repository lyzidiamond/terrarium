var test = require('tape'),
  T = require('../');

test('Terrarium - Node', function(t) {
  var terrarium = new T.Node();
  t.ok(terrarium, 'is initialized');

  terrarium.on('data', function(d) {
    t.equal(d['1:0'][0].val, 1, 'emits the correct data');
  });

  terrarium.on('end', function(d) {
    terrarium.destroy();
    t.end();
  });

  terrarium.run('//=1');
  t.ok(terrarium.child, 'has child');
});

test('Terrarium - SyntaxError', function(t) {
  var terrarium = new T.Node();
  t.ok(terrarium, 'is initialized');

  terrarium.on('err', function(d) {
    t.ok(d.error, 'emits an error');
  });

  terrarium.on('end', function(d) {
    terrarium.destroy();
    t.end();
  });

  terrarium.run('/');
});

test('Terrarium - ReferenceError', function(t) {
  var terrarium = new T.Node();
  t.ok(terrarium, 'is initialized');

  terrarium.on('err', function(d) {
    t.ok(d.error, 'emits an error');
  });

  terrarium.on('end', function(d) {
    terrarium.destroy();
    t.end();
  });

  terrarium.run('foo');
});
