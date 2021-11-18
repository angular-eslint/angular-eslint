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

export function metadataProperty(key: RegExp): string;
export function metadataProperty<TKey extends string>(
  key: TKey,
): `Property:matches([key.name=${TKey}][computed=false], [key.value=${TKey}], [key.quasis.0.value.raw=${TKey}])`;
export function metadataProperty(key: RegExp | string): string {
  return `Property:matches([key.name=${key}][computed=false], [key.value=${key}], [key.quasis.0.value.raw=${key}])`;
}

export function methodDefinition(key: RegExp): string;
export function methodDefinition<TKey extends string>(
  key: TKey,
): `MethodDefinition:matches([key.name=${TKey}][computed=false], [key.value=${TKey}], [key.quasis.0.value.raw=${TKey}])`;
export function methodDefinition(key: RegExp | string): string {
  return `MethodDefinition:matches([key.name=${key}][computed=false], [key.value=${key}], [key.quasis.0.value.raw=${key}])`;
}

export const COMPONENT_SELECTOR_LITERAL = `${COMPONENT_CLASS_DECORATOR} ${metadataProperty(
  'selector',
)} ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const DIRECTIVE_SELECTOR_LITERAL = `${DIRECTIVE_CLASS_DECORATOR} ${metadataProperty(
  'selector',
)} ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const COMPONENT_OR_DIRECTIVE_SELECTOR_LITERAL = `:matches(${COMPONENT_SELECTOR_LITERAL}, ${DIRECTIVE_SELECTOR_LITERAL})`;

export const INPUTS_METADATA_PROPERTY_LITERAL = `${COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR} ${metadataProperty(
  'inputs',
)} > ArrayExpression ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const INPUT_ALIAS = `:matches(PropertyDefinition, MethodDefinition[kind='set']) ${INPUT_DECORATOR} ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const INPUT_PROPERTY_OR_SETTER = `:matches(PropertyDefinition, MethodDefinition[kind='set'])[computed=false]:has(${INPUT_DECORATOR}) > :matches(Identifier, Literal)`;

export const OUTPUTS_METADATA_PROPERTY_LITERAL = `${COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR} ${metadataProperty(
  'outputs',
)} > ArrayExpression ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const OUTPUT_ALIAS = `:matches(PropertyDefinition, MethodDefinition[kind='get']) ${OUTPUT_DECORATOR} ${LITERAL_OR_TEMPLATE_ELEMENT}`;

export const OUTPUT_PROPERTY_OR_GETTER = `:matches(PropertyDefinition, MethodDefinition[kind='get'])[computed=false]:has(${OUTPUT_DECORATOR}) > :matches(Identifier, Literal)`;
