import { autoCloseTags, javascript } from '@codemirror/lang-javascript'
import { mentions } from '@uiw/codemirror-extensions-mentions';
import { xcodeDark } from '@uiw/codemirror-themes-all'
import CodeMirror, { basicSetup } from '@uiw/react-codemirror';
import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import * as random from 'lib0/random';
import { yCollab } from 'y-codemirror.next';

import { WebsocketProvider } from 'y-websocket';

import './App.css'

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

function App() {
  // const [editorSettings, setEditorSettings] = useState(EDITOR_SETTINGS);
  const [codeMirrorText, setCodeMirrorText] = useState('');
  const [yText, setYText] = useState<Y.Text>(yt);
  const [undoManager, setUndoManager] = useState<Y.UndoManager>();
  const [onTypescript, setOnTypescript] = useState(false);
  const provider = useRef<WebsocketProvider>();
  // const wsRef = useRef<WebSocket>();
  
  const onChange = (val:string) => {
    setCodeMirrorText(val)
  }

  const onClickToggleTypescript = () => {
    setOnTypescript(!onTypescript)
  }

  // 192.168.0.73

  // useEffect(() => {
  //   wsRef.current = new WebSocket('ws://192.168.0.86:8080');


  //   wsRef.current.onmessage = (event) => {
  //     // const data = JSON.parse(event.data);
  //     // const message = data.codemirrorText;
  //     // if(message !== undefined && message !== null){
  //     // setCodeMirrorText(message);
  //     // }
  //   }
  // },[])

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

      console.log(text);
    })
    

    // provider.current.on('', (event:any) => {
    //   console.log('hello from provider', event)
    // });

    // provider.current.awareness.setLocalStateField('user', {
    //   name: 'Anonymous ' + Math.floor(Math.random() * 100),
    //   color: userColor.color,
    //   colorLight: userColor.light
    // });
    
    


    // return () => {
    //   provider.disconnect();
    // }
  },[provider,yText])


  // useEffect(() => {
  //   if(yText && yText.toString() !== codeMirrorText) {
  //     yText.applyDelta([
  //       yText.length > 0 ? {delete: yText.length} : {}, // 콘텐츠가 있으면 전부 삭제하고
  //       {insert: codeMirrorText} // 새로운 콘텐츠를 삽입
  //     ]);
  //   }
  // },[yText, codeMirrorText])

  // useEffect(() => {
  //   if (wsRef.current?.readyState === WebSocket.OPEN) {
  //     wsRef.current.send(codeMirrorText);
  //   }
  // }, [codeMirrorText]);

  return(
  <>
  <nav className="fixed w-full h-14 bg-slate-950 z-10 flex items-center px-4 top-0">
    <p className="text-white text-2xl">러닝핏 X KDT</p>
    
  </nav>
  <div className="w-full bg-[#292A30] min-h-[100vh] flex">
  <aside className="w-20 h-full min-h-[100vh] bg-gray-700 flex flex-col justify-between items-center gap-4 py-20">
    <div className="flex flex-col gap-8">
      <div className="text-white">
        <button
          onClick={onClickToggleTypescript}
        >타입스크립트 on/off</button>
      </div>
      <div className="text-white">아이콘</div>
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
          theme={xcodeDark}
          aria-setsize={1}
          height="500px"
          basicSetup={{
            
            closeBrackets: true,
            foldGutter: true,
            dropCursor: true,
            indentOnInput: true,
            // syntaxHighlighting: true,
            autocompletion: true,
          }}
          extensions={[
            basicSetup({
              completionKeymap: true,
              foldGutter: true,

            }),
            autoCloseTags,
            yCollab(yText, provider.current.awareness, { undoManager }),
            
            javascript({jsx: true,typescript: onTypescript}),
            mentions(users),
            ]
          }
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
