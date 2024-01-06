import type { TemplateParseError } from '../src/index';
import { parseForESLint } from '../src/index';

describe('parseForESLint()', () => {
  it('should work', () => {
    expect(
      parseForESLint(
        `
      <!-- eslint-disable-next-line -->
      <div>some node</div>
      <!-- some other comment -->
    `,
        { filePath: './foo.html' },
      ).ast,
    ).toMatchInlineSnapshot(`
      Object {
        "comments": Array [
          Object {
            "loc": Object {
              "end": Object {
                "column": 39,
                "line": 2,
              },
              "start": Object {
                "column": 6,
                "line": 2,
              },
            },
            "range": Array [
              7,
              40,
            ],
            "type": "Block",
            "value": "eslint-disable-next-line",
          },
          Object {
            "loc": Object {
              "end": Object {
                "column": 33,
                "line": 4,
              },
              "start": Object {
                "column": 6,
                "line": 4,
              },
            },
            "range": Array [
              74,
              101,
            ],
            "type": "Block",
            "value": "some other comment",
          },
        ],
        "loc": Object {
          "end": Object {
            "column": 4,
            "line": 5,
          },
          "start": Object {
            "column": 6,
            "line": 2,
          },
        },
        "range": Array [
          7,
          106,
        ],
        "templateNodes": Array [
          Text$3 {
            "loc": Object {
              "end": Object {
                "column": 6,
                "line": 2,
              },
              "start": Object {
                "column": 6,
                "line": 2,
              },
            },
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 6,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 1,
                "offset": 7,
              },
              "fullStart": ParseLocation {
                "col": 0,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 0,
                "offset": 0,
              },
              "start": ParseLocation {
                "col": 6,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 1,
                "offset": 7,
              },
            },
            "type": "Text$3",
            "value": "
            ",
          },
          Text$3 {
            "loc": Object {
              "end": Object {
                "column": 6,
                "line": 3,
              },
              "start": Object {
                "column": 6,
                "line": 3,
              },
            },
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 6,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 47,
              },
              "fullStart": ParseLocation {
                "col": 39,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 1,
                "offset": 40,
              },
              "start": ParseLocation {
                "col": 6,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 47,
              },
            },
            "type": "Text$3",
            "value": "
            ",
          },
          Element$1 {
            "attributes": Array [],
            "children": Array [
              Text$3 {
                "loc": Object {
                  "end": Object {
                    "column": 20,
                    "line": 3,
                  },
                  "start": Object {
                    "column": 11,
                    "line": 3,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 20,
                    "file": ParseSourceFile {
                      "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                      "url": "./foo.html",
                    },
                    "line": 2,
                    "offset": 61,
                  },
                  "fullStart": ParseLocation {
                    "col": 11,
                    "file": ParseSourceFile {
                      "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                      "url": "./foo.html",
                    },
                    "line": 2,
                    "offset": 52,
                  },
                  "start": ParseLocation {
                    "col": 11,
                    "file": ParseSourceFile {
                      "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                      "url": "./foo.html",
                    },
                    "line": 2,
                    "offset": 52,
                  },
                },
                "type": "Text$3",
                "value": "some node",
              },
            ],
            "endSourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 26,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 67,
              },
              "fullStart": ParseLocation {
                "col": 20,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 61,
              },
              "start": ParseLocation {
                "col": 20,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 61,
              },
            },
            "i18n": undefined,
            "inputs": Array [],
            "loc": Object {
              "end": Object {
                "column": 26,
                "line": 3,
              },
              "start": Object {
                "column": 6,
                "line": 3,
              },
            },
            "name": "div",
            "outputs": Array [],
            "references": Array [],
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 26,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 67,
              },
              "fullStart": ParseLocation {
                "col": 6,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 47,
              },
              "start": ParseLocation {
                "col": 6,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 47,
              },
            },
            "startSourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 11,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 52,
              },
              "fullStart": ParseLocation {
                "col": 6,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 47,
              },
              "start": ParseLocation {
                "col": 6,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 47,
              },
            },
            "type": "Element$1",
          },
          Text$3 {
            "loc": Object {
              "end": Object {
                "column": 6,
                "line": 4,
              },
              "start": Object {
                "column": 6,
                "line": 4,
              },
            },
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 6,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 3,
                "offset": 74,
              },
              "fullStart": ParseLocation {
                "col": 26,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 2,
                "offset": 67,
              },
              "start": ParseLocation {
                "col": 6,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 3,
                "offset": 74,
              },
            },
            "type": "Text$3",
            "value": "
            ",
          },
          Text$3 {
            "loc": Object {
              "end": Object {
                "column": 4,
                "line": 5,
              },
              "start": Object {
                "column": 4,
                "line": 5,
              },
            },
            "sourceSpan": ParseSourceSpan {
              "details": null,
              "end": ParseLocation {
                "col": 4,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 4,
                "offset": 106,
              },
              "fullStart": ParseLocation {
                "col": 33,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 3,
                "offset": 101,
              },
              "start": ParseLocation {
                "col": 4,
                "file": ParseSourceFile {
                  "content": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
                  "url": "./foo.html",
                },
                "line": 4,
                "offset": 106,
              },
            },
            "type": "Text$3",
            "value": "
          ",
          },
        ],
        "tokens": Array [],
        "type": "Program",
        "value": "
            <!-- eslint-disable-next-line -->
            <div>some node</div>
            <!-- some other comment -->
          ",
      }
    `);
  });

  describe('parse errors', () => {
    it('should not throw if the Angular compiler produced parse errors by default', () => {
      expect.assertions(1);

      const { ast } = parseForESLint(
        '<p>consumed resources are at {{ ${percent} | formatPercentLocale }}</p>',
        {
          filePath:
            './inline-template-source-using-template-literal-interpolation.html',
        },
      );
      expect(ast).toBeDefined();
    });

    it('should appropriately throw if the Angular compiler produced parse errors and `parserOptions.suppressParseErrors` is set to false', () => {
      expect.assertions(2);

      let error: TemplateParseError;
      try {
        parseForESLint(
          '<p i18n>Lorem ipsum <em i18n="@@dolor">dolor</em> sit amet.</p>',
          {
            filePath: './invalid-nested-i18ns.html',
            suppressParseErrors: false,
          },
        );
      } catch (err: any) {
        error = err;
        expect(error).toMatchInlineSnapshot(
          `[TemplateParseError: Cannot mark an element as translatable inside of a translatable section. Please remove the nested i18n marker.]`,
        );
        expect(JSON.stringify(error, null, 2)).toMatchInlineSnapshot(`
          "{
            \\"fileName\\": \\"./invalid-nested-i18ns.html\\",
            \\"index\\": 20,
            \\"lineNumber\\": 1,
            \\"column\\": 21
          }"
        `);
      }
    });
  });

  describe('@defer', () => {
    it('should support the different variants of @defer', () => {
      expect(
        parseForESLint(
          `
          @defer (when title) {
            <div>Hello</div>
          }
          @defer (on immediate) {
            <calendar-cmp />
          } @placeholder (minimum 500ms) {
            <p>Placeholder content</p>
          }
          @defer {
            <large-component />
          } @loading (after 100ms; minimum 1s) {
            <img alt="loading..." src="loading.gif" />
          }
          @defer {
            <calendar-cmp />
          } @error {
            <p>Failed to load the calendar</p>
          }        
      `,
          { filePath: './foo.html' },
        ).ast,
      ).toMatchInlineSnapshot(`
        Object {
          "comments": Array [],
          "loc": Object {
            "end": Object {
              "column": 11,
              "line": 19,
            },
            "start": Object {
              "column": 10,
              "line": 2,
            },
          },
          "range": Array [
            11,
            525,
          ],
          "templateNodes": Array [
            Text$3 {
              "loc": Object {
                "end": Object {
                  "column": 10,
                  "line": 2,
                },
                "start": Object {
                  "column": 10,
                  "line": 2,
                },
              },
              "sourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
                "fullStart": ParseLocation {
                  "col": 0,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 0,
                  "offset": 0,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "type": "Text$3",
              "value": "
                  ",
            },
            DeferredBlock {
              "children": Array [
                Text$3 {
                  "loc": Object {
                    "end": Object {
                      "column": 12,
                      "line": 3,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 3,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 45,
                    },
                    "fullStart": ParseLocation {
                      "col": 31,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 32,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 45,
                    },
                  },
                  "type": "Text$3",
                  "value": "
                    ",
                },
                Element$1 {
                  "attributes": Array [],
                  "children": Array [
                    Text$3 {
                      "loc": Object {
                        "end": Object {
                          "column": 22,
                          "line": 3,
                        },
                        "start": Object {
                          "column": 17,
                          "line": 3,
                        },
                      },
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 22,
                          "file": ParseSourceFile {
                            "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                            "url": "./foo.html",
                          },
                          "line": 2,
                          "offset": 55,
                        },
                        "fullStart": ParseLocation {
                          "col": 17,
                          "file": ParseSourceFile {
                            "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                            "url": "./foo.html",
                          },
                          "line": 2,
                          "offset": 50,
                        },
                        "start": ParseLocation {
                          "col": 17,
                          "file": ParseSourceFile {
                            "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                            "url": "./foo.html",
                          },
                          "line": 2,
                          "offset": 50,
                        },
                      },
                      "type": "Text$3",
                      "value": "Hello",
                    },
                  ],
                  "endSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 61,
                    },
                    "fullStart": ParseLocation {
                      "col": 22,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 55,
                    },
                    "start": ParseLocation {
                      "col": 22,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 55,
                    },
                  },
                  "i18n": undefined,
                  "inputs": Array [],
                  "loc": Object {
                    "end": Object {
                      "column": 28,
                      "line": 3,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 3,
                    },
                  },
                  "name": "div",
                  "outputs": Array [],
                  "references": Array [],
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 61,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 45,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 45,
                    },
                  },
                  "startSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 17,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 50,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 45,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 45,
                    },
                  },
                  "type": "Element$1",
                },
                Text$3 {
                  "loc": Object {
                    "end": Object {
                      "column": 10,
                      "line": 4,
                    },
                    "start": Object {
                      "column": 10,
                      "line": 4,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 72,
                    },
                    "fullStart": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 61,
                    },
                    "start": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 72,
                    },
                  },
                  "type": "Text$3",
                  "value": "
                  ",
                },
              ],
              "definedPrefetchTriggers": Array [],
              "definedTriggers": Array [
                "when",
              ],
              "endSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 3,
                  "offset": 73,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 3,
                  "offset": 72,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 3,
                  "offset": 72,
                },
              },
              "error": null,
              "i18n": undefined,
              "loading": null,
              "loc": Object {
                "end": Object {
                  "column": 11,
                  "line": 4,
                },
                "start": Object {
                  "column": 10,
                  "line": 2,
                },
              },
              "mainBlockSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 3,
                  "offset": 73,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "nameSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 17,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 18,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "placeholder": null,
              "prefetchTriggers": Object {},
              "sourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 3,
                  "offset": 73,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "startSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 31,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 32,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "triggers": Object {
                "when": BoundDeferredTrigger {
                  "nameSpan": null,
                  "prefetchSpan": null,
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 29,
                    },
                    "fullStart": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 19,
                    },
                    "start": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 19,
                    },
                  },
                  "value": ASTWithSource {
                    "ast": PropertyRead {
                      "name": "title",
                      "nameSpan": AbsoluteSourceSpan {
                        "end": 29,
                        "start": 24,
                      },
                      "receiver": ImplicitReceiver {
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 24,
                          "start": 24,
                        },
                        "span": ParseSpan {
                          "end": 0,
                          "start": 0,
                        },
                      },
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 29,
                        "start": 24,
                      },
                      "span": ParseSpan {
                        "end": 5,
                        "start": 0,
                      },
                    },
                    "errors": Array [],
                    "location": "./foo.html@1:18",
                    "source": "title",
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 29,
                      "start": 24,
                    },
                    "span": ParseSpan {
                      "end": 5,
                      "start": 0,
                    },
                  },
                  "whenOrOnSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 22,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 23,
                    },
                    "fullStart": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 19,
                    },
                    "start": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 19,
                    },
                  },
                },
              },
              "type": "DeferredBlock",
            },
            DeferredBlock {
              "children": Array [
                Text$3 {
                  "loc": Object {
                    "end": Object {
                      "column": 12,
                      "line": 6,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 6,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 120,
                    },
                    "fullStart": ParseLocation {
                      "col": 33,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 107,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 120,
                    },
                  },
                  "type": "Text$3",
                  "value": "
                    ",
                },
                Element$1 {
                  "attributes": Array [],
                  "children": Array [],
                  "endSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 136,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 120,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 120,
                    },
                  },
                  "i18n": undefined,
                  "inputs": Array [],
                  "loc": Object {
                    "end": Object {
                      "column": 28,
                      "line": 6,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 6,
                    },
                  },
                  "name": "calendar-cmp",
                  "outputs": Array [],
                  "references": Array [],
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 136,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 120,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 120,
                    },
                  },
                  "startSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 136,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 120,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 120,
                    },
                  },
                  "type": "Element$1",
                },
                Text$3 {
                  "loc": Object {
                    "end": Object {
                      "column": 10,
                      "line": 7,
                    },
                    "start": Object {
                      "column": 10,
                      "line": 7,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 6,
                      "offset": 147,
                    },
                    "fullStart": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 136,
                    },
                    "start": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 6,
                      "offset": 147,
                    },
                  },
                  "type": "Text$3",
                  "value": "
                  ",
                },
              ],
              "definedPrefetchTriggers": Array [],
              "definedTriggers": Array [
                "immediate",
              ],
              "endSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 8,
                  "offset": 230,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 8,
                  "offset": 229,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 8,
                  "offset": 229,
                },
              },
              "error": null,
              "i18n": undefined,
              "loading": null,
              "loc": Object {
                "end": Object {
                  "column": 11,
                  "line": 9,
                },
                "start": Object {
                  "column": 10,
                  "line": 5,
                },
              },
              "mainBlockSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 6,
                  "offset": 148,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 4,
                  "offset": 84,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 4,
                  "offset": 84,
                },
              },
              "nameSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 17,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 4,
                  "offset": 91,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 4,
                  "offset": 84,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 4,
                  "offset": 84,
                },
              },
              "placeholder": DeferredBlockPlaceholder {
                "children": Array [
                  Text$3 {
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 192,
                      },
                      "fullStart": ParseLocation {
                        "col": 42,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 6,
                        "offset": 179,
                      },
                      "start": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 192,
                      },
                    },
                    "value": "
                    ",
                  },
                  Element$1 {
                    "attributes": Array [],
                    "children": Array [
                      Text$3 {
                        "sourceSpan": ParseSourceSpan {
                          "details": null,
                          "end": ParseLocation {
                            "col": 34,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 7,
                            "offset": 214,
                          },
                          "fullStart": ParseLocation {
                            "col": 15,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 7,
                            "offset": 195,
                          },
                          "start": ParseLocation {
                            "col": 15,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 7,
                            "offset": 195,
                          },
                        },
                        "value": "Placeholder content",
                      },
                    ],
                    "endSourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 38,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 218,
                      },
                      "fullStart": ParseLocation {
                        "col": 34,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 214,
                      },
                      "start": ParseLocation {
                        "col": 34,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 214,
                      },
                    },
                    "i18n": undefined,
                    "inputs": Array [],
                    "name": "p",
                    "outputs": Array [],
                    "references": Array [],
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 38,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 218,
                      },
                      "fullStart": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 192,
                      },
                      "start": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 192,
                      },
                    },
                    "startSourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 15,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 195,
                      },
                      "fullStart": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 192,
                      },
                      "start": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 192,
                      },
                    },
                  },
                  Text$3 {
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 10,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 8,
                        "offset": 229,
                      },
                      "fullStart": ParseLocation {
                        "col": 38,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 7,
                        "offset": 218,
                      },
                      "start": ParseLocation {
                        "col": 10,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 8,
                        "offset": 229,
                      },
                    },
                    "value": "
                  ",
                  },
                ],
                "endSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 11,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 8,
                    "offset": 230,
                  },
                  "fullStart": ParseLocation {
                    "col": 10,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 8,
                    "offset": 229,
                  },
                  "start": ParseLocation {
                    "col": 10,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 8,
                    "offset": 229,
                  },
                },
                "i18n": undefined,
                "minimumTime": 500,
                "nameSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 25,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 6,
                    "offset": 162,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 6,
                    "offset": 149,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 6,
                    "offset": 149,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 11,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 8,
                    "offset": 230,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 6,
                    "offset": 149,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 6,
                    "offset": 149,
                  },
                },
                "startSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 42,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 6,
                    "offset": 179,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 6,
                    "offset": 149,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 6,
                    "offset": 149,
                  },
                },
              },
              "prefetchTriggers": Object {},
              "sourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 8,
                  "offset": 230,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 4,
                  "offset": 84,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 4,
                  "offset": 84,
                },
              },
              "startSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 33,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 4,
                  "offset": 107,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 4,
                  "offset": 84,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 4,
                  "offset": 84,
                },
              },
              "triggers": Object {
                "immediate": ImmediateDeferredTrigger {
                  "nameSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 30,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 104,
                    },
                    "fullStart": ParseLocation {
                      "col": 21,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 95,
                    },
                    "start": ParseLocation {
                      "col": 21,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 95,
                    },
                  },
                  "prefetchSpan": null,
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 30,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 104,
                    },
                    "fullStart": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 92,
                    },
                    "start": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 92,
                    },
                  },
                  "whenOrOnSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 20,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 94,
                    },
                    "fullStart": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 92,
                    },
                    "start": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 92,
                    },
                  },
                },
              },
              "type": "DeferredBlock",
            },
            DeferredBlock {
              "children": Array [
                Text$3 {
                  "loc": Object {
                    "end": Object {
                      "column": 12,
                      "line": 11,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 11,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 262,
                    },
                    "fullStart": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 9,
                      "offset": 249,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 262,
                    },
                  },
                  "type": "Text$3",
                  "value": "
                    ",
                },
                Element$1 {
                  "attributes": Array [],
                  "children": Array [],
                  "endSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 31,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 281,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 262,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 262,
                    },
                  },
                  "i18n": undefined,
                  "inputs": Array [],
                  "loc": Object {
                    "end": Object {
                      "column": 31,
                      "line": 11,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 11,
                    },
                  },
                  "name": "large-component",
                  "outputs": Array [],
                  "references": Array [],
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 31,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 281,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 262,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 262,
                    },
                  },
                  "startSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 31,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 281,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 262,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 262,
                    },
                  },
                  "type": "Element$1",
                },
                Text$3 {
                  "loc": Object {
                    "end": Object {
                      "column": 10,
                      "line": 12,
                    },
                    "start": Object {
                      "column": 10,
                      "line": 12,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 11,
                      "offset": 292,
                    },
                    "fullStart": ParseLocation {
                      "col": 31,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 281,
                    },
                    "start": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 11,
                      "offset": 292,
                    },
                  },
                  "type": "Text$3",
                  "value": "
                  ",
                },
              ],
              "definedPrefetchTriggers": Array [],
              "definedTriggers": Array [],
              "endSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 13,
                  "offset": 397,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 13,
                  "offset": 396,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 13,
                  "offset": 396,
                },
              },
              "error": null,
              "i18n": undefined,
              "loading": DeferredBlockLoading {
                "afterTime": 100,
                "children": Array [
                  Text$3 {
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 343,
                      },
                      "fullStart": ParseLocation {
                        "col": 48,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 11,
                        "offset": 330,
                      },
                      "start": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 343,
                      },
                    },
                    "value": "
                    ",
                  },
                  Element$1 {
                    "attributes": Array [
                      TextAttribute {
                        "i18n": undefined,
                        "keySpan": ParseSourceSpan {
                          "details": null,
                          "end": ParseLocation {
                            "col": 20,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 351,
                          },
                          "fullStart": ParseLocation {
                            "col": 17,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 348,
                          },
                          "start": ParseLocation {
                            "col": 17,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 348,
                          },
                        },
                        "name": "alt",
                        "sourceSpan": ParseSourceSpan {
                          "details": null,
                          "end": ParseLocation {
                            "col": 33,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 364,
                          },
                          "fullStart": ParseLocation {
                            "col": 17,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 348,
                          },
                          "start": ParseLocation {
                            "col": 17,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 348,
                          },
                        },
                        "value": "loading...",
                        "valueSpan": ParseSourceSpan {
                          "details": null,
                          "end": ParseLocation {
                            "col": 32,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 363,
                          },
                          "fullStart": ParseLocation {
                            "col": 22,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 353,
                          },
                          "start": ParseLocation {
                            "col": 22,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 353,
                          },
                        },
                      },
                      TextAttribute {
                        "i18n": undefined,
                        "keySpan": ParseSourceSpan {
                          "details": null,
                          "end": ParseLocation {
                            "col": 37,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 368,
                          },
                          "fullStart": ParseLocation {
                            "col": 34,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 365,
                          },
                          "start": ParseLocation {
                            "col": 34,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 365,
                          },
                        },
                        "name": "src",
                        "sourceSpan": ParseSourceSpan {
                          "details": null,
                          "end": ParseLocation {
                            "col": 51,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 382,
                          },
                          "fullStart": ParseLocation {
                            "col": 34,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 365,
                          },
                          "start": ParseLocation {
                            "col": 34,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 365,
                          },
                        },
                        "value": "loading.gif",
                        "valueSpan": ParseSourceSpan {
                          "details": null,
                          "end": ParseLocation {
                            "col": 50,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 381,
                          },
                          "fullStart": ParseLocation {
                            "col": 39,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 370,
                          },
                          "start": ParseLocation {
                            "col": 39,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 12,
                            "offset": 370,
                          },
                        },
                      },
                    ],
                    "children": Array [],
                    "endSourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 54,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 385,
                      },
                      "fullStart": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 343,
                      },
                      "start": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 343,
                      },
                    },
                    "i18n": undefined,
                    "inputs": Array [],
                    "name": "img",
                    "outputs": Array [],
                    "references": Array [],
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 54,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 385,
                      },
                      "fullStart": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 343,
                      },
                      "start": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 343,
                      },
                    },
                    "startSourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 54,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 385,
                      },
                      "fullStart": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 343,
                      },
                      "start": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 343,
                      },
                    },
                  },
                  Text$3 {
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 10,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 13,
                        "offset": 396,
                      },
                      "fullStart": ParseLocation {
                        "col": 54,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 12,
                        "offset": 385,
                      },
                      "start": ParseLocation {
                        "col": 10,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 13,
                        "offset": 396,
                      },
                    },
                    "value": "
                  ",
                  },
                ],
                "endSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 11,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 13,
                    "offset": 397,
                  },
                  "fullStart": ParseLocation {
                    "col": 10,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 13,
                    "offset": 396,
                  },
                  "start": ParseLocation {
                    "col": 10,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 13,
                    "offset": 396,
                  },
                },
                "i18n": undefined,
                "minimumTime": 1000,
                "nameSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 21,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 303,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 294,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 294,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 11,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 13,
                    "offset": 397,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 294,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 294,
                  },
                },
                "startSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 48,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 330,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 294,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 11,
                    "offset": 294,
                  },
                },
              },
              "loc": Object {
                "end": Object {
                  "column": 11,
                  "line": 14,
                },
                "start": Object {
                  "column": 10,
                  "line": 10,
                },
              },
              "mainBlockSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 11,
                  "offset": 293,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 9,
                  "offset": 241,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 9,
                  "offset": 241,
                },
              },
              "nameSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 17,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 9,
                  "offset": 248,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 9,
                  "offset": 241,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 9,
                  "offset": 241,
                },
              },
              "placeholder": null,
              "prefetchTriggers": Object {},
              "sourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 13,
                  "offset": 397,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 9,
                  "offset": 241,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 9,
                  "offset": 241,
                },
              },
              "startSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 18,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 9,
                  "offset": 249,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 9,
                  "offset": 241,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 9,
                  "offset": 241,
                },
              },
              "triggers": Object {},
              "type": "DeferredBlock",
            },
            DeferredBlock {
              "children": Array [
                Text$3 {
                  "loc": Object {
                    "end": Object {
                      "column": 12,
                      "line": 16,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 16,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 429,
                    },
                    "fullStart": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 14,
                      "offset": 416,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 429,
                    },
                  },
                  "type": "Text$3",
                  "value": "
                    ",
                },
                Element$1 {
                  "attributes": Array [],
                  "children": Array [],
                  "endSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 445,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 429,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 429,
                    },
                  },
                  "i18n": undefined,
                  "inputs": Array [],
                  "loc": Object {
                    "end": Object {
                      "column": 28,
                      "line": 16,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 16,
                    },
                  },
                  "name": "calendar-cmp",
                  "outputs": Array [],
                  "references": Array [],
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 445,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 429,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 429,
                    },
                  },
                  "startSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 445,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 429,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 429,
                    },
                  },
                  "type": "Element$1",
                },
                Text$3 {
                  "loc": Object {
                    "end": Object {
                      "column": 10,
                      "line": 17,
                    },
                    "start": Object {
                      "column": 10,
                      "line": 17,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 16,
                      "offset": 456,
                    },
                    "fullStart": ParseLocation {
                      "col": 28,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 15,
                      "offset": 445,
                    },
                    "start": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                        "url": "./foo.html",
                      },
                      "line": 16,
                      "offset": 456,
                    },
                  },
                  "type": "Text$3",
                  "value": "
                  ",
                },
              ],
              "definedPrefetchTriggers": Array [],
              "definedTriggers": Array [],
              "endSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 18,
                  "offset": 525,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 18,
                  "offset": 524,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 18,
                  "offset": 524,
                },
              },
              "error": DeferredBlockError {
                "children": Array [
                  Text$3 {
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 479,
                      },
                      "fullStart": ParseLocation {
                        "col": 20,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 16,
                        "offset": 466,
                      },
                      "start": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 479,
                      },
                    },
                    "value": "
                    ",
                  },
                  Element$1 {
                    "attributes": Array [],
                    "children": Array [
                      Text$3 {
                        "sourceSpan": ParseSourceSpan {
                          "details": null,
                          "end": ParseLocation {
                            "col": 42,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 17,
                            "offset": 509,
                          },
                          "fullStart": ParseLocation {
                            "col": 15,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 17,
                            "offset": 482,
                          },
                          "start": ParseLocation {
                            "col": 15,
                            "file": ParseSourceFile {
                              "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                              "url": "./foo.html",
                            },
                            "line": 17,
                            "offset": 482,
                          },
                        },
                        "value": "Failed to load the calendar",
                      },
                    ],
                    "endSourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 46,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 513,
                      },
                      "fullStart": ParseLocation {
                        "col": 42,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 509,
                      },
                      "start": ParseLocation {
                        "col": 42,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 509,
                      },
                    },
                    "i18n": undefined,
                    "inputs": Array [],
                    "name": "p",
                    "outputs": Array [],
                    "references": Array [],
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 46,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 513,
                      },
                      "fullStart": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 479,
                      },
                      "start": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 479,
                      },
                    },
                    "startSourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 15,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 482,
                      },
                      "fullStart": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 479,
                      },
                      "start": ParseLocation {
                        "col": 12,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 479,
                      },
                    },
                  },
                  Text$3 {
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 10,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 18,
                        "offset": 524,
                      },
                      "fullStart": ParseLocation {
                        "col": 46,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 17,
                        "offset": 513,
                      },
                      "start": ParseLocation {
                        "col": 10,
                        "file": ParseSourceFile {
                          "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                          "url": "./foo.html",
                        },
                        "line": 18,
                        "offset": 524,
                      },
                    },
                    "value": "
                  ",
                  },
                ],
                "endSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 11,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 18,
                    "offset": 525,
                  },
                  "fullStart": ParseLocation {
                    "col": 10,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 18,
                    "offset": 524,
                  },
                  "start": ParseLocation {
                    "col": 10,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 18,
                    "offset": 524,
                  },
                },
                "i18n": undefined,
                "nameSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 19,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 16,
                    "offset": 465,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 16,
                    "offset": 458,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 16,
                    "offset": 458,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 11,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 18,
                    "offset": 525,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 16,
                    "offset": 458,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 16,
                    "offset": 458,
                  },
                },
                "startSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 20,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 16,
                    "offset": 466,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 16,
                    "offset": 458,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                      "url": "./foo.html",
                    },
                    "line": 16,
                    "offset": 458,
                  },
                },
              },
              "i18n": undefined,
              "loading": null,
              "loc": Object {
                "end": Object {
                  "column": 11,
                  "line": 19,
                },
                "start": Object {
                  "column": 10,
                  "line": 15,
                },
              },
              "mainBlockSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 16,
                  "offset": 457,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 14,
                  "offset": 408,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 14,
                  "offset": 408,
                },
              },
              "nameSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 17,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 14,
                  "offset": 415,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 14,
                  "offset": 408,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 14,
                  "offset": 408,
                },
              },
              "placeholder": null,
              "prefetchTriggers": Object {},
              "sourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 18,
                  "offset": 525,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 14,
                  "offset": 408,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 14,
                  "offset": 408,
                },
              },
              "startSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 18,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 14,
                  "offset": 416,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 14,
                  "offset": 408,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
                    "url": "./foo.html",
                  },
                  "line": 14,
                  "offset": 408,
                },
              },
              "triggers": Object {},
              "type": "DeferredBlock",
            },
          ],
          "tokens": Array [],
          "type": "Program",
          "value": "
                  @defer (when title) {
                    <div>Hello</div>
                  }
                  @defer (on immediate) {
                    <calendar-cmp />
                  } @placeholder (minimum 500ms) {
                    <p>Placeholder content</p>
                  }
                  @defer {
                    <large-component />
                  } @loading (after 100ms; minimum 1s) {
                    <img alt=\\"loading...\\" src=\\"loading.gif\\" />
                  }
                  @defer {
                    <calendar-cmp />
                  } @error {
                    <p>Failed to load the calendar</p>
                  }        
              ",
        }
      `);
    });
  });
});
