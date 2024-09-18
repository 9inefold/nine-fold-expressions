import type { Plugin } from 'unified';
import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

import { ElementType, Parser } from 'htmlparser2';
import { DomHandler } from 'domhandler';
import type * as DOM from 'domhandler';
import * as DOMUtil from 'domhandler';
import render from 'dom-serializer';

const internalDebug = false;
let debug = internalDebug;
let warn  = internalDebug;

const useDecoder = true;
const isStrict = (() => !this)();
const hasCallerName = !isStrict && _checkHasCallerName();
const inNode = typeof window === 'undefined';
const inBrowser = !inNode;

/// Same as `T | null`.
type Null<T> = T | null;
/// More permissive version of `Null`, allows for `undefined`.
type Nullish<T> = T | null | undefined;

/** Generic string dictionary. */
export type StrMap<V> = { [key: string]: V };

type ANSIString = `${number}` | `${number};${number}`;
type ANSIType = ANSIString | number | ANSI;

export const SUCCESS: false = false;
export const INVALID: true  = true;
export const FATAL: 'fatal' = 'fatal';
// export type ErrorType = true | false | 'fatal' | undefined;
export type ErrorType = void;

/**
 * Takes a list of arguments passed to a command.
 * Must return nothing ~~or one of the three state values~~.
 */
export type CommandCallback = (commands: string[]) => ErrorType;
/**
 * Takes a list of nodes and (optionally) a language name.
 * Must return nothing ~~or one of the three state values~~.
 */
export type UserCallback = (code: DOM.ChildNode[], language?: string) => ErrorType;

export type RehypeCodeOptions = {
  /**
   * Extra mappings for language tags.
   */
  extraLangs?:  StrMap<string>,
  /**
   * Dictionary of custom commands.
   * Use `prefix: callback` for `<!-- [prefix] args... -->`.
   */
  commands?:    StrMap<CommandCallback>,
  /**
   * List of user callbacks.
   * Will be executed in order.
   */
  callbacks?:   UserCallback[],
  /**
   * The default state for language tags.
   */
  tagDefault?:  boolean,
  /**
   * Enable warnings.
   */
  warn?:        boolean,
  /**
   * Enable debug printing.
   */
  debug?:       boolean,
};

type InternalState = {
  showTag: boolean,
  tokMap: StrMap<string>,
  tokIgnore: Set<string>,
  permissiveMap: boolean,
};

enum ANSI {
  Black = 30,
  Red = 31,
  Green = 32,
  Yellow = 33,
  Blue = 34,
  Magenta = 35,
  Cyan = 36,
  White = 37,
  BrightBlack = 90,
  BrightRed = 91,
  BrightGreen = 92,
  BrightYellow = 93,
  BrightBlue = 94,
  BrightMagenta = 95,
  BrightCyan = 96,
  BrightWhite = 97,
}

const langMap: StrMap<string> = {
  // ASM
  /// 6502
  'asm6502':    '6502',
  /// arm
  'armasm':     'arm',
  'arm-asm':    'arm',
  /// x86
  'x86':        'x86',
  'nasm':       'x86',
  'x86asm':     'x86',
  // C#
  'cs':         'c#',
  'csharp':     'c#',
  'dotnet':     'c#',
  // C++
  'cpp':        'c++',
  // haskell
  'hs':         'haskell',
  // js
  'javascript': 'js',
  // kotlin
  'kt':         'kotlin',
  'kts':        'kotlin',
  // latex
  'latex':      'tex',
  'context':    'tex',
  // lisp
  'elisp':      'emacs',
  'emacs-lisp': 'emacs',
  // markdown
  'md':         'markdown',
  // objective-c
  'objc':       'obj-c',
  'objectivec': 'obj-c',
  // python
  'python':     'py',
  // ruby
  'rb':         'ruby',
  // rust
  'rs':         'rust',
  // ts
  'typescript': 'ts',
  // wolfram
  'mathematica':'wolfram',
  'nb':         'wolfram',
  'wl':         'wolfram',
  // yaml
  'yml':        'yaml',
};

////////////////////////////////////////////////////////////////////////

function _checkHasCallerName(): boolean {
  function impl(): boolean {
    const data = arguments.callee.caller;
    return typeof (data as any)['name'] === 'string';
  }
  return impl();
}

function getCallerName(twice?: boolean): string {
  if (!hasCallerName) return '';
  const { caller } = arguments.callee;
  return twice ? caller.name : caller.caller.name;
}

////////////////////////////////////////////////////////////////////////

function escapeString(str: string): string {
  return str
  .replace(/\n/g, "\\n")
  .replace(/\t/g, "  ")
  .replace(/[\b]/g, "\\b")
  .replace(/\r/g, "\\r")
  .replace(/\f/g, "\\f");
}

function formatANSI(text: any, color?: ANSIType): string {
  if (inNode) {
    color ??= ANSI.White;
    return `\x1b[${color}m${text}\x1b[0m`;
  }
  return text;
}

function logDebug(message?: any, ...optionalParams: any[]) {
  if (debug) {
    console.log(message ?? '', ...optionalParams);
  }
}

function logWarning(text: string) {
  if (!warn) return;
  if (hasCallerName) {
    const { name } = arguments.callee.caller;
    text = `${name}: ${text}`;
  }
  console.log(formatANSI(text, ANSI.BrightYellow));
}

function logANSI(text?: string, color?: ANSIType) {
  if (!debug) {
    return;
  } else if (!text) {
    console.log('');
    return;
  } else if (inNode) {
    color ??= ANSI.White;
    logDebug(formatANSI(text, color));
  } else {
    logDebug(text);
  }
}

function nodeSpan(node: Null<DOM.ChildNode>): string {
  if (!node?.sourceCodeLocation) {
    return '';
  }
  const { startOffset, endOffset } = node.sourceCodeLocation;
  return `[${startOffset ?? '?'}:${endOffset ?? '?'}]`;
}

function dumpNode(
  node: Null<DOM.ChildNode>, 
  depthStrOrColor?: string | number,
  colorOverride?: ANSIType
) {
  if (!debug || !node) return;
  /// Extract types
  if (typeof depthStrOrColor === 'number') {
    colorOverride = depthStrOrColor;
    depthStrOrColor = undefined;
  }
  const D = depthStrOrColor ?? '';
  const span = nodeSpan(node);
  if (!DOMUtil.isTag(node)) {
    if (DOMUtil.isText(node)) {
      logInternal('>', `'${escapeString(node.data)}'`, ANSI.Green);
    } else {
      logInternal('>', node.type, ANSI.BrightGreen);
    }
  } else {
    let attrs = JSON.stringify(node.attribs);
    const color = (node.name === 'code') ? ANSI.BrightYellow : ANSI.Cyan;
    logInternal(`${node.name} >`, attrs, color);
  }

  // Helper function, avoids code duplication.
  function logInternal(pre: string, text: string, colorIn: ANSIType) {
    const color = colorOverride ?? colorIn;
    if (node && (node.parent || node.prev || node.next)) {
      logANSI(`${D}${pre} ${text} ${span}`, color);
    } else {
      logDebug(D,
        formatANSI(pre, ANSI.BrightRed),
        formatANSI(` ${text} ${span}`, color)
      );
    }
  }
}

function dumpElem(pre: DOM.Element, recurse?: boolean, depth?: number) {
  if (!debug) return;
  if (!depth || depth === 0) {
    logANSI(`${pre.name} > ${JSON.stringify(pre.attribs)}`, ANSI.BrightMagenta);
    depth = 1;
  }
  if (!pre.children.length) return;
  recurse ??= true;
  const D = ' '.repeat(depth * 2);
  for (let child of pre.children) {
    dumpNode(child, D);
    if (recurse && DOMUtil.isTag(child)) {
      dumpElem(child, recurse, depth + 1);
    }
  }
}

export function dumpHTML(node: DOM.AnyNode, recurse?: boolean) {
  if (DOMUtil.isTag(node)) {
    dumpElem(node, recurse);
  } else if (DOMUtil.isText(node)) {
    dumpNode(node, '');
  } else if (DOMUtil.isDocument(node)) {
    const htmlDoc = new DOMUtil.Element(
      'html', {}, node.children, ElementType.Tag);
    dumpElem(htmlDoc, true);
  } else if (DOMUtil.isComment(node)) {
    logANSI(node.data, ANSI.BrightBlack);
  }
}

////////////////////////////////////////////////////////////////////////

function hasKeys<T>(m: StrMap<T>): boolean {
  return Object.keys(m).length >= 1;
}

function defaultState(show?: boolean, permissive?: boolean): InternalState {
  return {
    showTag: show ?? true, 
    tokMap: {},
    tokIgnore: new Set(),
    permissiveMap: permissive ?? false,
  };
}

function isElemInClass(node: DOM.Element, data: Set<string>): boolean {
  if (data.size === 0) {
    return false;
  } else if ('class' in node.attribs) {
    const attrs = node.attribs['class'].split(/\s+/g);
    for (const attr of attrs) {
      if (data.has(attr))
        return true;
    }
  }
  return false;
}

/** Extracts string from comment, or `null`. */
function extractComment(comment: string): Null<string> {
  const matches = comment.match(/^<!---*\s*(.*?)\s*-*-->$/ms);
  return matches?.at(1) ?? null;
}

/** Extracts a list of commands from a comment, otherwise `[]`. */
function extractCommandFromComment(comment: string): string[] {
  let parsed = extractComment(comment);
  if (!parsed || parsed.length < 1) {
    return [];
  }
  return parsed.split(/[\s\n]+/);
}

/** Get an element if `<pre>`, otherwise `null`. */
function extractPreNode(dom: DOM.ChildNode[]): Null<DOM.Element> {
  if (dom.length < 1) return null;
  let pre = dom[0];
  if (pre.type !== ElementType.Tag || pre.name !== 'pre') {
    return null;
  }
  return pre;
}

/** Get an element if `<code>`, otherwise `null`. */
function extractCodeNode(pre: DOM.Element): Nullish<DOM.Element> {
  if (pre.children.length < 1) return null;
  for (let child of pre.children) {
    if (!DOMUtil.isTag(child) || child.name !== 'code') {
      continue;
    }
    /// Extra check to ensure languages are consistent. May remove...
    if (pre.attribs['class'] === child.attribs['class']) {
      return child;
    }
  }
  return null;
}

////////////////////////////////////////////////////////////////////////

export function mapLangtype(lang: string, extraLangs?: StrMap<string>): string {
  if (extraLangs && lang in extraLangs) {
    return extraLangs[lang];
  } else if (lang in langMap) {
    return langMap[lang];
  } else {
    return lang;
  }
}

/**
 * Encodes all text for Svelte.
 * This is done for anything matching ``[&<`{}]``.
 */
function encodeSvelteDOM(code: DOM.Element) {
  if (code.name !== 'code') {
    logWarning(`Invalid tag name '${code.name}'`);
    return;
  }

  const map = getReplacementMap();
  encodeRecurse(code.children);

  function encodeRecurse(children: DOM.ChildNode[]) {
    for (let child of children) {
      if (DOMUtil.isText(child)) {
        encodeText(child);
      } else if (DOMUtil.hasChildren(child)) {
        encodeRecurse(child.children);
      }
    }
  }

  function encodeText(text: DOM.Text) {
    text.data = text.data.replaceAll(/[&<`{}]/g, (substr) => {
      const rep = map.get(substr);
      return rep ?? substr;
    });
  }

  function getReplacementMap(): Map<string, string> {
    const toReplace = '`{}';
    const list = new Map<string, string>();
    list.set('&', '&amp;');
    list.set('<', '&lt;');
    for (const c of toReplace) {
      const code = c.charCodeAt(0);
      list.set(c, `&#${code}`);
    }
    return list;
  }
}

function renderSvelteDOM(dom: DOM.ChildNode[]): string {
  return render(dom, { encodeEntities: false });
}

function fillNodesEx(
  parent: Null<DOM.ParentNode>,
  children: DOM.ChildNode[],
  recurse?: boolean
) {
  let lastChild: Null<DOM.ChildNode> = null;
  for (let node of children) {
    node.parent = parent;
    if (lastChild) {
      lastChild.next = node;
      node.prev = lastChild;
    }
    lastChild = node;
    if (recurse && DOMUtil.hasChildren(node)) {
      fillNodesEx(node, node.children, recurse);
    }
  }
}

function fillNodes(parent: Null<DOM.ParentNode>, children?: DOM.ChildNode[]) {
  if (!parent && !children) {
    return;
  } else if (!children) {
    if (!parent) return;
    children = parent.childNodes;
  }
  fillNodesEx(parent, children, false);
}

function mapKeys(code: DOM.Element, state: InternalState) {
  if (code.name !== 'code') return;
  let { children } = code;
  const { tokMap, tokIgnore, permissiveMap } = state;
  const regSplitter = /(?:(?<=[^\w$@])(?=[\w$@]))|(?:(?<=[\w$@])(?=[^\w$@]))/gms;

  type NestedNodes = DOM.ChildNode | DOM.ChildNode[];
  function mapNodes(child: DOM.ChildNode): NestedNodes {
    if (!DOMUtil.isText(child)) {
      if (!permissiveMap || !DOMUtil.isTag(child))
        return child;
      if (isElemInClass(child, tokIgnore))
        return child;

      child.children = child.children.map(mapNodes).flat();
      return child;
    }

    const tokens = child.data.split(regSplitter);
    let strBuilder = '';
    let newChildren: DOM.ChildNode[] = [];

    // Creates a new node from the built string.
    function appendBuiltStr() {
      if (strBuilder.length) {
        newChildren.push(new DOMUtil.Text(strBuilder));
        strBuilder = '';
      }
    }

    for (let tok of tokens) {
      if (!(tok in tokMap)) {
        strBuilder += tok;
        continue;
      }
      appendBuiltStr();
      let newChild = new DOMUtil.Element(
        'span', { 'class': tokMap[tok] },
        [new DOMUtil.Text(tok)], ElementType.Tag
      )
      newChild.children[0].parent = newChild;
      newChildren.push(newChild);
    }

    if (newChildren.length < 1) {
      return child;
    }

    appendBuiltStr();

    // Fill in node data:
    const { parent } = child;
    fillNodes(parent, newChildren);
    newChildren[0].prev = child.prev;
    let lastElem = newChildren.at(-1);
    if (lastElem) lastElem.next = child.next;
    return newChildren;
  }

  code.children = children.map(mapNodes).flat();
  // dumpElem(code, true);
}

function modifyHTML(
  dom: DOM.ChildNode[], 
  state: InternalState,
  callbacks: UserCallback[],
  extraLangs?: StrMap<string>
): Nullish<string> {
  let pre = extractPreNode(dom);
  if (!pre) return null;
  const cls = pre.attribs['class'];
  if (!cls.startsWith('language-')) return null;

  let code = extractCodeNode(pre);
  if (!code) return null;

  const rawLang = cls.slice('language-'.length);
  const lang = mapLangtype(rawLang, extraLangs);

  if (state.showTag) {
    pre.attribs['data-rawlanguage']  = rawLang;
    code.attribs['data-rawlanguage'] = rawLang;
    pre.attribs['data-language']  = lang;
    code.attribs['data-language'] = lang;
  }
  if (hasKeys(state.tokMap)) {
    mapKeys(code, state);
  }

  for (let callback of callbacks) {
    callback(code.children, lang);
  }
  
  // Simple, custom Svelte encoding.
  if (useDecoder) {
    encodeSvelteDOM(code);
  }
  // dumpElem(pre);
  return renderSvelteDOM(dom);
}

////////////////////////////////////////////////////////////////////////
 
function argsToLabelDirectives(args: string[]): string[] {
  const reg = /([^\s;]\S*\s+(?:[^\s;]+\s*?)+)(?=;|$)/gm;
  return [...args.join(' ').matchAll(reg)].map(m => m[1]);
}

const rehypeCodeBlocks: Plugin<[RehypeCodeOptions?], Root> = (options = {}) => {
  const {
    extraLangs,
    commands,
    callbacks = [],
    tagDefault = true,
    warn:  optWarn  = internalDebug,
    debug: optDebug = internalDebug,
  } = options;
  return (tree) => {
    const modcodeCommands: StrMap<CommandCallback> = {
      'nolang': cmdNoLang,
      'map-permissive': cmdMapPerm,
      'map-ignore': cmdMapIgnore,
      'map':    cmdMapTokens,
    };

    let showTag = tagDefault;
    let permissiveMap = true;
    const getDefault = () => defaultState(showTag, permissiveMap);
    let state = getDefault();

    debug = optDebug;
    warn = optWarn;

    if (debug || warn)
      console.log('');
    visit(tree, (node, index, parent) => {
      if ((node.type as string) !== 'raw') {
        return;
      }
      
      let rawHtml: string = (node as any)['value'];
      if (rawHtml?.length < 1) return;

      if (rawHtml.startsWith('<!--')) {
        const cmd = extractCommandFromComment(rawHtml);
        handleCommand(cmd, commands);
        return;
      }
      
      const handler = new DomHandler(doDOMStuff);
      const parser = new Parser(handler, { decodeEntities: useDecoder });
      parser.write(rawHtml);
      parser.end();
      state = getDefault();

      function doDOMStuff(err: Null<Error>, dom: DOM.ChildNode[]) {
        if (err) {
        } else {
          const newHtml = modifyHTML(dom, state, callbacks, extraLangs);
          if (newHtml) {
            (node as any)['value'] = newHtml;
          }
        }
      }
    });

    debug = internalDebug;
    warn = internalDebug;

    function handleCommand(fullCmd: string[], extraHandlers?: StrMap<CommandCallback>) {
      const mdlint = /markdownlint-[\w-]+/;
      if (fullCmd.length < 1) return;
      const prefix = next();
      if (prefix === 'modcode') {
        const cmd = next();
        if (cmd in modcodeCommands) {
          modcodeCommands[cmd](fullCmd);
        } else {
          logWarning(`Unknown command '${cmd}'`);
        }
      } else if (extraHandlers && prefix in extraHandlers) {
        const retCode = extraHandlers[prefix](fullCmd);
        // if (!retCode) return;
      } else if (!mdlint.test(prefix)) {
        logWarning(`Unknown command prefix '${prefix}'`);
      }

      function next(): string {
        const out = fullCmd[0] ?? '';
        fullCmd = fullCmd.slice(1);
        return out.toLowerCase();
      }
    }

    function cmdNoLang(args: string[]) {
      const arg = args.at(0) ?? '';
      if (!arg.length) {
        state.showTag = false;
      } else if (arg === 'start' || arg === 'on') {
        showTag = false;
        state.showTag = false;
      } else if (arg === 'end' || arg === 'off') {
        showTag = true;
        state.showTag = true;
      }
    }

    function cmdMapTokens(args: string[]) {
      if (args.length === 0) return;
      const lbls = argsToLabelDirectives(args);
      for (let lbl of lbls) {
        let toReplace = lbl.match(/(\S+)\s+((?:\S+\s*)+)/)?.slice(1);
        if (!toReplace) {
          logWarning(`Invalid directive '${lbl}'`);
          continue;
        }
        const key = toReplace[0];
        if (key in state.tokMap) {
          logWarning(`Overwriting key '${key}'`);
        }
        state.tokMap[key] = toReplace[1];
      }
    }

    function cmdMapIgnore(args: string[]) {
      state.tokIgnore = new Set([...state.tokIgnore, ...args]);
    }

    function cmdMapPerm(args: string[]) {
      const arg = args.at(0) ?? '';
      if (!arg.length) {
        state.permissiveMap = true;
      } else if (arg === 'start' || arg === 'on') {
        permissiveMap = true;
        state.permissiveMap = true;
      } else if (arg === 'end' || arg === 'off') {
        permissiveMap = false;
        state.permissiveMap = false;
      }
    }
  };
};

export default rehypeCodeBlocks;
