type RegExpOrString = RegExp | string;
type ToString<T extends RegExpOrString> = T extends RegExp ? string : T;

type EmptyOrNullableAttributeQueryType = 'matches' | 'not';
type EmptyOrNullableAttribute<
  TAttributeNamePattern extends RegExpOrString,
  TQueryType extends EmptyOrNullableAttributeQueryType,
> = `:matches(BoundAttribute[name=${ToString<TAttributeNamePattern>}]:${TQueryType}([value.ast.type='EmptyExpr'], [value.ast.type='LiteralPrimitive']:matches([value.ast.value=null], [value.ast.value=undefined], [value.ast.value.length=0])), TextAttribute[name=${ToString<TAttributeNamePattern>}]:${TQueryType}([value.length=0]))`;

function emptyOrNullableAttributeFor<
  TAttributeNamePattern extends RegExpOrString,
  TQueryType extends EmptyOrNullableAttributeQueryType,
>(attributeNamePattern: TAttributeNamePattern, queryType: TQueryType) {
  return `:matches(BoundAttribute[name=${attributeNamePattern}]:${queryType}([value.ast.type='EmptyExpr'], [value.ast.type='LiteralPrimitive']:matches([value.ast.value=null], [value.ast.value=undefined], [value.ast.value.length=0])), TextAttribute[name=${attributeNamePattern}]:${queryType}([value.length=0]))` as EmptyOrNullableAttribute<
    TAttributeNamePattern,
    TQueryType
  >;
}

export function notEmptyOrNullableAttribute<
  TAttributeNamePattern extends RegExpOrString,
>(
  attributeNamePattern: TAttributeNamePattern,
): EmptyOrNullableAttribute<TAttributeNamePattern, 'not'> {
  return emptyOrNullableAttributeFor(attributeNamePattern, 'not');
}

export function emptyOrNullableAttribute<
  TAttributeNamePattern extends RegExpOrString,
>(
  attributeNamePattern: TAttributeNamePattern,
): EmptyOrNullableAttribute<TAttributeNamePattern, 'matches'> {
  return emptyOrNullableAttributeFor(attributeNamePattern, 'matches');
}

type BinaryOrNullableAttribute<TAttributeNamePattern extends RegExpOrString> =
  `:matches(BoundAttribute[name=${ToString<TAttributeNamePattern>}][value.ast.type='LiteralPrimitive']:matches([value.ast.value=null], [value.ast.value=undefined]), TextAttribute[name=${ToString<TAttributeNamePattern>}]:not([valueSpan]))`;

export function binaryOrNullableAttribute<
  TAttributeNamePattern extends RegExpOrString,
>(
  attributeNamePattern: TAttributeNamePattern,
): BinaryOrNullableAttribute<TAttributeNamePattern> {
  return `:matches(BoundAttribute[name=${attributeNamePattern}][value.ast.type='LiteralPrimitive']:matches([value.ast.value=null], [value.ast.value=undefined]), TextAttribute[name=${attributeNamePattern}]:not([valueSpan]))` as BinaryOrNullableAttribute<TAttributeNamePattern>;
}

type Attribute<
  TName extends RegExpOrString,
  TValue extends RegExpOrString,
> = TValue extends undefined
  ? `:matches(BoundAttribute, TextAttribute)[name=${ToString<TName>}]`
  : `:matches(BoundAttribute[name=${ToString<TName>}][value.ast.value=${ToString<TValue>}], TextAttribute[name=${ToString<TName>}][value=${ToString<TValue>}])`;

export function attribute<
  TName extends RegExpOrString,
  TValue extends RegExpOrString,
>(name: TName, value?: TValue): Attribute<TName, TValue> {
  if (value) {
    return `:matches(BoundAttribute[name=${name}][value.ast.value=${value}], TextAttribute[name=${name}][value=${value}])` as Attribute<
      TName,
      TValue
    >;
  }

  return `:matches(BoundAttribute, TextAttribute)[name=${name}]` as Attribute<
    TName,
    TValue
  >;
}
