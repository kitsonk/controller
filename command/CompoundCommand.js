define([
		"dojo/_base/declare", // declare
		"dojo/_base/array", // array.forEach
		"dojo/Stateful",
		"dojo/Evented"
], function(declare, array, Stateful, Evented){

// module:
//		dojo-controller/command/CompoundCommand
// summary:
//		An object that allows the combination of several 
//		commands into a single command.

	return declare([Stateful, Evented], {
		
		name: "",
		type: "compound",
		_commands: [],
		_context: null,
		
		postscript: function(params){
			this._commands = [];
			this.inherited(arguments);
		},
		
		add: function(command){
			if(!command){
				return;
			}
			
			if(command._commands && command._commands.length){
				array.forEach(command._commands, function(cmd){
					this.add(cmd);
				}, this);
			}else{
				this._commands.push(command);
				this.emit("add", { command: command });
			}
		},
		
		execute: function(){
			if(!this._commands.length){
				return;
			}
			
			var results = [];
			array.forEach(this._commands, function(command){
				results.push(command.execute.apply(command, arguments));
			}, this);
			return results;
		},
		
		undo: function(){
			if(!this._commands.length){
				return;
			}
			var results = [];
			for(var i = this._commands.length - 1; i >= 0; i--){
				if(this._commands[i].get("undoable")){
					results.push(this._commands[i].undo.apply(this._commands[i], arguments));
				}
			}
			return results;
		},
		
		_countGetter: function(){
			return this._commands.length;
		},
		_countSetter: function(value){
			console.warn("CompoundCommand: count is a read-only attribute.");
		},
		
		_contextGetter: function(){
			return this._context;
		},
		_contextSetter: function(value){
			this._context = value;
			for(var i = 0; i < this._commands.length; i++){
				this._commands[i].set("context", this._context);
			}
		}
		
	});
});