import { autoCloseTags, javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import { mentions } from '@uiw/codemirror-extensions-mentions';
import CodeMirror, { basicSetup } from '@uiw/react-codemirror';
import { useEffect, useRef, useState } from 'react';
import { yCollab } from 'y-codemirror.next';
import { CompletionContext, autocompletion } from "@codemirror/autocomplete";

import * as Y from 'yjs';
import * as random from 'lib0/random';
import { WebsocketProvider } from 'y-websocket';
import './App.css'
import createTheme from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';




const myTheme = createTheme({
  theme: 'dark',
  settings: {
    selection: '#1be8ffc3',
    selectionMatch: '#1bff4c',
    caret: '#1be7ff',
    gutterBorder: '#1be7ff',
    lineHighlight: '#1be8ff3b',
  },
    styles: [
    { tag: t.comment, color: '#7ea8fc9b' },
    { tag: t.definition(t.typeName), color: '#194a7b' },
    { tag: t.typeName, color: '#2f8eec' },
    { tag: t.tagName, color: '#5ed75e' },
    { tag: t.variableName, color: '#72b2f1' },
    { tag: t.angleBracket, color: '#F000C0'},
    { tag: t.angleBracket, color: '#c7c7c7'},
    { tag: t.keyword, color: '#F000C0', fontWeight: 'bold'},
    { tag: t.bracket, color: '#f0d400bb'},
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
    { tag: t.bool, color: '#ae04f7ffd'},
    
    
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


const completions = [
  ...javascriptKeywords.map((keyword) => ({ label: keyword, type: "keyword", info: "JavaScript keyword" })),
  ...javaKeywords.map((keyword) => ({ label: keyword, type: "keyword", info: "Java keyword" })),
  ...pythonKeywords.map((keyword) => ({ label: keyword, type: "keyword", info: "Python keyword" })),
  { label : "import", type: "keyword", info: "import"},
  { label: "className", type: "attributeName", info: "HTML class attribute" },
  { label: "span", type: "tagName", info:'html tag'},
  { label: "a", type: "tagName", info: "HTML anchor tag" },
  { label: "abbr", type: "tagName", info: "HTML abbreviation tag" },
  { label: "address", type: "tagName", info: "HTML address tag" },
  { label: "area", type: "tagName", info: "HTML area tag" },
  { label: "article", type: "tagName", info: "HTML article tag" },
  { label: "aside", type: "tagName", info: "HTML aside tag" },
  { label: "audio", type: "tagName", info: "HTML audio tag" },
  { label: "b", type: "tagName", info: "HTML bold tag" },
  { label: "base", type: "tagName", info: "HTML base tag" },
  { label: "bdi", type: "tagName", info: "HTML bdi tag" },
  { label: "bdo", type: "tagName", info: "HTML bdo tag" },
  { label: "blockquote", type: "tagName", info: "HTML blockquote tag" },
  { label: "body", type: "tagName", info: "HTML body tag" },
  { label: "br", type: "tagName", info: "HTML line break tag" },
  { label: "button", type: "tagName", info: "HTML button tag" },
  { label: "canvas", type: "tagName", info: "HTML canvas tag" },
  { label: "caption", type: "tagName", info: "HTML table caption tag" },
  { label: "cite", type: "tagName", info: "HTML citation tag" },
  { label: "code", type: "tagName", info: "HTML code tag" },
  { label: "col", type: "tagName", info: "HTML column tag" },
  { label: "colgroup", type: "tagName", info: "HTML column group tag" },
  { label: "data", type: "tagName", info: "HTML data tag" },
  { label: "datalist", type: "tagName", info: "HTML datalist tag" },
  { label: "dd", type: "tagName", info: "HTML description detail tag" },
  { label: "del", type: "tagName", info: "HTML deleted text tag" },
  { label: "details", type: "tagName", info: "HTML details tag" },
  { label: "dfn", type: "tagName", info: "HTML definition term tag" },
  { label: "dialog", type: "tagName", info: "HTML dialog tag" },
  { label: "div", type: "tagName", info: "HTML division tag" },
  { label: "dl", type: "tagName", info: "HTML description list tag" },
  { label: "dt", type: "tagName", info: "HTML description term tag" },
  { label: "em", type: "tagName", info: "HTML emphasized text tag" },
  { label: "embed", type: "tagName", info: "HTML embed tag" },
  { label: "fieldset", type: "tagName", info: "HTML fieldset tag" },
  { label: "figure", type: "tagName", info: "HTML figure tag" },
  { label: "figcaption", type: "tagName", info: "HTML figure caption tag" },
  { label: "footer", type: "tagName", info: "HTML footer tag" },
  { label: "form", type: "tagName", info: "HTML form tag" },
  { label: "h1", type: "tagName", info: "HTML heading 1 tag" },
  { label: "h2", type: "tagName", info: "HTML heading 2 tag" },
  { label: "h3", type: "tagName", info: "HTML heading 3 tag" },
  { label: "h4", type: "tagName", info: "HTML heading 4 tag" },
  { label: "h5", type: "tagName", info: "HTML heading 5 tag" },
  { label: "h6", type: "tagName", info: "HTML heading 6 tag" },
  { label: "head", type: "tagName", info: "HTML head tag" },
  { label: "header", type: "tagName", info: "HTML header tag" },
  { label: "hgroup", type: "tagName", info: "HTML heading group tag" },
  { label: "hr", type: "tagName", info: "HTML horizontal rule tag" },
  { label: "html", type: "tagName", info: "HTML html tag" },
  { label: "i", type: "tagName", info: "HTML italic tag" },
  { label: "iframe", type: "tagName", info: "HTML inline frame tag" },
  { label: "img", type: "tagName", info: "HTML image tag" },
  { label: "input", type: "tagName", info: "HTML input tag" },
  { label: "ins", type: "tagName", info: "HTML inserted text tag" },
  { label: "kbd", type: "tagName", info: "HTML keyboard input tag" },
  { label: "label", type: "tagName", info: "HTML label tag" },
  { label: "legend", type: "tagName", info: "HTML legend tag" },
  { label: "li", type: "tagName", info: "HTML list item tag" },
  { label: "link", type: "tagName", info: "HTML link tag" },
  { label: "main", type: "tagName", info: "HTML main tag" },
  { label: "map", type: "tagName", info: "HTML map tag" },
  { label: "mark", type: "tagName", info: "HTML marked text tag" },
  { label: "menu", type: "tagName", info: "HTML menu tag" },
  { label: "meta", type: "tagName", info: "HTML meta tag" },
  { label: "meter", type: "tagName", info: "HTML meter tag" },
  { label: "nav", type: "tagName", info: "HTML navigation tag" },
  { label: "noscript", type: "tagName", info: "HTML noscript tag" },
  { label: "object", type: "tagName", info: "HTML object tag" },
  { label: "ol", type: "tagName", info: "HTML ordered list tag" },
  { label: "optgroup", type: "tagName", info: "HTML option group tag" },
  { label: "option", type: "tagName", info: "HTML option tag" },
  { label: "output", type: "tagName", info: "HTML output tag" },
  { label: "p", type: "tagName", info: "HTML paragraph tag" },
  { label: "param", type: "tagName", info: "HTML parameter tag" },
  { label: "picture", type: "tagName", info: "HTML picture tag" },
  { label: "pre", type: "tagName", info: "HTML preformatted text tag" },
  { label: "progress", type: "tagName", info: "HTML progress tag" },
  { label: "q", type: "tagName", info: "HTML quote tag" },
  { label: "rp", type: "tagName", info: "HTML ruby parenthesis tag" },
  { label: "rt", type: "tagName", info: "HTML ruby text tag" },
  { label: "ruby", type: "tagName", info: "HTML ruby tag" },
  { label: "s", type: "tagName", info: "HTML strikethrough tag" },
  { label: "samp", type: "tagName", info: "HTML sample output tag" },
  { label: "script", type: "tagName", info: "HTML script tag" },
  { label: "section", type: "tagName", info: "HTML section tag" },
  { label: "select", type: "tagName", info: "HTML select tag" },
  { label: "small", type: "tagName", info: "HTML small text tag" },
  { label: "source", type: "tagName", info: "HTML source tag" },
  { label: "span", type: "tagName", info: "HTML span tag" },
  { label: "strong", type: "tagName", info: "HTML strong tag" },
  { label: "style", type: "tagName", info: "HTML style tag" },
  { label: "sub", type: "tagName", info: "HTML subscript tag" },
  { label: "summary", type: "tagName", info: "HTML summary tag" },
  { label: "sup", type: "tagName", info: "HTML superscript tag" },
  { label: "table", type: "tagName", info: "HTML table tag" },
  { label: "tbody", type: "tagName", info: "HTML table body tag" },
  { label: "td", type: "tagName", info: "HTML table data cell tag" },
  { label: "template", type: "tagName", info: "HTML template tag" },
  { label: "textarea", type: "tagName", info: "HTML text area tag" },
  { label: "tfoot", type: "tagName", info: "HTML table footer tag" },
  { label: "th", type: "tagName", info: "HTML table header cell tag" },
  { label: "thead", type: "tagName", info: "HTML table header tag" },
  { label: "time", type: "tagName", info: "HTML time tag" },
  { label: "title", type: "tagName", info: "HTML title tag" },
  { label: "tr", type: "tagName", info: "HTML table row tag" },
  { label: "track", type: "tagName", info: "HTML track tag" },
  { label: "u", type: "tagName", info: "HTML underline tag" },
  { label: "ul", type: "tagName", info: "HTML unordered list tag" },
  { label: "var", type: "tagName", info: "HTML variable tag" },
  { label: "video", type: "tagName", info: "HTML video tag" },
  { label: "wbr", type: "tagName", info: "HTML word break opportunity tag" }
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
    validFor: /^\w*$/
  };
}

function App() {
  // const [editorSettings, setEditorSettings] = useState(EDITOR_SETTINGS);
  const [codeMirrorText, setCodeMirrorText] = useState('');
  const [yText, setYText] = useState<Y.Text>(yt);
  const [undoManager, setUndoManager] = useState<Y.UndoManager>();
  const [onTypescript, setOnTypescript] = useState(false);
  const [languageModeState, setLanguageModeState] = useState(languageMode.javascript);
  const provider = useRef<WebsocketProvider>();
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
      // const text = yText.toString();
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
      <div className="text-white">아이콘</div>
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
          extensions={[autocompletion({ override: [myCompletions] }),
            basicSetup({
              completionKeymap: true,
              foldGutter: true,
            }),
            autoCloseTags,
            yCollab(yText, provider.current.awareness, { undoManager }),
            languageModeState,
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




// import createTheme from "@uiw/codemirror-themes";
// import { tags as t } from '@lezer/highlight';

// const myTheme = createTheme({
//   theme: 'dark',
//   settings: {
//     background: '#2d2d2d',
//     backgroundImage: '',
//     foreground: '#fff',
//     caret: '#AEAFAD',
//     selection: '#D6D6D6',
//     selectionMatch: '#D6D6D6',
//     gutterBackground: '#FFFFFF',
//     gutterForeground: '#4D4D4C',
//     gutterBorder: '#dddddd',
//     gutterActiveForeground: '',
//     lineHighlight: '#EFEFEF',
//   },
//   styles: [
//     { tag: t.comment, color: '#787b80' },
//     { tag: t.definition(t.typeName), color: '#194a7b' },
//     { tag: t.typeName, color: '#194a7b' },
//     { tag: t.tagName, color: '#008a02' },
//     { tag: t.variableName, color: '#1a00db' },
//   ],
// });




// export const SUPPORT_LEVELS = {
//   SUPPORTED: "SUPPORTED",
//   NOT_SUPPORTED: "NOT_SUPPORTED",
//   PARTIAL_SUPPORT: "PARTIAL_SUPPORT",
// };


// export const INDENT_VALUES = {
//   TABS: "Tabs",
//   SPACES: "Spaces",
// };

// export const EDITOR_SETTINGS = {
//   theme: {
//     label: "Syntax Highlighting",
    
    
//     // "Solarized Dark",
//     // "Tomorrow Night",
//     // "Oceanic Dark",
//     // "Panda",
//     // "DuoTone Dark",
//     // "High Contrast Dark",
//     // "Classic",
//     // "Solarized Light",
//     // "XQ Light",
//     // "Oceanic Light",
//     // "MDN Like",
//     // "DuoTone Light",
//     // "High Contrast Light",

//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: "We have lots of themes to port over; may want to drop ",
//   },

//   fontSize: {
//     label: "Font Size",
//     default: 14,
//     options: [10, 12, 14, 16, 18, 20, 22, 24],
//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: (
//       <>
//         <a href="https://discuss.codemirror.net/t/changing-the-font-size-of-cm6/2935">
//           Implemented via Theme
//         </a>
//       </>
//     ),
//   },

//   lineHeight: {
//     label: "Line Height",
//     default: 1.4,
//     options: [1, 1.2, 1.4, 1.6, 1.8, 2],
//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: null,
//   },

//   fontFamily: {
//     label: "Font",
//     default: "Source Code Pro",
//     options: [
//       "Monaco",
//       "Hack",
//       "Inconsolata",
//       "Source Code Pro",
//       "Monoid",
//       "Fantasque Sans Mono",
//       "Input Mono",
//       "DejaVu Sans Mono",
//       "FireCode Medium",
//       "Operator Mono",
//       "Dank Mono",
//       "Gintronic",
//       "Courier Prime",
//       "JetBrains Mono",
//       "Recursive",
//       "MonoLisa",
//       "Codelia",
//       "Comic Code",
//     ],
//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: null,
//   },

//   indentWidth: {
//     label: "Indent Width",
//     default: 2,
//     options: [2, 4, 6, 8],
//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: (
//       <>
//         NOTE: Does not convert previous indentations to a new width. There are
//         some ways to do that through{" "}
//         <a href="https://prettier.io/docs/en/api.html">Prettier</a>. Is there an
//         official CodeMirror way of altering indent width of pre-authored code
//         for spaces?
//       </>
//     ),
//   },

//   indentUnit: {
//     label: "Tabs or Spaces",
//     default: INDENT_VALUES.SPACES,
//     options: [INDENT_VALUES.SPACES, INDENT_VALUES.TABS],
//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: (
//       <>NOTE: Does not convert previous indentations to the new indent unit. </>
//     ),
//   },

//   lineNumbers: {
//     label: "Line Numbers",
//     default: true,
//     options: [true, false],
//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: (
//       <>
//         <a href="https://codemirror.net/6/docs/ref/#gutter.lineNumbers">
//           Officially supported
//         </a>
//       </>
//     ),
//   },

//   lineWrapping: {
//     label: "Line Wrapping",
//     default: true,
//     options: [true, false],
//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: (
//       <>
//         <a href="https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping">
//           Officially supported
//         </a>
//       </>
//     ),
//   },

//   codeFolding: {
//     label: "Code Folding",
//     default: true,
//     options: [true, false],
//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: (
//       <>
//         <a href="https://codemirror.net/6/docs/ref/#fold">
//           Officially supported.
//         </a>
//       </>
//     ),
//   },

//   matchBrackets: {
//     label: "Match & Close Brackets / Tags",
//     default: true,
//     options: [true, false],
//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: (
//       <>
//         <p>
//           <a href="https://codemirror.net/docs/ref/#language.bracketMatching">
//             Officially supported.
//           </a>
//         </p>
//         <p>
//           TODO: CodePen has traditionally paired this concept with{" "}
//           <a href="https://codemirror.net/docs/ref/#autocomplete.closeBrackets">
//             Close Brackets
//           </a>
//           , but they are different plugins in CodeMirror. Should we separate or
//           combine?
//         </p>

//         <p>
//           TODO: There&apos;s also the concept of{" "}
//           <a href="https://github.com/codemirror/lang-html#api-reference">
//             `matchClosingTags` and `autoCloseTags` for HTML
//           </a>{" "}
//           (possibly JSX as well?). Do we want this all linked to one option? In
//           the interest of simplicity, they do all seem related.
//         </p>
//       </>
//     ),
//   },

//   /* https://codemirror.net/6/docs/ref/#autocomplete */
//   autocomplete: {
//     label: "Autocomplete",
//     default: true,
//     options: [true, false],
//     supported: SUPPORT_LEVELS.PARTIAL_SUPPORT,
//     implemented: true,
//     notes: (
//       <>
//         <a href="https://codemirror.net/6/docs/ref/#autocomplete">
//           Officially supported
//         </a>
//         . Need to figure out which languages it works on. Doesn&apos;t seem to
//         do simple stuff in JavaScript like `document`, or `querySelector`. Also
//         we need to pipe in authored JavaScript, so autocomplete works on
//         user-authored code.
//       </>
//     ),
//   },

//   emmet: {
//     label: "Emmet",
//     default: true,
//     options: [true, false],
//     supported: SUPPORT_LEVELS.SUPPORTED,
//     implemented: true,
//     notes: (
//       <>
//         <a href="https://github.com/emmetio/codemirror6-plugin">
//           Implemented as a plugin
//         </a>{" "}
//         by Sergey.
//       </>
//     ),
//   },
// };
