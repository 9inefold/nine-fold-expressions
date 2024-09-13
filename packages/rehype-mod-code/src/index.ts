import type { Plugin } from 'unified';
import type { Root, Element, Comment, Properties, Literal } from 'hast';
import { visit } from 'unist-util-visit';

import { ElementType, Parser } from 'htmlparser2';
import { DomHandler } from 'domhandler';
import type * as DOM from 'domhandler';
import render from 'dom-serializer';

const internalDebug = false;
export let debug = internalDebug;
export let warn  = internalDebug;

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

class TmpBool {
  _value: boolean | null;
  _default: boolean;

  constructor(value?: boolean, defaultValue?: boolean) {
    this._default = defaultValue ?? false;
    this._value = value ?? this._default;
  }

  get value(): boolean {
    const out = !!this._value;
    this._value ??= this._default;
    return out;
  }
  set value(value: boolean | null) {
    this._value = value;
  }
}

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
  .replace(/\n/g, " ")
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
  if (pre.name !== 'pre') return;
  if (pre.children.length < 1) return;
  logANSI(`pre > ${JSON.stringify(pre.attribs)}`, ANSI.Magenta);
  for (let child of pre.children) {
    try {
      const str = JSON.stringify(child);
      logDebug(`  ${str}`);
    } catch {
      if (child.type !== ElementType.Tag) {
        if (child.type === ElementType.Text) {
          logANSI(`  > '${child.data}'`, ANSI.Green);
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

function extractComment(comment: string): Nullish<string> {
  const matches = comment.match(/^<!---*\s*(.*?)\s*-*-->$/ms);
  return matches?.at(1);
}

function extractCommandFromComment(comment: string): string[] {
  let parsed = extractComment(comment);
  if (!parsed || parsed.length < 1) {
    return [];
  }
  return parsed
    .split(/[\s\n]+/)
    .map(cmd => cmd.toLowerCase());
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

function modifyHTML(dom: DOM.ChildNode[], extraLangs?: StrMap<string>): Nullish<string> {
  let pre = extractPreNode(dom);
  if (!pre) return null;
  const cls = pre.attribs['class'];
  if (!cls.startsWith('language-')) return null;

  let code = extractCodeNode(pre);
  if (!code) return null;

  const rawLang = cls.slice('language-'.length);
  const lang = mapLangtype(rawLang, extraLangs);
  pre.attribs['data-language'] = lang;
  // code.attribs['data-language'] = lang;
  return renderSvelteDOM(dom);
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
    };
    
    let showTag = new TmpBool(true, tagDefault);
    let currValue = tagDefault;

    visit(tree, (node, index, parent) => {
      if ((node.type as string) !== 'raw') {
        return;
      }
      
      currValue = showTag.value;
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

      function doDOMStuff(err: Error | null, dom: DOM.ChildNode[]) {
        if (err) {
        } else if (currValue) {
          const newHtml = modifyHTML(dom, extraLangs);
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
        } else if (warn) {
          logANSI(`Unknown command '${cmd}'`, ANSI.BrightYellow);
        }
      } else if (extraHandlers && prefix in extraHandlers) {
        extraHandlers[prefix](fullCmd);
      } else if (warn) {
        logANSI(`Unknown command prefix '${prefix}'`, ANSI.BrightYellow);
      }

      function next(): string {
        const out = fullCmd[0] ?? '';
        fullCmd = fullCmd.slice(1);
        return out;
      }
    }

    function cmdNoLang(args: string[]) {
      const arg = args.at(0) ?? '';
      if (arg === 'start') {
        showTag.value = false;
      } else if (arg === 'end') {
        showTag.value = true;
      } else if (!arg.length && currValue) {
        showTag.value = null;
      }
    }
  };
};

export default rehypeCodeBlocks;
