define([
		"dojo/_base/declare", // declare declare.safeMixin
		"dojo/_base/array", // array.forEach
		"dojo/on", // on()
		"dijit/registry", // registry.byId
		"../Attributed"
], function(declare, array, on, registry, Attributed){

	return declare([Attributed], {
		
		// lang: [const] String
		//		Rarely used.  Overrides the default Dojo locale used to render this widget,
		//		as defined by the [HTML LANG](http://www.w3.org/TR/html401/struct/dirlang.html#adef-lang) attribute.
		//		Value must be among the list of locales specified during by the Dojo bootstrap,
		//		formatted according to [RFC 3066](http://www.ietf.org/rfc/rfc3066.txt) (like en-us).
		lang: "",
		
		// dir: [const] String
		//		Bi-directional support, as defined by the [HTML DIR](http://www.w3.org/TR/html401/struct/dirlang.html#adef-dir)
		//		attribute. Either left-to-right "ltr" or right-to-left "rtl".  If undefined, widgets renders in page's
		//		default direction.
		dir: "",
		
		// textDir: String
		//		Bi-directional support,	the main variable which is responsible for the direction of the text.
		//		The text direction can be different than the GUI direction by using this parameter in creation
		//		of a widget.
		//		Allowed values:
		//			1. "ltr"
		//			2. "rtl"
		//			3. "auto" - contextual the direction of a text defined by first strong letter.
		//		By default is as the page direction.
		textDir: "",
		
		// label: HTML String
		//		The label that get propagated to bound widgets.
		label: "",
		
		// showLabel: Boolean
		//		Set this to true to hide the label text and display only the icon.
		//		(If showLabel=false then iconClass must be specified.)
		//		Especially useful for toolbars.
		//		If showLabel=true, the label will become the title (a.k.a. tooltip/hint) of the icon.
		//
		//		The exception case is for computers in high-contrast mode, where the label
		//		will still be displayed, since the icon doesn't appear.
		showLabel: true,

		// iconClass: String
		//		Class to apply to DOMNode in the widget to make it display an icon
		iconClass: "",
		
		// title: String
		//		HTML title attribute.
		//
		//		For form widgets this specifies a tooltip to display when hovering over
		//		the widget (just like the native HTML title attribute).
		//
		//		For TitlePane or for when this widget is a child of a TabContainer, AccordionContainer,
		//		etc., it's used to specify the tab label, accordion pane title, etc.
		title: "",
		
		// tooltip: String
		//		When this widget's title attribute is used to for a tab label, accordion pane title, etc.,
		//		this specifies the tooltip to appear when the mouse is hovered over that text.
		tooltip: "",
		
		// accelKey: String
		//		Text for the accelerator (shortcut) key combination.
		//		Note that although Menu can display accelerator keys there is no infrastructure to 
		//		actually catch and execute these accelerators.
		accelKey: "",
		
		// value: String
		//		Corresponds to the native HTML <input> element's attribute.
		value: "",
		
		// readOnly: Boolean
		//		Should this widget respond to user input?
		//		In markup, this is specified as "readOnly".
		//		Similar to disabled except readOnly form values are submitted.
		readOnly: false,
		
		// toggled: Boolean
		//		True if the button is depressed, or the checkbox is checked,
		//		or the radio button is selected, etc.
		toggled: false,
		
		// category: String
		//		TODO: Add functionality for grouping of actions by category
		category: "",
		
		// enabled: Boolean
		//		Should this widget respond to user input?
		_enabled: true,
		_get_enabled: function(){
			return this._enabled;
		},
		_set_enabled: function(value){
			this._enabled = value;
		},
		
		// _run: Function
		//		Private attribute to hold a function that can define the 
		//		behaviour of the Action.  Typically though a command/Command is 
		//		used to encapsulate the behaviour.
		_run: null,
		_get_run: function(){
			return this._run;
		},
		_set_run: function(value){
			this._run = value;
		},
		
		// _command: Object
		//		The private attribute 
		_command: null,
		_get_command: function(){
			return this._command;
		},
		_set_command: function(value){
			this._command = value;
		},
		
		// _commandStack: Object
		//		The private attribute
		_commandStack: null,
		_get_commandStack: function(){
			return this._commandStack;
		},
		_set_commandStack: function(value){
			this._commandStack = value;
		},
		
		// _binds: Array
		//		The private array that contains all the currently bound widgets
		_binds: [],
		
		// _runHandles: Array
		//		The private array that contains all the handles for when a widget 
		//		click event is bound to the run method on the Action.
		_runHandles: [],
		
		postscript: function(/*Array?*/ binds, /*Object?*/ params){
			if(!params && !(binds instanceof Array)){
				params = binds;
			}
			if (params){ this.set(params); }
			this._binds = [];
			this._runHandles = [];
			this._created = true;
			if(binds && params && (binds instanceof Array) && binds.length){
				this.bind(binds);
			}
		},
		
		run: function(){
			// summary:
			//		Handles the execution of the Action's behaviour.
			// description:
			//		Handles the execution of the Action's behaviour.  First it looks to see if there is a specific 
			//		function that has been Action.set("run", ...); and if not, then looks to see if there is a 
			//		command/Command set on the Action and if there is a CommandStack, it will execute the command 
			//		on that CommandStack.
			//
			//		After a run, it will emit a "run" event and return the result.
			if(this.get("enabled")){
				var result;
				if(this._run && (typeof this._run === "function")){
					result = this._run.apply(this, arguments);
				}else if(this._command && (typeof this._command.execute === "function")){
					if(this._commandStack){
						result = this._commandStack.execute.apply(this._commandStack, [this._command].concat(Array.prototype.slice.call(arguments)));
					}else{
						result = this._command.execute.apply(this._command, arguments);
					}
				}else{
					throw new Error("No suitable function found to run.");
				}
				this.emit("run", { result: result, args: arguments });
				return result;
			}
		},
		
		toggle: function(){
			// summary:
			//		Inverts the Boolean value of the toggled attribute.
			this.set("toggled", !this.get("toggled"));
			return this.get("toggled");
		},
		
		// _attrMapping: Object
		//		A hash of all the Action attributes that need to be propagated to a 
		//		bound widget.
		_attrMapping: {
			lang: "lang",
			dir: "dir",
			textDir: "textDir",
			label: "label",
			showLabel: "showLabel",
			iconClass: "iconClass",
			title: "title",
			tooltip: "",
			accelKey: "accelKey",
			value: "value",
			readOnly: "readOnly",
			toggled: "checked",
			enabled: ["disabled", "enabled"]
		},
		
		_update: function(/*Widget*/ widget, /*String?*/ attr){
			// summary:
			//		Private function that updates a bound widget.
			// description:
			//		A private function that takes a widget and propagates the mapped attributes 
			//		from the Action to the widget.  If the optional `attr` is provided, it will 
			//		only map that attribute.
			
			function setAttr(widget, widgetAttr, attr){
				// summary:
				//		Logic for proagating from and Action to a widget.
				if(typeof widgetAttr === "string"){
					if(widgetAttr in widget){
						// TODO: Should we use direct assignment, avoiding events/watch?
						widget.set(widgetAttr, this.get(attr));
					}
				}else{
					array.forEach(widgetAttr, function(item){
						if(item === "disabled" && attr === "enabled"){ //Handle one special setting
							widget.set(item, !this.get(attr));
						}else{
							widget.set(item, this.get(attr));
						}
					}, this);
				}
			}
			
			if(!widget || !(typeof widget.set === "function")){
				// Either nothing passed or this isn't something we can deal with
				return;
			}else{
				var attrMap = this._attrMapping;
				if(attr){ // Only a single attribute being set
					setAttr.call(this, widget, attrMap[attr], attr);
				}else{
					for(var attr in attrMap){ // The whole map is done.
						setAttr.call(this, widget, attrMap[attr], attr);
					}
				}
			}
		},
		
		_bindRun: function(/*Object*/ widget){
			// summary:
			//		Binds the "click" event on the widget to the run method on the Action
			var self = this;
			this._runHandles.push(on(widget, "click", function(e){
				self.run.call(self, e);
			}));
		},
		
		bind: function(/*String|Object*/ widget){
			// summary:
			//		Binds a widget to the Action.
			// description:
			//		Takes the widget passed as an argument and binds it to the Action 
			//		so that the widget's "click" event executes the Action.run() as well
			//		as propagates attribute settings from the Action to the widget.  Also sets 
			//		the widget up so that when a attribute value is changed on the Action that 
			//		is also propagated to the widget.
			if(typeof widget === "string"){
				widget = registry.byId(widget);
			}
			if(widget && (widget instanceof Array) && widget.length){
				array.forEach(widget, this.bind, this);
				return;
			}
			if(!widget || !widget.set || (typeof widget.set !== "function")){
				throw new Error("Invalid object passed to bind.");
			}
			if(widget._action){
				throw new Error("Widget already bound.");
			}
			widget._action = this;
			this._binds.push(widget);
			this._bindRun(widget);
			this._update(widget);
			var self = this;
			return {
				unbind: function(){
					self.unbind(widget);
				}
			}
		},
		
		unbind: function(widget){
			
		},
		
		onchanged: function(/*Object*/ e){
			// summary:
			//		Called from ancestor Attributed when an attribute value is changed and then 
			//		propagates that change, if appropriate to any bound widgets.
			if(e.attrName in this._attrMapping){
				array.forEach(this._binds, function(widget){
					this._update(widget, e.attrName);
				}, this);
			}
		}		
		
	});

});