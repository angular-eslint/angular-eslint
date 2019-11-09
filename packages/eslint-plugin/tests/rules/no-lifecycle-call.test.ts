import rule, { MessageIds, RULE_NAME } from '../../src/rules/no-lifecycle-call';
import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '../test-helper';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'noLifecycleCall';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // #region Components
    `@Component({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngAfterContentChecked();
      }
    }`,

    `@Component({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngAfterContentInit();
      }
    }`,

    `@Component({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngAfterViewChecked();
      }
    }`,

    `@Component({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngAfterViewInit();
      }
    }`,

    `@Component({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngDoCheck();
      }
    }`,

    `@Component({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngOnChanges();
      }
    }`,

    `@Component({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngOnInit();
      }
    }`,
    // #endregion Components

    // #region Directives
    `@Directive({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngAfterContentChecked();
      }
    }`,

    `@Directive({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngAfterContentInit();
      }
    }`,

    `@Directive({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngAfterViewChecked();
      }
    }`,

    `@Directive({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngAfterViewInit();
      }
    }`,

    `@Directive({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngDoCheck();
      }
    }`,

    `@Directive({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngOnChanges();
      }
    }`,

    `@Directive({
      selector: 'test'
    })
    class Test {
      test() {
        super.ngOnInit();
      }
    }`,
    // #endregion Directives

    // #region Injectables
    `@Injectable()
    class Test {
      test() {
        super.ngAfterContentChecked();
      }
    }`,

    `@Injectable()
    class Test {
      test() {
        super.ngAfterContentInit();
      }
    }`,

    `@Injectable()
    class Test {
      test() {
        super.ngAfterViewChecked();
      }
    }`,

    `@Injectable()
    class Test {
      test() {
        super.ngAfterViewInit();
      }
    }`,

    `@Injectable()
    class Test {
      test() {
        super.ngDoCheck();
      }
    }`,

    `@Injectable()
    class Test {
      test() {
        super.ngOnChanges();
      }
    }`,

    `@Injectable()
    class Test {
      test() {
        super.ngOnInit();
      }
    }`,
    // #endregion Injectables

    // #region Pipes
    `@Pipe({
      name: 'test'
    })
    class Test {
      test() {
        super.ngAfterContentChecked();
      }
    }`,

    `@Pipe({
      name: 'test'
    })
    class Test {
      test() {
        super.ngAfterContentInit();
      }
    }`,

    `@Pipe({
      name: 'test'
    })
    class Test {
      test() {
        super.ngAfterViewChecked();
      }
    }`,

    `@Pipe({
      name: 'test'
    })
    class Test {
      test() {
        super.ngAfterViewInit();
      }
    }`,

    `@Pipe({
      name: 'test'
    })
    class Test {
      test() {
        super.ngDoCheck();
      }
    }`,

    `@Pipe({
      name: 'test'
    })
    class Test {
      test() {
        super.ngOnChanges();
      }
    }`,

    `@Pipe({
      name: 'test'
    })
    class Test {
      test() {
        super.ngOnInit();
      }
    }`,
    // #endregion Pipes

    // should succeed if explicitly calling multiple non lifecycle methods
    `@Component({
      selector: 'test'
    })
    class Test {
      test(): void {
        this.ngAfterContentChecked1();
        this.angAfterContentInit();
        this.ngAfterViewChecked2();
        this.ngAfterViewInit3();
        this.ngOnChange$();
        this.ngOnDestroyx();
        this.ngOnInitialize();
        this.ngDoChecking();
      }
    }
    @Directive({
      selector: 'test'
    })
    class TestDirective {
      test(): void {
        this.ngAfterContentChecked1();
        this.angAfterContentInit();
        this.ngAfterViewChecked2();
        this.ngAfterViewInit3();
        this.ngOnChange$();
        this.ngOnDestroyx();
        this.ngOnInitialize();
        this.ngDoChecking();
      }
    }`,
  ],
  invalid: [
    // #region Components
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterContentChecked',
      annotatedSource: `@Component({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngAfterContentChecked();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterContentInit()',
      annotatedSource: `@Component({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngAfterContentInit();
          ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterViewChecked()',
      annotatedSource: `@Component({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngAfterViewChecked();
          ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterViewInit()',
      annotatedSource: `@Component({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngAfterViewInit();
          ~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngDoCheck()',
      annotatedSource: `@Component({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngDoCheck();
          ~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngOnChanges()',
      annotatedSource: `@Component({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngOnChanges();
          ~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngOnInit()',
      annotatedSource: `@Component({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngOnInit();
          ~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),
    // #endregion

    // #region Directives
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if explicitly calling ngAfterContentChecked()',
      annotatedSource: `@Directive({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngAfterContentChecked();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterContentInit()',
      annotatedSource: `@Directive({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngAfterContentInit();
          ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterViewChecked()',
      annotatedSource: `@Directive({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngAfterViewChecked();
          ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterViewInit()',
      annotatedSource: `@Directive({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngAfterViewInit();
          ~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngDoCheck()',
      annotatedSource: `@Directive({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngDoCheck();
          ~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngOnChanges()',
      annotatedSource: `@Directive({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngOnChanges();
          ~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngOnInit()',
      annotatedSource: `@Directive({
        selector: 'test'
      })
      class Test {
        test() {
          this.ngOnInit();
          ~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),
    // #endregion Directives

    // #region Injectables
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if explicitly calling ngAfterContentChecked()',
      annotatedSource: `@Injectable()
      class Test {
        test() {
          this.ngAfterContentChecked();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterContentInit()',
      annotatedSource: `@Injectable()
      class Test {
        test() {
          this.ngAfterContentInit();
          ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterViewChecked()',
      annotatedSource: `@Injectable()
      class Test {
        test() {
          this.ngAfterViewChecked();
          ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterViewInit()',
      annotatedSource: `@Injectable()
      class Test {
        test() {
          this.ngAfterViewInit();
          ~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngDoCheck()',
      annotatedSource: `@Injectable()
      class Test {
        test() {
          this.ngDoCheck();
          ~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngOnChanges()',
      annotatedSource: `@Injectable()
      class Test {
        test() {
          this.ngOnChanges();
          ~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngOnInit()',
      annotatedSource: `@Injectable()
      class Test {
        test() {
          this.ngOnInit();
          ~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),
    // #endregion Injectables

    // #region Pipes
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if explicitly calling ngAfterContentChecked()',
      annotatedSource: `@Pipe({
        name: 'test'
      })
      class Test {
        test() {
          this.ngAfterContentChecked();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterContentInit()',
      annotatedSource: `@Pipe({
        name: 'test'
      })
      class Test {
        test() {
          this.ngAfterContentInit();
          ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterViewChecked()',
      annotatedSource: `@Pipe({
        name: 'test'
      })
      class Test {
        test() {
          this.ngAfterViewChecked();
          ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngAfterViewInit()',
      annotatedSource: `@Pipe({
        name: 'test'
      })
      class Test {
        test() {
          this.ngAfterViewInit();
          ~~~~~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngDoCheck()',
      annotatedSource: `@Pipe({
        name: 'test'
      })
      class Test {
        test() {
          this.ngDoCheck();
          ~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngOnChanges()',
      annotatedSource: `@Pipe({
        name: 'test'
      })
      class Test {
        test() {
          this.ngOnChanges();
          ~~~~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if explicitly calling ngOnInit()',
      annotatedSource: `@Pipe({
        name: 'test'
      })
      class Test {
        test() {
          this.ngOnInit();
          ~~~~~~~~~~~~~~~
        }
      }`,
      messageId,
    }),
    // #endregion Pipes
  ],
});
