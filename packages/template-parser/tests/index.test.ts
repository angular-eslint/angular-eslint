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
              "prefetchTriggers": Object {
                "type": "Object",
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
                "type": "Object",
                "when": BoundDeferredTrigger {
                  "loc": Object {
                    "end": Object {
                      "column": 28,
                      "line": 2,
                    },
                    "start": Object {
                      "column": 18,
                      "line": 2,
                    },
                  },
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
                  "type": "BoundDeferredTrigger",
                  "value": ASTWithSource {
                    "ast": PropertyRead {
                      "loc": Object {
                        "end": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                        "start": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                      },
                      "name": "title",
                      "nameSpan": AbsoluteSourceSpan {
                        "end": 29,
                        "start": 24,
                      },
                      "receiver": ImplicitReceiver {
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 24,
                          "start": 24,
                        },
                        "span": ParseSpan {
                          "end": 0,
                          "start": 0,
                        },
                        "type": "ImplicitReceiver",
                      },
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 29,
                        "start": 24,
                      },
                      "span": ParseSpan {
                        "end": 5,
                        "start": 0,
                      },
                      "type": "PropertyRead",
                    },
                    "errors": Array [],
                    "loc": Object {
                      "end": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                      "start": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                    },
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
                    "type": "ASTWithSource",
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
                    "loc": Object {
                      "end": Object {
                        "column": 12,
                        "line": 8,
                      },
                      "start": Object {
                        "column": 12,
                        "line": 8,
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
                            "column": 34,
                            "line": 8,
                          },
                          "start": Object {
                            "column": 15,
                            "line": 8,
                          },
                        },
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
                        "type": "Text$3",
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
                    "loc": Object {
                      "end": Object {
                        "column": 38,
                        "line": 8,
                      },
                      "start": Object {
                        "column": 12,
                        "line": 8,
                      },
                    },
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
                    "type": "Element$1",
                  },
                  Text$3 {
                    "loc": Object {
                      "end": Object {
                        "column": 10,
                        "line": 9,
                      },
                      "start": Object {
                        "column": 10,
                        "line": 9,
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
                    "type": "Text$3",
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
                "loc": Object {
                  "end": Object {
                    "column": 11,
                    "line": 9,
                  },
                  "start": Object {
                    "column": 12,
                    "line": 7,
                  },
                },
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
                "type": "DeferredBlockPlaceholder",
              },
              "prefetchTriggers": Object {
                "type": "Object",
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
                "type": "Object",
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
                    "loc": Object {
                      "end": Object {
                        "column": 12,
                        "line": 13,
                      },
                      "start": Object {
                        "column": 12,
                        "line": 13,
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
                    "type": "Text$3",
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
                        "loc": Object {
                          "end": Object {
                            "column": 33,
                            "line": 13,
                          },
                          "start": Object {
                            "column": 17,
                            "line": 13,
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
                        "type": "TextAttribute",
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
                        "loc": Object {
                          "end": Object {
                            "column": 51,
                            "line": 13,
                          },
                          "start": Object {
                            "column": 34,
                            "line": 13,
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
                        "type": "TextAttribute",
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
                    "loc": Object {
                      "end": Object {
                        "column": 54,
                        "line": 13,
                      },
                      "start": Object {
                        "column": 12,
                        "line": 13,
                      },
                    },
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
                    "type": "Element$1",
                  },
                  Text$3 {
                    "loc": Object {
                      "end": Object {
                        "column": 10,
                        "line": 14,
                      },
                      "start": Object {
                        "column": 10,
                        "line": 14,
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
                    "type": "Text$3",
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
                "loc": Object {
                  "end": Object {
                    "column": 11,
                    "line": 14,
                  },
                  "start": Object {
                    "column": 12,
                    "line": 12,
                  },
                },
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
                "type": "DeferredBlockLoading",
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
              "prefetchTriggers": Object {
                "type": "Object",
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
              "triggers": Object {
                "type": "Object",
              },
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
                    "loc": Object {
                      "end": Object {
                        "column": 12,
                        "line": 18,
                      },
                      "start": Object {
                        "column": 12,
                        "line": 18,
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
                            "column": 42,
                            "line": 18,
                          },
                          "start": Object {
                            "column": 15,
                            "line": 18,
                          },
                        },
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
                        "type": "Text$3",
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
                    "loc": Object {
                      "end": Object {
                        "column": 46,
                        "line": 18,
                      },
                      "start": Object {
                        "column": 12,
                        "line": 18,
                      },
                    },
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
                    "type": "Element$1",
                  },
                  Text$3 {
                    "loc": Object {
                      "end": Object {
                        "column": 10,
                        "line": 19,
                      },
                      "start": Object {
                        "column": 10,
                        "line": 19,
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
                    "type": "Text$3",
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
                "loc": Object {
                  "end": Object {
                    "column": 11,
                    "line": 19,
                  },
                  "start": Object {
                    "column": 12,
                    "line": 17,
                  },
                },
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
                "type": "DeferredBlockError",
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
              "prefetchTriggers": Object {
                "type": "Object",
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
              "triggers": Object {
                "type": "Object",
              },
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

  describe('@if', () => {
    it('should support the different variants of @if', () => {
      expect(
        parseForESLint(
          `
          @if (a > b) {
            {{a}} is greater than {{b}}
          } @else if (b > a) {
            {{a}} is less than {{b}}
          } @else {
            {{a}} is equal to {{b}}
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
              "line": 8,
            },
            "start": Object {
              "column": 10,
              "line": 2,
            },
          },
          "range": Array [
            11,
            200,
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
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
            IfBlock {
              "branches": Array [
                IfBlockBranch {
                  "children": Array [
                    BoundText {
                      "i18n": undefined,
                      "loc": Object {
                        "end": Object {
                          "column": 10,
                          "line": 4,
                        },
                        "start": Object {
                          "column": 12,
                          "line": 3,
                        },
                      },
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 10,
                          "file": ParseSourceFile {
                            "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 75,
                        },
                        "fullStart": ParseLocation {
                          "col": 23,
                          "file": ParseSourceFile {
                            "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 1,
                          "offset": 24,
                        },
                        "start": ParseLocation {
                          "col": 12,
                          "file": ParseSourceFile {
                            "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 2,
                          "offset": 37,
                        },
                      },
                      "type": "BoundText",
                      "value": ASTWithSource {
                        "ast": Interpolation$1 {
                          "expressions": Array [
                            PropertyRead {
                              "loc": Object {
                                "end": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                                "start": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                              },
                              "name": "a",
                              "nameSpan": AbsoluteSourceSpan {
                                "end": 40,
                                "start": 39,
                              },
                              "receiver": ImplicitReceiver {
                                "loc": Object {
                                  "end": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                  "start": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 39,
                                  "start": 39,
                                },
                                "span": ParseSpan {
                                  "end": 15,
                                  "start": 15,
                                },
                                "type": "ImplicitReceiver",
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 40,
                                "start": 39,
                              },
                              "span": ParseSpan {
                                "end": 16,
                                "start": 15,
                              },
                              "type": "PropertyRead",
                            },
                            PropertyRead {
                              "loc": Object {
                                "end": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                                "start": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                              },
                              "name": "b",
                              "nameSpan": AbsoluteSourceSpan {
                                "end": 62,
                                "start": 61,
                              },
                              "receiver": ImplicitReceiver {
                                "loc": Object {
                                  "end": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                  "start": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 61,
                                  "start": 61,
                                },
                                "span": ParseSpan {
                                  "end": 37,
                                  "start": 37,
                                },
                                "type": "ImplicitReceiver",
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 62,
                                "start": 61,
                              },
                              "span": ParseSpan {
                                "end": 38,
                                "start": 37,
                              },
                              "type": "PropertyRead",
                            },
                          ],
                          "loc": Object {
                            "end": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                            "start": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 75,
                            "start": 24,
                          },
                          "span": ParseSpan {
                            "end": 51,
                            "start": 0,
                          },
                          "strings": Array [
                            "
                    ",
                            " is greater than ",
                            "
                  ",
                          ],
                          "type": "Interpolation$1",
                        },
                        "errors": Array [],
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "location": "./foo.html@2:12",
                        "source": "
                    {{a}} is greater than {{b}}
                  ",
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 75,
                          "start": 24,
                        },
                        "span": ParseSpan {
                          "end": 51,
                          "start": 0,
                        },
                        "type": "ASTWithSource",
                      },
                    },
                  ],
                  "endSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 11,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 76,
                    },
                    "fullStart": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 75,
                    },
                    "start": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 75,
                    },
                  },
                  "expression": ASTWithSource {
                    "ast": Binary {
                      "left": PropertyRead {
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "name": "a",
                        "nameSpan": AbsoluteSourceSpan {
                          "end": 17,
                          "start": 16,
                        },
                        "receiver": ImplicitReceiver {
                          "loc": Object {
                            "end": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                            "start": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 16,
                            "start": 16,
                          },
                          "span": ParseSpan {
                            "end": 0,
                            "start": 0,
                          },
                          "type": "ImplicitReceiver",
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 17,
                          "start": 16,
                        },
                        "span": ParseSpan {
                          "end": 1,
                          "start": 0,
                        },
                        "type": "PropertyRead",
                      },
                      "loc": Object {
                        "end": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                        "start": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                      },
                      "operation": ">",
                      "right": PropertyRead {
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "name": "b",
                        "nameSpan": AbsoluteSourceSpan {
                          "end": 21,
                          "start": 20,
                        },
                        "receiver": ImplicitReceiver {
                          "loc": Object {
                            "end": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                            "start": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 20,
                            "start": 19,
                          },
                          "span": ParseSpan {
                            "end": 4,
                            "start": 3,
                          },
                          "type": "ImplicitReceiver",
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 21,
                          "start": 20,
                        },
                        "span": ParseSpan {
                          "end": 5,
                          "start": 4,
                        },
                        "type": "PropertyRead",
                      },
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 21,
                        "start": 16,
                      },
                      "span": ParseSpan {
                        "end": 5,
                        "start": 0,
                      },
                      "type": "Binary",
                    },
                    "errors": Array [],
                    "loc": Object {
                      "end": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                      "start": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                    },
                    "location": "./foo.html@1:15",
                    "source": "a > b",
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 21,
                      "start": 16,
                    },
                    "span": ParseSpan {
                      "end": 5,
                      "start": 0,
                    },
                    "type": "ASTWithSource",
                  },
                  "expressionAlias": null,
                  "i18n": undefined,
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
                  "nameSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 14,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 15,
                    },
                    "fullStart": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 11,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 11,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 76,
                    },
                    "fullStart": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
                      "col": 23,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 24,
                    },
                    "fullStart": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 11,
                    },
                  },
                  "type": "IfBlockBranch",
                },
                IfBlockBranch {
                  "children": Array [
                    BoundText {
                      "i18n": undefined,
                      "loc": Object {
                        "end": Object {
                          "column": 10,
                          "line": 6,
                        },
                        "start": Object {
                          "column": 12,
                          "line": 5,
                        },
                      },
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 10,
                          "file": ParseSourceFile {
                            "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 5,
                          "offset": 143,
                        },
                        "fullStart": ParseLocation {
                          "col": 30,
                          "file": ParseSourceFile {
                            "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 95,
                        },
                        "start": ParseLocation {
                          "col": 12,
                          "file": ParseSourceFile {
                            "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 4,
                          "offset": 108,
                        },
                      },
                      "type": "BoundText",
                      "value": ASTWithSource {
                        "ast": Interpolation$1 {
                          "expressions": Array [
                            PropertyRead {
                              "loc": Object {
                                "end": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                                "start": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                              },
                              "name": "a",
                              "nameSpan": AbsoluteSourceSpan {
                                "end": 111,
                                "start": 110,
                              },
                              "receiver": ImplicitReceiver {
                                "loc": Object {
                                  "end": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                  "start": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 110,
                                  "start": 110,
                                },
                                "span": ParseSpan {
                                  "end": 15,
                                  "start": 15,
                                },
                                "type": "ImplicitReceiver",
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 111,
                                "start": 110,
                              },
                              "span": ParseSpan {
                                "end": 16,
                                "start": 15,
                              },
                              "type": "PropertyRead",
                            },
                            PropertyRead {
                              "loc": Object {
                                "end": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                                "start": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                              },
                              "name": "b",
                              "nameSpan": AbsoluteSourceSpan {
                                "end": 130,
                                "start": 129,
                              },
                              "receiver": ImplicitReceiver {
                                "loc": Object {
                                  "end": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                  "start": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 129,
                                  "start": 129,
                                },
                                "span": ParseSpan {
                                  "end": 34,
                                  "start": 34,
                                },
                                "type": "ImplicitReceiver",
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 130,
                                "start": 129,
                              },
                              "span": ParseSpan {
                                "end": 35,
                                "start": 34,
                              },
                              "type": "PropertyRead",
                            },
                          ],
                          "loc": Object {
                            "end": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                            "start": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 143,
                            "start": 95,
                          },
                          "span": ParseSpan {
                            "end": 48,
                            "start": 0,
                          },
                          "strings": Array [
                            "
                    ",
                            " is less than ",
                            "
                  ",
                          ],
                          "type": "Interpolation$1",
                        },
                        "errors": Array [],
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "location": "./foo.html@4:12",
                        "source": "
                    {{a}} is less than {{b}}
                  ",
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 143,
                          "start": 95,
                        },
                        "span": ParseSpan {
                          "end": 48,
                          "start": 0,
                        },
                        "type": "ASTWithSource",
                      },
                    },
                  ],
                  "endSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 11,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 144,
                    },
                    "fullStart": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 143,
                    },
                    "start": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 143,
                    },
                  },
                  "expression": ASTWithSource {
                    "ast": Binary {
                      "left": PropertyRead {
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "name": "b",
                        "nameSpan": AbsoluteSourceSpan {
                          "end": 88,
                          "start": 87,
                        },
                        "receiver": ImplicitReceiver {
                          "loc": Object {
                            "end": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                            "start": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 87,
                            "start": 87,
                          },
                          "span": ParseSpan {
                            "end": 0,
                            "start": 0,
                          },
                          "type": "ImplicitReceiver",
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 88,
                          "start": 87,
                        },
                        "span": ParseSpan {
                          "end": 1,
                          "start": 0,
                        },
                        "type": "PropertyRead",
                      },
                      "loc": Object {
                        "end": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                        "start": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                      },
                      "operation": ">",
                      "right": PropertyRead {
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "name": "a",
                        "nameSpan": AbsoluteSourceSpan {
                          "end": 92,
                          "start": 91,
                        },
                        "receiver": ImplicitReceiver {
                          "loc": Object {
                            "end": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                            "start": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 91,
                            "start": 90,
                          },
                          "span": ParseSpan {
                            "end": 4,
                            "start": 3,
                          },
                          "type": "ImplicitReceiver",
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 92,
                          "start": 91,
                        },
                        "span": ParseSpan {
                          "end": 5,
                          "start": 4,
                        },
                        "type": "PropertyRead",
                      },
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 92,
                        "start": 87,
                      },
                      "span": ParseSpan {
                        "end": 5,
                        "start": 0,
                      },
                      "type": "Binary",
                    },
                    "errors": Array [],
                    "loc": Object {
                      "end": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                      "start": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                    },
                    "location": "./foo.html@3:22",
                    "source": "b > a",
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 92,
                      "start": 87,
                    },
                    "span": ParseSpan {
                      "end": 5,
                      "start": 0,
                    },
                    "type": "ASTWithSource",
                  },
                  "expressionAlias": null,
                  "i18n": undefined,
                  "loc": Object {
                    "end": Object {
                      "column": 11,
                      "line": 6,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 4,
                    },
                  },
                  "nameSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 21,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 86,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 77,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 77,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 11,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 144,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 77,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 77,
                    },
                  },
                  "startSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 30,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 95,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 77,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 77,
                    },
                  },
                  "type": "IfBlockBranch",
                },
                IfBlockBranch {
                  "children": Array [
                    BoundText {
                      "i18n": undefined,
                      "loc": Object {
                        "end": Object {
                          "column": 10,
                          "line": 8,
                        },
                        "start": Object {
                          "column": 12,
                          "line": 7,
                        },
                      },
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 10,
                          "file": ParseSourceFile {
                            "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 7,
                          "offset": 199,
                        },
                        "fullStart": ParseLocation {
                          "col": 19,
                          "file": ParseSourceFile {
                            "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 5,
                          "offset": 152,
                        },
                        "start": ParseLocation {
                          "col": 12,
                          "file": ParseSourceFile {
                            "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 165,
                        },
                      },
                      "type": "BoundText",
                      "value": ASTWithSource {
                        "ast": Interpolation$1 {
                          "expressions": Array [
                            PropertyRead {
                              "loc": Object {
                                "end": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                                "start": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                              },
                              "name": "a",
                              "nameSpan": AbsoluteSourceSpan {
                                "end": 168,
                                "start": 167,
                              },
                              "receiver": ImplicitReceiver {
                                "loc": Object {
                                  "end": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                  "start": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 167,
                                  "start": 167,
                                },
                                "span": ParseSpan {
                                  "end": 15,
                                  "start": 15,
                                },
                                "type": "ImplicitReceiver",
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 168,
                                "start": 167,
                              },
                              "span": ParseSpan {
                                "end": 16,
                                "start": 15,
                              },
                              "type": "PropertyRead",
                            },
                            PropertyRead {
                              "loc": Object {
                                "end": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                                "start": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                              },
                              "name": "b",
                              "nameSpan": AbsoluteSourceSpan {
                                "end": 186,
                                "start": 185,
                              },
                              "receiver": ImplicitReceiver {
                                "loc": Object {
                                  "end": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                  "start": Object {
                                    "column": undefined,
                                    "line": NaN,
                                  },
                                },
                                "sourceSpan": AbsoluteSourceSpan {
                                  "end": 185,
                                  "start": 185,
                                },
                                "span": ParseSpan {
                                  "end": 33,
                                  "start": 33,
                                },
                                "type": "ImplicitReceiver",
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 186,
                                "start": 185,
                              },
                              "span": ParseSpan {
                                "end": 34,
                                "start": 33,
                              },
                              "type": "PropertyRead",
                            },
                          ],
                          "loc": Object {
                            "end": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                            "start": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 199,
                            "start": 152,
                          },
                          "span": ParseSpan {
                            "end": 47,
                            "start": 0,
                          },
                          "strings": Array [
                            "
                    ",
                            " is equal to ",
                            "
                  ",
                          ],
                          "type": "Interpolation$1",
                        },
                        "errors": Array [],
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "location": "./foo.html@6:12",
                        "source": "
                    {{a}} is equal to {{b}}
                  ",
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 199,
                          "start": 152,
                        },
                        "span": ParseSpan {
                          "end": 47,
                          "start": 0,
                        },
                        "type": "ASTWithSource",
                      },
                    },
                  ],
                  "endSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 11,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 7,
                      "offset": 200,
                    },
                    "fullStart": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 7,
                      "offset": 199,
                    },
                    "start": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 7,
                      "offset": 199,
                    },
                  },
                  "expression": null,
                  "expressionAlias": null,
                  "i18n": undefined,
                  "loc": Object {
                    "end": Object {
                      "column": 11,
                      "line": 8,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 6,
                    },
                  },
                  "nameSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 151,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 145,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 145,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 11,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 7,
                      "offset": 200,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 145,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 145,
                    },
                  },
                  "startSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 19,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 152,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 145,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 145,
                    },
                  },
                  "type": "IfBlockBranch",
                },
              ],
              "endSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 7,
                  "offset": 200,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 7,
                  "offset": 199,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 7,
                  "offset": 199,
                },
              },
              "loc": Object {
                "end": Object {
                  "column": 11,
                  "line": 8,
                },
                "start": Object {
                  "column": 10,
                  "line": 2,
                },
              },
              "nameSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 14,
                  "file": ParseSourceFile {
                    "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 15,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "sourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 7,
                  "offset": 200,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
                  "col": 23,
                  "file": ParseSourceFile {
                    "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 24,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
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
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "type": "IfBlock",
            },
          ],
          "tokens": Array [],
          "type": "Program",
          "value": "
                  @if (a > b) {
                    {{a}} is greater than {{b}}
                  } @else if (b > a) {
                    {{a}} is less than {{b}}
                  } @else {
                    {{a}} is equal to {{b}}
                  }
              ",
        }
      `);
    });
  });

  describe('@for', () => {
    it('should support the different variants of @for', () => {
      expect(
        parseForESLint(
          `
          @for (item of items; track item.id) {
            {{ item.name }}
          } @empty {
             There are no items.
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
              "line": 6,
            },
            "start": Object {
              "column": 10,
              "line": 2,
            },
          },
          "range": Array [
            11,
            142,
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
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
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
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
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
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
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
            ForLoopBlock {
              "children": Array [
                BoundText {
                  "i18n": undefined,
                  "loc": Object {
                    "end": Object {
                      "column": 10,
                      "line": 4,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 3,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 10,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 3,
                      "offset": 87,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 61,
                    },
                  },
                  "type": "BoundText",
                  "value": ASTWithSource {
                    "ast": Interpolation$1 {
                      "expressions": Array [
                        PropertyRead {
                          "loc": Object {
                            "end": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                            "start": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                          },
                          "name": "name",
                          "nameSpan": AbsoluteSourceSpan {
                            "end": 73,
                            "start": 69,
                          },
                          "receiver": PropertyRead {
                            "loc": Object {
                              "end": Object {
                                "column": undefined,
                                "line": NaN,
                              },
                              "start": Object {
                                "column": undefined,
                                "line": NaN,
                              },
                            },
                            "name": "item",
                            "nameSpan": AbsoluteSourceSpan {
                              "end": 68,
                              "start": 64,
                            },
                            "receiver": ImplicitReceiver {
                              "loc": Object {
                                "end": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                                "start": Object {
                                  "column": undefined,
                                  "line": NaN,
                                },
                              },
                              "sourceSpan": AbsoluteSourceSpan {
                                "end": 64,
                                "start": 64,
                              },
                              "span": ParseSpan {
                                "end": 16,
                                "start": 16,
                              },
                              "type": "ImplicitReceiver",
                            },
                            "sourceSpan": AbsoluteSourceSpan {
                              "end": 68,
                              "start": 64,
                            },
                            "span": ParseSpan {
                              "end": 20,
                              "start": 16,
                            },
                            "type": "PropertyRead",
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 73,
                            "start": 64,
                          },
                          "span": ParseSpan {
                            "end": 25,
                            "start": 16,
                          },
                          "type": "PropertyRead",
                        },
                      ],
                      "loc": Object {
                        "end": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                        "start": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                      },
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 87,
                        "start": 48,
                      },
                      "span": ParseSpan {
                        "end": 39,
                        "start": 0,
                      },
                      "strings": Array [
                        "
                    ",
                        "
                  ",
                      ],
                      "type": "Interpolation$1",
                    },
                    "errors": Array [],
                    "loc": Object {
                      "end": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                      "start": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                    },
                    "location": "./foo.html@2:12",
                    "source": "
                    {{ item.name }}
                  ",
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 87,
                      "start": 48,
                    },
                    "span": ParseSpan {
                      "end": 39,
                      "start": 0,
                    },
                    "type": "ASTWithSource",
                  },
                },
              ],
              "contextVariables": Array [
                Variable {
                  "keySpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "name": "$index",
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "value": "$index",
                  "valueSpan": undefined,
                },
                Variable {
                  "keySpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "name": "$first",
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "value": "$first",
                  "valueSpan": undefined,
                },
                Variable {
                  "keySpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "name": "$last",
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "value": "$last",
                  "valueSpan": undefined,
                },
                Variable {
                  "keySpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "name": "$even",
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "value": "$even",
                  "valueSpan": undefined,
                },
                Variable {
                  "keySpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "name": "$odd",
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "value": "$odd",
                  "valueSpan": undefined,
                },
                Variable {
                  "keySpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "name": "$count",
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "fullStart": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                    "start": ParseLocation {
                      "col": 47,
                      "file": ParseSourceFile {
                        "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 1,
                      "offset": 48,
                    },
                  },
                  "value": "$count",
                  "valueSpan": undefined,
                },
              ],
              "empty": ForLoopBlockEmpty {
                "children": Array [
                  Text$3 {
                    "loc": Object {
                      "end": Object {
                        "column": 10,
                        "line": 6,
                      },
                      "start": Object {
                        "column": 13,
                        "line": 5,
                      },
                    },
                    "sourceSpan": ParseSourceSpan {
                      "details": null,
                      "end": ParseLocation {
                        "col": 10,
                        "file": ParseSourceFile {
                          "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                          "url": "./foo.html",
                        },
                        "line": 5,
                        "offset": 141,
                      },
                      "fullStart": ParseLocation {
                        "col": 20,
                        "file": ParseSourceFile {
                          "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                          "url": "./foo.html",
                        },
                        "line": 3,
                        "offset": 97,
                      },
                      "start": ParseLocation {
                        "col": 13,
                        "file": ParseSourceFile {
                          "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                          "url": "./foo.html",
                        },
                        "line": 4,
                        "offset": 111,
                      },
                    },
                    "type": "Text$3",
                    "value": "
                     There are no items.
                  ",
                  },
                ],
                "endSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 11,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 5,
                    "offset": 142,
                  },
                  "fullStart": ParseLocation {
                    "col": 10,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 5,
                    "offset": 141,
                  },
                  "start": ParseLocation {
                    "col": 10,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 5,
                    "offset": 141,
                  },
                },
                "i18n": undefined,
                "loc": Object {
                  "end": Object {
                    "column": 11,
                    "line": 6,
                  },
                  "start": Object {
                    "column": 12,
                    "line": 4,
                  },
                },
                "nameSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 19,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 96,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 89,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 89,
                  },
                },
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 11,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 5,
                    "offset": 142,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 89,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 89,
                  },
                },
                "startSourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 20,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 97,
                  },
                  "fullStart": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 89,
                  },
                  "start": ParseLocation {
                    "col": 12,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 3,
                    "offset": 89,
                  },
                },
                "type": "ForLoopBlockEmpty",
              },
              "endSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 5,
                  "offset": 142,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 5,
                  "offset": 141,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 5,
                  "offset": 141,
                },
              },
              "expression": ASTWithSource {
                "ast": PropertyRead {
                  "loc": Object {
                    "end": Object {
                      "column": undefined,
                      "line": NaN,
                    },
                    "start": Object {
                      "column": undefined,
                      "line": NaN,
                    },
                  },
                  "name": "items",
                  "nameSpan": AbsoluteSourceSpan {
                    "end": 30,
                    "start": 25,
                  },
                  "receiver": ImplicitReceiver {
                    "loc": Object {
                      "end": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                      "start": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                    },
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 25,
                      "start": 25,
                    },
                    "span": ParseSpan {
                      "end": 0,
                      "start": 0,
                    },
                    "type": "ImplicitReceiver",
                  },
                  "sourceSpan": AbsoluteSourceSpan {
                    "end": 30,
                    "start": 25,
                  },
                  "span": ParseSpan {
                    "end": 5,
                    "start": 0,
                  },
                  "type": "PropertyRead",
                },
                "errors": Array [],
                "loc": Object {
                  "end": Object {
                    "column": undefined,
                    "line": NaN,
                  },
                  "start": Object {
                    "column": undefined,
                    "line": NaN,
                  },
                },
                "location": "./foo.html@1:16",
                "source": "items",
                "sourceSpan": AbsoluteSourceSpan {
                  "end": 30,
                  "start": 25,
                },
                "span": ParseSpan {
                  "end": 5,
                  "start": 0,
                },
                "type": "ASTWithSource",
              },
              "i18n": undefined,
              "item": Variable {
                "keySpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 20,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 21,
                  },
                  "fullStart": ParseLocation {
                    "col": 16,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 17,
                  },
                  "start": ParseLocation {
                    "col": 16,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 17,
                  },
                },
                "name": "item",
                "sourceSpan": ParseSourceSpan {
                  "details": null,
                  "end": ParseLocation {
                    "col": 20,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 21,
                  },
                  "fullStart": ParseLocation {
                    "col": 16,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 17,
                  },
                  "start": ParseLocation {
                    "col": 16,
                    "file": ParseSourceFile {
                      "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                      "url": "./foo.html",
                    },
                    "line": 1,
                    "offset": 17,
                  },
                },
                "value": "$implicit",
                "valueSpan": undefined,
              },
              "loc": Object {
                "end": Object {
                  "column": 11,
                  "line": 6,
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
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 3,
                  "offset": 88,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
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
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
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
                  "col": 15,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 16,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
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
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "sourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 5,
                  "offset": 142,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
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
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
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
                  "col": 47,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 48,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
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
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "trackBy": ASTWithSource {
                "ast": PropertyRead {
                  "loc": Object {
                    "end": Object {
                      "column": undefined,
                      "line": NaN,
                    },
                    "start": Object {
                      "column": undefined,
                      "line": NaN,
                    },
                  },
                  "name": "id",
                  "nameSpan": AbsoluteSourceSpan {
                    "end": 45,
                    "start": 43,
                  },
                  "receiver": PropertyRead {
                    "loc": Object {
                      "end": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                      "start": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                    },
                    "name": "item",
                    "nameSpan": AbsoluteSourceSpan {
                      "end": 42,
                      "start": 38,
                    },
                    "receiver": ImplicitReceiver {
                      "loc": Object {
                        "end": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                        "start": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                      },
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 38,
                        "start": 38,
                      },
                      "span": ParseSpan {
                        "end": 0,
                        "start": 0,
                      },
                      "type": "ImplicitReceiver",
                    },
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 42,
                      "start": 38,
                    },
                    "span": ParseSpan {
                      "end": 4,
                      "start": 0,
                    },
                    "type": "PropertyRead",
                  },
                  "sourceSpan": AbsoluteSourceSpan {
                    "end": 45,
                    "start": 38,
                  },
                  "span": ParseSpan {
                    "end": 7,
                    "start": 0,
                  },
                  "type": "PropertyRead",
                },
                "errors": Array [],
                "loc": Object {
                  "end": Object {
                    "column": undefined,
                    "line": NaN,
                  },
                  "start": Object {
                    "column": undefined,
                    "line": NaN,
                  },
                },
                "location": "./foo.html@1:31",
                "source": "item.id",
                "sourceSpan": AbsoluteSourceSpan {
                  "end": 45,
                  "start": 38,
                },
                "span": ParseSpan {
                  "end": 7,
                  "start": 0,
                },
                "type": "ASTWithSource",
              },
              "trackKeywordSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 36,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 37,
                },
                "fullStart": ParseLocation {
                  "col": 31,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 32,
                },
                "start": ParseLocation {
                  "col": 31,
                  "file": ParseSourceFile {
                    "content": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 32,
                },
              },
              "type": "ForLoopBlock",
            },
          ],
          "tokens": Array [],
          "type": "Program",
          "value": "
                  @for (item of items; track item.id) {
                    {{ item.name }}
                  } @empty {
                     There are no items.
                  }
              ",
        }
      `);
    });
  });

  describe('@switch', () => {
    it('should support the different variants of @switch', () => {
      expect(
        parseForESLint(
          `
          @switch (condition) {
            @case (caseA) {
              <span>Case A.</span>
            }
            @case (caseB) {
              <span>Case B.</span>
            }
            @default {
              <span>Default case.</span>
            }
          }
      `,
          { filePath: './foo.html' },
        ).ast,
      ).toMatchInlineSnapshot(`
        Object {
          "comments": Array [],
          "loc": Object {
            "end": Object {
              "column": 6,
              "line": 13,
            },
            "start": Object {
              "column": 10,
              "line": 2,
            },
          },
          "range": Array [
            11,
            283,
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
            SwitchBlock {
              "cases": Array [
                SwitchBlockCase {
                  "children": Array [
                    Text$3 {
                      "loc": Object {
                        "end": Object {
                          "column": 14,
                          "line": 4,
                        },
                        "start": Object {
                          "column": 14,
                          "line": 4,
                        },
                      },
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 75,
                        },
                        "fullStart": ParseLocation {
                          "col": 27,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 2,
                          "offset": 60,
                        },
                        "start": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 75,
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
                              "column": 27,
                              "line": 4,
                            },
                            "start": Object {
                              "column": 20,
                              "line": 4,
                            },
                          },
                          "sourceSpan": ParseSourceSpan {
                            "details": null,
                            "end": ParseLocation {
                              "col": 27,
                              "file": ParseSourceFile {
                                "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                                "url": "./foo.html",
                              },
                              "line": 3,
                              "offset": 88,
                            },
                            "fullStart": ParseLocation {
                              "col": 20,
                              "file": ParseSourceFile {
                                "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                                "url": "./foo.html",
                              },
                              "line": 3,
                              "offset": 81,
                            },
                            "start": ParseLocation {
                              "col": 20,
                              "file": ParseSourceFile {
                                "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                                "url": "./foo.html",
                              },
                              "line": 3,
                              "offset": 81,
                            },
                          },
                          "type": "Text$3",
                          "value": "Case A.",
                        },
                      ],
                      "endSourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 34,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 95,
                        },
                        "fullStart": ParseLocation {
                          "col": 27,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 88,
                        },
                        "start": ParseLocation {
                          "col": 27,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 88,
                        },
                      },
                      "i18n": undefined,
                      "inputs": Array [],
                      "loc": Object {
                        "end": Object {
                          "column": 34,
                          "line": 4,
                        },
                        "start": Object {
                          "column": 14,
                          "line": 4,
                        },
                      },
                      "name": "span",
                      "outputs": Array [],
                      "references": Array [],
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 34,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 95,
                        },
                        "fullStart": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 75,
                        },
                        "start": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 75,
                        },
                      },
                      "startSourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 20,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 81,
                        },
                        "fullStart": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 75,
                        },
                        "start": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 75,
                        },
                      },
                      "type": "Element$1",
                    },
                    Text$3 {
                      "loc": Object {
                        "end": Object {
                          "column": 12,
                          "line": 5,
                        },
                        "start": Object {
                          "column": 12,
                          "line": 5,
                        },
                      },
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 12,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 4,
                          "offset": 108,
                        },
                        "fullStart": ParseLocation {
                          "col": 34,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 3,
                          "offset": 95,
                        },
                        "start": ParseLocation {
                          "col": 12,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 4,
                          "offset": 108,
                        },
                      },
                      "type": "Text$3",
                      "value": "
                    ",
                    },
                  ],
                  "endSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 13,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 109,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 108,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 108,
                    },
                  },
                  "expression": ASTWithSource {
                    "ast": PropertyRead {
                      "loc": Object {
                        "end": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                        "start": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                      },
                      "name": "caseA",
                      "nameSpan": AbsoluteSourceSpan {
                        "end": 57,
                        "start": 52,
                      },
                      "receiver": ImplicitReceiver {
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
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
                        "end": 57,
                        "start": 52,
                      },
                      "span": ParseSpan {
                        "end": 5,
                        "start": 0,
                      },
                      "type": "PropertyRead",
                    },
                    "errors": Array [],
                    "loc": Object {
                      "end": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                      "start": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                    },
                    "location": "./foo.html@2:19",
                    "source": "caseA",
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 57,
                      "start": 52,
                    },
                    "span": ParseSpan {
                      "end": 5,
                      "start": 0,
                    },
                    "type": "ASTWithSource",
                  },
                  "i18n": undefined,
                  "loc": Object {
                    "end": Object {
                      "column": 13,
                      "line": 5,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 3,
                    },
                  },
                  "nameSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 51,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 45,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 13,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 4,
                      "offset": 109,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                      "col": 27,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 60,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 2,
                      "offset": 45,
                    },
                  },
                  "type": "SwitchBlockCase",
                },
                SwitchBlockCase {
                  "children": Array [
                    Text$3 {
                      "loc": Object {
                        "end": Object {
                          "column": 14,
                          "line": 7,
                        },
                        "start": Object {
                          "column": 14,
                          "line": 7,
                        },
                      },
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 152,
                        },
                        "fullStart": ParseLocation {
                          "col": 27,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 5,
                          "offset": 137,
                        },
                        "start": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 152,
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
                              "column": 27,
                              "line": 7,
                            },
                            "start": Object {
                              "column": 20,
                              "line": 7,
                            },
                          },
                          "sourceSpan": ParseSourceSpan {
                            "details": null,
                            "end": ParseLocation {
                              "col": 27,
                              "file": ParseSourceFile {
                                "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                                "url": "./foo.html",
                              },
                              "line": 6,
                              "offset": 165,
                            },
                            "fullStart": ParseLocation {
                              "col": 20,
                              "file": ParseSourceFile {
                                "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                                "url": "./foo.html",
                              },
                              "line": 6,
                              "offset": 158,
                            },
                            "start": ParseLocation {
                              "col": 20,
                              "file": ParseSourceFile {
                                "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                                "url": "./foo.html",
                              },
                              "line": 6,
                              "offset": 158,
                            },
                          },
                          "type": "Text$3",
                          "value": "Case B.",
                        },
                      ],
                      "endSourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 34,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 172,
                        },
                        "fullStart": ParseLocation {
                          "col": 27,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 165,
                        },
                        "start": ParseLocation {
                          "col": 27,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 165,
                        },
                      },
                      "i18n": undefined,
                      "inputs": Array [],
                      "loc": Object {
                        "end": Object {
                          "column": 34,
                          "line": 7,
                        },
                        "start": Object {
                          "column": 14,
                          "line": 7,
                        },
                      },
                      "name": "span",
                      "outputs": Array [],
                      "references": Array [],
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 34,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 172,
                        },
                        "fullStart": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 152,
                        },
                        "start": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 152,
                        },
                      },
                      "startSourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 20,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 158,
                        },
                        "fullStart": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 152,
                        },
                        "start": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 152,
                        },
                      },
                      "type": "Element$1",
                    },
                    Text$3 {
                      "loc": Object {
                        "end": Object {
                          "column": 12,
                          "line": 8,
                        },
                        "start": Object {
                          "column": 12,
                          "line": 8,
                        },
                      },
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 12,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 7,
                          "offset": 185,
                        },
                        "fullStart": ParseLocation {
                          "col": 34,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 6,
                          "offset": 172,
                        },
                        "start": ParseLocation {
                          "col": 12,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 7,
                          "offset": 185,
                        },
                      },
                      "type": "Text$3",
                      "value": "
                    ",
                    },
                  ],
                  "endSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 13,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 7,
                      "offset": 186,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 7,
                      "offset": 185,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 7,
                      "offset": 185,
                    },
                  },
                  "expression": ASTWithSource {
                    "ast": PropertyRead {
                      "loc": Object {
                        "end": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                        "start": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                      },
                      "name": "caseB",
                      "nameSpan": AbsoluteSourceSpan {
                        "end": 134,
                        "start": 129,
                      },
                      "receiver": ImplicitReceiver {
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 129,
                          "start": 129,
                        },
                        "span": ParseSpan {
                          "end": 0,
                          "start": 0,
                        },
                        "type": "ImplicitReceiver",
                      },
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 134,
                        "start": 129,
                      },
                      "span": ParseSpan {
                        "end": 5,
                        "start": 0,
                      },
                      "type": "PropertyRead",
                    },
                    "errors": Array [],
                    "loc": Object {
                      "end": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                      "start": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                    },
                    "location": "./foo.html@5:19",
                    "source": "caseB",
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 134,
                      "start": 129,
                    },
                    "span": ParseSpan {
                      "end": 5,
                      "start": 0,
                    },
                    "type": "ASTWithSource",
                  },
                  "i18n": undefined,
                  "loc": Object {
                    "end": Object {
                      "column": 13,
                      "line": 8,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 6,
                    },
                  },
                  "nameSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 18,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 128,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 122,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 122,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 13,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 7,
                      "offset": 186,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 122,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 122,
                    },
                  },
                  "startSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 27,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 137,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 122,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 5,
                      "offset": 122,
                    },
                  },
                  "type": "SwitchBlockCase",
                },
                SwitchBlockCase {
                  "children": Array [
                    Text$3 {
                      "loc": Object {
                        "end": Object {
                          "column": 14,
                          "line": 10,
                        },
                        "start": Object {
                          "column": 14,
                          "line": 10,
                        },
                      },
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 224,
                        },
                        "fullStart": ParseLocation {
                          "col": 22,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 8,
                          "offset": 209,
                        },
                        "start": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 224,
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
                              "column": 33,
                              "line": 10,
                            },
                            "start": Object {
                              "column": 20,
                              "line": 10,
                            },
                          },
                          "sourceSpan": ParseSourceSpan {
                            "details": null,
                            "end": ParseLocation {
                              "col": 33,
                              "file": ParseSourceFile {
                                "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                                "url": "./foo.html",
                              },
                              "line": 9,
                              "offset": 243,
                            },
                            "fullStart": ParseLocation {
                              "col": 20,
                              "file": ParseSourceFile {
                                "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                                "url": "./foo.html",
                              },
                              "line": 9,
                              "offset": 230,
                            },
                            "start": ParseLocation {
                              "col": 20,
                              "file": ParseSourceFile {
                                "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                                "url": "./foo.html",
                              },
                              "line": 9,
                              "offset": 230,
                            },
                          },
                          "type": "Text$3",
                          "value": "Default case.",
                        },
                      ],
                      "endSourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 40,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 250,
                        },
                        "fullStart": ParseLocation {
                          "col": 33,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 243,
                        },
                        "start": ParseLocation {
                          "col": 33,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 243,
                        },
                      },
                      "i18n": undefined,
                      "inputs": Array [],
                      "loc": Object {
                        "end": Object {
                          "column": 40,
                          "line": 10,
                        },
                        "start": Object {
                          "column": 14,
                          "line": 10,
                        },
                      },
                      "name": "span",
                      "outputs": Array [],
                      "references": Array [],
                      "sourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 40,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 250,
                        },
                        "fullStart": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 224,
                        },
                        "start": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 224,
                        },
                      },
                      "startSourceSpan": ParseSourceSpan {
                        "details": null,
                        "end": ParseLocation {
                          "col": 20,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 230,
                        },
                        "fullStart": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 224,
                        },
                        "start": ParseLocation {
                          "col": 14,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 224,
                        },
                      },
                      "type": "Element$1",
                    },
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 10,
                          "offset": 263,
                        },
                        "fullStart": ParseLocation {
                          "col": 40,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 9,
                          "offset": 250,
                        },
                        "start": ParseLocation {
                          "col": 12,
                          "file": ParseSourceFile {
                            "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                            "url": "./foo.html",
                          },
                          "line": 10,
                          "offset": 263,
                        },
                      },
                      "type": "Text$3",
                      "value": "
                    ",
                    },
                  ],
                  "endSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 13,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 264,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 263,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 263,
                    },
                  },
                  "expression": null,
                  "i18n": undefined,
                  "loc": Object {
                    "end": Object {
                      "column": 13,
                      "line": 11,
                    },
                    "start": Object {
                      "column": 12,
                      "line": 9,
                    },
                  },
                  "nameSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 21,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 8,
                      "offset": 208,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 8,
                      "offset": 199,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 8,
                      "offset": 199,
                    },
                  },
                  "sourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 13,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 10,
                      "offset": 264,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 8,
                      "offset": 199,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 8,
                      "offset": 199,
                    },
                  },
                  "startSourceSpan": ParseSourceSpan {
                    "details": null,
                    "end": ParseLocation {
                      "col": 22,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 8,
                      "offset": 209,
                    },
                    "fullStart": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 8,
                      "offset": 199,
                    },
                    "start": ParseLocation {
                      "col": 12,
                      "file": ParseSourceFile {
                        "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                        "url": "./foo.html",
                      },
                      "line": 8,
                      "offset": 199,
                    },
                  },
                  "type": "SwitchBlockCase",
                },
              ],
              "endSourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 11,
                  "offset": 276,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 11,
                  "offset": 275,
                },
                "start": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 11,
                  "offset": 275,
                },
              },
              "expression": ASTWithSource {
                "ast": PropertyRead {
                  "loc": Object {
                    "end": Object {
                      "column": undefined,
                      "line": NaN,
                    },
                    "start": Object {
                      "column": undefined,
                      "line": NaN,
                    },
                  },
                  "name": "condition",
                  "nameSpan": AbsoluteSourceSpan {
                    "end": 29,
                    "start": 20,
                  },
                  "receiver": ImplicitReceiver {
                    "loc": Object {
                      "end": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                      "start": Object {
                        "column": undefined,
                        "line": NaN,
                      },
                    },
                    "sourceSpan": AbsoluteSourceSpan {
                      "end": 20,
                      "start": 20,
                    },
                    "span": ParseSpan {
                      "end": 0,
                      "start": 0,
                    },
                    "type": "ImplicitReceiver",
                  },
                  "sourceSpan": AbsoluteSourceSpan {
                    "end": 29,
                    "start": 20,
                  },
                  "span": ParseSpan {
                    "end": 9,
                    "start": 0,
                  },
                  "type": "PropertyRead",
                },
                "errors": Array [],
                "loc": Object {
                  "end": Object {
                    "column": undefined,
                    "line": NaN,
                  },
                  "start": Object {
                    "column": undefined,
                    "line": NaN,
                  },
                },
                "location": "./foo.html@1:19",
                "source": "condition",
                "sourceSpan": AbsoluteSourceSpan {
                  "end": 29,
                  "start": 20,
                },
                "span": ParseSpan {
                  "end": 9,
                  "start": 0,
                },
                "type": "ASTWithSource",
              },
              "loc": Object {
                "end": Object {
                  "column": 11,
                  "line": 12,
                },
                "start": Object {
                  "column": 10,
                  "line": 2,
                },
              },
              "nameSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 18,
                  "file": ParseSourceFile {
                    "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 19,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "sourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 11,
                  "offset": 276,
                },
                "fullStart": ParseLocation {
                  "col": 10,
                  "file": ParseSourceFile {
                    "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 1,
                  "offset": 11,
                },
              },
              "type": "SwitchBlock",
              "unknownBlocks": Array [],
            },
            Text$3 {
              "loc": Object {
                "end": Object {
                  "column": 6,
                  "line": 13,
                },
                "start": Object {
                  "column": 6,
                  "line": 13,
                },
              },
              "sourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 6,
                  "file": ParseSourceFile {
                    "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 12,
                  "offset": 283,
                },
                "fullStart": ParseLocation {
                  "col": 11,
                  "file": ParseSourceFile {
                    "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 11,
                  "offset": 276,
                },
                "start": ParseLocation {
                  "col": 6,
                  "file": ParseSourceFile {
                    "content": "
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
                    "url": "./foo.html",
                  },
                  "line": 12,
                  "offset": 283,
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
                  @switch (condition) {
                    @case (caseA) {
                      <span>Case A.</span>
                    }
                    @case (caseB) {
                      <span>Case B.</span>
                    }
                    @default {
                      <span>Default case.</span>
                    }
                  }
              ",
        }
      `);
    });
  });

  describe('call expressions', () => {
    it('should support normal and safe calls', () => {
      expect(
        parseForESLint(`{{ foo() }} {{ bar?.() }}`, { filePath: './foo.html' })
          .ast,
      ).toMatchInlineSnapshot(`
        Object {
          "comments": Array [],
          "loc": Object {
            "end": Object {
              "column": 25,
              "line": 1,
            },
            "start": Object {
              "column": 0,
              "line": 1,
            },
          },
          "range": Array [
            0,
            25,
          ],
          "templateNodes": Array [
            BoundText {
              "i18n": undefined,
              "loc": Object {
                "end": Object {
                  "column": 25,
                  "line": 1,
                },
                "start": Object {
                  "column": 0,
                  "line": 1,
                },
              },
              "sourceSpan": ParseSourceSpan {
                "details": null,
                "end": ParseLocation {
                  "col": 25,
                  "file": ParseSourceFile {
                    "content": "{{ foo() }} {{ bar?.() }}",
                    "url": "./foo.html",
                  },
                  "line": 0,
                  "offset": 25,
                },
                "fullStart": ParseLocation {
                  "col": 0,
                  "file": ParseSourceFile {
                    "content": "{{ foo() }} {{ bar?.() }}",
                    "url": "./foo.html",
                  },
                  "line": 0,
                  "offset": 0,
                },
                "start": ParseLocation {
                  "col": 0,
                  "file": ParseSourceFile {
                    "content": "{{ foo() }} {{ bar?.() }}",
                    "url": "./foo.html",
                  },
                  "line": 0,
                  "offset": 0,
                },
              },
              "type": "BoundText",
              "value": ASTWithSource {
                "ast": Interpolation$1 {
                  "expressions": Array [
                    Call {
                      "args": Array [],
                      "argumentSpan": AbsoluteSourceSpan {
                        "end": 7,
                        "start": 7,
                      },
                      "loc": Object {
                        "end": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                        "start": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                      },
                      "receiver": PropertyRead {
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "name": "foo",
                        "nameSpan": AbsoluteSourceSpan {
                          "end": 6,
                          "start": 3,
                        },
                        "receiver": ImplicitReceiver {
                          "loc": Object {
                            "end": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                            "start": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 3,
                            "start": 3,
                          },
                          "span": ParseSpan {
                            "end": 3,
                            "start": 3,
                          },
                          "type": "ImplicitReceiver",
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 6,
                          "start": 3,
                        },
                        "span": ParseSpan {
                          "end": 6,
                          "start": 3,
                        },
                        "type": "PropertyRead",
                      },
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 8,
                        "start": 3,
                      },
                      "span": ParseSpan {
                        "end": 8,
                        "start": 3,
                      },
                      "type": "Call",
                    },
                    SafeCall {
                      "args": Array [],
                      "argumentSpan": AbsoluteSourceSpan {
                        "end": 21,
                        "start": 21,
                      },
                      "loc": Object {
                        "end": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                        "start": Object {
                          "column": undefined,
                          "line": NaN,
                        },
                      },
                      "receiver": PropertyRead {
                        "loc": Object {
                          "end": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                          "start": Object {
                            "column": undefined,
                            "line": NaN,
                          },
                        },
                        "name": "bar",
                        "nameSpan": AbsoluteSourceSpan {
                          "end": 18,
                          "start": 15,
                        },
                        "receiver": ImplicitReceiver {
                          "loc": Object {
                            "end": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                            "start": Object {
                              "column": undefined,
                              "line": NaN,
                            },
                          },
                          "sourceSpan": AbsoluteSourceSpan {
                            "end": 15,
                            "start": 15,
                          },
                          "span": ParseSpan {
                            "end": 15,
                            "start": 15,
                          },
                          "type": "ImplicitReceiver",
                        },
                        "sourceSpan": AbsoluteSourceSpan {
                          "end": 18,
                          "start": 15,
                        },
                        "span": ParseSpan {
                          "end": 18,
                          "start": 15,
                        },
                        "type": "PropertyRead",
                      },
                      "sourceSpan": AbsoluteSourceSpan {
                        "end": 22,
                        "start": 15,
                      },
                      "span": ParseSpan {
                        "end": 22,
                        "start": 15,
                      },
                      "type": "SafeCall",
                    },
                  ],
                  "loc": Object {
                    "end": Object {
                      "column": undefined,
                      "line": NaN,
                    },
                    "start": Object {
                      "column": undefined,
                      "line": NaN,
                    },
                  },
                  "sourceSpan": AbsoluteSourceSpan {
                    "end": 25,
                    "start": 0,
                  },
                  "span": ParseSpan {
                    "end": 25,
                    "start": 0,
                  },
                  "strings": Array [
                    "",
                    " ",
                    "",
                  ],
                  "type": "Interpolation$1",
                },
                "errors": Array [],
                "loc": Object {
                  "end": Object {
                    "column": undefined,
                    "line": NaN,
                  },
                  "start": Object {
                    "column": undefined,
                    "line": NaN,
                  },
                },
                "location": "./foo.html@0:0",
                "source": "{{ foo() }} {{ bar?.() }}",
                "sourceSpan": AbsoluteSourceSpan {
                  "end": 25,
                  "start": 0,
                },
                "span": ParseSpan {
                  "end": 25,
                  "start": 0,
                },
                "type": "ASTWithSource",
              },
            },
          ],
          "tokens": Array [],
          "type": "Program",
          "value": "{{ foo() }} {{ bar?.() }}",
        }
      `);
    });
  });

  describe('ng-content', () => {
    it('should support fallback content', () => {
      expect(
        parseForESLint(
          `
          <ng-content>
             @if (foo) {
               <div>Hello!</div>
             }
          </ng-content>
        `,
          {
            filePath: './foo.html',
          },
        ).ast,
      ).toMatchSnapshot();
    });
  });
});
