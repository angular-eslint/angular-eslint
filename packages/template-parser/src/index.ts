import { parseTemplate } from '@angular/compiler';
import EventEmitter from 'events';

const { ScopeManager, Scope } = require('eslint-scope');
const NodeEventGenerator = require('eslint/lib/linter/node-event-generator');

const emitters = new WeakMap();

const KEYS: any = {
  Program: ['templateNodes'],
  Element: ['children', 'outputs'],
  BoundEvent: ['handler'],
};

function fallbackKeysFilter(this: any, key: string) {
  let value = null;
  return (
    key !== 'comments' &&
    key !== 'leadingComments' &&
    key !== 'loc' &&
    key !== 'parent' &&
    key !== 'range' &&
    key !== 'tokens' &&
    key !== 'trailingComments' &&
    (value = this[key]) !== null &&
    typeof value === 'object' &&
    (typeof value.type === 'string' || Array.isArray(value))
  );
}

function getFallbackKeys(node: { [x: string]: any; type?: string | number }) {
  return Object.keys(node).filter(fallbackKeysFilter, node);
}

function isNode(x: { type: any }) {
  return x !== null && typeof x === 'object' && typeof x.type === 'string';
}

function traverse(
  node: { [x: string]: any; type: string | number },
  parent: any,
  visitor: {
    enterNode: (arg0: any, arg1: any) => void;
    visitorKeys: any;
    leaveNode: (arg0: any, arg1: any) => void;
  },
) {
  let i = 0;
  let j = 0;

  visitor.enterNode(node, parent);

  const keys =
    (visitor.visitorKeys || KEYS)[node.type] || getFallbackKeys(node);

  for (i = 0; i < keys.length; ++i) {
    const child = node[keys[i]];
    const isArr = Array.isArray(child);
    if (isArr) {
      for (j = 0; j < child.length; ++j) {
        const c = child[j];
        if (isNode(c)) {
          traverse(c, node, visitor);
        }
      }
    } else if (isNode(child)) {
      traverse(child, node, visitor);
    }
  }

  visitor.leaveNode(node, parent);
}

/**
 * Need all Nodes to have a `type` property before we begin
 */
function preprocessNode(node: { [x: string]: any; type: any }) {
  let i = 0;
  let j = 0;

  const keys = KEYS[node.type] || getFallbackKeys(node);

  for (i = 0; i < keys.length; ++i) {
    const child = node[keys[i]];
    const isArr = Array.isArray(child);
    if (child.type !== undefined) {
      // Angular sometimes uses a prop called type already
      child.__originalType = child.type;
    }
    if (!isArr && !child.type) {
      child.type = child.constructor.name;
    }

    if (isArr) {
      for (j = 0; j < child.length; ++j) {
        const c = child[j];
        if (c.type !== undefined) {
          // Angular sometimes uses a prop called type already
          c.__originalType = c.type;
        }
        if (!c.type) {
          c.type = c.constructor.name;
        }
        if (isNode(c)) {
          preprocessNode(c);
        }
      }
    } else if (isNode(child)) {
      preprocessNode(child);
    }
  }
}

function parseForESLint(code: string, options: { filePath: string }) {
  const ast = {
    type: 'Program',
    comments: [],
    tokens: [],
    templateNodes: parseTemplate(code, options.filePath).nodes,
    range: [0, 1],
    loc: {
      start: {
        line: 0,
        column: 0,
      },
      end: {
        line: 0,
        column: 1,
      },
    },
    value: code,
  };

  // @ts-ignore
  const scopeManager = new ScopeManager({});
  // @ts-ignore
  const globalScope = new Scope(scopeManager, 'module', null, ast, false);

  preprocessNode(ast);

  return {
    ast,
    scopeManager,
    visitorKeys: KEYS,
    services: {
      convertNodeSourceSpanToLoc(sourceSpan: {
        start: { line: number; col: any };
        end: { line: number; col: any };
      }) {
        return {
          start: {
            line: sourceSpan.start.line + 1,
            column: sourceSpan.start.col,
          },
          end: {
            line: sourceSpan.end.line + 1,
            column: sourceSpan.end.col,
          },
        };
      },
      defineTemplateBodyVisitor(
        templateBodyVisitor: { [x: string]: any },
        scriptVisitor: { [x: string]: any },
      ) {
        const rootAST = ast;
        if (scriptVisitor == null) {
          scriptVisitor = {}; //eslint-disable-line no-param-reassign
        }
        if (rootAST == null) {
          return scriptVisitor;
        }

        let emitter = emitters.get(rootAST);

        // If this is the first time, initialize the intermediate event emitter.
        if (emitter == null) {
          emitter = new EventEmitter();
          emitter.setMaxListeners(0);
          emitters.set(rootAST, emitter);

          const programExitHandler = scriptVisitor['Program:exit'];
          scriptVisitor['Program:exit'] = (node: any) => {
            try {
              if (typeof programExitHandler === 'function') {
                programExitHandler(node);
              }

              // Traverse template body.
              const generator = new NodeEventGenerator(emitter);
              traverse(rootAST, null, generator);
            } finally {
              // @ts-ignore
              scriptVisitor['Program:exit'] = programExitHandler;
              emitters.delete(rootAST);
            }
          };
        }

        // Register handlers into the intermediate event emitter.
        for (const selector of Object.keys(templateBodyVisitor)) {
          emitter.on(selector, templateBodyVisitor[selector]);
        }

        return scriptVisitor;
      },
    },
  };
}

module.exports = {
  parseForESLint,
  parse: function parse(code: string, options: { filePath: string }) {
    return parseForESLint(code, options).ast;
  },
};
