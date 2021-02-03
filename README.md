# Learning how to write a plugin


## Getting Tokens

These are the results from running `cm.getTokenAt({'line':1,'ch':1})` for a given line and ch; I made sure to get all the tokens on each line. The first bullet is the content of the line, and the sub-bullets are all the Tokens fetchd from that line.

You can get the indentation level via Token.state.indentation
The "- " token in a list item has state.taskList = false
The "[ ]" token in a list item / todo has "state.taskOpen = true"; "state.taskClosed = true"; "
The "[x]" token in a list item / todo has state.taskOpen = true

* ""
    * Token {start: 0, end: 0, string: "", type: null}
* "# Tasks..."
    * Token {start: 0, end: 2, string: "# ", type: "formatting formatting-header formatting-header-1 h…eader-1 line-HyperMD-header line-HyperMD-header-1"}
    * Token {start: 2, end: 8, string: "Tasks…", type: "header header-1"}
* "- [ ] Sample Task"
    * Token {start: 0, end: 2, string: "- ", type: "formatting formatting-list formatting-list-ul list-1 line-HyperMD-list-line line-HyperMD-list-line-1"}
    * Token {start: 2, end: 5, string: "[ ]", type: "formatting formatting-task meta"}
    * Token {start: 5, end: 6, string: " ", type: "list-1", state: {…}}
    * Token {start: 6, end: 12, string: "Sample", type: "list-1"}
    * Token {start: 12, end: 13, string: " ", type: "list-1"}
    * Token {start: 13, end: 17, string: "Task", type: "list-1"}
* "- [x] Sample"
    * Token {start: 0, end: 2, string: "- ", type: "formatting formatting-list formatting-list-ul list-1 line-HyperMD-list-line line-HyperMD-list-line-1", state: {…}} 
    * Token {start: 2, end: 5, string: "[x]", type: "formatting formatting-task property", state: {…}}
    * Token {start: 5, end: 6, string: " ", type: "list-1", state: {…}} 
    * Token {start: 6, end: 12, string: "Sample", type: "list-1", state: {…}}
* "    - [ ] SingleIndent"
    * Token {start: 0, end: 4, string: "    ", type: "hmd-list-indent hmd-list-indent-1"
    * Token {start: 4, end: 6, string: "- ", type: "formatting formatting-list formatting-list-ul list-2 line-HyperMD-list-line line-HyperMD-list-line-2"
    * Token {start: 6, end: 9, string: "[ ]", type: "formatting formatting-task meta"
    * Token {start: 9, end: 10, string: " ", type: "list-2", state: {…}}
    * Token {start: 10, end: 22, string: "SingleIndent", type: "list-2"
* "- [ ] Sample #work @done(2021-01-28 10:36 AM)"
    * Token {start: 0, end: 2, string: "- ", type: "formatting formatting-list formatting-list-ul list-1 line-HyperMD-list-line line-HyperMD-list-line-1"}
    * Token {start: 2, end: 5, string: "[ ]", type: "formatting formatting-task meta", state: {…}} 
    * Token {start: 5, end: 6, string: " ", type: "list-1", state: {…}} 
    * Token {start: 6, end: 12, string: "Sample", type: "list-1", state: {…}} 
    * Token {start: 12, end: 13, string: " ", type: "list-1", state: {…}}
    * Token {start: 13, end: 14, string: "#", type: "list-1 formatting formatting-hashtag hashtag-begin hashtag meta tag-work", state: {…}}
    * Token {start: 14, end: 18, string: "work", type: "list-1 hashtag meta hashtag-end tag-work", state: {…}} 
    * Token {start: 18, end: 19, string: " ", type: "list-1", state: {…}}
    * Token {start: 19, end: 24, string: "@done", type: "list-1", state: {…}}
    * Token {start: 24, end: 25, string: "(", type: "list-1", state: {…}}
    * Token {start: 25, end: 35, string: "2021-01-28", type: "list-1", state: {…}}
    * Token {start: 35, end: 36, string: " ", type: "list-1", state: {…}} 
    * Token {start: 36, end: 38, string: "10", type: "list-1", state: {…}} 
    * Token {start: 38, end: 39, string: ":", type: "list-1", state: {…}} 
    * Token {start: 39, end: 41, string: "36", type: "list-1", state: {…}} 
    * Token {start: 41, end: 42, string: " ", type: "list-1", state: {…}}
    * Token {start: 42, end: 45, string: "AM)", type: "list-1", state: {…}}
* "- [ ] Sample [[20210125]]"
    * Token {start: 0, end: 2, string: "- ", type: "formatting formatting-list formatting-list-ul list-1 line-HyperMD-list-line line-HyperMD-list-line-1", state: {…}} 
    * Token {start: 2, end: 5, string: "[ ]", type: "formatting formatting-task meta", state: {…}} 
    * Token {start: 5, end: 6, string: " ", type: "list-1", state: {…}} 
    * Token {start: 6, end: 12, string: "Sample", type: "list-1", state: {…}} 
    * Token {start: 12, end: 13, string: " ", type: "list-1", state: {…}} 
    * Token {start: 13, end: 15, string: "[[", type: "formatting-link list-1", state: {…}} 
    * Token {start: 15, end: 23, string: "20210125", type: "list-1 hmd-internal-link", state: {…}} 
    * Token {start: 23, end: 25, string: "]]", type: "formatting-link list-1", state: {…}} 
* "- [ ] Sample [google](https://www.google.com/)"
    * Token {start: 0, end: 2, string: "- ", type: "formatting formatting-list formatting-list-ul list-1 line-HyperMD-list-line line-HyperMD-list-line-1", state: {…}} 
    * Token {start: 2, end: 5, string: "[ ]", type: "formatting formatting-task meta", state: {…}} 
    * Token {start: 5, end: 6, string: " ", type: "list-1", state: {…}} 
    * Token {start: 6, end: 12, string: "Sample", type: "list-1", state: {…}} 
    * Token {start: 12, end: 13, string: " ", type: "list-1", state: {…}} 
    * Token {start: 14, end: 20, string: "google", type: "link list-1", state: {…}} 
    * Token {start: 20, end: 21, string: "]", type: "formatting formatting-link link list-1", state: {…}} 
    * Token {start: 21, end: 22, string: "(", type: "formatting formatting-link-string string url list-1", state: {…}} 
    * Token {start: 22, end: 45, string: "https://www.google.com/", type: "string url list-1", state: {…}} 
    * Token {start: 45, end: 46, string: ")", type: "formatting formatting-link-string string url list-1", state: {…}}
* "- [ ] Sample #wk/10/test"
    * Token {start: 0, end: 2, string: "- ", type: "formatting formatting-list formatting-list-ul list-1 line-HyperMD-list-line line-HyperMD-list-line-1", state: {…}} 
    * Token {start: 2, end: 5, string: "[ ]", type: "formatting formatting-task meta", state: {…}} 
    * Token {start: 5, end: 6, string: " ", type: "list-1", state: {…}} 
    * Token {start: 6, end: 12, string: "Sample", type: "list-1", state: {…}} 
    * Token {start: 14, end: 24, string: "wk/10/test", type: "list-1 hashtag meta hashtag-end tag-wk10test", state: {…}} 
* "- [ ] Sample <2021-01-27"
    * Token {start: 0, end: 2, string: "- ", type: "formatting formatting-list formatting-list-ul list-1 line-HyperMD-list-line line-HyperMD-list-line-1", state: {…}}
    * Token {start: 2, end: 5, string: "[ ]", type: "formatting formatting-task meta", state: {…}} 
    * Token {start: 5, end: 6, string: " ", type: "list-1", state: {…}} 
    * Token {start: 6, end: 12, string: "Sample", type: "list-1", state: {…}}
    * Token {start: 12, end: 13, string: " ", type: "list-1", state: {…}} 
    * Token {start: 14, end: 24, string: "2021-01-27", type: "list-1", state: {…}} 
* " ```"
    * Token {start: 0, end: 0, string: "", type: null, state: {…}} 
    * Token {start: 0, end: 3, string: "```", type: ""formatting formatting-code-block  line-HyperMD-codeblock line-background-HyperMD-codeblock-bg hmd-codeblock line-HyperMD-codeblock-begin line-background-HyperMD-codeblock-begin-bg"", state: {…}}
* (Inside a code block, aka after ^^ that line) "this.app.plugins.plugins['obsidian-sample-plugin'].registerCodeMirror"
    * Token {start: 0, end: 0, string: "", type: null, state: {…}} 
    * Token {start: 0, end: 70, string: "this.app.plugins.plugins['obsidian-sample-plugin'].registerCodeMirror(", type: "line-HyperMD-codeblock line-background-HyperMD-codeblock-bg hmd-codeblock", state: {…}