var instrument = require('./instrument');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Terrarium() {
  EventEmitter.call(this);
  this.name = 'frame-' + Date.now().toString(16);
  this.iframe = document.body.appendChild(document.createElement('iframe'));
  this.iframe.setAttribute('name', this.name);
  this.iframe.style.display = 'none';
  this.context = window[this.name];
}

util.inherits(Terrarium, EventEmitter);

Terrarium.prototype.run = function(source) {
  var U = typeof URL !== 'undefined' ? URL : webkitURL;
  var instrumented = instrument(source, this.name),
    html = '<!DOCTYPE html><html><head></head><body>' +
      '<script>window.onerror = function(e) { window.top.ERROR(e); }</script>' +
      '<script>' +
      instrumented.result + '</script></body></html>',
    blob = new Blob([html], { encoding: 'UTF-8', type: 'text/html' }),
    targetUrl = U.createObjectURL(blob);

  this.iframe.addEventListener('load', function() {
    if (this.iframe.contentWindow.run) this.iframe.contentWindow.run();
  }.bind(this));

  this.setInstrument(this.name, instrumented);
  this.iframe.src = targetUrl;
};

Terrarium.prototype.destroy = function() {
  this.iframe.parentNode.removeChild(this.iframe);
  delete this.context;
  delete this.name;
  delete window.INSTRUMENT;
  delete window._UPDATE;
};

Terrarium.prototype.setInstrument = function(thisTick, instrumented) {
  var DATA = {};
  var start = Date.now();
  var TODO = instrumented.TODO;

  window.INSTRUMENT = function(name, number, val) {
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
    _UPDATE(thisTick);
  };

  window.ERROR = function(e) {
    this.emit('err', e);
  }.bind(this);

  window._UPDATE = function(tick) {
    if (tick !== thisTick) return;
    this.emit('data', DATA);
  }.bind(this);
};

module.exports = Terrarium;
