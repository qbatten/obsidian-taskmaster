import { 
	App,
	MarkdownSourceView, 
	Notice, 
	Plugin, 
	PluginSettingTab,
	Setting,
	} from 'obsidian'

import {
	Editor,
	Token
} from 'codemirror'


let range = n => [...Array(n).keys()]
let TASK_TYPE_IDENTIFIER = 'formatting-task';
let TASK_COMPLETE_INDENTIFIER = 'property';
let TASK_INCOMPLETE_IDENTIFIER = 'meta';
let LIST_TYPE_IDENTIFIER = 'formatting-list';
let TAG_TYPE_IDENTIFIER = 'hashtag-end';
let INTERNAL_LINK_TYPE_IDENTIFIER = 'hmd-internal-link';

class TaskLine {
	app: any;
	cm: Editor;
	line: number;
	allLineTokens: any;
	lineText: string;
	indent: number;
	checked: boolean;
	tags: String[];
	internalLinks: String[];
	urls: String[];


	getSpecialTokens(allLineTokens: any) {
		let taskTokenGetChecked = function(token: Token) {
			let checkbox = token.string;
			if(checkbox.match(/\[[xX]\]/)) {
				return true;
			} else if(checkbox.match(/\[ \]/)) {
				return false;
			}
		}

		let listTokenGetIndent = function(token: Token) {
			let indentMatch = token.type.match(/list-(?<indent>\d+)/);
			return Number.parseInt(indentMatch.groups.indent);
		}

		let tagTokenGetTag = function(token: Token) {
			let tagMatch = token.type.match(/ tag-(?<tag>[-\w]+)/);
			return tagMatch.groups.tag;
		}

		//
		/* 
		THIS NEEDS FIXING
		TO HANDLE LINKS WITH A SPACE AND/OR MULTUPLE TOKENS W/IN A SINGLE LINK */
		let internalLinkTokenGetName = function(token: Token) {
			return token.string;
		}
		//
		/* 
		THIS NEEDS FIXING
		To handle URLs that arent wrapped in mkdown urls; needs better identifier*/
		let urlTokenGetURL = function(token: Token) {
			return token.string;
		}




		for(let currToken of allLineTokens) {
			this.lineText = this.lineText + currToken.string;
			if(currToken.type.contains(LIST_TYPE_IDENTIFIER)) {
				this.indent = listTokenGetIndent(currToken);
			} else if(currToken.type.contains(TASK_TYPE_IDENTIFIER)) {
				this.checked = taskTokenGetChecked(currToken);
			} else if(currToken.type.contains(TAG_TYPE_IDENTIFIER)) {
				let tag = tagTokenGetTag(currToken) ;
				tag && this.tags.push(tag);
			} else if(currToken.type.contains(INTERNAL_LINK_TYPE_IDENTIFIER)) {
				this.internalLinks.push(internalLinkTokenGetName(currToken))
			} else if(currToken.type.contains('string url') && !currToken.type.contains('formatting')) {
				this.urls.push(urlTokenGetURL(currToken));
			}
		}

		if(this.checked == null) {
			throw Error(`Not a task: line ${this.line}`);
		}
		
	}

	

	constructor(app: any, cm: any, line: number) {
		this.app = app;
		this.cm = cm;
		this.line = line;
		this.allLineTokens = cm.getLineTokens(line);
		this.tags = [];
		this.internalLinks = [];
		this.urls = [];
		this.lineText = "";
	    this.getSpecialTokens(this.allLineTokens);
		
	}

}



export default class TestPlugin extends Plugin {

	cms: CodeMirror.Editor[]
	linesEvaluated: any[]

	evalLines(cm) {
		let i: number = 0;
		cm.eachLine((line) => {
			try {
				let newLine = new TaskLine(this, cm, i);
				this.linesEvaluated[i] = newLine;
			} catch {
				
			} finally {
				i++;
			}
		});
	}
	
	addListenerAndRegister(taskSpan: HTMLElement) {
		
		let markComplete = function (el) {
			el.textContent = "[x]";
			el.removeClass("cm-meta");
			el.addClass("cm-property");
			console.log('uncom->COMP', el);
		};
		
		let markIncomplete = function(el) {
			el.textContent = "[ ]";
			el.removeClass("cm-property");
			el.addClass("cm-meta");
			console.log('COMP->uncomp', el);
		}.bind(this);

		let taskClickEventListener = (ev) =>
		{
			
			let el = ev.target as HTMLElement;
			if(el.innerHTML == "[ ]") {

				markComplete(el);
			} else if(el.innerHTML == "[x]") {
				markIncomplete(el);
			}    
		};

		taskSpan.onclick = taskClickEventListener;
		console.log('added listener');
	}

	refreshListeners() {
		let taskSpans = document.querySelectorAll('span.cm-formatting.cm-formatting-task');
		console.log(taskSpans);
		taskSpans.forEach(this.addListenerAndRegister);
	}

	async onload() {
		
		this.linesEvaluated = [];

		let fullRecheck = function(cm) {
			this.evalLines(cm);
			this.refreshListeners();
		}.bind(this);

		let evalLinesCaller = function(cm: Editor) {
			fullRecheck(cm);
			cm.on('cursorActivity', fullRecheck);
		}
		this.registerCodeMirror(evalLinesCaller);
	}

}



module.exports = TestPlugin;
