// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export * from '@angular/compiler';

import type {
  MessageBundle,
  ParsedTemplate,
  LocalizedString,
} from '@angular/compiler';
export type Comment = Required<ParsedTemplate>['commentNodes'][number];
export type Message = ReturnType<MessageBundle['getMessages']>[number];
export type I18nMeta = LocalizedString['metaBlock'];
