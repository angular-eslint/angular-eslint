# Our philosophy on lint rules which enforce code formatting conventions

It is the view of the maintainers of this project that using a linter to enforce code formatting concerns is fundamentally not a good idea.

There are dedicated code formatters, such as https://prettier.io (recommended) and clang format which are far more powerful and specialized for the use case of code formatting concerns such as indentation, line breaks, semi-colons, commas etc.

We have been maintaining ESLint and associated rules, plugins and parsers for over 5 years now and we know that maintaining rules related to code formatting is incredibly difficult and fragile, particularly because all code fixes operate on a string representation of your code and not an AST.

We are a tiny team with a massive userbase so we have to pick our battles. **We will therefore not be providing or supporting any code formatting related rules via our plugins in this project.**

## Recommendation

We strongly recommend you check out https://prettier.io as it is incredibly powerful and popular across all common frontend languages such as JavaScript, TypeScript, CSS and HTML. There are even multiple ways you can combine prettier with ESLint in your projects:

- https://github.com/prettier/eslint-config-prettier (personally recommended as it keeps linting and formatting as separate responsibilites)
- https://github.com/prettier/eslint-plugin-prettier (runs prettier within ESLint so you get feedback on violations from prettier itself rather than more fragile ESLint formatting rules).

## But what if I really, really, really want to enforce code formatting conventions via lint rules?

Fair enough, that is your choice to make, we are just giving recommendations from our own experiences.

You can create your own ESLint plugin (whether or not you then choose to share it with the world is of course a secondary choice) and create any and all formatting rules which you can combine with the plugins which angular-eslint provides. One of the great things about ESLint is the ability to combine rules and plugins from your own projects with those of countless others from the open-source community.
