# Enforces sorting of values within NgModule metadata arrays (`sort-ngmodule-metadata-arrays`)

This rule enforces that NgModule metadata arrays have a sorted list of identifiers. Objects such as provider definitions, call expressions and computed members will be ignored for sorting purposes. Sorting is based on simple string localeCompare.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
@NgModule({
  providers: [_Provider, BProvider, AProvider, CProvider],
})
export class AppModule {}
```

Example of **correct** code for this rule:

```ts
@Component({
  providers: [_Provider, AProvider, BProvider, CProvider],
})
export class AppComponent {}
```

## Options

There are no additional options for this rule

```json
{
  "@angular-eslint/sort-ngmodule-metadata-arrays": ["error"]
}
```
