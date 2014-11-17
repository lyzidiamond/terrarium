var test = require('tape'),
  T = require('./');

test('Terrarium - Node', function(t) {
  var terrarium = new T.Node();
  t.ok(terrarium);

  terrarium.on('data', function(d) {
    t.equal(d['1:0'][0].val, 1, 'emits the correct data');
  });

  terrarium.on('end', function(d) {
    terrarium.destroy();
    t.end();
  });

  terrarium.run('//=1');
});
