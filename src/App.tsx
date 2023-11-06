import { useState } from "react";
import CodeMirror from '@uiw/react-codemirror';

import { autoCloseTags, javascript, jsxLanguage } from '@codemirror/lang-javascript'
import { color } from "@uiw/react-codemirror";
import { HighlightStyle, tags } from "@codemirror/highlight";
import { basicSetup } from "@codemirror/basic-setup";
import { EditorView } from "@codemirror/view";
import { autocompletion, startCompletion } from "@codemirror/autocomplete";

import { EditorState } from '@codemirror/state';
import { mentions } from '@uiw/codemirror-extensions-mentions';
import { abcdef, vscodeDark, xcodeDark } from '@uiw/codemirror-themes-all'
import createTheme, { CreateThemeOptions } from "@uiw/codemirror-themes";
import { tags as t } from '@lezer/highlight';
const users = [
  { label: '@Walter White' },
  { label: '@유제환' },
  { label: '@김명성' },
];


const myTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#2d2d2d',
    backgroundImage: '',
    foreground: '#fff',
    caret: '#AEAFAD',
    selection: '#D6D6D6',
    selectionMatch: '#D6D6D6',
    gutterBackground: '#FFFFFF',
    gutterForeground: '#4D4D4C',
    gutterBorder: '#dddddd',
    gutterActiveForeground: '',
    lineHighlight: '#EFEFEF',
  },
  styles: [
    { tag: t.comment, color: '#787b80' },
    { tag: t.definition(t.typeName), color: '#194a7b' },
    { tag: t.typeName, color: '#194a7b' },
    { tag: t.tagName, color: '#008a02' },
    { tag: t.variableName, color: '#1a00db' },
  ],
});






function App() {
  const [value, setValue] = useState('');
  const onChange = (val:string) => {
    setValue(val);
  }
  return <CodeMirror value={value} onChange={onChange}
  theme={xcodeDark}
   height="100vh"
   basicSetup={{
    allowMultipleSelections: true,
    closeBrackets: true,
    foldGutter: true,
    dropCursor: true,
    indentOnInput: true,
    syntaxHighlighting: true,
    autocompletion: true,
   }}
   extensions={[
    autoCloseTags,
    javascript({jsx: true}),
    mentions(users)
    ]}
  />
}

export default App;
