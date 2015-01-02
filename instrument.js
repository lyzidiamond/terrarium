var esprima = require('esprima'),
  escodegen = require('escodegen'),
  traverse = require('traverse');

// Given a string of source code, look for our magic kind of comment
// and transform those comments into actual code that records the value
// of variables at a point in time.
function instrument(str, tick) {
  var TODO = [];
  var transformed = escodegen.generate(
    wrapInRun(
      transform(
        esprima.parse(str, {attachComment:true,loc:true}), TODO)), {format:{compact:true}});

  return transformed;
}

function updateCall(comment) {
  var value = comment.value.replace(/^=/, '');
  var arg = esprima.parse('a(' + value + ')').body[0].expression.arguments;
  arg.push({ type: "Literal",
    value: comment.loc.start.line
  });
  arg.push({ type: "Literal", value: value });
  return {
    "type": "ExpressionStatement",
    "expression": {
      "type": "CallExpression",
      "callee": {
        "type": "Identifier",
        "name": "window.top.INSTRUMENT"
      },
      "arguments": arg
    }
  };
}

function transform(code) {
  function pp(l, k, v) { if (!l[k]) l[k] = []; l[k].push(v); }
  function pairs(o) {
    return Object.keys(o).map(function(k) { return [k, o[k]]; });
  }
  // walks through the source tree, though we're only going to touch
  // things with 'body', which means function bodies and the main
  // source.
  traverse(code).forEach(function(node) {
    var j, i, comment, id;
    if (this.key !== 'body') return;
    var coveredComments = {};
    var nextValue = node;
    var insertions = {};
    for (i = 0; i < node.length; i++) {
      // a comment can be both leading & trailing, so we keep this
      // coveredComments object to avoid double-logging it.
      if (node[i].leadingComments) {
        for (j = 0; j < node[i].leadingComments.length; j++) {
          comment = node[i].leadingComments[j];
          id = comment.range.join('-');
          if (!coveredComments[id]) {
            pp(insertions, i, updateCall(comment));
            coveredComments[id] = true;
          }
        }
      }
      if (node[i].leadingComments) {
        for (j = 0; j < node[i].trailingComments.length; j++) {
          comment = node[i].trailingComments[j];
          id = comment.range.join('-');
          if (!coveredComments[id]) {
            pp(insertions, i + 1, updateCall(comment));
            coveredComments[id] = true;
          }
        }
      }
    }
    // inserting things in places is hard with arrays, since when you
    // push something into i, it changes the positions of other stuff.
    // we avoid this problem by
    // 1: doing batch insertions with splice
    // 2: iterating backwards
    insertions = pairs(insertions);
    insertions.sort(function(a, b) { return b[0] - a[0]; });
    for (var k = 0; k < insertions.length; k++) {
      nextValue.splice.apply(nextValue, [+insertions[k][0], 0].concat(insertions[k][1]));
    }
    this.update(nextValue);
  });
  return code;
}

function wrapInRun(code) {
  return {
    "type": "Program",
    "body": [
      {
      "type": "ExpressionStatement",
      "expression": {
        "type": "AssignmentExpression",
        "operator": "=",
        "left": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "Identifier",
            "name": "window"
          },
          "property": {
            "type": "Identifier",
            "name": "run"
          }
        },
        "right": {
          "type": "FunctionExpression",
          "params": [],
          "defaults": [],
          "body": {
            "type": "BlockStatement",
            "body": code.body
          },
          "generator": false,
          "expression": false
        }
      }
    }
    ]
  };
}

module.exports = instrument;
