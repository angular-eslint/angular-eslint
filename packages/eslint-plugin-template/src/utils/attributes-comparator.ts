import { getLiteralValue } from './get-literal-value';
import { getAttributeValue } from './get-attribute-value';

export function attributesComparator(
  baseAttributes: any[] = [],
  node: any,
): boolean {
  const attributes: any[] = [...node.attributes, ...node.inputs];

  return baseAttributes.every((baseAttribute) =>
    attributes.some((attribute) => {
      if (node.name === 'a' && attribute.name === 'routerLink') {
        return true;
      }

      if (baseAttribute.name !== attribute.name) {
        return false;
      }

      if (
        baseAttribute.value &&
        baseAttribute.value !==
          getLiteralValue(getAttributeValue(node, baseAttribute.name))
      ) {
        return false;
      } else {
        return true;
      }
    }),
  );
}
