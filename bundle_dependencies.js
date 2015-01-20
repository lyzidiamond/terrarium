/**
 * This code is cribbed from browser-module-sandbox. All shouts to maxogden
 */
var request = require('browser-request');
var detective = require('detective');
var createCache = require('browser-module-cache');

var cache = createCache();
var cdn = 'https://wzrd.in';

module.exports = function(entry, callback) {
  var preferredVersions = {};
  var self = this;

  var modules = detective(entry);

  var allBundles = '';
  var packages = [];

  // cache.get(function(err, cached) {
    var cached = {};
    // if (err) {
    //   return err;
    // }

    var download = [];
    modules.forEach(function(module) {
      if (cached[module]) {
        allBundles += cached[module]['bundle'];
        packages.push(cached[module]['package']);
      } else {
        download.push(module);
      }
    });

    // if (download.length === 0) {
    //   return makeIframe(allBundles);
    // }

    var body = {
      "options": {
        "debug": true
      },
      "dependencies": {}
    };

    download.map(function(module) {
      var version = preferredVersions[module] || 'latest';
      body.dependencies[module] = version;
    });

    request({
      method: "POST",
      body: JSON.stringify(body),
      url: cdn + '/multi'},
      downloadedModules);
  // });

  function downloadedModules(err, resp, body) {
    if (err) {
      return err;
    } else if (resp.statusCode == 500) {
      return body;
    }

    var json = JSON.parse(body);

    Object.keys(json).map(function(module) {
      allBundles += json[module]['bundle'];
      packages.push(json[module]['package']);
    });

    // cache.put(json, function() {
      callback(null, allBundles);
    // });
  }
};
