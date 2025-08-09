import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Prism from "prismjs"
import Editor from "react-simple-code-editor"
import './App.css'
import axios from 'axios'
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import Markdown from 'react-markdown'

import "prismjs/components/prism-python"
import "prismjs/components/prism-java"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-css"
import "prismjs/components/prism-json"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Prism.highlightAll()
  }, [review])
  useEffect(() => {
    setReview('')
  }, [code])


  const detectLanguage = (code) => {
    if (/^\s*#include\b/m.test(code)) return 'cpp'
    if (/^\s*import\s+\w+/m.test(code) && /def\s+\w+\s*\(.*\)\s*:/.test(code)) return 'python'
    if (/^\s*public\s+class\b/m.test(code)) return 'java'
    if (/^\s*<!DOCTYPE html>|<html>|<\/html>/i.test(code)) return 'markup'
    if (/^\s*(function|const|let|var)\b/.test(code)) return 'javascript'
    if (/^\s*int\s+\w+\s*\(.*\)/.test(code)) return 'c'
    if (/^\s*\{[\s\S]*\}$/.test(code.trim())) return 'json'
    if (/^\s*\$|^echo\b/.test(code)) return 'bash'
    if (/^\s*(type|interface)\s+\w+/.test(code)) return 'typescript'
    return 'javascript'
  }

  const highlightedCode = (code) => {
    const lang = detectLanguage(code)
    const grammar = Prism.languages[lang] || Prism.languages.javascript
    return Prism.highlight(code, grammar, lang)
  }

  async function reviewCode() {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:3000/ai/get-review', { code })
      setReview(response.data)
    } catch (err) {
      setReview("❌ Error fetching review.")
    }
    setLoading(false)
  }

  return (
    <>
      <main>
        <div className="left">
          <div className="code">
            <div className="editor-scroll">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={highlightedCode}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 16,
                  minHeight: "100%",
                  width: "100%",
                  outline: "none",
                  borderRadius: "0.7rem"
                }}    
              />
            </div>
          </div>

          <div onClick={reviewCode} className="review">Review</div>
        </div>

        <div className="right">
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <p>Reviewing your code, please wait...</p>
            </div>
          ) : code ? (
            <Markdown rehypePlugins={[rehypeHighlight]}>
              {review}
            </Markdown>
          ) : (
            <h1 className='empty'>Enter code first</h1>
          )}
        </div>
      </main>
    </>
  )
}

export default App
