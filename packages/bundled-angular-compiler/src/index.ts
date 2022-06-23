export * from '@angular/compiler';

import type { MessageBundle, ParsedTemplate } from '@angular/compiler';
export type Comment = Required<ParsedTemplate>['commentNodes'][number];
export type Message = ReturnType<MessageBundle['getMessages']>[number];
