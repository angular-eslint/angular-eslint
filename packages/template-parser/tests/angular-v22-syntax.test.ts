import { describe, expect, it } from 'vitest';
import { parseForESLint } from '../src/index';

describe('Angular v22 expression syntax', () => {
  /**
   * Recursively collect every node reachable from the parsed AST whose
   * constructor name matches `ctorName`. A node is only considered "reached"
   * by ESLint's traversal once `preprocessNode` has assigned it a string
   * `type` and a `loc`; nodes that the visitor keys fail to traverse retain
   * their original Angular class instance without those properties. We assert
   * on both to prove the nested expression is actually visible to rules.
   */
  function findNodes(node: unknown, ctorName: string): any[] {
    const results: any[] = [];
    const seen = new Set<unknown>();
    const walk = (current: unknown): void => {
      if (current === null || typeof current !== 'object') {
        return;
      }
      if (seen.has(current)) {
        return;
      }
      seen.add(current);
      if ((current as any).constructor?.name === ctorName) {
        results.push(current);
      }
      if (Array.isArray(current)) {
        current.forEach(walk);
        return;
      }
      for (const key of Object.keys(current)) {
        // Avoid walking back up / into span metadata which can contain
        // unrelated objects with the same constructor names.
        if (
          key === 'parent' ||
          key === 'sourceSpan' ||
          key === 'span' ||
          key === 'nameSpan' ||
          key === 'argumentSpan'
        ) {
          continue;
        }
        walk((current as any)[key]);
      }
    };
    walk(node);
    return results;
  }

  function expectReached(node: any): void {
    expect(typeof node.type).toBe('string');
    expect(node.loc).toBeDefined();
    expect(node.loc.start).toBeDefined();
    expect(node.loc.end).toBeDefined();
  }

  it('should traverse into an arrow function body in an event handler', () => {
    const { ast } = parseForESLint(
      `<button (click)="items.filter(x => x.active())"></button>`,
      { filePath: './foo.html' },
    );

    const arrowFns = findNodes(ast, 'ArrowFunction');
    expect(arrowFns).toHaveLength(1);
    expectReached(arrowFns[0]);

    // The inner `x.active()` Call lives inside the arrow function body and is
    // dropped entirely without the `ArrowFunction: ['body']` visitor key.
    const calls = findNodes(ast, 'Call');
    // outer `items.filter(...)` Call and inner `x.active()` Call
    expect(calls).toHaveLength(2);
    calls.forEach(expectReached);
    expect(calls.some((call) => call.receiver?.name === 'active')).toBe(true);
  });

  it('should traverse into an arrow function body in an interpolation', () => {
    const { ast } = parseForESLint(`{{ run(() => doThing()) }}`, {
      filePath: './foo.html',
    });

    const arrowFns = findNodes(ast, 'ArrowFunction');
    expect(arrowFns).toHaveLength(1);
    expectReached(arrowFns[0]);

    const calls = findNodes(ast, 'Call');
    // outer `run(...)` and inner `doThing()`
    expect(calls).toHaveLength(2);
    calls.forEach(expectReached);
    const innerCall = calls.find((call) => call.receiver?.name === 'doThing');
    expect(innerCall).toBeDefined();
    expectReached(innerCall.receiver);
  });

  it('should traverse into the expression of a spread in a call', () => {
    const { ast } = parseForESLint(`{{ fn(...args) }}`, {
      filePath: './foo.html',
    });

    const spreads = findNodes(ast, 'SpreadElement');
    expect(spreads).toHaveLength(1);
    expectReached(spreads[0]);

    // The spread's `expression` (PropertyRead `args`) is a single-object
    // child that is dropped without the `SpreadElement: ['expression']` key.
    const spreadExpression = spreads[0].expression;
    expect(spreadExpression.name).toBe('args');
    expectReached(spreadExpression);
  });

  it('should traverse into the expression of a spread inside an array literal', () => {
    const { ast } = parseForESLint(`{{ fn([...a, b()]) }}`, {
      filePath: './foo.html',
    });

    const spreads = findNodes(ast, 'SpreadElement');
    expect(spreads).toHaveLength(1);
    expectReached(spreads[0]);

    // The spread's inner `a` PropertyRead must be reachable.
    const spreadExpression = spreads[0].expression;
    expect(spreadExpression.name).toBe('a');
    expectReached(spreadExpression);

    // The sibling `b()` call in the array literal is also reachable.
    const calls = findNodes(ast, 'Call');
    const bCall = calls.find((call) => call.receiver?.name === 'b');
    expect(bCall).toBeDefined();
    expectReached(bCall);
  });

  it('should traverse into the tag and template of a tagged template literal', () => {
    const { ast } = parseForESLint('{{ tag`hello ${name()}` }}', {
      filePath: './foo.html',
    });

    const tagged = findNodes(ast, 'TaggedTemplateLiteral');
    expect(tagged).toHaveLength(1);
    expectReached(tagged[0]);

    // `tag` (the PropertyRead) is dropped without `'tag'` in the visitor keys.
    expect(tagged[0].tag.name).toBe('tag');
    expectReached(tagged[0].tag);

    // The `template` (TemplateLiteral) and the nested `name()` Call inside its
    // interpolation are dropped without `'template'` in the visitor keys.
    const templateLiterals = findNodes(ast, 'TemplateLiteral');
    expect(templateLiterals).toHaveLength(1);
    expectReached(templateLiterals[0]);

    const calls = findNodes(ast, 'Call');
    expect(calls).toHaveLength(1);
    expectReached(calls[0]);
    expect(calls[0].receiver?.name).toBe('name');
  });

  // The official Angular v22 blog post showcases inline arrow-function event
  // handlers. Assert the full parsed AST so the entire arrow-function subtree
  // (including the nested object-literal-with-spread body) is captured.
  it('should fully parse the blog "Decrease Stock" button inline arrow handler', () => {
    const { ast } = parseForESLint(
      `<p>Stock: {{ item().stock }}</p>

<button 
(click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
  Decrease Stock
</button>
`,
      { filePath: './foo.html' },
    );

    expect(ast).toMatchInlineSnapshot(`
      {
        "comments": [],
        "loc": {
          "end": {
            "column": 0,
            "line": 7,
          },
          "start": {
            "column": 0,
            "line": 1,
          },
        },
        "range": [
          0,
          130,
        ],
        "templateNodes": [
          Element {
            "attributes": [],
            "children": [
              BoundText {
                "i18n": undefined,
                "loc": {
                  "end": {
                    "column": 28,
                    "line": 1,
                  },
                  "start": {
                    "column": 3,
                    "line": 1,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 28,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 0,
                    "offset": 28,
                  },
                  "fullStart": ParseLocation {
                    "col": 3,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 0,
                    "offset": 3,
                  },
                  "start": ParseLocation {
                    "col": 3,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 0,
                    "offset": 3,
                  },
                },
                "type": "BoundText",
                "value": ASTWithSource {
                  "ast": Interpolation {
                    "expressions": [
                      PropertyRead {
                        "loc": {
                          "end": {
                            "column": 25,
                            "line": 1,
                          },
                          "start": {
                            "column": 13,
                            "line": 1,
                          },
                        },
                        "name": "stock",
                        "nameSpan": AbsoluteSourceSpan {
                          "end": 25,
                          "start": 20,
                        },
                        "receiver": Call {
                          "args": [],
                          "argumentSpan": AbsoluteSourceSpan {
                            "end": 18,
                            "start": 18,
                          },
                          "loc": {
                            "end": {
                              "column": 19,
                              "line": 1,
                            },
                            "start": {
                              "column": 13,
                              "line": 1,
                            },
                          },
                          "receiver": PropertyRead {
                            "loc": {
                              "end": {
                                "column": 17,
                                "line": 1,
                              },
                              "start": {
                                "column": 13,
                                "line": 1,
                              },
                            },
                            "name": "item",
                            "nameSpan": AbsoluteSourceSpan {
                              "end": 17,
                              "start": 13,
                            },
                            "receiver": ImplicitReceiver {
                              "loc": {
                                "end": {
                                  "column": 13,
                                  "line": 1,
                                },
                                "start": {
                                  "column": 13,
                                  "line": 1,
                                },
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 13,
                                "start": 13,
                              },
                              "span": ParseSpan {
                                "end": 10,
                                "start": 10,
                              },
                              "type": "ImplicitReceiver",
                            },
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 17,
                              "start": 13,
                            },
                            "span": ParseSpan {
                              "end": 14,
                              "start": 10,
                            },
                            "type": "PropertyRead",
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 19,
                            "start": 13,
                          },
                          "span": ParseSpan {
                            "end": 16,
                            "start": 10,
                          },
                          "type": "Call",
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 25,
                          "start": 13,
                        },
                        "span": ParseSpan {
                          "end": 22,
                          "start": 10,
                        },
                        "type": "PropertyRead",
                      },
                    ],
                    "loc": {
                      "end": {
                        "column": 28,
                        "line": 1,
                      },
                      "start": {
                        "column": 3,
                        "line": 1,
                      },
                    },
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 28,
                      "start": 3,
                    },
                    "span": ParseSpan {
                      "end": 25,
                      "start": 0,
                    },
                    "strings": [
                      "Stock: ",
                      "",
                    ],
                    "type": "Interpolation",
                  },
                  "errors": [],
                  "loc": {
                    "end": {
                      "column": 28,
                      "line": 1,
                    },
                    "start": {
                      "column": 3,
                      "line": 1,
                    },
                  },
                  "location": "./foo.html@0:3",
                  "source": "Stock: {{ item().stock }}",
                  "sourceSpan": AbsoluteSourceSpan {
                    "end": 28,
                    "start": 3,
                  },
                  "span": ParseSpan {
                    "end": 25,
                    "start": 0,
                  },
                  "type": "ASTWithSource",
                },
              },
            ],
            "directives": [],
            "endSourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 32,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 32,
              },
              "fullStart": ParseLocation {
                "col": 28,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 28,
              },
              "start": ParseLocation {
                "col": 28,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 28,
              },
            },
            "i18n": undefined,
            "inputs": [],
            "isSelfClosing": false,
            "isVoid": false,
            "loc": {
              "end": {
                "column": 32,
                "line": 1,
              },
              "start": {
                "column": 0,
                "line": 1,
              },
            },
            "name": "p",
            "outputs": [],
            "references": [],
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 32,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 32,
              },
              "fullStart": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 0,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 0,
              },
            },
            "startSourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 3,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 3,
              },
              "fullStart": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 0,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 0,
              },
            },
            "type": "Element",
          },
          Text {
            "loc": {
              "end": {
                "column": 0,
                "line": 3,
              },
              "start": {
                "column": 0,
                "line": 3,
              },
            },
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 34,
              },
              "fullStart": ParseLocation {
                "col": 32,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 32,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 34,
              },
            },
            "type": "Text",
            "value": "

      ",
          },
          Element {
            "attributes": [],
            "children": [
              Text {
                "loc": {
                  "end": {
                    "column": 0,
                    "line": 6,
                  },
                  "start": {
                    "column": 2,
                    "line": 5,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 0,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 5,
                    "offset": 120,
                  },
                  "fullStart": ParseLocation {
                    "col": 59,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 102,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 4,
                    "offset": 105,
                  },
                },
                "type": "Text",
                "value": "
        Decrease Stock
      ",
              },
            ],
            "directives": [],
            "endSourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 9,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 5,
                "offset": 129,
              },
              "fullStart": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 5,
                "offset": 120,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 5,
                "offset": 120,
              },
            },
            "i18n": undefined,
            "inputs": [],
            "isSelfClosing": false,
            "isVoid": false,
            "loc": {
              "end": {
                "column": 9,
                "line": 6,
              },
              "start": {
                "column": 0,
                "line": 3,
              },
            },
            "name": "button",
            "outputs": [
              BoundEvent {
                "__originalType": 0,
                "handler": ASTWithSource {
                  "ast": Call {
                    "args": [
                      ArrowFunction {
                        "body": ParenthesizedExpression {
                          "expression": LiteralMap {
                            "keys": [
                              {
                                "kind": "spread",
                                "loc": {
                                  "end": {
                                    "column": 32,
                                    "line": 4,
                                  },
                                  "start": {
                                    "column": 29,
                                    "line": 4,
                                  },
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 75,
                                  "start": 72,
                                },
                                "span": ParseSpan {
                                  "end": 23,
                                  "start": 20,
                                },
                                "type": "Object",
                              },
                              {
                                "key": "stock",
                                "kind": "property",
                                "loc": {
                                  "end": {
                                    "column": 40,
                                    "line": 4,
                                  },
                                  "start": {
                                    "column": 35,
                                    "line": 4,
                                  },
                                },
                                "quoted": false,
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 83,
                                  "start": 78,
                                },
                                "span": ParseSpan {
                                  "end": 31,
                                  "start": 26,
                                },
                                "type": "Object",
                              },
                            ],
                            "loc": {
                              "end": {
                                "column": 55,
                                "line": 4,
                              },
                              "start": {
                                "column": 27,
                                "line": 4,
                              },
                            },
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 98,
                              "start": 70,
                            },
                            "span": ParseSpan {
                              "end": 46,
                              "start": 18,
                            },
                            "type": "LiteralMap",
                            "values": [
                              PropertyRead {
                                "loc": {
                                  "end": {
                                    "column": 33,
                                    "line": 4,
                                  },
                                  "start": {
                                    "column": 32,
                                    "line": 4,
                                  },
                                },
                                "name": "p",
                                "nameSpan": AbsoluteSourceSpan {
                                  "end": 76,
                                  "start": 75,
                                },
                                "receiver": ImplicitReceiver {
                                  "loc": {
                                    "end": {
                                      "column": 32,
                                      "line": 4,
                                    },
                                    "start": {
                                      "column": 32,
                                      "line": 4,
                                    },
                                  },
                                  "sourceSpan": AbsoluteSourceSpan {
                                    "end": 75,
                                    "start": 75,
                                  },
                                  "span": ParseSpan {
                                    "end": 23,
                                    "start": 23,
                                  },
                                  "type": "ImplicitReceiver",
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 76,
                                  "start": 75,
                                },
                                "span": ParseSpan {
                                  "end": 24,
                                  "start": 23,
                                },
                                "type": "PropertyRead",
                              },
                              Binary {
                                "left": PropertyRead {
                                  "loc": {
                                    "end": {
                                      "column": 49,
                                      "line": 4,
                                    },
                                    "start": {
                                      "column": 42,
                                      "line": 4,
                                    },
                                  },
                                  "name": "stock",
                                  "nameSpan": AbsoluteSourceSpan {
                                    "end": 92,
                                    "start": 87,
                                  },
                                  "receiver": PropertyRead {
                                    "loc": {
                                      "end": {
                                        "column": 43,
                                        "line": 4,
                                      },
                                      "start": {
                                        "column": 42,
                                        "line": 4,
                                      },
                                    },
                                    "name": "p",
                                    "nameSpan": AbsoluteSourceSpan {
                                      "end": 86,
                                      "start": 85,
                                    },
                                    "receiver": ImplicitReceiver {
                                      "loc": {
                                        "end": {
                                          "column": 42,
                                          "line": 4,
                                        },
                                        "start": {
                                          "column": 41,
                                          "line": 4,
                                        },
                                      },
                                      "sourceSpan": AbsoluteSourceSpan {
                                        "end": 85,
                                        "start": 84,
                                      },
                                      "span": ParseSpan {
                                        "end": 33,
                                        "start": 32,
                                      },
                                      "type": "ImplicitReceiver",
                                    },
                                    "sourceSpan": AbsoluteSourceSpan {
                                      "end": 86,
                                      "start": 85,
                                    },
                                    "span": ParseSpan {
                                      "end": 34,
                                      "start": 33,
                                    },
                                    "type": "PropertyRead",
                                  },
                                  "sourceSpan": AbsoluteSourceSpan {
                                    "end": 92,
                                    "start": 85,
                                  },
                                  "span": ParseSpan {
                                    "end": 40,
                                    "start": 33,
                                  },
                                  "type": "PropertyRead",
                                },
                                "loc": {
                                  "end": {
                                    "column": 53,
                                    "line": 4,
                                  },
                                  "start": {
                                    "column": 42,
                                    "line": 4,
                                  },
                                },
                                "operation": "-",
                                "right": LiteralPrimitive {
                                  "loc": {
                                    "end": {
                                      "column": 53,
                                      "line": 4,
                                    },
                                    "start": {
                                      "column": 52,
                                      "line": 4,
                                    },
                                  },
                                  "sourceSpan": AbsoluteSourceSpan {
                                    "end": 96,
                                    "start": 95,
                                  },
                                  "span": ParseSpan {
                                    "end": 44,
                                    "start": 43,
                                  },
                                  "type": "LiteralPrimitive",
                                  "value": 1,
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 96,
                                  "start": 85,
                                },
                                "span": ParseSpan {
                                  "end": 44,
                                  "start": 33,
                                },
                                "type": "Binary",
                              },
                            ],
                          },
                          "loc": {
                            "end": {
                              "column": 56,
                              "line": 4,
                            },
                            "start": {
                              "column": 26,
                              "line": 4,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 99,
                            "start": 69,
                          },
                          "span": ParseSpan {
                            "end": 47,
                            "start": 17,
                          },
                          "type": "ParenthesizedExpression",
                        },
                        "loc": {
                          "end": {
                            "column": 56,
                            "line": 4,
                          },
                          "start": {
                            "column": 21,
                            "line": 4,
                          },
                        },
                        "parameters": [
                          ArrowFunctionIdentifierParameter {
                            "name": "p",
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 65,
                              "start": 64,
                            },
                            "span": ParseSpan {
                              "end": 13,
                              "start": 12,
                            },
                          },
                        ],
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 99,
                          "start": 64,
                        },
                        "span": ParseSpan {
                          "end": 47,
                          "start": 12,
                        },
                        "type": "ArrowFunction",
                      },
                    ],
                    "argumentSpan": AbsoluteSourceSpan {
                      "end": 99,
                      "start": 64,
                    },
                    "loc": {
                      "end": {
                        "column": 57,
                        "line": 4,
                      },
                      "start": {
                        "column": 9,
                        "line": 4,
                      },
                    },
                    "receiver": PropertyRead {
                      "loc": {
                        "end": {
                          "column": 20,
                          "line": 4,
                        },
                        "start": {
                          "column": 9,
                          "line": 4,
                        },
                      },
                      "name": "update",
                      "nameSpan": AbsoluteSourceSpan {
                        "end": 63,
                        "start": 57,
                      },
                      "receiver": PropertyRead {
                        "loc": {
                          "end": {
                            "column": 13,
                            "line": 4,
                          },
                          "start": {
                            "column": 9,
                            "line": 4,
                          },
                        },
                        "name": "item",
                        "nameSpan": AbsoluteSourceSpan {
                          "end": 56,
                          "start": 52,
                        },
                        "receiver": ImplicitReceiver {
                          "loc": {
                            "end": {
                              "column": 9,
                              "line": 4,
                            },
                            "start": {
                              "column": 9,
                              "line": 4,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 52,
                            "start": 52,
                          },
                          "span": ParseSpan {
                            "end": 0,
                            "start": 0,
                          },
                          "type": "ImplicitReceiver",
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 56,
                          "start": 52,
                        },
                        "span": ParseSpan {
                          "end": 4,
                          "start": 0,
                        },
                        "type": "PropertyRead",
                      },
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 63,
                        "start": 52,
                      },
                      "span": ParseSpan {
                        "end": 11,
                        "start": 0,
                      },
                      "type": "PropertyRead",
                    },
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 100,
                      "start": 52,
                    },
                    "span": ParseSpan {
                      "end": 48,
                      "start": 0,
                    },
                    "type": "Call",
                  },
                  "errors": [],
                  "loc": {
                    "end": {
                      "column": 57,
                      "line": 4,
                    },
                    "start": {
                      "column": 9,
                      "line": 4,
                    },
                  },
                  "location": "./foo.html@3:9",
                  "source": "item.update(p => ({ ...p, stock: p.stock - 1 }))",
                  "sourceSpan": AbsoluteSourceSpan {
                    "end": 100,
                    "start": 52,
                  },
                  "span": ParseSpan {
                    "end": 48,
                    "start": 0,
                  },
                  "type": "ASTWithSource",
                },
                "handlerSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 57,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 100,
                  },
                  "fullStart": ParseLocation {
                    "col": 9,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 52,
                  },
                  "start": ParseLocation {
                    "col": 9,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 52,
                  },
                },
                "keySpan": ParseSourceSpan {
                  "details": "click",
                  "end": ParseLocation {
                    "col": 6,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 49,
                  },
                  "fullStart": ParseLocation {
                    "col": 1,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 44,
                  },
                  "start": ParseLocation {
                    "col": 1,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 44,
                  },
                },
                "loc": {
                  "end": {
                    "column": 58,
                    "line": 4,
                  },
                  "start": {
                    "column": 0,
                    "line": 4,
                  },
                },
                "name": "click",
                "phase": null,
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 58,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 101,
                  },
                  "fullStart": ParseLocation {
                    "col": 0,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 43,
                  },
                  "start": ParseLocation {
                    "col": 0,
                    "file": ParseSourceFile {
                      "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 43,
                  },
                },
                "target": null,
                "type": "BoundEvent",
              },
            ],
            "references": [],
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 9,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 5,
                "offset": 129,
              },
              "fullStart": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 34,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 34,
              },
            },
            "startSourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 59,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 3,
                "offset": 102,
              },
              "fullStart": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 34,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 34,
              },
            },
            "type": "Element",
          },
          Text {
            "loc": {
              "end": {
                "column": 0,
                "line": 7,
              },
              "start": {
                "column": 0,
                "line": 7,
              },
            },
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 6,
                "offset": 130,
              },
              "fullStart": ParseLocation {
                "col": 9,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 5,
                "offset": 129,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
                  "url": "./foo.html",
                },
                "line": 6,
                "offset": 130,
              },
            },
            "type": "Text",
            "value": "
      ",
          },
        ],
        "tokens": [],
        "type": "Program",
        "value": "<p>Stock: {{ item().stock }}</p>

      <button 
      (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
        Decrease Stock
      </button>
      ",
      }
    `);
  });

  // The official Angular v22 blog post showcases spread and rest syntax across
  // object literals, array literals and call arguments. Assert the full parsed
  // AST so every spread/rest node is captured.
  it('should fully parse the blog bakery spread and rest example', () => {
    const { ast } = parseForESLint(
      `<section>
  <div [class]="{
    ...standardCupStyles, 
    'cardboard-sleeve': isHotDrink
  }">
  </div>

  <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

  <p>
    Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
  </p>
</section>
`,
      { filePath: './foo.html' },
    );

    expect(ast).toMatchInlineSnapshot(`
      {
        "comments": [],
        "loc": {
          "end": {
            "column": 0,
            "line": 14,
          },
          "start": {
            "column": 0,
            "line": 1,
          },
        },
        "range": [
          0,
          311,
        ],
        "templateNodes": [
          Element {
            "attributes": [],
            "children": [
              Text {
                "loc": {
                  "end": {
                    "column": 2,
                    "line": 2,
                  },
                  "start": {
                    "column": 2,
                    "line": 2,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 12,
                  },
                  "fullStart": ParseLocation {
                    "col": 9,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 0,
                    "offset": 9,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 12,
                  },
                },
                "type": "Text",
                "value": "
        ",
              },
              Element {
                "attributes": [],
                "children": [
                  Text {
                    "loc": {
                      "end": {
                        "column": 2,
                        "line": 6,
                      },
                      "start": {
                        "column": 2,
                        "line": 6,
                      },
                    },
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 2,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 5,
                        "offset": 98,
                      },
                      "fullStart": ParseLocation {
                        "col": 5,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 4,
                        "offset": 95,
                      },
                      "start": ParseLocation {
                        "col": 2,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 5,
                        "offset": 98,
                      },
                    },
                    "type": "Text",
                    "value": "
        ",
                  },
                ],
                "directives": [],
                "endSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 8,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 5,
                    "offset": 104,
                  },
                  "fullStart": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 5,
                    "offset": 98,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 5,
                    "offset": 98,
                  },
                },
                "i18n": undefined,
                "inputs": [
                  BoundAttribute {
                    "__originalType": 0,
                    "i18n": undefined,
                    "keySpan": ParseSourceSpan {
                      "details": "class",
                      "end": ParseLocation {
                        "col": 13,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 1,
                        "offset": 23,
                      },
                      "fullStart": ParseLocation {
                        "col": 8,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 1,
                        "offset": 18,
                      },
                      "start": ParseLocation {
                        "col": 8,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 1,
                        "offset": 18,
                      },
                    },
                    "loc": {
                      "end": {
                        "column": 4,
                        "line": 5,
                      },
                      "start": {
                        "column": 7,
                        "line": 2,
                      },
                    },
                    "name": "class",
                    "securityContext": 0,
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 4,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 4,
                        "offset": 94,
                      },
                      "fullStart": ParseLocation {
                        "col": 7,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 1,
                        "offset": 17,
                      },
                      "start": ParseLocation {
                        "col": 7,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 1,
                        "offset": 17,
                      },
                    },
                    "type": "BoundAttribute",
                    "unit": null,
                    "value": ASTWithSource {
                      "ast": LiteralMap {
                        "keys": [
                          {
                            "kind": "spread",
                            "loc": {
                              "end": {
                                "column": 7,
                                "line": 3,
                              },
                              "start": {
                                "column": 4,
                                "line": 3,
                              },
                            },
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 35,
                              "start": 32,
                            },
                            "span": ParseSpan {
                              "end": 9,
                              "start": 6,
                            },
                            "type": "Object",
                          },
                          {
                            "key": "cardboard-sleeve",
                            "kind": "property",
                            "loc": {
                              "end": {
                                "column": 22,
                                "line": 4,
                              },
                              "start": {
                                "column": 4,
                                "line": 4,
                              },
                            },
                            "quoted": true,
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 77,
                              "start": 59,
                            },
                            "span": ParseSpan {
                              "end": 51,
                              "start": 33,
                            },
                            "type": "Object",
                          },
                        ],
                        "loc": {
                          "end": {
                            "column": 3,
                            "line": 5,
                          },
                          "start": {
                            "column": 16,
                            "line": 2,
                          },
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 93,
                          "start": 26,
                        },
                        "span": ParseSpan {
                          "end": 67,
                          "start": 0,
                        },
                        "type": "LiteralMap",
                        "values": [
                          PropertyRead {
                            "loc": {
                              "end": {
                                "column": 24,
                                "line": 3,
                              },
                              "start": {
                                "column": 7,
                                "line": 3,
                              },
                            },
                            "name": "standardCupStyles",
                            "nameSpan": AbsoluteSourceSpan {
                              "end": 52,
                              "start": 35,
                            },
                            "receiver": ImplicitReceiver {
                              "loc": {
                                "end": {
                                  "column": 7,
                                  "line": 3,
                                },
                                "start": {
                                  "column": 7,
                                  "line": 3,
                                },
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 35,
                                "start": 35,
                              },
                              "span": ParseSpan {
                                "end": 9,
                                "start": 9,
                              },
                              "type": "ImplicitReceiver",
                            },
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 52,
                              "start": 35,
                            },
                            "span": ParseSpan {
                              "end": 26,
                              "start": 9,
                            },
                            "type": "PropertyRead",
                          },
                          PropertyRead {
                            "loc": {
                              "end": {
                                "column": 34,
                                "line": 4,
                              },
                              "start": {
                                "column": 24,
                                "line": 4,
                              },
                            },
                            "name": "isHotDrink",
                            "nameSpan": AbsoluteSourceSpan {
                              "end": 89,
                              "start": 79,
                            },
                            "receiver": ImplicitReceiver {
                              "loc": {
                                "end": {
                                  "column": 24,
                                  "line": 4,
                                },
                                "start": {
                                  "column": 23,
                                  "line": 4,
                                },
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 79,
                                "start": 78,
                              },
                              "span": ParseSpan {
                                "end": 53,
                                "start": 52,
                              },
                              "type": "ImplicitReceiver",
                            },
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 89,
                              "start": 79,
                            },
                            "span": ParseSpan {
                              "end": 63,
                              "start": 53,
                            },
                            "type": "PropertyRead",
                          },
                        ],
                      },
                      "errors": [],
                      "loc": {
                        "end": {
                          "column": 3,
                          "line": 5,
                        },
                        "start": {
                          "column": 16,
                          "line": 2,
                        },
                      },
                      "location": "./foo.html@1:16",
                      "source": "{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }",
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 93,
                        "start": 26,
                      },
                      "span": ParseSpan {
                        "end": 67,
                        "start": 0,
                      },
                      "type": "ASTWithSource",
                    },
                    "valueSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 3,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 4,
                        "offset": 93,
                      },
                      "fullStart": ParseLocation {
                        "col": 16,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 1,
                        "offset": 26,
                      },
                      "start": ParseLocation {
                        "col": 16,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 1,
                        "offset": 26,
                      },
                    },
                  },
                ],
                "isSelfClosing": false,
                "isVoid": false,
                "loc": {
                  "end": {
                    "column": 8,
                    "line": 6,
                  },
                  "start": {
                    "column": 2,
                    "line": 2,
                  },
                },
                "name": "div",
                "outputs": [],
                "references": [],
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 8,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 5,
                    "offset": 104,
                  },
                  "fullStart": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 12,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 12,
                  },
                },
                "startSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 5,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 4,
                    "offset": 95,
                  },
                  "fullStart": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 12,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 12,
                  },
                },
                "type": "Element",
              },
              Text {
                "loc": {
                  "end": {
                    "column": 2,
                    "line": 8,
                  },
                  "start": {
                    "column": 2,
                    "line": 8,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 108,
                  },
                  "fullStart": ParseLocation {
                    "col": 8,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 5,
                    "offset": 104,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 108,
                  },
                },
                "type": "Text",
                "value": "

        ",
              },
              Element {
                "attributes": [],
                "children": [],
                "directives": [],
                "endSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 82,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 188,
                  },
                  "fullStart": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 108,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 108,
                  },
                },
                "i18n": undefined,
                "inputs": [
                  BoundAttribute {
                    "__originalType": 0,
                    "i18n": undefined,
                    "keySpan": ParseSourceSpan {
                      "details": "pastryOrder",
                      "end": ParseLocation {
                        "col": 31,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 137,
                      },
                      "fullStart": ParseLocation {
                        "col": 20,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 126,
                      },
                      "start": ParseLocation {
                        "col": 20,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 126,
                      },
                    },
                    "loc": {
                      "end": {
                        "column": 80,
                        "line": 8,
                      },
                      "start": {
                        "column": 19,
                        "line": 8,
                      },
                    },
                    "name": "pastryOrder",
                    "securityContext": 0,
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 80,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 186,
                      },
                      "fullStart": ParseLocation {
                        "col": 19,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 125,
                      },
                      "start": ParseLocation {
                        "col": 19,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 125,
                      },
                    },
                    "type": "BoundAttribute",
                    "unit": null,
                    "value": ASTWithSource {
                      "ast": LiteralArray {
                        "expressions": [
                          SpreadElement {
                            "expression": PropertyRead {
                              "loc": {
                                "end": {
                                  "column": 55,
                                  "line": 8,
                                },
                                "start": {
                                  "column": 38,
                                  "line": 8,
                                },
                              },
                              "name": "dailyPastryBasics",
                              "nameSpan": AbsoluteSourceSpan {
                                "end": 161,
                                "start": 144,
                              },
                              "receiver": ImplicitReceiver {
                                "loc": {
                                  "end": {
                                    "column": 38,
                                    "line": 8,
                                  },
                                  "start": {
                                    "column": 38,
                                    "line": 8,
                                  },
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 144,
                                  "start": 144,
                                },
                                "span": ParseSpan {
                                  "end": 4,
                                  "start": 4,
                                },
                                "type": "ImplicitReceiver",
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 161,
                                "start": 144,
                              },
                              "span": ParseSpan {
                                "end": 21,
                                "start": 4,
                              },
                              "type": "PropertyRead",
                            },
                            "loc": {
                              "end": {
                                "column": 55,
                                "line": 8,
                              },
                              "start": {
                                "column": 35,
                                "line": 8,
                              },
                            },
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 161,
                              "start": 141,
                            },
                            "span": ParseSpan {
                              "end": 21,
                              "start": 1,
                            },
                            "type": "SpreadElement",
                          },
                          LiteralPrimitive {
                            "loc": {
                              "end": {
                                "column": 68,
                                "line": 8,
                              },
                              "start": {
                                "column": 57,
                                "line": 8,
                              },
                            },
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 174,
                              "start": 163,
                            },
                            "span": ParseSpan {
                              "end": 34,
                              "start": 23,
                            },
                            "type": "LiteralPrimitive",
                            "value": "croissant",
                          },
                          LiteralPrimitive {
                            "loc": {
                              "end": {
                                "column": 78,
                                "line": 8,
                              },
                              "start": {
                                "column": 70,
                                "line": 8,
                              },
                            },
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 184,
                              "start": 176,
                            },
                            "span": ParseSpan {
                              "end": 44,
                              "start": 36,
                            },
                            "type": "LiteralPrimitive",
                            "value": "muffin",
                          },
                        ],
                        "loc": {
                          "end": {
                            "column": 79,
                            "line": 8,
                          },
                          "start": {
                            "column": 34,
                            "line": 8,
                          },
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 185,
                          "start": 140,
                        },
                        "span": ParseSpan {
                          "end": 45,
                          "start": 0,
                        },
                        "type": "LiteralArray",
                      },
                      "errors": [],
                      "loc": {
                        "end": {
                          "column": 79,
                          "line": 8,
                        },
                        "start": {
                          "column": 34,
                          "line": 8,
                        },
                      },
                      "location": "./foo.html@7:34",
                      "source": "[...dailyPastryBasics, 'croissant', 'muffin']",
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 185,
                        "start": 140,
                      },
                      "span": ParseSpan {
                        "end": 45,
                        "start": 0,
                      },
                      "type": "ASTWithSource",
                    },
                    "valueSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 79,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 185,
                      },
                      "fullStart": ParseLocation {
                        "col": 34,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 140,
                      },
                      "start": ParseLocation {
                        "col": 34,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 140,
                      },
                    },
                  },
                ],
                "isSelfClosing": true,
                "isVoid": false,
                "loc": {
                  "end": {
                    "column": 82,
                    "line": 8,
                  },
                  "start": {
                    "column": 2,
                    "line": 8,
                  },
                },
                "name": "app-bakery-cart",
                "outputs": [],
                "references": [],
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 82,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 188,
                  },
                  "fullStart": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 108,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 108,
                  },
                },
                "startSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 82,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 188,
                  },
                  "fullStart": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 108,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 108,
                  },
                },
                "type": "Element",
              },
              Text {
                "loc": {
                  "end": {
                    "column": 2,
                    "line": 10,
                  },
                  "start": {
                    "column": 2,
                    "line": 10,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 9,
                    "offset": 192,
                  },
                  "fullStart": ParseLocation {
                    "col": 82,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 7,
                    "offset": 188,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 9,
                    "offset": 192,
                  },
                },
                "type": "Text",
                "value": "

        ",
              },
              Element {
                "attributes": [],
                "children": [
                  BoundText {
                    "i18n": undefined,
                    "loc": {
                      "end": {
                        "column": 2,
                        "line": 12,
                      },
                      "start": {
                        "column": 4,
                        "line": 11,
                      },
                    },
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 2,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 11,
                        "offset": 295,
                      },
                      "fullStart": ParseLocation {
                        "col": 5,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 9,
                        "offset": 195,
                      },
                      "start": ParseLocation {
                        "col": 4,
                        "file": ParseSourceFile {
                          "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                          "url": "./foo.html",
                        },
                        "line": 10,
                        "offset": 200,
                      },
                    },
                    "type": "BoundText",
                    "value": ASTWithSource {
                      "ast": Interpolation {
                        "expressions": [
                          Call {
                            "args": [
                              SpreadElement {
                                "expression": PropertyRead {
                                  "loc": {
                                    "end": {
                                      "column": 51,
                                      "line": 11,
                                    },
                                    "start": {
                                      "column": 37,
                                      "line": 11,
                                    },
                                  },
                                  "name": "baseItemPrices",
                                  "nameSpan": AbsoluteSourceSpan {
                                    "end": 247,
                                    "start": 233,
                                  },
                                  "receiver": ImplicitReceiver {
                                    "loc": {
                                      "end": {
                                        "column": 37,
                                        "line": 11,
                                      },
                                      "start": {
                                        "column": 37,
                                        "line": 11,
                                      },
                                    },
                                    "sourceSpan": AbsoluteSourceSpan {
                                      "end": 233,
                                      "start": 233,
                                    },
                                    "span": ParseSpan {
                                      "end": 38,
                                      "start": 38,
                                    },
                                    "type": "ImplicitReceiver",
                                  },
                                  "sourceSpan": AbsoluteSourceSpan {
                                    "end": 247,
                                    "start": 233,
                                  },
                                  "span": ParseSpan {
                                    "end": 52,
                                    "start": 38,
                                  },
                                  "type": "PropertyRead",
                                },
                                "loc": {
                                  "end": {
                                    "column": 51,
                                    "line": 11,
                                  },
                                  "start": {
                                    "column": 34,
                                    "line": 11,
                                  },
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 247,
                                  "start": 230,
                                },
                                "span": ParseSpan {
                                  "end": 52,
                                  "start": 35,
                                },
                                "type": "SpreadElement",
                              },
                              PropertyRead {
                                "loc": {
                                  "end": {
                                    "column": 61,
                                    "line": 11,
                                  },
                                  "start": {
                                    "column": 53,
                                    "line": 11,
                                  },
                                },
                                "name": "salesTax",
                                "nameSpan": AbsoluteSourceSpan {
                                  "end": 257,
                                  "start": 249,
                                },
                                "receiver": ImplicitReceiver {
                                  "loc": {
                                    "end": {
                                      "column": 53,
                                      "line": 11,
                                    },
                                    "start": {
                                      "column": 52,
                                      "line": 11,
                                    },
                                  },
                                  "sourceSpan": AbsoluteSourceSpan {
                                    "end": 249,
                                    "start": 248,
                                  },
                                  "span": ParseSpan {
                                    "end": 54,
                                    "start": 53,
                                  },
                                  "type": "ImplicitReceiver",
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 257,
                                  "start": 249,
                                },
                                "span": ParseSpan {
                                  "end": 62,
                                  "start": 54,
                                },
                                "type": "PropertyRead",
                              },
                              PropertyRead {
                                "loc": {
                                  "end": {
                                    "column": 80,
                                    "line": 11,
                                  },
                                  "start": {
                                    "column": 63,
                                    "line": 11,
                                  },
                                },
                                "name": "espressoShotPrice",
                                "nameSpan": AbsoluteSourceSpan {
                                  "end": 276,
                                  "start": 259,
                                },
                                "receiver": ImplicitReceiver {
                                  "loc": {
                                    "end": {
                                      "column": 63,
                                      "line": 11,
                                    },
                                    "start": {
                                      "column": 62,
                                      "line": 11,
                                    },
                                  },
                                  "sourceSpan": AbsoluteSourceSpan {
                                    "end": 259,
                                    "start": 258,
                                  },
                                  "span": ParseSpan {
                                    "end": 64,
                                    "start": 63,
                                  },
                                  "type": "ImplicitReceiver",
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 276,
                                  "start": 259,
                                },
                                "span": ParseSpan {
                                  "end": 81,
                                  "start": 64,
                                },
                                "type": "PropertyRead",
                              },
                              PropertyRead {
                                "loc": {
                                  "end": {
                                    "column": 92,
                                    "line": 11,
                                  },
                                  "start": {
                                    "column": 82,
                                    "line": 11,
                                  },
                                },
                                "name": "syrupPrice",
                                "nameSpan": AbsoluteSourceSpan {
                                  "end": 288,
                                  "start": 278,
                                },
                                "receiver": ImplicitReceiver {
                                  "loc": {
                                    "end": {
                                      "column": 82,
                                      "line": 11,
                                    },
                                    "start": {
                                      "column": 81,
                                      "line": 11,
                                    },
                                  },
                                  "sourceSpan": AbsoluteSourceSpan {
                                    "end": 278,
                                    "start": 277,
                                  },
                                  "span": ParseSpan {
                                    "end": 83,
                                    "start": 82,
                                  },
                                  "type": "ImplicitReceiver",
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 288,
                                  "start": 278,
                                },
                                "span": ParseSpan {
                                  "end": 93,
                                  "start": 83,
                                },
                                "type": "PropertyRead",
                              },
                            ],
                            "argumentSpan": AbsoluteSourceSpan {
                              "end": 288,
                              "start": 230,
                            },
                            "loc": {
                              "end": {
                                "column": 93,
                                "line": 11,
                              },
                              "start": {
                                "column": 20,
                                "line": 11,
                              },
                            },
                            "receiver": PropertyRead {
                              "loc": {
                                "end": {
                                  "column": 33,
                                  "line": 11,
                                },
                                "start": {
                                  "column": 20,
                                  "line": 11,
                                },
                              },
                              "name": "calculateBill",
                              "nameSpan": AbsoluteSourceSpan {
                                "end": 229,
                                "start": 216,
                              },
                              "receiver": ImplicitReceiver {
                                "loc": {
                                  "end": {
                                    "column": 20,
                                    "line": 11,
                                  },
                                  "start": {
                                    "column": 20,
                                    "line": 11,
                                  },
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 216,
                                  "start": 216,
                                },
                                "span": ParseSpan {
                                  "end": 21,
                                  "start": 21,
                                },
                                "type": "ImplicitReceiver",
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 229,
                                "start": 216,
                              },
                              "span": ParseSpan {
                                "end": 34,
                                "start": 21,
                              },
                              "type": "PropertyRead",
                            },
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 289,
                              "start": 216,
                            },
                            "span": ParseSpan {
                              "end": 94,
                              "start": 21,
                            },
                            "type": "Call",
                          },
                        ],
                        "loc": {
                          "end": {
                            "column": 2,
                            "line": 12,
                          },
                          "start": {
                            "column": 5,
                            "line": 10,
                          },
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 295,
                          "start": 195,
                        },
                        "span": ParseSpan {
                          "end": 100,
                          "start": 0,
                        },
                        "strings": [
                          "
          Total Cost: $",
                          "
        ",
                        ],
                        "type": "Interpolation",
                      },
                      "errors": [],
                      "loc": {
                        "end": {
                          "column": 2,
                          "line": 12,
                        },
                        "start": {
                          "column": 5,
                          "line": 10,
                        },
                      },
                      "location": "./foo.html@10:4",
                      "source": "
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        ",
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 295,
                        "start": 195,
                      },
                      "span": ParseSpan {
                        "end": 100,
                        "start": 0,
                      },
                      "type": "ASTWithSource",
                    },
                  },
                ],
                "directives": [],
                "endSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 6,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 299,
                  },
                  "fullStart": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 295,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 295,
                  },
                },
                "i18n": undefined,
                "inputs": [],
                "isSelfClosing": false,
                "isVoid": false,
                "loc": {
                  "end": {
                    "column": 6,
                    "line": 12,
                  },
                  "start": {
                    "column": 2,
                    "line": 10,
                  },
                },
                "name": "p",
                "outputs": [],
                "references": [],
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 6,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 299,
                  },
                  "fullStart": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 9,
                    "offset": 192,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 9,
                    "offset": 192,
                  },
                },
                "startSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 5,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 9,
                    "offset": 195,
                  },
                  "fullStart": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 9,
                    "offset": 192,
                  },
                  "start": ParseLocation {
                    "col": 2,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 9,
                    "offset": 192,
                  },
                },
                "type": "Element",
              },
              Text {
                "loc": {
                  "end": {
                    "column": 0,
                    "line": 13,
                  },
                  "start": {
                    "column": 0,
                    "line": 13,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 0,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 12,
                    "offset": 300,
                  },
                  "fullStart": ParseLocation {
                    "col": 6,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 299,
                  },
                  "start": ParseLocation {
                    "col": 0,
                    "file": ParseSourceFile {
                      "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                      "url": "./foo.html",
                    },
                    "line": 12,
                    "offset": 300,
                  },
                },
                "type": "Text",
                "value": "
      ",
              },
            ],
            "directives": [],
            "endSourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 10,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 12,
                "offset": 310,
              },
              "fullStart": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 12,
                "offset": 300,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 12,
                "offset": 300,
              },
            },
            "i18n": undefined,
            "inputs": [],
            "isSelfClosing": false,
            "isVoid": false,
            "loc": {
              "end": {
                "column": 10,
                "line": 13,
              },
              "start": {
                "column": 0,
                "line": 1,
              },
            },
            "name": "section",
            "outputs": [],
            "references": [],
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 10,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 12,
                "offset": 310,
              },
              "fullStart": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 0,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 0,
              },
            },
            "startSourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 9,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 9,
              },
              "fullStart": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 0,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 0,
              },
            },
            "type": "Element",
          },
          Text {
            "loc": {
              "end": {
                "column": 0,
                "line": 14,
              },
              "start": {
                "column": 0,
                "line": 14,
              },
            },
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 13,
                "offset": 311,
              },
              "fullStart": ParseLocation {
                "col": 10,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 12,
                "offset": 310,
              },
              "start": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
                  "url": "./foo.html",
                },
                "line": 13,
                "offset": 311,
              },
            },
            "type": "Text",
            "value": "
      ",
          },
        ],
        "tokens": [],
        "type": "Program",
        "value": "<section>
        <div [class]="{
          ...standardCupStyles, 
          'cardboard-sleeve': isHotDrink
        }">
        </div>

        <app-bakery-cart [pastryOrder]="[...dailyPastryBasics, 'croissant', 'muffin']"/>

        <p>
          Total Cost: \${{ calculateBill(...baseItemPrices, salesTax, espressoShotPrice, syrupPrice) }}
        </p>
      </section>
      ",
      }
    `);
  });
});
