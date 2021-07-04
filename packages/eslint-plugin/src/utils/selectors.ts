export const COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR =
  'ClassDeclaration > Decorator:matches([expression.callee.name="Component"], [expression.callee.name="Directive"])';

export const COMPONENT_CLASS_DECORATOR =
  'ClassDeclaration > Decorator[expression.callee.name="Component"]';

export const DIRECTIVE_CLASS_DECORATOR =
  'ClassDeclaration > Decorator[expression.callee.name="Directive"]';

export const PIPE_CLASS_DECORATOR =
  'ClassDeclaration > Decorator[expression.callee.name="Pipe"]';

export const INJECTABLE_CLASS_DECORATOR =
  'ClassDeclaration > Decorator[expression.callee.name="Injectable"]';

export const MODULE_CLASS_DECORATOR =
  'ClassDeclaration > Decorator[expression.callee.name="NgModule"]';

export const OUTPUT_DECORATOR = 'Decorator[expression.callee.name="Output"]';

export const OUTPUTS_METADATA_PROPERTY = `${COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR} Property[key.name='outputs'] > ArrayExpression :matches(Literal, TemplateElement)`;

export const OUTPUT_ALIAS = `:matches(ClassProperty, MethodDefinition[kind='get']) ${OUTPUT_DECORATOR} :matches(Literal, TemplateElement)`;

export const OUTPUT_PROPERTY_OR_GETTER = `:matches(ClassProperty, MethodDefinition[kind='get'])[computed=false]:has(${OUTPUT_DECORATOR}) > :matches(Identifier, Literal)`;
