module.exports = function(test, T, name) {
  test('Terrarium ' + name, function(t) {
    var terrarium = new T();
    t.ok(terrarium, 'is initialized');

    terrarium.on('data', function(d) {
      t.ok(d, 'gives data');
      t.equal(d['x:2'][0].val, 10, 'emits the correct data');
      terrarium.destroy();
      t.end();
    });

    t.equal(terrarium.run('var x = 10;\n//=x'), terrarium);
  });

  test('Terrarium - SyntaxError', function(t) {
    var terrarium = new T();
    t.ok(terrarium, 'is initialized');

    terrarium.on('err', function(d) {
      t.ok(d, 'emits an error');
    });

    terrarium.on('end', function(d) {
      terrarium.destroy();
      t.end();
    });

    terrarium.run('/');
  });

  test('Terrarium - ReferenceError', function(t) {
    var terrarium = new T();
    t.ok(terrarium, 'is initialized');

    terrarium.on('err', function(d) {
      t.ok(d, 'emits an error');
    });

    terrarium.on('end', function(d) {
      terrarium.destroy();
      t.end();
    });

    terrarium.run('foo');
  });
};
