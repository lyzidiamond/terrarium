var test = require('tape'),
  T = require('./');

test('Terrarium - Browser', function(t) {
  var terrarium = new T.Browser();
  t.ok(terrarium);

  terrarium.on('data', function(d) {
    t.equal(d['1:0'][0].val, 1, 'emits the correct data');
    t.end();
  });

  terrarium.run('//=1');
});
