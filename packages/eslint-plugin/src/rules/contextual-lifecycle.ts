import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';

import {
  ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER,
  AngularClassDecorators,
  AngularLifecycleMethodKeys,
  getClassName,
  getDeclaredMethods,
  getDecorator,
  getMethodName,
  isAngularLifecycleMethod,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'contextuaLifecycle';
export const RULE_NAME = 'contextual-lifecycle';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that classes use allowed lifecycle method in its body',
      category: 'Possible Errors',
      recommended: false,
    },
    schema: [],
    messages: {
      contextuaLifecycle: `The method {{methodName}} is not allowed for class {{className}} because it is decorated with {{decoratorName}}`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        const className = getClassName(node);
        const isDirective = !!getDecorator(
          node,
          AngularClassDecorators.Directive,
        );
        const isInjectable = !!getDecorator(
          node,
          AngularClassDecorators.Injectable,
        );
        const isPipe = !!getDecorator(node, AngularClassDecorators.Pipe);
        const isNgModule = !!getDecorator(
          node,
          AngularClassDecorators.NgModule,
        );

        let allowedMethods: ReadonlySet<AngularLifecycleMethodKeys> | undefined;
        let decoratorName: string;

        if (isInjectable) {
          allowedMethods = ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER.get(
            AngularClassDecorators.Injectable,
          );
          decoratorName = AngularClassDecorators.Injectable;
        } else if (isDirective) {
          allowedMethods = ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER.get(
            AngularClassDecorators.Directive,
          );
          decoratorName = AngularClassDecorators.Directive;
        } else if (isPipe) {
          allowedMethods = ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER.get(
            AngularClassDecorators.Pipe,
          );
          decoratorName = AngularClassDecorators.Pipe;
        } else if (isNgModule) {
          allowedMethods = ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER.get(
            AngularClassDecorators.NgModule,
          );
          decoratorName = AngularClassDecorators.NgModule;
        } else {
          return;
        }

        const declaredMethods = getDeclaredMethods(node);

        for (const method of declaredMethods) {
          const methodName = getMethodName(method);
          if (
            !isAngularLifecycleMethod(methodName) ||
            (allowedMethods && allowedMethods.has(methodName))
          )
            continue;

          context.report({
            node: method.key,
            messageId: 'contextuaLifecycle',
            data: {
              methodName,
              className,
              decoratorName,
            },
          });
        }
      },
    };
  },
});
