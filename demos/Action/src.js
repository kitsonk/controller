require([
	"dojo/parser", // parser.parse
	"dojo/_base/array", // array.forEach
	"dojo/Deferred", // Deferred
	"dojo/_base/fx", // baseFx.fadeOut
	"dojo/_base/lang", // lang.setObject
	"dojo/dom-style", // style.set
	"dijit/registry", // registry.byId
	"dojo-controller/action/Action",
	"dojo-controller/command/Command",
	"dojo-controller/command/CommandStack",
	"dijit/layout/ContentPane", 
	"dijit/form/Button",
	"dijit/form/ToggleButton",
	"dijit/layout/BorderContainer",
	"dijit/layout/TabContainer",
	"dijit/CheckedMenuItem",
	"dijit/Declaration",
	"dijit/Menu",
	"dijit/MenuBar",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/PopupMenuBarItem",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"dojox/form/BusyButton",
	"dojo/domReady!"], 	
function(parser, array, Deferred, baseFx, lang, style, registry, Action, Command, CommandStack, ContentPane){
	
	var baseName = function(path, suffix){
	    // Returns the filename component of the path  
	    // 
	    // version: 1109.2015
	    // discuss at: http://phpjs.org/functions/basename
	    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	    // +   improved by: Ash Searle (http://hexmen.com/blog/)
	    // +   improved by: Lincoln Ramsay
	    // +   improved by: djmix
	    // *     example 1: basename('/www/site/home.htm', '.htm');
	    // *     returns 1: 'home'
	    // *     example 2: basename('ecra.php?p=1');
	    // *     returns 2: 'ecra.php?p=1'
	    var b = path.replace(/^.*[\/\\]/g, '');
	 
	    if (typeof(suffix) == 'string' && b.substr(b.length - suffix.length) == suffix){
	        b = b.substr(0, b.length - suffix.length);
	    }
	 
	    return b;
	}
	
	lang.setObject("demo.addTab", function(tabContainer, href, title, closable){
		if (typeof tabContainer === "string"){
			tabContainer = registry.byId(tabContainer);
		}
		var tabName = "tab" + baseName(href,".html"),
			tab = registry.byId(tabName);
		if (typeof tab === "undefined"){
			var tab = new ContentPane({
				id: tabName,
				title: title,
				href: href,
				closable: closable,
				style: "padding: 0;"
			});
			tabContainer.addChild(tab);
		}
		tabContainer.selectChild(tab);
	});
	
	parser.parse();
	
	function getBinds(item){
		return array.map(["toolbar.", "menubar.", "context.", "button."], function(menu){
			return menu + item;
		});
	}
	
	var actionFileOpen = new Action({
		binds: getBinds("file.Open"),
		label: "Open...",
		iconClass: "dijitIcon dijitIconFolderOpen",
		accelKey: "Ctrl+O",
		title: "Open a file",
		run: function(){
			console.log("open");
		}
	}),
	actionFileNew = new Action({
		binds: getBinds("file.New"),
		label: "New",
		iconClass: "dijitIcon dijitIconFile",
		accelKey: "Ctrl+N",
		title: "Create a new file",
		run: function(){
			console.log("new");
		}
	}),
	actionFileClose = new Action({
		binds: getBinds("file.Close"),
		label: "Close",
		iconClass: "dijitIcon dijitIconClear",
		accelKey: "Ctrl+W",
		title: "Close the file",
		enabled: false,
		run: function(){
			console.log("close");
		}
	}),
	actionFileSave = new Action({
		binds: getBinds("file.Save"),
		label: "Save",
		iconClass: "dijitIcon dijitIconSave",
		accelKey: "Ctrl+S",
		title: "Save the file",
		enabled: false,
		run: function(){
			console.log("save");
		}
	});
	
	var demoCommandStack = new CommandStack();
	
	var actionEditUndo = new Action({
		binds: getBinds("edit.Undo"),
		label: "Undo",
		iconClass: "dijitEditorIcon dijitEditorIconUndo",
		accelKey: "Ctrl+Z",
		title: "Undo last action",
		enabled: false,
		run: function(){
			demoCommandStack.undo();
		}
	}),
	actionEditRedo = new Action({
		binds: getBinds("edit.Redo"),
		label: "Redo",
		iconClass: "dijitEditorIcon dijitEditorIconRedo",
		accelKey: "Ctrl+Y",
		title: "Redo last action",
		enabled: false,
		run: function(){
			demoCommandStack.redo();
		}
	});
	
	var setUndoRedo = function(e){
		var undoCount = this.get("undoCount"),
			redoCount = this.get("redoCount"),
			undoEnabled = actionEditUndo.get("enabled"),
			redoEnabled = actionEditRedo.get("enabled");
		if(undoCount && !undoEnabled){
			actionEditUndo.set("enabled", true);
		}else if(!undoCount && undoEnabled){
			actionEditUndo.set("enabled", false);
		}
		if(redoCount && !redoEnabled){
			actionEditRedo.set("enabled", true);
		}else if(!redoCount && redoEnabled){
			actionEditRedo.set("enabled", false);
		}
	};
	demoCommandStack.on("execute", setUndoRedo);
	demoCommandStack.on("undo", setUndoRedo);
	
	var actionEditPaste = new Action({
		binds: getBinds("edit.Paste"),
		label: "Paste",
		iconClass: "dijitEditorIcon dijitEditorIconPaste",
		accelKey: "Ctrl+V",
		title: "Paste something",
		enabled: false,
		command: new Command({
			name: "Paste",
			execute: function(){
				this._pasteState = actionEditPaste.get("enabled");
				actionEditPaste.set("enabled", false);
				console.log("paste");
			},
			undo: function(){
				actionEditPaste.set("enabled", this._pasteState);
				console.log("undo paste");
			}
		}),
		commandStack: demoCommandStack
	}),
	actionEditCopy = new Action({
		binds: getBinds("edit.Copy"),
		label: "Copy",
		iconClass: "dijitEditorIcon dijitEditorIconCopy",
		accelKey: "Ctrl+C",
		title: "Copy something",
		command: new Command({
			name: "Copy",
			execute: function(){
				this._pasteState = actionEditPaste.get("enabled");
				actionEditPaste.set("enabled", true);
				console.log("copy");
			},
			undo: function(){
				actionEditPaste.set("enabled", this._pasteState);
				console.log("undo copy");
			}
		}),
		commandStack: demoCommandStack
	}),
	actionEditCut = new Action({
		binds: getBinds("edit.Cut"),
		label: "Cut",
		iconClass: "dijitEditorIcon dijitEditorIconCut",
		accelKey: "Ctrl+X",
		title: "Cut something",
		command: new Command({
			name: "Cut",
			execute: function(){
				this._pasteState = actionEditPaste.get("enabled");
				actionEditPaste.set("enabled", true);
				console.log("cut");
			},
			undo: function(){
				actionEditPaste.set("enabled", this._pasteState);
				console.log("undo cut");
			}
		}),
		commandStack: demoCommandStack
	}),
	actionDeferred = new Action({
		binds: getBinds("deferred.Deferred"),
		label: "Deferred Action",
		iconClass: "dijitIcon dijitIconFunction",
		accelKey: "Ctrl+D",
		title: "Execute Deferred",
		enabled: true,
		runningDisable: true,
		runningLabel: "Running...",
		run: function(){
			console.log("deferred");
			var deferred = new Deferred();
			setTimeout(function(){ 
				console.log("deferred resolve");
				deferred.resolve({ called: true });
			}, 2000);
			return deferred;
		}
	}),
	actionToggle = new Action({
		binds: getBinds("toggle.Toggle"),
		label: "Toggle",
		iconClass: "dijitIcon dijitIconBookmark",
		accelKey: "Ctrl+T",
		title: "Toggle Me!",
		run: function(){
			
		}
	});
	
	baseFx.fadeOut({
		node: "preloader",
		onEnd: function() {
			style.set("preloader", "display", "none");
		}
	}).play();
});