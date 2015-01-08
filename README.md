# terrarium

[![build status](https://secure.travis-ci.org/tmcw/terrarium.png)](http://travis-ci.org/tmcw/terrarium)

Terrarium is a sandbox for running JavaScript code with
instrumentation. It's designed for interactive, learnable programming
environments, but architecturally is more similar to code coverage tools.

Terrarium is **not** a security sandbox and is trivially easy to exploit.

## How it Works

**parse**: Terrarium accepts a string of JavaScript source code. It parses this code
with [esprima](http://esprima.org/). If this parse fails, it emits an error
with the esprima-generated syntax error: this lets us normalize this class
of errors across browsers and node versions.

**transform**: It then uses [js-traverse](https://github.com/substack/js-traverse)
to walk every node in the esprima-generated [AST](http://en.wikipedia.org/wiki/Abstract_syntax_tree),
finding comment nodes. Each comment is transformed into an instrumentation call.
In node, that means using [process.send](http://nodejs.org/api/child_process.html).

**generate**: This AST is then turned back into JavaScript by
[escodegen](https://github.com/estools/escodegen).

**run**: The resulting JavaScript is run by either an iframe, or by process.fork,
as specified below.

## API

Terrarium provides two APIs: `Terrarium.Browser` and `Terrarium.Node`. They have the same
behavior on separate platforms.

* **Browser** runs code in a web browser by using an `iframe` and calling functions in `window.top`
* **Node** runs code in a subprocess by using [.fork](http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options) and calling `process.send`

`Terrarium.Browser` is designed to be used with [browserify](http://browserify.org/).

The `Terrarium.Browser` API also accepts an options object to its constructor.
The options include:

* `sandbox`: an object of JavaScript objects to be transferred into the running
  context.

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

* **Why not vm.runInContext**: this was the previous approach. Terrarium now uses
  a child process because this allows it to bind to ports and effectively cancel listeners on close.
* **Why not eval()**: eval doesn't provide variable sandboxing, so it's easy to
  overwrite existing variables on your page. It also doesn't allow you to control
  timers.
