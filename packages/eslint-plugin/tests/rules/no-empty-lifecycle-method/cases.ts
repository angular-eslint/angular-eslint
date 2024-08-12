import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-empty-lifecycle-method';

const messageId: MessageIds = 'noEmptyLifecycleMethod';
const suggestRemoveLifecycleMethod: MessageIds = 'suggestRemoveLifecycleMethod';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    @Component()
    class Test {
      ngAfterContentChecked() { console.log('AfterContentChecked'); }
    }
  `,
  `
    @Directive()
    class Test {
      ngAfterContentInit() { console.log('AfterContentInit'); }
    }
  `,
  `
    @Injectable()
    class Test {
      ngAfterViewChecked() { console.log('AfterViewChecked'); }
    }
  `,
  `
    @NgModule()
    class Test {
      ngAfterViewInit() { console.log('AfterViewInit'); }
    }
  `,
  `
    @Pipe()
    class Test {
      ngDoBootstrap() { console.log('DoBootstrap'); }
    }
  `,
  `
    @Component()
    class Test {
      ngDoCheck() { console.log('DoCheck'); }
    }
  `,
  `
    @Directive()
    class Test {
      ngOnChanges() { console.log('OnChanges'); }
    }
  `,
  `
    @Injectable()
    class Test {
      ngOnDestroy() { console.log('OnDestroy'); }
    }
  `,
  `
    @NgModule()
    class Test {
      ngOnInit() { console.log('OnInit'); }
    }
  `,
  `
    @Component()
    class Test {
      [ngOnInit]() {}
    }
  `,
  `
    class Test {
      ngOnInit() {}
    }
  `,
];
export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `ngAfterContentChecked()` method is empty',
    annotatedSource: `
      @Component()
      class Test {
        ngAfterContentChecked() {}
        ~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveLifecycleMethod,
        output: `
      @Component()
      class Test {
        
        
      }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `ngAfterContentInit()` method is empty',
    annotatedSource: `
      @Directive()
      class Test extends BaseDirective {
        ngAfterContentInit() {}
        ~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveLifecycleMethod,
        output: `
      @Directive()
      class Test extends BaseDirective {
        
        
      }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: "should fail if `'ngAfterViewChecked'()` method is empty",
    annotatedSource: `
      @Injectable()
      class Test extends BaseTest implements AfterViewChecked, OnDestroy {
        'ngAfterViewChecked'() {}
        ~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveLifecycleMethod,
        output: `
      @Injectable()
      class Test extends BaseTest implements  OnDestroy {
        
        
      }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: "should fail if `['ngAfterViewInit']()` method is empty",
    annotatedSource: `
      @NgModule()
      class Test {
        ['ngAfterViewInit']() {}
        ~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveLifecycleMethod,
        output: `
      @NgModule()
      class Test {
        
        
      }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `[`ngDoBootstrap`]()` method is empty',
    annotatedSource: `
      import { HttpInterceptor } from '@angular/common/http';
      import {
        DoCheck,
        DoBootstrap
      } from '@angular/core';
      @Pipe()
      class Test {
        [\`ngDoBootstrap\`]() {}
        ~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveLifecycleMethod,
        output: `
      import { HttpInterceptor } from '@angular/common/http';
      import {
        DoCheck
      } from '@angular/core';
      @Pipe()
      class Test {
        
        
      }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `ngDoCheck()` method is empty',
    annotatedSource: `
      import {
        AfterViewChecked,
        DoCheck,
        AfterViewInit,
      } from '@angular/core';
      @Component()
      class Test 
          implements AfterViewChecked,
                      AfterViewInit,
                      DoCheck {
        ngDoCheck() {}
        ~~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveLifecycleMethod,
        output: `
      import {
        AfterViewChecked,
        AfterViewInit,
      } from '@angular/core';
      @Component()
      class Test 
          implements AfterViewChecked,
                      AfterViewInit {
        
        
      }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `ngOnChanges()` method is empty',
    annotatedSource: `
      import {OnChanges, AfterContentInit} from '@angular/core';
      @Directive()
      class Test implements OnChanges, AfterContentInit {
        ngOnChanges() {}
        ~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveLifecycleMethod,
        output: `
      import { AfterContentInit} from '@angular/core';
      @Directive()
      class Test implements  AfterContentInit {
        
        
      }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `ngOnDestroy()` method is empty',
    annotatedSource: `
      import * as ng from '@angular/core';
      @Injectable()
      class Test implements ng.OnDestroy {
        ngOnDestroy() {}
        ~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveLifecycleMethod,
        output: `
      import * as ng from '@angular/core';
      @Injectable()
      class Test  {
        
        
      }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `ngOnInit()` method is empty',
    annotatedSource: `
      import {DoBootstrap, OnInit} from '@angular/core';
      @NgModule()
      class Test implements OnInit, DoBootstrap {
        ngOnInit() {
          this.init();
        }
      }

      @NgModule()
      class Test2 implements OnInit, DoBootstrap {
        ngOnInit() {}
        ~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveLifecycleMethod,
        output: `
      import {DoBootstrap, OnInit} from '@angular/core';
      @NgModule()
      class Test implements OnInit, DoBootstrap {
        ngOnInit() {
          this.init();
        }
      }

      @NgModule()
      class Test2 implements  DoBootstrap {
        
        
      }
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    // https://github.com/angular-eslint/angular-eslint/issues/604
    description: 'should fail if `ngOnInit()` method is empty',
    annotatedSource: `
      @Component()
      class Test extends BaseComponent<unknown> implements OnInit {
        ngOnInit() {}
        ~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveLifecycleMethod,
        output: `
      @Component()
      class Test extends BaseComponent<unknown>  {
        
        
      }
    `,
      },
    ],
  }),
];
