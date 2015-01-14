var esprima = require('esprima'),
  escodegen = require('escodegen'),
  traverse = require('traverse');

/**
 * Given a string of source code, look for our magic kind of comment
 * and transform those comments into actual code that records the value
 * of variables at a point in time.
 *
 * @param {string} code input
 * @param {string} tick
 * @param {string} type either browser or node
 * @returns {Object}
 */
function instrument(str, tick, type) {
  var TODO = [], parsed;
  try {
    parsed = esprima.parse(str, {attachComment:true,loc:true});
  } catch(e) {
    // make esprima's errors zero-based
    e.lineNumber--;
    throw e;
  }
  var transformed = escodegen.generate(
    wrapInRun(
      transform(
        parsed, type, tick, TODO), type, tick));
  return {
    source: transformed,
    TODO: TODO
  };
}

/**
 * @return {Object} AST for error handling window.onerror code
 */
function setErrorHandler() {
  return {
    "type": "Program",
    "body": [{
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
            "name": "onerror"
          }
        },
        "right": {
          "type": "FunctionExpression",
          "id": null,
          "params": [
            {
            "type": "Identifier",
            "name": "e"
          }
          ],
          "defaults": [],
          "body": {
            "type": "BlockStatement",
            "body": [
              {
              "type": "ExpressionStatement",
              "expression": {
                "type": "CallExpression",
                "callee": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                      "type": "Identifier",
                      "name": "window"
                    },
                    "property": {
                      "type": "Identifier",
                      "name": "top"
                    }
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "ERROR"
                  }
                },
                "arguments": [
                  {
                  "type": "Identifier",
                  "name": "e"
                }]
              }
            },
            {
              "type": "ReturnStatement",
              "argument": {
                "type": "Literal",
                "value": true,
                "raw": "true"
              }
            }]
          },
          "rest": null,
          "generator": false,
          "expression": false
        }
      }
    }]
  };
}

function instrumentName(comment, type, tick) {
  return comment.value + ':' + comment.loc.start.line;
}

function isInstrumentComment(comment) {
  return comment.value.indexOf('=') === 0;
}

function instrumentCall(comment, type, tick) {
  var value = comment.value.replace(/^=/, '');
  var parsedComment = esprima.parse('a(' + value + ')').body[0].expression.arguments;
  function prop(k, v, r) {
    return {
      "type": "Property", "kind": "init",
      "key": { "type": "Identifier", "name": k },
      "value": r ? v : { type: "Literal", value: v }
    };
  }
  return {
    "type": "ExpressionStatement",
    "expression": {
      "type": "CallExpression",
      "callee": {
        "type": "Identifier",
        "name": type === 'node' ? 'process.send' : "window.top.INSTRUMENT"
      },
      "arguments": [{
        "type": "ObjectExpression",
        "properties": [
          prop('type', 'instrument'),
          prop('lineNumber', comment.loc.start.line),
          prop('name', value),
          prop('value', parsedComment[0], true)
        ]
      }]
    }
  };
}
function pairs(o) { return Object.keys(o).map(function(k) { return [k, o[k]]; }); }
function values(o) { return pairs(o).map(function(k) { return k[1]; }); }

function transform(code, type, tick, TODO) {
  function pp(l, k, v) { if (!l[k]) l[k] = []; l[k].push(v); }
  // walks through the source tree, though we're only going to touch
  // things with 'body', which means function bodies and the main
  // source.
  traverse(code).forEach(function(node) {
    var comment, id, coveredComments = {}, insertions = {};
    function instrumentComments(node, i) {
      var j;
      // a comment can be both leading & trailing, so we keep this
      // coveredComments object to avoid double-logging it.
      if (node.leadingComments) {
        for (j = 0; j < node.leadingComments.length; j++) {
          comment = node.leadingComments[j];
          id = comment.range.join('-');
          if (!coveredComments[id] && isInstrumentComment(comment)) {
            pp(insertions, i, instrumentCall(comment, type, tick));
            TODO.push(instrumentName(comment));
            coveredComments[id] = true;
          }
        }
      }
      if (node.trailingComments) {
        for (j = 0; j < node.trailingComments.length; j++) {
          comment = node.trailingComments[j];
          id = comment.range.join('-');
          if (!coveredComments[id] && isInstrumentComment(comment)) {
            pp(insertions, i + 1, instrumentCall(comment, type, tick));
            TODO.push(instrumentName(comment));
            coveredComments[id] = true;
          }
        }
      }
    }

    if (this.key === 'body') {
      var nextValue = traverse.clone(node);
      for (var k = 0; k < node.length; k++) {
        instrumentComments(node[k], k);
      }
      // inserting things in places is hard with arrays, since when you
      // push something into i, it changes the positions of other stuff.
      // we avoid this problem by
      // 1: doing batch insertions with splice
      // 2: iterating backwards
      insertions = pairs(insertions);
      insertions.sort(function(a, b) { return b[0] - a[0]; });
      for (var m = 0; m < insertions.length; m++) {
        nextValue.splice.apply(nextValue, [+insertions[m][0], 0].concat(insertions[m][1]));
      }
      this.update(nextValue);
    } else if (node && node.type === 'Program' && node.body.length === 0) {
      // a bare program consisting only of comments falls into this ditch:
      // instead of having a body, it just has comments, so we need to
      // look for them here.
      instrumentComments(node, 0);
      insertions = pairs(insertions);
      insertions.sort(function(a, b) { return b[0] - a[0]; });
      if (insertions.length) {
        node.body = insertions.map(function(i) { return i[1][0]; });
        this.update(node);
      }
    }
  });
  return code;
}

/**
 * @param {Object} AST of existing code
 * @param {string} type of backend
 * @param {string} tick of run evaluation
 * @return {Object} AST
 */
function wrapInRun(code, type, tick) {
  return type === 'node' ? code : {
    "type": "Program",
    "body": [setErrorHandler(), {
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
    }]
  };
}

module.exports = instrument;
