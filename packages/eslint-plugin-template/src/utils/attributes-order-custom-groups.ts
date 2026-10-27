export type CustomGroupOption = Readonly<{
  groupName: string;
  attributeNamePattern: string;
}>;

export type CompiledCustomGroup = Readonly<{
  groupName: string;
  regex: RegExp;
}>;

const ORDER_TYPE_VALUES = new Set<string>([
  'TEMPLATE_REFERENCE',
  'STRUCTURAL_DIRECTIVE',
  'ATTRIBUTE_BINDING',
  'INPUT_BINDING',
  'TWO_WAY_BINDING',
  'OUTPUT_BINDING',
]);

const DEFAULT_ORDER_TYPES = [
  'STRUCTURAL_DIRECTIVE',
  'TEMPLATE_REFERENCE',
  'ATTRIBUTE_BINDING',
  'INPUT_BINDING',
  'TWO_WAY_BINDING',
  'OUTPUT_BINDING',
] as const;

export function compileCustomGroups(
  customGroups: readonly CustomGroupOption[],
  order: readonly string[],
): CompiledCustomGroup[] {
  const groupNames = new Set<string>();

  for (const group of customGroups) {
    if (groupNames.has(group.groupName)) {
      throw new Error(
        `[attributes-order]: duplicate customGroups groupName "${group.groupName}"`,
      );
    }

    if (ORDER_TYPE_VALUES.has(group.groupName)) {
      throw new Error(
        `[attributes-order]: customGroups groupName "${group.groupName}" must not match a built-in order type`,
      );
    }

    try {
      // eslint-disable-next-line no-new -- validation only
      new RegExp(group.attributeNamePattern);
    } catch {
      throw new Error(
        `[attributes-order]: invalid attributeNamePattern for group "${group.groupName}"`,
      );
    }

    groupNames.add(group.groupName);
  }

  for (const group of customGroups) {
    if (!order.includes(group.groupName)) {
      throw new Error(
        `[attributes-order]: customGroups groupName "${group.groupName}" must appear in order`,
      );
    }
  }

  for (const orderEntry of order) {
    if (
      !ORDER_TYPE_VALUES.has(orderEntry) &&
      !groupNames.has(orderEntry)
    ) {
      throw new Error(
        `[attributes-order]: unknown order entry "${orderEntry}"`,
      );
    }
  }

  for (const orderType of DEFAULT_ORDER_TYPES) {
    const occurrences = order.filter((entry) => entry === orderType).length;
    if (occurrences !== 1) {
      throw new Error(
        `[attributes-order]: order must include built-in type "${orderType}" exactly once`,
      );
    }
  }

  return customGroups.map((group) => ({
    groupName: group.groupName,
    regex: new RegExp(group.attributeNamePattern),
  }));
}

export function resolveSortKey(
  attr: Readonly<{
    name: string;
    keySpan?: { details?: string | null };
    orderType: string;
  }>,
  compiledCustomGroups: readonly CompiledCustomGroup[],
): string {
  if (compiledCustomGroups.length === 0) {
    return attr.orderType;
  }

  const name = attr.keySpan?.details ?? attr.name;

  for (const group of compiledCustomGroups) {
    if (group.regex.test(name)) {
      return group.groupName;
    }
  }

  return attr.orderType;
}
