# terrarium

[![build status](https://secure.travis-ci.org/tmcw/terrarium.png)](http://travis-ci.org/tmcw/terrarium)

Terrarium is a sandbox for running JavaScript code with
instrumentation. It's designed for interactive, learnable programming
environments, but architecturally is more similar to code coverage tools.

Terrarium is **not** a security sandbox and is trivially easy to exploit.

## API

Terrarium provides two APIs: `Terrarium.Browser` and `Terrarium.Node`. They have the same
behavior on separate platforms.

* **Browser** runs code in a web browser by using an `iframe` and calling functions in `window.top`
* **Node** runs code in a subprocess by using [.fork](http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options) and calling `process.send`

`Terrarium.Browser` is designed to be used with browserify.

## Example

```js
var t = new Terrarium.Browser();
// or var t = new Terrarium.Node();

t.on('data', function(data) { /* instrumentation */ });
t.on('err', function(data) { /* errors */ });

t.run(JAVASCRIPT_SOURCE);

// later...
t.destroy(); // shut down
```

## FAQ

* **Why not vm.runInContext**: this was the previous approach. Terrarium now uses a child process because this allows it to bind to ports and effectively cancel listeners on close.
