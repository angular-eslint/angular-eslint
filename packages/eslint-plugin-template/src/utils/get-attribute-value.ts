import { PROPERTY } from './constants';

export function getAttributeValue<T = unknown>(
  node: any,
  attributeName: string,
): T | null | typeof PROPERTY {
  const attribute = node.attributes.find(
    (attribute: any) => attribute.name === attributeName,
  );

  if (attribute) {
    return attribute.value;
  }

  const input = node.inputs.find((input: any) => input.name === attributeName);

  if (!input || !input.value.ast) {
    return null;
  } else if (input.value.ast.value) {
    return input.value.ast.value;
  } else {
    return PROPERTY;
  }
}
