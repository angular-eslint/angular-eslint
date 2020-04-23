import { parseTemplate, ParseSourceSpan } from '@angular/compiler';
import EventEmitter from 'events';
import { ScopeManager, Scope } from 'eslint-scope';
// @ts-ignore
import NodeEventGenerator from 'eslint/lib/linter/node-event-generator';

const emitters = new WeakMap();

interface Node {
  [x: string]: any;
  type: string;
}

interface VisitorKeys {
  [nodeName: string]: string[];
}

interface LOC {
  line: number;
  column: number;
}

interface AST extends Node {
  type: string;
  comments: string[];
  tokens: string[];
  range: [number, number];
  loc: {
    start: LOC;
    end: LOC;
  };
  templateNodes: any[];
  value: string;
}

const KEYS: VisitorKeys = {
  ASTWithSource: ['ast'],
  Binary: ['left', 'right'],
  BoundAttribute: ['value'],
  BoundEvent: ['handler'],
  BoundText: ['value'],
  Element: ['children', 'inputs', 'outputs'],
  Interpolation: ['expressions'],
  PrefixNot: ['expression'],
  Program: ['templateNodes'],
  PropertyRead: ['receiver'],
  Template: ['templateAttrs', 'children', 'inputs'],
};

function fallbackKeysFilter(this: Node, key: string) {
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

function getFallbackKeys(node: Node): string[] {
  return Object.keys(node).filter(fallbackKeysFilter, node);
}

function isNode(x: any): x is Node {
  return x !== null && typeof x === 'object' && typeof x.type === 'string';
}

type NodeVisitorFn = (node: Node, parent: Node | null) => void;

function traverse(
  node: Node,
  parent: Node | null,
  visitor: {
    visitorKeys: VisitorKeys;
    enterNode: NodeVisitorFn;
    leaveNode: NodeVisitorFn;
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
function preprocessNode(node: Node) {
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

function convertNodeSourceSpanToLoc(sourceSpan: ParseSourceSpan) {
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
}

function getStartSourceSpanFromAST(ast: AST): ParseSourceSpan | null {
  let startSourceSpan: ParseSourceSpan | null = null;
  ast.templateNodes.forEach(node => {
    const nodeSourceSpan = node.startSourceSpan || node.sourceSpan;

    if (!startSourceSpan) {
      startSourceSpan = nodeSourceSpan;
      return;
    }

    if (
      nodeSourceSpan &&
      nodeSourceSpan.start.offset < startSourceSpan.start.offset
    ) {
      startSourceSpan = nodeSourceSpan;
      return;
    }
  });
  return startSourceSpan;
}

function getEndSourceSpanFromAST(ast: AST): ParseSourceSpan | null {
  let endSourceSpan: ParseSourceSpan | null = null;
  ast.templateNodes.forEach(node => {
    const nodeSourceSpan = node.endSourceSpan || node.sourceSpan;

    if (!endSourceSpan) {
      endSourceSpan = nodeSourceSpan;
      return;
    }

    if (
      nodeSourceSpan &&
      nodeSourceSpan.end.offset > endSourceSpan.end.offset
    ) {
      endSourceSpan = nodeSourceSpan;
      return;
    }
  });
  return endSourceSpan;
}

function parseForESLint(code: string, options: { filePath: string }) {
  const angularCompilerResult = parseTemplate(code, options.filePath, {
    preserveWhitespaces: false,
  });

  const ast: AST = {
    type: 'Program',
    comments: [],
    tokens: [],
    range: [0, 0],
    loc: {
      start: { line: 0, column: 0 },
      end: { line: 0, column: 0 },
    },
    templateNodes: angularCompilerResult.nodes,
    value: code,
  };

  /**
   * The types for ScopeManager seem to be wrong, it requires an configuration object argument
   * or it will throw at runtime
   */
  // @ts-ignore
  const scopeManager = new ScopeManager({});
  /**
   * Create a global scope for the ScopeManager, the types for Scope also
   * seem to be wrong
   */
  // @ts-ignore
  new Scope(scopeManager, 'module', null, ast, false);

  preprocessNode(ast);

  const startSourceSpan = getStartSourceSpanFromAST(ast);
  const endSourceSpan = getEndSourceSpanFromAST(ast);

  if (startSourceSpan && endSourceSpan) {
    ast.range = [startSourceSpan.start.offset, endSourceSpan.end.offset];
    ast.loc = {
      start: convertNodeSourceSpanToLoc(startSourceSpan).start,
      end: convertNodeSourceSpanToLoc(endSourceSpan).end,
    };
  }

  return {
    ast,
    scopeManager,
    visitorKeys: KEYS,
    services: {
      convertNodeSourceSpanToLoc,
      defineTemplateBodyVisitor(
        templateBodyVisitor: { [x: string]: Function },
        scriptVisitor: { [x: string]: Function },
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
          scriptVisitor['Program:exit'] = (node: Node) => {
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
