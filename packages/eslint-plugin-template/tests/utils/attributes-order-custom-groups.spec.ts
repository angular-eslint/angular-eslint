import { OrderType } from '../../src/rules/attributes-order';
import { compileCustomGroups } from '../../src/utils/attributes-order-custom-groups';

const defaultOrderWithNeo = [
  OrderType.StructuralDirective,
  OrderType.TemplateReferenceVariable,
  'neoAttr',
  OrderType.AttributeBinding,
  OrderType.InputBinding,
  OrderType.TwoWayBinding,
  OrderType.OutputBinding,
] as const;

describe('compileCustomGroups', () => {
  it('throws when attributeNamePattern is invalid', () => {
    expect(() =>
      compileCustomGroups(
        [{ groupName: 'neoAttr', attributeNamePattern: '[' }],
        [...defaultOrderWithNeo],
      ),
    ).toThrow(/invalid attributeNamePattern/);
  });

  it('throws when custom group is missing from order', () => {
    expect(() =>
      compileCustomGroups(
        [{ groupName: 'neoAttr', attributeNamePattern: '^neo' }],
        [...defaultOrderWithNeo].filter((entry) => entry !== 'neoAttr'),
      ),
    ).toThrow(/must appear in order/);
  });

  it('throws when groupName matches a built-in order type', () => {
    expect(() =>
      compileCustomGroups(
        [
          {
            groupName: OrderType.InputBinding,
            attributeNamePattern: '^neo',
          },
        ],
        defaultOrderWithNeo,
      ),
    ).toThrow(/must not match a built-in order type/);
  });
});
