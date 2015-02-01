module.exports = display;

var MAPID = 'tmcw.l12c66f2';

/**
 * A fancy formatting function that creates maps for browser-exported
 * turf instead of console.logging.
 */
function display() {
  return {
    "type": "Program",
    "body": [
      {
      "type": "FunctionDeclaration",
      "id": {
        "type": "Identifier",
        "name": "_display"
      },
      "params": [
        {
        "type": "Identifier",
        "name": "value"
      }
      ],
      "defaults": [],
      "body": {
        "type": "BlockStatement",
        "body": [
          {
          "type": "IfStatement",
          "test": {
            "type": "LogicalExpression",
            "operator": "||",
            "left": {
              "type": "LogicalExpression",
              "operator": "||",
              "left": {
                "type": "BinaryExpression",
                "operator": "!==",
                "left": {
                  "type": "UnaryExpression",
                  "operator": "typeof",
                  "argument": {
                    "type": "Identifier",
                    "name": "value"
                  },
                  "prefix": true
                },
                "right": {
                  "type": "Literal",
                  "value": "object",
                  "raw": "'object'"
                }
              },
              "right": {
                "type": "UnaryExpression",
                "operator": "!",
                "argument": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "Identifier",
                    "name": "value"
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "type"
                  }
                },
                "prefix": true
              }
            },
            "right": {
              "type": "BinaryExpression",
              "operator": "===",
              "left": {
                "type": "UnaryExpression",
                "operator": "typeof",
                "argument": {
                  "type": "Identifier",
                  "name": "L"
                },
                "prefix": true
              },
              "right": {
                "type": "Literal",
                "value": "undefined",
                "raw": "'undefined'"
              }
            }
          },
          "consequent": {
            "type": "BlockStatement",
            "body": [
              {
              "type": "ReturnStatement",
              "argument": {
                "type": "CallExpression",
                "callee": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "Identifier",
                    "name": "console"
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "log"
                  }
                },
                "arguments": [
                  {
                  "type": "Identifier",
                  "name": "value"
                }
                ]
              }
            }
            ]
          },
          "alternate": null
        },
        {
          "type": "VariableDeclaration",
          "declarations": [
            {
            "type": "VariableDeclarator",
            "id": {
              "type": "Identifier",
              "name": "container"
            },
            "init": {
              "type": "CallExpression",
              "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "Identifier",
                    "name": "document"
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "body"
                  }
                },
                "property": {
                  "type": "Identifier",
                  "name": "appendChild"
                }
              },
              "arguments": [
                {
                "type": "Literal",
                "value": "div",
                "raw": "'div'"
              }
              ]
            }
          }
          ],
          "kind": "var"
        },
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
                "name": "container"
              },
              "property": {
                "type": "Identifier",
                "name": "className"
              }
            },
            "right": {
              "type": "Literal",
              "value": "map",
              "raw": "'map'"
            }
          }
        },
        {
          "type": "ExpressionStatement",
          "expression": {
            "type": "CallExpression",
            "callee": {
              "type": "MemberExpression",
              "computed": false,
              "object": {
                "type": "CallExpression",
                "callee": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                      "type": "Identifier",
                      "name": "L"
                    },
                    "property": {
                      "type": "Identifier",
                      "name": "mapbox"
                    }
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "featureLayer"
                  }
                },
                "arguments": [
                  {
                  "type": "Identifier",
                  "name": "value"
                }
                ]
              },
              "property": {
                "type": "Identifier",
                "name": "addTo"
              }
            },
            "arguments": [
              {
              "type": "CallExpression",
              "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "Identifier",
                    "name": "L"
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "mapbox"
                  }
                },
                "property": {
                  "type": "Identifier",
                  "name": "map"
                }
              },
              "arguments": [
                {
                "type": "Identifier",
                "name": "container"
              },
              {
                "type": "Literal",
                "value": MAPID
              }
              ]
            }
            ]
          }
        }
        ]
      },
      "rest": null,
      "generator": false,
      "expression": false
    }
    ]
  };
}
