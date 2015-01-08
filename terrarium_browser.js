var instrument = require('./instrument');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function createObjectURL(blob) {
  var U = typeof URL !== 'undefined' ? URL : webkitURL;
  return U.createObjectURL(blob);
}

// Running Terrarium in browsers: this creates an iframe temporarily
// and fills it with a page that just runs JavaScript.
function Terrarium(options) {
  EventEmitter.call(this);
  this.name = 'frame-' + Date.now().toString(16);
  this.iframe = document.body.appendChild(document.createElement('iframe'));
  this.iframe.setAttribute('name', this.name);
  this.iframe.style.display = 'none';
  this.context = window[this.name];
  if (options && options.sandbox) {
    this.sandbox = options.sandbox;
  } else { this.sandbox = {}; }
}

util.inherits(Terrarium, EventEmitter);

Terrarium.prototype.run = function(source) {
  try {
    var instrumented = instrument(source, this.name, 'browser');
    var html = '<!DOCTYPE html><html><head></head><body>' +
        '<script>window.onerror = function(e) { window.top.ERROR(e); }</script>' +
        '<script>' +
        instrumented.source + '</script></body></html>',
      blob = new Blob([html], { encoding: 'UTF-8', type: 'text/html' }),
      targetUrl = createObjectURL(blob);

    this.setInstrument(this.name, instrumented);

    this.iframe.addEventListener('load', function() {
      try {
        for (var k in this.sandbox) {
          console.log(this.sandbox);
          this.iframe.contentWindow[k] = this.sandbox[k];
        }
        if (this.iframe.contentWindow.run) this.iframe.contentWindow.run();
      } catch(e) {
        this.emit('err', e);
        this.emit('end');
      }
    }.bind(this));

    this.iframe.src = targetUrl;
  } catch(e) {
    // the call to instrument() can throw a SyntaxError.
    this.emit('err', e);
    this.emit('end');
  }
  return this;
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

  window.INSTRUMENT = function(d) {
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
      window.UPDATE(thisTick);
    }
  };

  window.ERROR = function(e) {
    this.emit('err', e);
  }.bind(this);

  window.UPDATE = function(tick) {
    if (tick !== thisTick) return;
    this.emit('data', DATA);
  }.bind(this);
};

module.exports = Terrarium;
