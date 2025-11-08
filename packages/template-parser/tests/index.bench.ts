import { bench, describe } from 'vitest';
import { parseForESLint } from '../src/index';

describe('Template Parser Performance', () => {
  function createTemplate(numLines: number, componentsPerLine = 2): string {
    const lines: string[] = [];
    for (let i = 0; i < numLines; i++) {
      let line = '';
      for (let j = 0; j < componentsPerLine; j++) {
        line += `<div [class]="value${i}_${j}" (click)="handler${i}_${j}()">{{ data${i}_${j} }}</div>`;
      }
      lines.push(line);
    }
    return lines.join('\n');
  }

  bench(
    'Small template (50 lines)',
    () => {
      const template = createTemplate(50);
      parseForESLint(template, { filePath: './test.html' });
    },
    { iterations: 100 },
  );

  bench(
    'Medium template (200 lines)',
    () => {
      const template = createTemplate(200);
      parseForESLint(template, { filePath: './test.html' });
    },
    { iterations: 50 },
  );

  bench(
    'Large template (1000 lines)',
    () => {
      const template = createTemplate(1000);
      parseForESLint(template, { filePath: './test.html' });
    },
    { iterations: 10 },
  );

  bench(
    'Complex template with nested structures',
    () => {
      const template = `
        <div *ngFor="let item of items; let i = index">
          <h1>{{ item.title }}</h1>
          <div [ngClass]="{active: item.active, disabled: !item.enabled}">
            <button (click)="handleClick(item, i)" [disabled]="!item.enabled">
              {{ item.label }}
            </button>
            @if (item.showDetails) {
              <div class="details">
                <p>{{ item.description }}</p>
                @for (tag of item.tags; track tag.id) {
                  <span class="tag">{{ tag.name }}</span>
                }
              </div>
            }
            @defer (on viewport) {
              <img [src]="item.imageUrl" [alt]="item.title" />
            }
          </div>
        </div>
      `.repeat(50);
      parseForESLint(template, { filePath: './test.html' });
    },
    { iterations: 20 },
  );
});
