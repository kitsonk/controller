define([
		"dojo/_base/declare", // declare
		"dojo/_base/array", // array.forEach
		"../Attributed"
], function(declare, array, Attributed){

// module:
//		dojo-controller/command/CompoundCommand
// summary:
//		An object that allows the combination of several 
//		commands into a single command.

	return declare([Attributed], {
		
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
		
		_get_count: function(){
			return this._commands.length;
		},
		
		_set_count: function(value){
			console.warn("CompoundCommand: count is a read-only attribute.");
		},
		
		_get_context: function(){
			return this._context;
		},
		
		_set_context: function(value){
			this._context = value;
			for(var i = 0; i < this._commands.length; i++){
				this._commands[i].set("context", this._context);
			}
		}
		
	});
});