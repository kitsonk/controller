define([
		"dojo/_base/declare", // declare declare.safeMixin
		"../Attributed"
], function(declare, Attributed){

	return declare([Attributed], {
		
		label: "",
		iconClass: "",
		category: "",
		value: "",
		toggled: false,
		hint: "",
		_run: null,
		_command: null,
		_enabled: true,
		_links: [],
		_commandStack: null,
		
		postscript: function(links, params){
			if(!params && !(links instanceof Array)){
				params = links;
			}
			if(links && (links instanceof Array) && links.length){
				//Widgets to link to
			}
			if(params){ this.set(params); }
		},
		
		run: function(){
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
			this.set("toggled", !this.get("toggled"));
			return this.get("toggled");
		},
		
		link: function(widget){
			
		},
		
		unlink: function(widget){
			
		},
		
		_get_command: function(){
			return this._command;
		},
		
		_set_command: function(value){
			this._command = value;
		},
		
		_get_commandStack: function(){
			return this._commandStack;
		},
		
		_set_commandStack: function(value){
			this._commandStack = value;
		},
		
		_get_enabled: function(){
			return this._enabled;
		},
		
		_set_enabled: function(value){
			this._enabled = value;
		},
		
		_get_run: function(){
			return this._run;
		},
		
		_set_run: function(value){
			this._run = value;
		}
	});

});