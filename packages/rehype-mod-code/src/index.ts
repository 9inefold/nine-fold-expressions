import type { Plugin } from 'unified';
import type { Root, Element, Comment, Properties, Literal } from 'hast';
import { visit } from 'unist-util-visit';

import { ElementType, Parser } from 'htmlparser2';
import { DomHandler } from 'domhandler';
import type * as DOM from 'domhandler';
import * as DOMUtil from 'domhandler';
import render from 'dom-serializer';

const internalDebug = false;
let debug = internalDebug;
let warn  = internalDebug;

type Nullish<T> = T | null | undefined;
export type StrMap<V> = { [key: string]: V };

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

type ANSIType = string | number | ANSI;
type CommandCallback = (commands: string[]) => void;

export type RehypeCodeOptions = {
  extraLangs?: StrMap<string>,
  commands?: StrMap<CommandCallback>,
  tagDefault?: boolean,
};

type InternalState = {
  showTag: boolean,
  tokMap: StrMap<string>,
  permissiveMap: boolean,
};

const inNode = typeof window === 'undefined';
const inBrowser = !inNode;

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

function logWarning(text?: string) {
  if (warn) logANSI(text, ANSI.BrightYellow);
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

function dumpPre(pre: DOM.Element) {
  // if (pre.name !== 'pre') return;
  if (pre.children.length < 1) return;
  logANSI(`${pre.name} > ${JSON.stringify(pre.attribs)}`, ANSI.Magenta);
  for (let child of pre.children) {
    try {
      const str = JSON.stringify(child);
      logDebug(`  ${str}`);
    } catch {
      if (child.type !== ElementType.Tag) {
        if (child.type === ElementType.Text) {
          logANSI(`  > '${escapeString(child.data)}'`, ANSI.Green);
        } else {
          logANSI(`  > ${child.type}`, ANSI.BrightGreen);
        }
      } else {
        let attrs = JSON.stringify(child.attribs);
        const color = (child.name === 'code') ? ANSI.BrightYellow : ANSI.Cyan;
        logANSI(`  ${child.name} > ${attrs}`, color);
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////

function hasKeys<T>(m: StrMap<T>): boolean {
  return Object.keys(m).length >= 1;
}

function defaultState(show?: boolean): InternalState {
  return {
    showTag: show ?? true, 
    tokMap: {},
    permissiveMap: false,
  };
}


function extractComment(comment: string): Nullish<string> {
  const matches = comment.match(/^<!---*\s*(.*?)\s*-*-->$/ms);
  return matches?.at(1);
}

function extractCommandFromComment(comment: string): string[] {
  let parsed = extractComment(comment);
  if (!parsed || parsed.length < 1) {
    return [];
  }
  return parsed.split(/[\s\n]+/);
}

function extractPreNode(dom: DOM.ChildNode[]): Nullish<DOM.Element> {
  if (dom.length < 1) return null;
  let pre = dom[0];
  if (pre.type !== ElementType.Tag || pre.name !== 'pre') {
    return null;
  }
  return pre;
}

function extractCodeNode(pre: DOM.Element): Nullish<DOM.Element> {
  if (pre.children.length < 1) return null;
  // dumpPre(pre);
  for (let child of pre.children) {
    if (child.type !== ElementType.Tag || child.name !== 'code') {
      continue;
    }
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

function renderSvelteDOM(dom: DOM.ChildNode[]): string {
  return render(dom, { encodeEntities: false });
}

function mapKeys(code: DOM.Element, state: InternalState) {
  if (code.name !== 'code') return;
  let { children } = code;
  const { tokMap, permissiveMap } = state;

  type NestedNodes = DOM.ChildNode | DOM.ChildNode[];
  function mapNodes(child: DOM.ChildNode): NestedNodes {
    if (!DOMUtil.isText(child)) {
      // TODO: Allow recursion
      // { return mapNodes(child); }
      
      if (!permissiveMap || !DOMUtil.isTag(child)) {
        return child;
      }

      let cChild = child.children[0];
      if (!DOMUtil.isText(cChild)) {
        return child;
      }

      const childData = cChild.data;
      if (childData in tokMap) {
        child.attribs['class'] = tokMap[childData];
      }
      return child;
    }

    const tokens = child.data
      .split(/(?:(?<=[^\w$@])(?=[\w$@]))|(?:(?<=[\w$@])(?=[^\w$@]))/gms);
    let strBuilder = '';
    let newChildren: DOM.ChildNode[] = [];

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
      newChildren.push(new DOMUtil.Element(
        'span', { 'class': tokMap[tok] },
        [new DOMUtil.Text(tok)], ElementType.Tag
      ));
    }

    if (newChildren.length < 1) {
      return child;
    }

    appendBuiltStr();
    return newChildren;
  }

  code.children = children.map(mapNodes).flat();
}

function modifyHTML(
  dom: DOM.ChildNode[], 
  state: InternalState, 
  extraLangs?: StrMap<string>
): Nullish<string> {
  let pre = extractPreNode(dom);
  if (!pre) return null;
  const cls = pre.attribs['class'];
  if (!cls.startsWith('language-')) return null;

  let code = extractCodeNode(pre);
  if (!code) return null;

  if (state.showTag) {
    const rawLang = cls.slice('language-'.length);
    const lang = mapLangtype(rawLang, extraLangs);
    pre.attribs['data-language'] = lang;
    // code.attribs['data-language'] = lang;
  }
  if (hasKeys(state.tokMap)) {
    // for (let key in state.tokMap) {
    //   logANSI(`${key}: ${state.tokMap[key]}`, ANSI.BrightBlue);
    // }
    // logDebug();
    mapKeys(code, state);
  }
  return renderSvelteDOM(dom);
}

////////////////////////////////////////////////////////////////////////
 
function argsToLabelDirectives(args: string[]): string[] {
  const reg = /([^\s;]\S*\s+(?:[^\s;]+\s*?)+)(?=;|$)/gm;
  return [...args.join(' ').matchAll(reg)].map(m => m[1]);
}

const rehypeCodeBlocks: Plugin<[RehypeCodeOptions?], Root> = (options = {}) => {
  const {
    extraLangs, commands, 
    tagDefault = true
  } = options;
  return (tree) => {
    logDebug();
    const modcodeCommands: StrMap<CommandCallback> = {
      'nolang': cmdNoLang,
      'map':    cmdMapTokens,
      'map-permissive': cmdMapPerm,
    };

    let showTag = tagDefault;
    let state = defaultState(tagDefault);

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

      // logANSI(`[${index}]:`, ANSI.BrightRed);
      // logDebug(`${rawHtml}\n`);
      
      const handler = new DomHandler(doDOMStuff);
      const parser = new Parser(handler, { decodeEntities: false });
      parser.write(rawHtml);
      parser.end();
      state = defaultState(tagDefault);

      function doDOMStuff(err: Error | null, dom: DOM.ChildNode[]) {
        if (err) {
        } else {
          const newHtml = modifyHTML(dom, state, extraLangs);
          if (newHtml) {
            (node as any)['value'] = newHtml;
          }
        }
      }
    });

    function handleCommand(fullCmd: string[], extraHandlers?: StrMap<CommandCallback>) {
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
        extraHandlers[prefix](fullCmd);
      } else {
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
      if (arg === 'start') {
        showTag = false;
        state.showTag = false;
      } else if (arg === 'end') {
        showTag = true;
        state.showTag = true;
      } else if (!arg.length) {
        state.showTag = false;
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

    function cmdMapPerm(args: string[]) {
      state.permissiveMap = true;
    }
  };
};

export default rehypeCodeBlocks;
