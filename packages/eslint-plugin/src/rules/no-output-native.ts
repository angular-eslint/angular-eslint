import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { isLiteral, getClassName, getClassPropertyName } from '../utils/utils';

type Options = [];
export type MessageIds = 'noOutputNative';
export const RULE_NAME = 'no-output-native';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows naming directive outputs as standard DOM event.',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      noOutputNative:
        'The output property should not be named or renamed as a native event',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'ClassProperty > Decorator[expression.callee.name="Output"]'(
        node: TSESTree.Decorator,
      ) {
        const classProperty = node.parent as TSESTree.ClassProperty;
        const className = getClassName(node);

        if (!className) return;

        const propertyName = getClassPropertyName(classProperty);

        const outputCallExpression = node.expression as TSESTree.CallExpression;
        const arg = outputCallExpression.arguments[0];

        const outputName = (arg && isLiteral(arg) && arg.value) || propertyName;

        if (!outputName || !getNativeEventNames().has(outputName.toString()))
          return;

        context.report({
          node: classProperty,
          messageId: 'noOutputNative',
        });
      },
    };
  },
});

let nativeEventNames: ReadonlySet<string> | null = null;
function getNativeEventNames(): ReadonlySet<string> {
  return (
    nativeEventNames ||
    // Source: https://developer.mozilla.org/en-US/docs/Web/Events
    (nativeEventNames = new Set<string>([
      'abort',
      'afterprint',
      'animationend',
      'animationiteration',
      'animationstart',
      'appinstalled',
      'audioprocess',
      'audioend',
      'audiostart',
      'beforeprint',
      'beforeunload',
      'beginEvent',
      'blocked',
      'blur',
      'boundary',
      'cached',
      'canplay',
      'canplaythrough',
      'change',
      'chargingchange',
      'chargingtimechange',
      'checking',
      'click',
      'close',
      'complete',
      'compositionend',
      'compositionstart',
      'compositionupdate',
      'contextmenu',
      'copy',
      'cut',
      'dblclick',
      'devicechange',
      'devicelight',
      'devicemotion',
      'deviceorientation',
      'deviceproximity',
      'dischargingtimechange',
      'DOMAttributeNameChanged',
      'DOMAttrModified',
      'DOMCharacterDataModified',
      'DOMContentLoaded',
      'DOMElementNameChanged',
      'focus',
      'focusin',
      'focusout',
      'DOMNodeInserted',
      'DOMNodeInsertedIntoDocument',
      'DOMNodeRemoved',
      'DOMNodeRemovedFromDocument',
      'DOMSubtreeModified',
      'downloading',
      'drag',
      'dragend',
      'dragenter',
      'dragleave',
      'dragover',
      'dragstart',
      'drop',
      'durationchange',
      'emptied',
      'end',
      'ended',
      'endEvent',
      'error',
      'fullscreenchange',
      'fullscreenerror',
      'gamepadconnected',
      'gamepaddisconnected',
      'gotpointercapture',
      'hashchange',
      'lostpointercapture',
      'input',
      'invalid',
      'keydown',
      'keypress',
      'keyup',
      'languagechange',
      'levelchange',
      'load',
      'loadeddata',
      'loadedmetadata',
      'loadend',
      'loadstart',
      'mark',
      'message',
      'messageerror',
      'mousedown',
      'mouseenter',
      'mouseleave',
      'mousemove',
      'mouseout',
      'mouseover',
      'mouseup',
      'nomatch',
      'notificationclick',
      'noupdate',
      'obsolete',
      'offline',
      'online',
      'open',
      'orientationchange',
      'pagehide',
      'pageshow',
      'paste',
      'pause',
      'pointercancel',
      'pointerdown',
      'pointerenter',
      'pointerleave',
      'pointerlockchange',
      'pointerlockerror',
      'pointermove',
      'pointerout',
      'pointerover',
      'pointerup',
      'play',
      'playing',
      'popstate',
      'progress',
      'push',
      'pushsubscriptionchange',
      'ratechange',
      'readystatechange',
      'repeatEvent',
      'reset',
      'resize',
      'resourcetimingbufferfull',
      'result',
      'resume',
      'scroll',
      'seeked',
      'seeking',
      'select',
      'selectstart',
      'selectionchange',
      'show',
      'soundend',
      'soundstart',
      'speechend',
      'speechstart',
      'stalled',
      'start',
      'storage',
      'submit',
      'success',
      'suspend',
      'SVGAbort',
      'SVGError',
      'SVGLoad',
      'SVGResize',
      'SVGScroll',
      'SVGUnload',
      'SVGZoom',
      'timeout',
      'timeupdate',
      'touchcancel',
      'touchend',
      'touchmove',
      'touchstart',
      'transitionend',
      'unload',
      'updateready',
      'upgradeneeded',
      'userproximity',
      'voiceschanged',
      'versionchange',
      'visibilitychange',
      'volumechange',
      'waiting',
      'wheel',
    ]))
  );
}
