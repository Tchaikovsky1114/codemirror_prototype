import { autoCloseTags, esLint, javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import CodeMirror, { EditorState, EditorView, basicSetup } from '@uiw/react-codemirror';
import { useEffect, useRef, useState } from 'react';
import { yCollab } from 'y-codemirror.next';
import { Completion, CompletionContext, autocompletion, closeCompletion, insertCompletionText, startCompletion } from "@codemirror/autocomplete";
import { linter, lintGutter } from '@codemirror/lint';
import * as Y from 'yjs';
import * as random from 'lib0/random';
import { WebsocketProvider } from 'y-websocket';
import createTheme from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import * as eslint from "eslint-linter-browserify";
import './App.css'




const config = {
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    }
  },
 
  env: {
    browser: true,
    node: true
  },
  extends: "eslint:recommended",
  rules: {
    // enable additional rules
    // indent: ["error", 4],
    "linebreak-style": ["error", "unix"],
    "no-debugger": ["error"],
    // quotes: ["error", "double"],
    // semi: ["error", "always"],
    // override configuration set by extending "eslint:recommended"
    "no-empty": "warn",
    "no-undef": ["error"],
    "no-cond-assign": ["error", "always"],
    // disable rules from base configurations
    "for-direction": "off",
    
  }
};


const myTheme = createTheme({
  theme: 'dark',
  settings: {
    selection: '#1be8ffc3',
    selectionMatch: '#1bff4c56',

    caret: '#1be7ff',
    gutterBorder: '#1be7ff',
    lineHighlight: '#1be8ff3b',
  },
    styles: [
    { tag: t.comment, color: '#7ea8fc9b' },
    { tag: t.definition(t.typeName), color: '#2b89e7' },
    { tag: t.typeName, color: '#2f8eec' },
    { tag: t.tagName, color: '#5ed75e' },
    { tag: t.variableName, color: '#72b2f1' },
    { tag: t.angleBracket, color: '#F000C0'},
    { tag: t.angleBracket, color: '#c7c7c7'},
    { tag: t.keyword, color: '#F000C0', fontWeight: 'bold'},
    { tag: t.bracket, color: '#9ebc67d3'},
    { tag: t.string, color: '#fff'},
    { tag: t.operator, color: '#fff'},
    { tag: t.punctuation, color: '#ffffff'},
    { tag: t.className, color: 'yellow'},
    { tag: t.namespace, color: 'yellow'},
    { tag: t.number, color: 'orange'},
    { tag: t.quote, color: 'orange'},
    { tag: t.attributeName, color: 'orange'},
    { tag: t.docString, color: '#fff'},
    { tag: t.content, color: '#fee'},
    { tag: t.bool, color: '#ffb700', fontWeight: 'bold'},
    { tag: t.propertyName, color: '#2f8eec'},
  ],
})

const users = [{ label: '@Walter White' },{ label: '@유제환' },{ label: '@김명성' },{ label: '@오은석' },];

export const usercolors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' }
]
export const userColor = usercolors[random.uint32() % usercolors.length]

const yDoc = new Y.Doc();
const yt = yDoc.getText('codemirror');


const languageMode = {
  java: java(),
  javascript: javascript({jsx: true}),
  python: python(),
}



const javascriptKeywords = [
  'abstract', 'arguments', 'await', 'boolean',
  'break', 'byte', 'case', 'catch',
  'char', 'class', 'const', 'continue',
  'debugger', 'default', 'delete', 'do',
  'double', 'else', 'enum', 'eval',
  'export', 'extends', 'false', 'final',
  'finally', 'float', 'for', 'function',
  'goto', 'if', 'implements', 'import',
  'in', 'instanceof', 'int', 'interface',
  'let', 'long', 'native', 'new',
  'null', 'package', 'private', 'protected',
  'public', 'return', 'short', 'static',
  'super', 'switch', 'synchronized', 'this',
  'throw', 'throws', 'transient', 'true',
  'try', 'typeof', 'var', 'void',
  'volatile', 'while', 'with', 'yield'
];
const javaKeywords = [
  'abstract', 'assert', 'boolean', 'break',
  'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default',
  'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float',
  'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface',
  'long', 'native', 'new', 'package',
  'private', 'protected', 'public', 'return',
  'short', 'static', 'strictfp', 'super',
  'switch', 'synchronized', 'this', 'throw',
  'throws', 'transient', 'try', 'void',
  'volatile', 'while', 'true', 'false', 'null'
];
const pythonKeywords = [
  'and', 'as', 'assert', 'break',
  'class', 'continue', 'def', 'del',
  'elif', 'else', 'except', 'False',
  'finally', 'for', 'from', 'global',
  'if', 'import', 'in', 'is',
  'lambda', 'None', 'nonlocal', 'not',
  'or', 'pass', 'raise', 'return',
  'True', 'try', 'while', 'with',
  'yield'
];

const replaceTagText = (view: EditorView, tagText: string, from: number, to: number) => {
  return view.dispatch(insertCompletionText(view.state, tagText, from, to));
}

const completions = [
  ...javascriptKeywords.map((keyword) => ({ label: keyword, type: "keyword", info: "JavaScript keyword" })),
  ...javaKeywords.map((keyword) => ({ label: keyword, type: "keyword", info: "Java keyword" })),
  ...pythonKeywords.map((keyword) => ({ label: keyword, type: "keyword", info: "Python keyword" })),
  { label : "import", type: "keyword", info: "import"},
  { label: "className", type: "attributeName", info: "HTML class attribute", detail: 'detail...',icon: false,
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, 'className={}', from, to)},
  { label: "span", type: "tagName", info:'html tag' ,
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<span></span>', from, to)},
  { label: "a", type: "tagName", info: "HTML anchor tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<a href=""></a>', from, to)},
    { label: "a:blank", type: "tagName", info: "HTML anchor tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<a href="http://" target="_blank" rel="noopener noreferrer"></a>', from, to)},

  { label: "abbr", type: "tagName", info: "HTML abbreviation tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<abbr></abbr>', from, to)},
  { label: "address", type: "tagName", info: "HTML address tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<address></address>', from, to)},
  { label: "area", type: "tagName", info: "HTML area tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<area></area>', from, to)},
  { label: "article", type: "tagName", info: "HTML article tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<article></article>', from, to)},
  { label: "aside", type: "tagName", info: "HTML aside tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<aside></aside>', from, to)},
  { label: "audio", type: "tagName", info: "HTML audio tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<audio></audio>', from, to)},
  { label: "b", type: "tagName", info: "HTML bold tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<b></b>', from, to)},
  { label: "base", type: "tagName", info: "HTML base tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<base></base>', from, to)},
  { label: "bdi", type: "tagName", info: "HTML bdi tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<bdi></bdi>', from, to)},
  { label: "bdo", type: "tagName", info: "HTML bdo tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<bdo></bdo>', from, to)},
  { label: "blockquote", type: "tagName", info: "HTML blockquote tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<blockquote></blockquote>', from, to)},
  { label: "body", type: "tagName", info: "HTML body tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<body></body>', from, to)},
  { label: "br", type: "tagName", info: "HTML line break tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<br></br>', from, to)},
  { label: "button", type: "tagName", info: "HTML button tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<button></button>', from, to)},
  { label: "canvas", type: "tagName", info: "HTML canvas tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<canvas></canvas>', from, to)},
  { label: "caption", type: "tagName", info: "HTML table caption tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<caption></caption>', from, to)},
  { label: "cite", type: "tagName", info: "HTML citation tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<cite></cite>', from, to)},
  { label: "code", type: "tagName", info: "HTML code tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<code></code>', from, to)    
},
  { label: "col", type: "tagName", info: "HTML column tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<col></col>', from, to)    
},
  { label: "colgroup", type: "tagName", info: "HTML column group tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<colgroup></colgroup>', from, to)    
},
  { label: "data", type: "tagName", info: "HTML data tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<data></data>', from, to)    
},
  { label: "datalist", type: "tagName", info: "HTML datalist tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<datalist></datalist>', from, to)    
},
  { label: "dd", type: "tagName", info: "HTML description detail tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<dd></dd>', from, to)    
},
  { label: "del", type: "tagName", info: "HTML deleted text tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<del></del>', from, to)    
},
  { label: "details", type: "tagName", info: "HTML details tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<details></details>', from, to)    
},
  { label: "dfn", type: "tagName", info: "HTML definition term tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<dfn></dfn>', from, to)    
},
  { label: "dialog", type: "tagName", info: "HTML dialog tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<dialog></dialog>', from, to)    
},
  { label: "div", type: "tagName", info: "HTML division tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<div></div>', from, to)    
},
  { label: "dl", type: "tagName", info: "HTML description list tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<dl></dl>', from, to)    
},
  { label: "dt", type: "tagName", info: "HTML description term tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<dt></dt>', from, to)    
},
  { label: "em", type: "tagName", info: "HTML emphasized text tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<em></em>', from, to)    
},
  { label: "embed", type: "tagName", info: "HTML embed tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<embed></embed>', from, to)    
},
  { label: "fieldset", type: "tagName", info: "HTML fieldset tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<fieldset></fieldset>', from, to)    
},
  { label: "figure", type: "tagName", info: "HTML figure tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<figure></figure>', from, to)    
},
  { label: "figcaption", type: "tagName", info: "HTML figure caption tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<figcaption></figcaption>', from, to)    
},
  { label: "footer", type: "tagName", info: "HTML footer tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<footer></footer>', from, to)    
},
  { label: "form", type: "tagName", info: "HTML form tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<form></form>', from, to)    
},
  { label: "h1", type: "tagName", info: "HTML heading 1 tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<h1></h1>', from, to)    
},
  { label: "h2", type: "tagName", info: "HTML heading 2 tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<h2></h2>', from, to)    
},
  { label: "h3", type: "tagName", info: "HTML heading 3 tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<h3></h3>', from, to)    
},
  { label: "h4", type: "tagName", info: "HTML heading 4 tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<h4></h4>', from, to)    
},
  { label: "h5", type: "tagName", info: "HTML heading 5 tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<h5></h5>', from, to)    
},
  { label: "h6", type: "tagName", info: "HTML heading 6 tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<h6></h6>', from, to)    
},
  { label: "head", type: "tagName", info: "HTML head tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<head></head>', from, to)    
},
  { label: "header", type: "tagName", info: "HTML header tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<header></header>', from, to)    
},
  { label: "hgroup", type: "tagName", info: "HTML heading group tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<hgroup></hgroup>', from, to)    
},
  { label: "hr", type: "tagName", info: "HTML horizontal rule tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<hr></hr>', from, to)    
},
  { label: "html", type: "tagName", info: "HTML html tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<html></html>', from, to)    
},
  { label: "i", type: "tagName", info: "HTML italic tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<i></i>', from, to)    
},
  { label: "iframe", type: "tagName", info: "HTML inline frame tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<iframe></iframe>', from, to)    
},
  { label: "img", type: "tagName", info: "HTML image tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<img></img>', from, to)    
},
  { label: "input", type: "tagName", info: "HTML input tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<input></input>', from, to)    
},
  { label: "ins", type: "tagName", info: "HTML inserted text tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<ins></ins>', from, to)    
},
  { label: "kbd", type: "tagName", info: "HTML keyboard input tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<kbd></kbd>', from, to)    
},
  { label: "label", type: "tagName", info: "HTML label tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<label></label>', from, to)    
},
  { label: "legend", type: "tagName", info: "HTML legend tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<legend></legend>', from, to)    
},
  { label: "li", type: "tagName", info: "HTML list item tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<li></li>', from, to)    
},
  { label: "link", type: "tagName", info: "HTML link tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<link></link>', from, to)    
},
  { label: "main", type: "tagName", info: "HTML main tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<main></main>', from, to)    
},
  { label: "map", type: "tagName", info: "HTML map tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<map></map>', from, to)    
},
  { label: "mark", type: "tagName", info: "HTML marked text tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<mark></mark>', from, to)    
},
  { label: "menu", type: "tagName", info: "HTML menu tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<menu></menu>', from, to)    
},
  { label: "meta", type: "tagName", info: "HTML meta tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<meta></meta>', from, to)    
},
  { label: "meter", type: "tagName", info: "HTML meter tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<meter></meter>', from, to)    
},
  { label: "nav", type: "tagName", info: "HTML navigation tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<nav></nav>', from, to)    
},
  { label: "noscript", type: "tagName", info: "HTML noscript tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<noscript></noscript>', from, to)    
},
  { label: "object", type: "tagName", info: "HTML object tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<object></object>', from, to)    
},
  { label: "ol", type: "tagName", info: "HTML ordered list tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<ol></ol>', from, to)    
},
  { label: "optgroup", type: "tagName", info: "HTML option group tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<optgroup></optgroup>', from, to)    
},
  { label: "option", type: "tagName", info: "HTML option tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<option></option>', from, to)    
},
  { label: "output", type: "tagName", info: "HTML output tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<output></output>', from, to)    
},
  { label: "p", type: "tagName", info: "HTML paragraph tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<p></p>', from, to)    
},
  { label: "param", type: "tagName", info: "HTML parameter tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<param></param>', from, to)    
},
  { label: "picture", type: "tagName", info: "HTML picture tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<picture></picture>', from, to)    
},
  { label: "pre", type: "tagName", info: "HTML preformatted text tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<pre></pre>', from, to)    
},
  { label: "progress", type: "tagName", info: "HTML progress tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<progress></progress>', from, to)    
},
  { label: "q", type: "tagName", info: "HTML quote tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<q></q>', from, to)    
},
  { label: "rp", type: "tagName", info: "HTML ruby parenthesis tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<rp></rp>', from, to)    
},
  { label: "rt", type: "tagName", info: "HTML ruby text tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<rt></rt>', from, to)    
},
  { label: "ruby", type: "tagName", info: "HTML ruby tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<ruby></ruby>', from, to)    
},
  { label: "s", type: "tagName", info: "HTML strikethrough tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<s></s>', from, to)    
},
  { label: "samp", type: "tagName", info: "HTML sample output tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<samp></samp>', from, to)    
},
  { label: "script", type: "tagName", info: "HTML script tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<script></script>', from, to)    
},
  { label: "section", type: "tagName", info: "HTML section tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<section></section>', from, to)    
},
  { label: "select", type: "tagName", info: "HTML select tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<select></select>', from, to)    
},
  { label: "small", type: "tagName", info: "HTML small text tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<small></small>', from, to)    
},
  { label: "source", type: "tagName", info: "HTML source tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<source></source>', from, to)    
},
  { label: "span", type: "tagName", info: "HTML span tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<span></span>', from, to)    
},
  { label: "strong", type: "tagName", info: "HTML strong tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<strong></strong>', from, to)    
},
  { label: "style", type: "tagName", info: "HTML style tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<style></style>', from, to)    
},
  { label: "sub", type: "tagName", info: "HTML subscript tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<sub></sub>', from, to)    
},
  { label: "summary", type: "tagName", info: "HTML summary tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<summary></summary>', from, to)    
},
  { label: "sup", type: "tagName", info: "HTML superscript tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<sup></sup>', from, to)    
},
  { label: "table", type: "tagName", info: "HTML table tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<table></table>', from, to)    
},
  { label: "tbody", type: "tagName", info: "HTML table body tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<tbody></tbody>', from, to)    
},
  { label: "td", type: "tagName", info: "HTML table data cell tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<td></td>', from, to)    
},
  { label: "template", type: "tagName", info: "HTML template tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<template></template>', from, to)    
},
  { label: "textarea", type: "tagName", info: "HTML text area tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<textarea></textarea>', from, to)    
},
  { label: "tfoot", type: "tagName", info: "HTML table footer tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<tfoot></tfoot>', from, to)    
},
  { label: "th", type: "tagName", info: "HTML table header cell tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<th></th>', from, to)    
},
  { label: "thead", type: "tagName", info: "HTML table header tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<thead></thead>', from, to)    
},
  { label: "time", type: "tagName", info: "HTML time tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<time></time>', from, to)    
},
  { label: "title", type: "tagName", info: "HTML title tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<title></title>', from, to)    
},
  { label: "tr", type: "tagName", info: "HTML table row tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<tr></tr>', from, to)    
},
  { label: "track", type: "tagName", info: "HTML track tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<track></track>', from, to)    
},
  { label: "u", type: "tagName", info: "HTML underline tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<u></u>', from, to)    
},
  { label: "ul", type: "tagName", info: "HTML unordered list tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<ul></ul>', from, to)    
},
  { label: "var", type: "tagName", info: "HTML variable tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<var></var>', from, to)    
},
  { label: "video", type: "tagName", info: "HTML video tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<video></video>', from, to)    
},
  { label: "wbr", type: "tagName", info: "HTML word break opportunity tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<wbr></wbr>', from, to)    
},
  { label: "svg", type: "tagName", info: "HTML svg tag",
    apply: (view:EditorView, _: Completion, from: number, to: number) => replaceTagText(view, '<svg></svg>', from, to)    
},

];
// { label: "jaehwan", type: "constant", info: "으으 방구쟁이" },
//   { label: "password", type: "variable" }
function myCompletions(context: CompletionContext) {
  let before = context.matchBefore(/\w+/);
  // If completion wasn't explicitly started and there
  // is no word before the cursor, don't open completions.
  if (!context.explicit && !before) return null;
  return {
    from: before ? before.from : context.pos,
    options: completions,
    validFor: /^\w*$/,
    
  }
}

function App() {
  // const [editorSettings, setEditorSettings] = useState(EDITOR_SETTINGS);
  const [codeMirrorText, setCodeMirrorText] = useState('');
  const [yText, setYText] = useState<Y.Text>(yt);
  const [undoManager, setUndoManager] = useState<Y.UndoManager>();
  const [onTypescript, setOnTypescript] = useState(false);
  const [languageModeState, setLanguageModeState] = useState(languageMode.javascript);
  const provider = useRef<WebsocketProvider>();
  const [fontSize, setFontSize] = useState(14);
  // const wsRef = useRef<WebSocket>();
  
  const onChange = (val:string) => {
    setCodeMirrorText(val)
  }

  const onClickToggleTypescript = () => {
    setOnTypescript(!onTypescript)
  }

  const onChangeLanguageMode = (val: 'java' | 'javascript' | 'python') => {
    setLanguageModeState(languageMode[val])
  }

  const onChangeFontSize = (val: number) => {
    setFontSize(val)
  }


  useEffect(() => {
    
     provider.current = new WebsocketProvider(
      'ws://192.168.0.86:8080',
      'codemirror1234',
      yDoc
    )
    
  },[])

  useEffect(() => {
    if(!provider.current) return;
    setUndoManager(new Y.UndoManager(yText));
    // setYText(yText);
    yText.observe((event, transaction) => {
      const text = yText.toString();

      // console.log(event,transaction,yText);
    })
    provider.current.awareness.setLocalStateField('user', {
      name: '항구를떠도는철새' + Math.floor(Math.random() * 100),
      color: userColor.color,
      colorLight: userColor.light,
      message: '퉷!'
    });

    return () => {
      provider.current?.disconnect();
    }
  },[provider,yText])

  

  return(
  <>
  <nav className="fixed w-full h-14 bg-slate-950 z-10 flex items-center px-4 top-0">
    <p className="text-white text-2xl">러닝핏 X KDT</p>
    
  </nav>
  <div className="w-full bg-[#292A30] min-h-[100vh] flex">
  <aside className="w-60 h-full min-h-[100vh] bg-gray-700 flex flex-col justify-between items-center gap-4 py-20">
    <div className="flex flex-col gap-8">
      <div className="text-white">
        <select
          defaultValue="javascript"
          className="w-full px-4 h-12 rounded-lg bg-[#292A30] text-white"
          onChange={(e) => onChangeLanguageMode(e.target.value as 'java' | 'javascript' | 'python')}
        >
          <option value="java">자바</option>
          <option value="javascript">자바스크립트</option>
          <option value="python">파이썬</option>
        </select>
      </div>
      {
        languageModeState === languageMode.javascript &&
        <button
          className={`text-white px-4 h-12 rounded-lg bg-[#009C72]
          transition-all duration-300
          ${onTypescript ? 'bg-[#009C72]' : 'bg-[#292A30]'}
          `}
          onClick={onClickToggleTypescript}
        >타입스크립트
      </button>
      }
      <div className="text-white">
        <select
          defaultValue="14"
          className="w-full px-4 h-12 rounded-lg bg-[#292A30] text-white"
          onChange={(e) => onChangeFontSize(+e.target.value)}
        >
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="24">24</option>
          <option value="28">28</option>
        </select>
      </div>
    </div>
      
    <div className="flex flex-col gap-8">
      <div className="text-white">아이콘</div>
      <div className="text-white">아이콘</div>
      <div className="text-white">아이콘</div>
    </div>

  </aside>

    <div className="mt-20 w-full min-h-[100vh] flex-1 p-4 overflow-scroll">
      
      <div className="border border-slate-700 rounded-lg overflow-scroll">
        {
          provider.current &&
          (yText && provider && provider.current.awareness && undoManager) ?
          <CodeMirror
          
          // ref={codeMirrorRef || null}
          value={codeMirrorText}
          onChange={onChange}
          theme={myTheme}
          aria-setsize={1}
          height="500px"
          basicSetup={{
            closeBrackets: true,
            foldGutter: true,
            dropCursor: true,
            indentOnInput: true,
            autocompletion: true,
            
          }}
          extensions={[autocompletion({ override: [ myCompletions ] }),
            basicSetup({
              completionKeymap: true,
              foldGutter: true,
            }),
            autoCloseTags,
            yCollab(yText, provider.current.awareness, { undoManager }),
            languageModeState,
            lintGutter(),
            linter(esLint(new eslint.Linter(),config)),
            EditorView.theme({
              "&": {
                fontSize: `${fontSize}px`,
              }
            }),
            
            // mentions(users),
            ]}
          />
          : <div>로딩중</div>
        }
          
        </div>

        <div className="py-4 flex gap-4 justify-start items-center">
          <button className="text-white px-8 h-12 rounded-lg bg-[#009C72]">실행하기</button>
          <button className="text-white px-8 h-12 rounded-lg bg-[#009C72]">공유하기</button>
        </div>

        <div className="min-h-[220px] border border-slate-700 rounded-lg overflow-hidden p-4 bg-[#292A30]">
          <p className="text-white">코드 파싱 결과창</p>
        </div>
      </div>
  </div>
  </>
  )
}

export default App;




