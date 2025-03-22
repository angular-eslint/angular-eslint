import { parseForESLint } from '@angular-eslint/template-parser';
import { areEquivalentASTs } from '../../src/utils/are-equivalent-asts';
import {
  ASTWithSource,
  BindingPipe,
  Binary,
  Chain,
  Conditional,
  ImplicitReceiver,
  Interpolation,
  KeyedRead,
  KeyedWrite,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  PropertyRead,
  ThisReceiver,
  TmplAstBoundText,
  TmplAstElement,
  Unary,
  PrefixNot,
  TypeofExpression,
  NonNullAssert,
  PropertyWrite,
  SafePropertyRead,
  SafeKeyedRead,
  Call,
  SafeCall,
} from '@angular-eslint/bundled-angular-compiler';

describe('areEquivalentASTs', () => {
  describe('Unary', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = '+foo';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different operator', () => {
        expect(compare('+foo', '-foo')).toBe(false);
      });

      it('different expression', () => {
        expect(compare('+foo', '+bar')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): Unary {
      return parseBoundText(`{{ ${markup} }}`, Unary);
    }
  });

  describe('Binary', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'a + b';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different operator', () => {
        expect(compare('a + b', 'a - b')).toBe(false);
      });

      it('different expression', () => {
        expect(compare('a + b', 'a + c')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): Binary {
      return parseBoundText(`{{ ${markup} }}`, Binary);
    }
  });

  describe('Chain', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'a + 1; b + 2';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different order', () => {
        expect(compare('a + 1; b + 2', 'b + 2; a + 1')).toBe(false);
      });

      it('different expressions', () => {
        expect(compare('a + 1; b + 2', 'c + 3; d + 4')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(
        parseOutputHandler(a, Chain),
        parseOutputHandler(b, Chain),
      );
    }
  });

  describe('Conditional', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'a > b ? 1 : 2';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different true case', () => {
        expect(compare('a > b ? 1 : 2', 'a > b ? 0 : 2')).toBe(false);
      });

      it('different false case', () => {
        expect(compare('a > b ? 1 : 2', 'a > b ? 1 : 3')).toBe(false);
      });

      it('different test', () => {
        expect(compare('a > b ? 1 : 2', 'a < b ? 1 : 2')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): Conditional {
      return parseBoundText(`{{ ${markup} }}`, Conditional);
    }
  });

  describe('ThisReceiver and ImplicitReceiver', () => {
    describe('equivalent', () => {
      it('this is identical to itself', () => {
        const ast = getThisReceiver();
        expect(areEquivalentASTs(ast, ast)).toBe(true);
      });

      it('implicit receiver is identical to itself', () => {
        const ast = getImplicitReceiver();
        expect(areEquivalentASTs(ast, ast)).toBe(true);
      });

      it('this is equivalent to implicit', () => {
        expect(
          areEquivalentASTs(getThisReceiver(), getImplicitReceiver()),
        ).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('this receiver and different node type', () => {
        expect(
          areEquivalentASTs(getThisReceiver(), parse('foo', PropertyRead)),
        ).toBe(false);
      });

      it('this receiver and different node type', () => {
        expect(
          areEquivalentASTs(getImplicitReceiver(), parse('foo', PropertyRead)),
        ).toBe(false);
      });
    });

    function getThisReceiver(): ThisReceiver {
      return parse<ThisReceiver>('this', ThisReceiver);
    }

    function getImplicitReceiver(): ImplicitReceiver {
      const read = parse<PropertyRead>('foo', PropertyRead);
      expect(read.receiver).toBeInstanceOf(ImplicitReceiver);
      return read.receiver;
    }

    function parse<T>(markup: string, type: unknown): T {
      return parseBoundText(`{{ ${markup} }}`, type);
    }
  });

  describe('Interpolation', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'before {{ foo }} after';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different number of strings and expressions', () => {
        expect(compare('a{{ b }}c', 'a{{ b }}c{{d}}')).toBe(false);
      });

      it('different strings', () => {
        expect(compare('a{{ b }}c', 'a{{ b }}d')).toBe(false);
      });

      it('different expressions', () => {
        expect(compare('a{{ b }}c', 'a{{ d }}c')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): Interpolation {
      const ast = parseForESLint(markup, {
        filePath: './foo.html',
        suppressParseErrors: false,
      }).ast;
      expect(ast.templateNodes).toHaveLength(1);

      expect(ast.templateNodes[0]).toBeInstanceOf(TmplAstBoundText);
      const boundText = ast.templateNodes[0] as TmplAstBoundText;

      expect(boundText.value).toBeInstanceOf(ASTWithSource);
      const astWithSource = boundText.value as ASTWithSource;

      expect(astWithSource.ast).toBeInstanceOf(Interpolation);
      return astWithSource.ast as Interpolation;
    }
  });

  describe('KeyedRead', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'foo["bar"]';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different receiver', () => {
        expect(compare('a["bar"]', 'b["bar"]')).toBe(false);
      });

      it('different key', () => {
        expect(compare('a["x"]', 'a["y"]')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): KeyedRead {
      return parseBoundText(`{{ ${markup} }}`, KeyedRead);
    }
  });

  describe('KeyedWrite', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'foo["bar"] = 1';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different receiver', () => {
        expect(compare('a["bar"] = 1', 'b["bar"] = 1')).toBe(false);
      });

      it('different key', () => {
        expect(compare('a["x"] = 1', 'a["y"] = 1')).toBe(false);
      });

      it('different value', () => {
        expect(compare('a["foo"] = 1', 'a["foo"] = 2')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(
        parseOutputHandler(a, KeyedWrite),
        parseOutputHandler(b, KeyedWrite),
      );
    }
  });

  describe('LiteralArray', () => {
    describe('equivalent', () => {
      it('empty', () => {
        const markup = '[]';
        expect(compare(markup, markup)).toBe(true);
      });

      it('same elements', () => {
        const markup = '[1, 2, 3]';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different length', () => {
        expect(compare('[1, 2, 3]', '[1, 2]')).toBe(false);
      });

      it('different values', () => {
        expect(compare('[1, 2, 3]', '[1, 4, 3]')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): LiteralArray {
      return parseBoundText(`{{ ${markup} }}`, LiteralArray);
    }
  });

  describe('LiteralMap', () => {
    describe('equivalent', () => {
      it('empty', () => {
        const markup = '{}';
        expect(compare(markup, markup)).toBe(true);
      });

      it('same elements', () => {
        const markup = '{ a: 1, b: 2 }';
        expect(compare(markup, markup)).toBe(true);
      });

      it('quoted and not quoted elements', () => {
        expect(compare('{ a: 1 }', '{ "a": 1 }')).toBe(true);
      });

      it('shorthand and not shorthand initialization', () => {
        expect(compare('{ a: a }', '{ a }')).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different number of elements', () => {
        expect(compare('{ a: 1, b: 2 }', '{ a: 1, b: 2, c: 3 }')).toBe(false);
      });

      it('different keys', () => {
        expect(compare('{ a: 1, b: 2, c: 3 }', '{ a: 1, d: 2, c: 3 }')).toBe(
          false,
        );
      });

      it('different values', () => {
        expect(compare('{ a: 1, b: 2, c: 3 }', '{ a: 1, b: 4, c: 3 }')).toBe(
          false,
        );
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): LiteralMap {
      return parseBoundText(`{{ ${markup} }}`, LiteralMap);
    }
  });

  describe('LiteralPrimitive', () => {
    describe('equivalent', () => {
      it.each([
        { type: 'boolean', value: 'true' },
        { type: 'number', value: '42' },
        { type: 'string', value: '"test"' },
        { type: 'null', value: 'null' },
        { type: 'undefined', value: 'undefined' },
      ])('$type', ({ value }) => {
        expect(compare(value, value)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it.each([
        { type: 'boolean', first: 'true', second: 'false' },
        { type: 'number', first: '42', second: '24' },
        { type: 'string', first: '"test"', second: '"other"' },
      ])('different $type values', ({ first, second }) => {
        expect(compare(first, second)).toBe(false);
      });

      it('different types', () => {
        expect(compare('42', 'true')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): LiteralPrimitive {
      return parseBoundText(`{{ ${markup} }}`, LiteralPrimitive);
    }
  });

  describe('BindingPipe', () => {
    describe('equivalent', () => {
      it('identical with no arguments', () => {
        const markup = 'foo | bar';
        expect(compare(markup, markup)).toBe(true);
      });

      it('identical with arguments', () => {
        const markup = 'foo | bar: 1 : 2 : 3';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different expression', () => {
        expect(compare('a | foo', 'b | foo')).toBe(false);
      });

      it('different name', () => {
        expect(compare('a | foo', 'a | bar')).toBe(false);
      });

      it('different number of arguments', () => {
        expect(compare('a | foo : 1 : 2', 'a | foo : 1 : 2 : 3')).toBe(false);
      });

      it('different argument values', () => {
        expect(compare('a | foo : 1 : 2 : 3', 'a | foo : 1 : 4 : 3')).toBe(
          false,
        );
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): BindingPipe {
      return parseBoundText(`{{ ${markup} }}`, BindingPipe);
    }
  });

  describe('PrefixNot', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = '!foo';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different expression', () => {
        expect(compare('!a', '!b')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): PrefixNot {
      return parseBoundText(`{{ ${markup} }}`, PrefixNot);
    }
  });

  describe('TypeofExpression', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'typeof foo';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different expression', () => {
        expect(compare('typeof a', 'typeof b')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): TypeofExpression {
      return parseBoundText(`{{ ${markup} }}`, TypeofExpression);
    }
  });

  describe('NonNullAssert', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'foo!';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different expression', () => {
        expect(compare('a!', 'b!')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): NonNullAssert {
      return parseBoundText(`{{ ${markup} }}`, NonNullAssert);
    }
  });

  describe('PropertyRead', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'foo';
        expect(compare(markup, markup)).toBe(true);
      });

      it('this and implicit receiver', () => {
        expect(compare('foo', 'this.foo')).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different name', () => {
        expect(compare('a.b', 'a.c')).toBe(false);
      });

      it('different receiver', () => {
        expect(compare('a.b', 'c.b')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): PropertyRead {
      return parseBoundText(`{{ ${markup} }}`, PropertyRead);
    }
  });

  describe('PropertyWrite', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'foo = 1';
        expect(compare(markup, markup)).toBe(true);
      });

      it('this and implicit receiver', () => {
        expect(compare('foo = 1', 'this.foo = 1')).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different name', () => {
        expect(compare('a.b = 1', 'a.c = 1')).toBe(false);
      });

      it('different receiver', () => {
        expect(compare('a.b = 1', 'c.b = 1')).toBe(false);
      });

      it('different value', () => {
        expect(compare('a.b = 1', 'a.b = 2')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(
        parseOutputHandler(a, PropertyWrite),
        parseOutputHandler(b, PropertyWrite),
      );
    }
  });

  describe('SafePropertyRead', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'foo?.bar';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different name', () => {
        expect(compare('a?.b', 'a?.c')).toBe(false);
      });

      it('different receiver', () => {
        expect(compare('a?.b', 'c?.b')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): SafePropertyRead {
      return parseBoundText(`{{ ${markup} }}`, SafePropertyRead);
    }
  });

  describe('SafeKeyedRead', () => {
    describe('equivalent', () => {
      it('identical', () => {
        const markup = 'foo?.["bar"]';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different receiver', () => {
        expect(compare('a?.["bar"]', 'b?.["bar"]')).toBe(false);
      });

      it('different key', () => {
        expect(compare('a?.["x"]', 'a?.["y"]')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): SafeKeyedRead {
      return parseBoundText(`{{ ${markup} }}`, SafeKeyedRead);
    }
  });

  describe('Call', () => {
    describe('equivalent', () => {
      it('identical with no arguments', () => {
        const markup = 'foo()';
        expect(compare(markup, markup)).toBe(true);
      });

      it('identical with arguments', () => {
        const markup = 'foo(1, 2)';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different receiver', () => {
        expect(compare('a(1)', 'b(1)')).toBe(false);
      });

      it('different number of arguments', () => {
        expect(compare('a(1, 2, 3)', 'a(1, 2, 3, 4)')).toBe(false);
      });

      it('different argument values', () => {
        expect(compare('a(1, 2, 3)', 'a(1, 3, 2)')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): Call {
      return parseBoundText(`{{ ${markup} }}`, Call);
    }
  });

  describe('SafeCall', () => {
    describe('equivalent', () => {
      it('identical with no arguments', () => {
        const markup = 'foo?.()';
        expect(compare(markup, markup)).toBe(true);
      });

      it('identical with arguments', () => {
        const markup = 'foo?.(1, 2)';
        expect(compare(markup, markup)).toBe(true);
      });
    });

    describe('not equivalent', () => {
      it('different receiver', () => {
        expect(compare('a?.(1)', 'b?.(1)')).toBe(false);
      });

      it('different number of arguments', () => {
        expect(compare('a?.(1, 2, 3)', 'a?.(1, 2, 3, 4)')).toBe(false);
      });

      it('different argument values', () => {
        expect(compare('a?.(1, 2, 3)', 'a?.(1, 3, 2)')).toBe(false);
      });
    });

    function compare(a: string, b: string): boolean {
      return areEquivalentASTs(parse(a), parse(b));
    }

    function parse(markup: string): SafeCall {
      return parseBoundText(`{{ ${markup} }}`, SafeCall);
    }
  });
});

function parseBoundText<T>(markup: string, type: unknown): T {
  const ast = parseForESLint(markup, {
    filePath: './foo.html',
    suppressParseErrors: false,
  }).ast;
  expect(ast.templateNodes).toHaveLength(1);

  expect(ast.templateNodes[0]).toBeInstanceOf(TmplAstBoundText);
  const boundText = ast.templateNodes[0] as TmplAstBoundText;

  expect(boundText.value).toBeInstanceOf(ASTWithSource);
  const astWithSource = boundText.value as ASTWithSource;

  expect(astWithSource.ast).toBeInstanceOf(Interpolation);
  const interpolation = astWithSource.ast as Interpolation;

  expect(interpolation.expressions).toHaveLength(1);
  expect(interpolation.expressions[0]).toBeInstanceOf(type);

  return interpolation.expressions[0] as T;
}

function parseOutputHandler<T>(markup: string, type: unknown): T {
  const ast = parseForESLint(`<button (click)='${markup}'></button>`, {
    filePath: './foo.html',
    suppressParseErrors: false,
  }).ast;
  expect(ast.templateNodes).toHaveLength(1);

  expect(ast.templateNodes[0]).toBeInstanceOf(TmplAstElement);
  const element = ast.templateNodes[0] as TmplAstElement;

  expect(element.outputs).toHaveLength(1);
  const output = element.outputs[0];

  expect(output.handler).toBeInstanceOf(ASTWithSource);
  const astWithSource = output.handler as ASTWithSource;

  expect(astWithSource.ast).toBeInstanceOf(type);
  return output.handler as T;
}
