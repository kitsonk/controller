define([
		"dojo/_base/declare", // declare declare.safeMixin
		"dojo/_base/array", // array.forEach
		"dojo/_base/lang", // lang.extend
		"dojo/on", // on()
		"dijit/_WidgetBase",
		"dijit/registry", // registry.byId
		"dojo/Stateful",
		"dojo/Evented"
], function(declare, array, lang, on, _WidgetBase, registry, Stateful, Evented){

// module:
//		dojo-controller/action/Action
// summary:
//		A class that builds upon dojo/Stateful and dojo/Evented by adding on 
//		auto-magic getters and setters functionality as well as emitting events
//		when attributes change their value.
	
	lang.extend(_WidgetBase, {
		// Extending _WidgetBase so that widgets can have their Action bound by 
		// setting the `action` attribute on the widget.  For example 
		// `myWidget.set("action", action);` would work.
		
		// Providing a link to the bound Action
		action: null,
		
		// Handles the binding and unbinding of a widget
		_setActionAttr: function(value){
			if(this.action && this.action.unbind){
				// There already is some action bound, unbind it first
				this.action.unbind(this);
			}
			if(value && value.isBound && !value.isBound(this)){
				value.bind(this);
			}
		}
	});

	return declare([Stateful, Evented], {
		
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
		_valueSetter: function(value){
			if(value){
				this.toggled = true;
			}else{
				this.toggled = false;
			}
			this.value = value;
		},
		
		// toggledValue: String
		//		The value that the "value" attribute is set to when toggled=true.
		toggledValue: "toggled",
		
		// readOnly: Boolean
		//		Should this widget respond to user input?
		//		In markup, this is specified as "readOnly".
		//		Similar to disabled except readOnly form values are submitted.
		readOnly: false,
		
		// toggled: Boolean
		//		True if the button is depressed, or the checkbox is checked,
		//		or the radio button is selected, etc.
		toggled: false,
		_toggledSetter: function(value){
			if(value){
				this.set("value", this.toggledValue);
			}else{
				if(this.value){
					this.toggledValue = this.value;
				}
				this.set("value", "");
			}
		},
		
		// runningDisable: Boolean
		//		Disable the action while the action is running.  The running state only 
		//		occurs when a Deferred is returned from the command.
		runningDisable: false,
		
		// runningLabel: String
		//		What a bound widgets label should be when the Action is running (like 
		//		when waiting for a Deferred promise).
		runningLabel: "",
		
		// timeout: Integer
		//		Number of milliseconds the Action will wait for a promise to resolve, 
		//		cancel or error out. `null` means it is disabled.
		timeout: null,
		
		// category: String
		//		TODO: Add functionality for grouping of actions by category
		category: "",
		
		// enabled: Boolean
		//		Should this widget respond to user input?
		_enabled: true,
		_enabledGetter: function(){
			return this._enabled;
		},
		_enabledSetter: function(value){
			this._enabled = value;
		},
		
		// scope: Function
		//		The scope of which the `this` should be when run is invoked.  Defaults 
		//		to `null` which means `this` will be the Action itself.
		scope: null,
		
		// _running: Boolean
		//		A logic value that represents if the Action is currently running.  
		//		It is only true when the run return value is a promise.
		_running: false,
		_runningGetter: function(){
			return this._running;
		},
		_runningSetter: function(value){
			if(value){
				this._running = true;
				if(this.runningDisable){
					this._enabledState = this.get("enabled");
					this.set("enabled", false);
				}
				if(this.runningLabel){
					array.forEach(this._binds, function(widget){
						if("label" in widget && !("busyLabel" in widget)){
							if("showLabel" in widget){
								var showLabel = widget.get("showLabel");
							}
							this._setAttr(widget, "label", "runningLabel");
							if("showLabel" in widget){
								widget.set("showLabel", showLabel);
							}
						}else if(typeof widget.makeBusy === "function"){
							widget.makeBusy();
						}
					}, this);
				}
			}else{
				if(this.runningLabel){
					array.forEach(this._binds, function(widget){
						if("label" in widget && !("busyLabel" in widget)){
							if("showLabel" in widget){
								var showLabel = widget.get("showLabel");
							}
							this._setAttr(widget, "label", "label");
							if("showLabel" in widget){
								widget.set("showLabel", showLabel);
							}
						}else if(typeof widget.cancel === "function"){
							widget.cancel();
						}
					}, this);
				}
				if(this.runningDisable){
					this.set("enabled", this._enabledState);
				}
				this._running = false;
			}
		},
		
		// _run: Function
		//		Private attribute to hold a function that can define the 
		//		behaviour of the Action.  Typically though a command/Command is 
		//		used to encapsulate the behaviour.
		_run: null,
		_runGetter: function(){
			return this._run;
		},
		_runSetter: function(value){
			this._run = value;
		},
		
		// _command: Object
		//		The private attribute 
		_command: null,
		_commandGetter: function(){
			return this._command;
		},
		_commandSetter: function(value){
			this._command = value;
		},
		
		// _commandStack: Object
		//		The private attribute
		_commandStack: null,
		_commandStackGetter: function(){
			return this._commandStack;
		},
		_commandStackSetter: function(value){
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
			// summary:
			//		Handles setting up the action post construction
			
			if(!params && !(binds instanceof Array)){
				params = binds;
			}
			this._binds = [];
			this._runHandles = [];
			if(params){
				if ("binds" in params){
					binds = params.binds;
					delete params.binds;
				}
				this.set(params);
			}
			this._created = true;
			this.watch(this._watch);
			if(binds && params && (binds instanceof Array) && binds.length){
				this.bind(binds);
			}
		},
		
		markupFactory: function(params, node, ctor){
			// summary:
			//		Allows the dojo/parser to instantiate a declarative Action
			
			node.parentNode.removeChild(node);
			return new ctor(params);
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
					result = this._run.apply(this.scope || this, arguments);
				}else if(this._command && (typeof this._command.execute === "function")){
					if(this._commandStack){
						result = this._commandStack.execute.apply(this.scope || this._commandStack, [this._command].concat(Array.prototype.slice.call(arguments)));
					}else{
						result = this._command.execute.apply(this.scope || this._command, arguments);
					}
				}else{
					throw new Error("No suitable function found to run.");
				}
				if (result && typeof result.then === "function"){
					this.set("running", true);
					this.resetTimeout(this.timeout);
					var self = this;
					this._runReturn = result;
					this._runDeferred = result.then(function(data){
						self.set("running", false);
						self.toggle();
						self.emit("run", { args: arguments, data: data, deferred: true });
						return data;
					});
					return this._runDeferred;
				}else{
					this.toggle();
					this.emit("run", { args: arguments, data: result, deferred: false });
					return result;
				}
			}
		},
		
		cancel: function(/*String?*/ reason){
			// summary:
			//		Cancels any part of the Action that is inflight and sets Action's running state to false
			
			if(this._runReturn && (this._runReturn.fired == -1)){
				this._runReturn.cancel();
			}
			delete this._runReturn;
			this._runDeferred = null;
			this.set("running", false);
			this.emit("cancelled", { reason: reason });
		},
		
		resetTimeout: function(/*Int*/ timeout){
			// summary:
			//		Resets (or cancels) the timeout that will cancel the running state of the Action
			
			if(this._timeout){
				clearTimeout(this._timeout);
			}
			
			if(timeout){
				var self = this;
				this._timeout = setTimeout(function(){
					self.cancel("timeout");
				}, timeout);
			}else if(timeout === 0){
				this.cancel("timeout");
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
			label: ["label", "_label"],  // _label works around issue with dojox.form.BusyButton
			showLabel: "showLabel",
			iconClass: "iconClass",
			title: "title",
			tooltip: "tooltip",
			accelKey: "accelKey",
			value: "value",
			readOnly: "readOnly",
			toggled: "checked",
			runningLabel: "busyLabel",  // Used by dojox.form.BusyButton
			timeout: "timeout", // Used by dojox.form.BusyButton
			enabled: ["disabled", "enabled"]
		},
		
		_setAttr: function(/*Widget*/ widget, /*String*/ widgetAttr, /*String*/ attr){
			// summary:
			//		Logic for proagating from an Action to a widget.
			if(typeof widgetAttr === "string"){
				if(widgetAttr in widget){
					// TODO: Should we use direct assignment, avoiding events/watch?
					widget.set(widgetAttr, this.get(attr));
				}
			}else{
				array.forEach(widgetAttr, function(item){
					if(item in widget){
						if(item === "disabled" && attr === "enabled"){ //Handle one special setting
							widget.set(item, !this.get(attr));
						}else{
							widget.set(item, this.get(attr));
						}
					}
				}, this);
			}
		},
		
		_update: function(/*Widget*/ widget, /*String?*/ attr){
			// summary:
			//		Private function that updates a bound widget.
			// description:
			//		A private function that takes a widget and propagates the mapped attributes 
			//		from the Action to the widget.  If the optional `attr` is provided, it will 
			//		only map that attribute.
			
			if(!widget || !(typeof widget.set === "function")){
				// Either nothing passed or this isn't something we can deal with
				return;
			}else{
				var attrMap = this._attrMapping;
				if("showLabel" in widget){ // Saving showLabel because if we set label, it will reset showLabel
					// TODO this is hacky...
					var showLabel = widget.get("showLabel");
				}
				if(attr){ // Only a single attribute being set
					this._setAttr(widget, attrMap[attr], attr);
				}else{
					for(var attr in attrMap){ // The whole map is done.
						this._setAttr(widget, attrMap[attr], attr);
					}
				}
				if("showLabel" in widget){
					widget.set("showLabel", showLabel);
				}
			}
		},
		
		bind: function(/*String|Object*/ widget){
			// summary:
			//		Binds a widget to the Action.
			//
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
			if(widget.action && widget.action !== this){
				throw new Error("Widget already bound.");
			}
			if("action" in widget){
				widget.action = this;
			}
			this._binds.push(widget);
			var self = this;
			this._runHandles.push(on(widget, "click", function(e){
				self.run.call(self, e);
			}));
			this._update(widget);
			var handle = {
				unbind: function(){
					return self.unbind(widget);
				}
			}
			this.emit("bound", { action: this, widget: widget, handle: handle });
			return handle;
		},
		
		unbind: function(/*String|Object*/ widget){
			// summary:
			//		Unbinds a widget from an action.
			//
			// description:
			//		Takes a widget or string ID of a widget and unbinds it from the action.
			//		Unbinding only removes the "run" from being fired and the widget's other 
			//		attributes will be left configured as they were, but changes to the 
			//		action will no longer propagate to the widget.
			//
			// returns: Boolean
			//		`true` if sucessfully unbound or `false` if the widget could not be 
			//		found.
			
			if(typeof widget === "string"){
				widget = registry.byId(widget);
			}
			if(this.isBound(widget)){
				if(widget.action === this){
					widget.action = null;
				}
				var idx = array.indexOf(this._binds, widget);
				this._binds.splice(idx, 1);
				this._runHandles.splice(idx, 1)[0].remove();
				this.emit("unbound", { action: this, widget: widget });
				return true;
			}else{
				return false;
			}
		},
		
		isBound: function(/*Object*/ widget){
			// summary:
			//		Returns `true` if this action is bound to widget otherwise
			//		returns `false`.
			return ~array.indexOf(this._binds, widget);
		},
		
		_watch: function(attrName, oldValue, value){
			// summary:
			//		Called from ancestor Attributed when an attribute value is changed and then 
			//		propagates that change, if appropriate to any bound widgets.
			if(attrName in this._attrMapping){
				array.forEach(this._binds, function(widget){
					this._update(widget, attrName);
				}, this);
			}
		}		
		
	});

});