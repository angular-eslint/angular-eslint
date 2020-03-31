import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/cyclomatic-complexity';
import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '../test-helper';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'cyclomaticComplexity';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        <div *ngIf="a === '1'">
          <div>{{ person.name }}</div>
        </div>
      `,
      options: [
        {
          maxComplexity: 1,
        },
      ],
    },
    {
      code: `
        <div *ngIf="a === '1'">
          <div *ngFor="let person of persons; trackBy: trackByFn">
            {{ person.name }}
          </div>
        </div>
      `,
      options: [
        {
          maxComplexity: 2,
        },
      ],
    },
    {
      code: `
        <div *ngIf="a === '1'">
          <div *ngFor="let person of persons; trackBy: trackByFn">
            {{ person.name }}
            <div [ngSwitch]="person.emotion">
              <app-happy-hero    *ngSwitchCase="'happy'" [hero]="currentHero"></app-happy-hero>
              <app-sad-hero      *ngSwitchCase="'sad'"   [hero]="currentHero"></app-sad-hero>
              <app-unknown-hero  *ngSwitchDefault        [hero]="currentHero"></app-unknown-hero>
            </div>
          </div>
        </div>
      `,
      options: [
        {
          maxComplexity: 5,
        },
      ],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the cyclomatic complexity is higher than the maximum defined',
      annotatedSource: `
        <div *ngIf="a === '1'">
          <div *ngFor="let person of persons; trackBy: trackByFn">
            <div *ngIf="a === '1'">{{ person.name }}</div>
            <div [ngSwitch]="person.emotion">
              <app-happy-hero    *ngSwitchCase="'happy'"    [hero]="currentHero"></app-happy-hero>
              <app-sad-hero      *ngSwitchCase="'sad'"      [hero]="currentHero"></app-sad-hero>
              <app-confused-hero *ngSwitchCase="'confused'" [hero]="currentHero"></app-confused-hero>
                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~
              <app-unknown-hero  *ngSwitchDefault           [hero]="currentHero"></app-unknown-hero>
                                 ^^^^^^^^^^^^^^^^
            </div>
          </div>
        </div>
      `,
      messages: [
        {
          char: '~',
          messageId,
        },
        {
          char: '^',
          messageId,
        },
      ],
      options: [
        {
          maxComplexity: 5,
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the cyclomatic complexity is higher than the maximum defined, using directives with ng-template',
      annotatedSource: `
        <div [fakeDirective]="'test'"></div>
        <ng-template ngFor let-person [ngForOf]="persons" let-i="index">
          {{ person.name }}
        </ng-template>
        <ng-template [ngIf]="a === '1'">
          something here
        </ng-template>
        <div *ngIf="a === '1'">
          <div *ngFor="let person of persons; trackBy: trackByFn">
            <div *ngIf="a === '1'">{{ person.name }}</div>
            <div [ngSwitch]="person.emotion">
              <app-happy-hero    *ngSwitchCase="'happy'"    [hero]="currentHero"></app-happy-hero>
              <app-sad-hero      *ngSwitchCase="'sad'"      [hero]="currentHero"></app-sad-hero>
                                 ~~~~~~~~~~~~~~~~~~~~~
              <app-confused-hero *ngSwitchCase="'confused'" [hero]="currentHero"></app-confused-hero>
                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^
              <app-unknown-hero  *ngSwitchDefault           [hero]="currentHero"></app-unknown-hero>
                                 ################
            </div>
          </div>
        </div>
      `,
      messages: [
        {
          char: '~',
          messageId,
        },
        {
          char: '^',
          messageId,
        },
        {
          char: '#',
          messageId,
        },
      ],
      options: [
        {
          maxComplexity: 6,
        },
      ],
    }),
  ],
});
