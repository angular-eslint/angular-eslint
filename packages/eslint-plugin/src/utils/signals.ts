import { Type, Symbol } from 'typescript';

export const KNOWN_SIGNAL_TYPES: ReadonlySet<string> = new Set([
  'InputSignal',
  'ModelSignal',
  'Signal',
  'WritableSignal',
  'InputSignalWithTransform',
]);

export function isSignal(type: Type, symbol: Symbol | undefined): boolean {
  if (symbol && KNOWN_SIGNAL_TYPES.has(symbol.name)) {
    return true;
  }

  // If the type has an alias symbol, then check if that
  // alias symbol is a known signal type. The `Signal` type
  // will fall under this category, because it is defined
  // as a type alias. Other signal types like `InputSignal`
  // won't match here, because they are defined as interfaces.
  if (type.aliasSymbol) {
    return KNOWN_SIGNAL_TYPES.has(type.aliasSymbol.name);
  }

  return false;
}
