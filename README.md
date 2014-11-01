# terrarium

Terrarium is a sandbox for running JavaScript code in a browser with
instrumentation. It's designed for interactive, learnable programming
environments, but architecturally is more similar to code coverage tools.

Terrarium is **not** a security sandbox and is trivially easy to exploit.

## API

```js
var t = new Terrarium();

t.on('data', function(data) { /* instrumentation */ });
t.on('err', function(data) { /* errors */ });

t.run(JAVASCRIPT_SOURCE);

// later...
t.destroy(); // shut down
```
