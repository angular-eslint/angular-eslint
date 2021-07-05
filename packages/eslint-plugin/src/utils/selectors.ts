export const COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR =
  'ClassDeclaration > Decorator[expression.callee.name=/^(Component|Directive)$/]';

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

export const INPUT_DECORATOR = 'Decorator[expression.callee.name="Input"]';

export const OUTPUT_DECORATOR = 'Decorator[expression.callee.name="Output"]';

export const LITERAL_OR_TEMPLATE_ELEMENT = ':matches(Literal, TemplateElement)';

export const SELECTOR_METADATA_PROPERTY =
  'Property:matches([key.name="selector"], [key.value="selector"])';

export const COMPONENT_SELECTOR_LITERAL = `${COMPONENT_CLASS_DECORATOR} ${SELECTOR_METADATA_PROPERTY} ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const DIRECTIVE_SELECTOR_LITERAL = `${DIRECTIVE_CLASS_DECORATOR} ${SELECTOR_METADATA_PROPERTY} ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const COMPONENT_OR_DIRECTIVE_SELECTOR_LITERAL = `:matches(${COMPONENT_SELECTOR_LITERAL}, ${DIRECTIVE_SELECTOR_LITERAL})`;

export const INPUTS_METADATA_PROPERTY =
  'Property:matches([key.name="inputs"], [key.value="inputs"])';

export const INPUTS_METADATA_PROPERTY_LITERAL = `${COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR} ${INPUTS_METADATA_PROPERTY} > ArrayExpression ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const INPUT_ALIAS = `:matches(ClassProperty, MethodDefinition[kind='set']) ${INPUT_DECORATOR} ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const INPUT_PROPERTY_OR_SETTER = `:matches(ClassProperty, MethodDefinition[kind='set'])[computed=false]:has(${INPUT_DECORATOR}) > :matches(Identifier, Literal)`;

export const OUTPUTS_METADATA_PROPERTY = `${COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR} Property[key.name='outputs'] > ArrayExpression ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const OUTPUT_ALIAS = `:matches(ClassProperty, MethodDefinition[kind='get']) ${OUTPUT_DECORATOR} ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const OUTPUT_PROPERTY_OR_GETTER = `:matches(ClassProperty, MethodDefinition[kind='get'])[computed=false]:has(${OUTPUT_DECORATOR}) > :matches(Identifier, Literal)`;
