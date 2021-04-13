// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parseForESLint } = require('../src/index');

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
                "column": 10,
                "line": 2,
              },
              "start": Object {
                "column": 6,
                "line": 2,
              },
            },
            "range": Array [
              7,
              11,
            ],
            "type": "Block",
            "value": "eslint-disable-next-line",
          },
          Object {
            "loc": Object {
              "end": Object {
                "column": 10,
                "line": 4,
              },
              "start": Object {
                "column": 6,
                "line": 4,
              },
            },
            "range": Array [
              74,
              78,
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
          Text {
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
            "type": "Text",
            "value": "
            ",
          },
          Text {
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
            "type": "Text",
            "value": "
            ",
          },
          Element {
            "attributes": Array [],
            "children": Array [
              Text {
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
                "type": "Text",
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
            "type": "Element",
          },
          Text {
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
            "type": "Text",
            "value": "
            ",
          },
          Text {
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
            "type": "Text",
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
});
