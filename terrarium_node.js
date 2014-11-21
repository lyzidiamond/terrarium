var instrument = require('./instrument_node');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var child_process = require('child_process');

var TMP = '__TMPRPL__.js';

function Terrarium() {
  EventEmitter.call(this);
}

util.inherits(Terrarium, EventEmitter);

Terrarium.prototype.run = function(source) {
  var instrumentedSource = instrument(source);
  fs.writeFileSync(TMP, instrumentedSource.result);
  this.child = child_process.fork(TMP, { silent: true });

  this.DATA = {};
  var DATA = this.DATA;
  var start = Date.now();
  var TODO = instrumentedSource.TODO;

  this.child.on('message', function(d) {
    if (d && d.type === 'instrument') {
      var name = d.name,
        number = d.lineNumber,
        val = d.value;

      if (DATA[name + ':' + number] === undefined) {
        DATA[name + ':' + number] = [];
      }
      DATA[name + ':' + number].unshift({
        name: name,
        line: number,
        val: val,
        when: Date.now() - start
      });
      TODO[name + ':' + number] = true;
      for (var k in TODO) {
        if (!TODO[k]) return;
      }
      this.update();
    }
  }.bind(this));

  this.child.stderr.on('data', function(d) {
    this.emit('err', { error: d });
  }.bind(this));

  this.child.on('exit', function(d) {
    this.emit('end');
  }.bind(this));
};

Terrarium.prototype.update = function() {
  this.emit('data', this.DATA);
};

Terrarium.prototype.destroy = function() {
  this.child.kill();
  if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
};

module.exports = Terrarium;
