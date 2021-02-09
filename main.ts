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
	Token,
	TextMarker
} from 'codemirror'


let range = n => [...Array(n).keys()]
let TASK_TYPE_IDENTIFIER = 'formatting-task';
let TASK_COMPLETE_INDENTIFIER = 'property';
let TASK_INCOMPLETE_IDENTIFIER = 'meta';
let LIST_TYPE_IDENTIFIER = 'formatting-list';
let TAG_TYPE_IDENTIFIER = 'hashtag-end';
let INTERNAL_LINK_TYPE_IDENTIFIER = 'hmd-internal-link';

class Task {
	element: Element;
	marker: TextMarker;
	
	parent: Task;
	children: Task[];

	taskLine: TaskContext;

	checked: Boolean;
	text: String;
	tags: String[];
	internalLinks: String[];
	externalLinks: String[];

	create_date: Date;

	constructor(taskLine) {
		this.create_date = new Date(Date.now());
		this.taskLine = taskLine;
	}
}

class TaskContext {
	app: any;
	cm: Editor;

	line: number;
	indent: number;

	allLineTokens: Token[];

	task: Task;

	create_date: Date;

	
	getSpecialTokens(allLineTokens: any, task: Task) {

		let checkboxTokenGetChecked = function(token: Token) {
			let checkbox = token.string;
			if(checkbox.match(/\[[xX]\]/)) {
				return true;
			} else if(checkbox.match(/\[ \]/)) {
				return false;
			}
		};

		let listTokenGetIndent = function(token: Token) {
			let indentMatch = token.type.match(/list-(?<indent>\d+)/);
			return Number.parseInt(indentMatch.groups.indent);
		}

		let tagTokenGetTag = function(token: Token) {
			let tagMatch = token.type.match(/ tag-(?<tag>[-\w]+)/);
			return tagMatch.groups.tag;
		}

		/* 
		THIS NEEDS FIXING
		TO HANDLE LINKS WITH A SPACE AND/OR MULTUPLE TOKENS W/IN A SINGLE LINK */
		let internalLinkTokenGetName = function(token: Token) {
			return token.string;
		}

		/* 
		THIS NEEDS FIXING
		To handle URLs that arent wrapped in mkdown urls; needs better identifier*/
		let externalLinkTokenGetURL = function(token: Token) {
			return token.string;
		}

		let makeMarkFromToken = function(token: Token, addClass: String,  addTitle: String) {
			let from = {'line': this.line, 'ch':token.start}, 
				to = {'line': this.line, 'ch': token.end},
				opt = {'className': addClass, 'title': addTitle};
			let marker = this.cm.doc.markText(from, to, opt);
			return marker
		}.bind(this);


		for(let currToken of allLineTokens) {
			task.text = task.text ? task.text + currToken.string : currToken.string;
			if(!currToken.type) {
				continue;
			} else if(currToken.type.contains(LIST_TYPE_IDENTIFIER)) {
				this.indent = listTokenGetIndent(currToken);
			} else if(currToken.type.contains(TASK_TYPE_IDENTIFIER)) {
				task.checked = checkboxTokenGetChecked(currToken);
				let mark = makeMarkFromToken(currToken, 
					null, 'TASKTMP-' + this.line);
				task.marker = mark;
			} else if(currToken.type.contains(TAG_TYPE_IDENTIFIER)) {
				let tag = tagTokenGetTag(currToken) ;
				tag && task.tags.push(tag);
			} else if(currToken.type.contains(INTERNAL_LINK_TYPE_IDENTIFIER)) {
				task.internalLinks.push(internalLinkTokenGetName(currToken))
			} else if(currToken.type.contains('string url') && !currToken.type.contains('formatting')) {
				task.externalLinks.push(externalLinkTokenGetURL(currToken));
			}
		}

		if(task.checked == null) {
			throw Error(`Not a task: line ${this.line}, L124`);
		}

		return task;
	}

	constructor(app: any, cm: any, line: number) {
		this.create_date = new Date(Date.now());
		this.app = app;
		this.cm = cm;
		this.line = line;
		this.allLineTokens = cm.getLineTokens(line);
		this.task = this.getSpecialTokens(this.allLineTokens, new Task(this));

		
	}

}



export default class TestPlugin extends Plugin {

	linesEvaluated: {};
	tasks: Task[];

	evalLines(cm): TaskContext[] {
		let linesEvaluated: TaskContext[] = [];
		let i: number = 0;
		cm.eachLine((line) => {
			try {
				let newLine = new TaskContext(this, cm, i);
				linesEvaluated[i] = newLine;
			} catch(e) {
				// console.log(e);
			} finally {
				i++;
			}
		});
		return linesEvaluated;
	}



	getElementAddListenerFromMark(line: TaskContext) {

		let getElementFromMark = function(mark: TextMarker) {
			let el = document.querySelector('[title~=' + mark.title + ']')
			return el;
		}
		

		let markComplete = function (el) {
			let found = this.task.marker.find();
			this.cm.replaceRange('[x]', found.from, found.to);
			el.removeClass("cm-meta");
			el.addClass("cm-property");
		}.bind(line);
		
		let markIncomplete = function(el) {
			let found = this.task.marker.find();
			this.cm.replaceRange('[ ]', found.from, found.to);
			el.removeClass("cm-property");
			el.addClass("cm-meta");
		}.bind(line);

		let taskClickEventListener = (ev) =>
		{
			
			let el = ev.target as HTMLElement;
			if(el.innerHTML == "[ ]") {
				markComplete(el);
			} else if(el.innerHTML == "[x]") {
				markIncomplete(el);
			}    
		};
		let mark = line.task.marker;
		let el: any = getElementFromMark(mark);
		console.log(mark, el);
		el.onclick = taskClickEventListener;
		return el;
	}

	async onload() {
		this.linesEvaluated = {};
		let fullRecheck = function(cm: CodeMirror.Editor, changes) {
			let linesToCheck: number[] = [];
			let newLinesToCheck: number[] = [];
			changes && changes.forEach(change => {
				let fromLine = change.from.line, toLine = change.to.line;
				newLinesToCheck = range(toLine + 1).slice(fromLine,);
				newLinesToCheck.forEach((num) => {
					linesToCheck.contains(num) || linesToCheck.push(num);
					// console.log('changeForEach',newLinesToCheck, num,linesToCheck)
				});
				// console.log('procChange', {changes, change, linesToCheck, newLinesToCheck})
			});
			// console.log('procD', changes, linesToCheck);
			let linesEvaluated = this.evalLines(cm);
			linesEvaluated.forEach((line: TaskContext) => {
				let a = this.getElementAddListenerFromMark(line);
				line.task.element = a;
			});
			linesEvaluated && Object.assign(this.linesEvaluated, linesEvaluated);
			// console.log('linesEval',linesEvaluated )
		}.bind(this);

		this.registerCodeMirror(function(cm: Editor) {
			fullRecheck(cm, null);
			cm.on("changes", fullRecheck);
		});
	}

}



module.exports = TestPlugin;
