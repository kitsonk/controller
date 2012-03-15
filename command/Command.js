define([
		"dojo/_base/declare", // declare declare.safeMixin
		"dojo/Evented",
		"../Attributed"
], function(declare, Evented, Attributed){

// module:
//		dojo-controller/command/Command
// summary:
//		An object that allows abstraction and management of "command" 
//		type logic.

	return declare([Attributed], {
		// summary:
		//		An object that allows abstraction and management of "command" 
		//		type logic.
		//
		// description:
		//
		// example:
		//	| require(["dojo-command/command/Command"], function(Command){
		//	| 	var myCommand = new Command({
		//	|		execute: function(args){
		//	|			console.log("executed!");
		//	|		}
		//	|	});
		//	| });
		
		// _executeDeferred: Deferred
		//		Used for storing internally any Deferred used to operate the execute 
		//		thread.
		_executeDeferred: null,
		
		// _undoDeferred: Deferred
		//		Used for storing internally any Deferred used to operate the undo
		//		thread.
		_undoDeferred: null,
		
		// _execute: Function
		//		Private function where the Command's execute function is actually stored
		_execute: null,
		
		// _undo: Function
		//		Private function where the Command's execute function is actually stored
		_undo: null,
		
		// undoable: [const] Boolean
		//		Returns true if the Command supports the undo function.  It is assumed 
		//		that the Command will be able to fully 
		
		// cancelable: Boolean
		//		Returns true if the Command can be cancelled and false if it cannot be.
		cancelable: false,

		execute: function(){
			// summary:
			//		Executes the command.
			if (typeof this._execute === "function"){
				result = this._execute.apply(this, arguments);
				if (result && typeof result.then === "function"){
					var self = this;
					this._executeDeferred = result.then(function(data){
						self.emit("execute", { args: arguments, data: data, deferred: true });
					});
					return this._executeDeferred;
				}else{
					this.emit("execute", { args: arguments, data: result, deferred: false });
					return result;
				}
			}else{
				console.warn("Command: .execute() not set but called.");
			}
		},
		_set_execute: function(value){
			// summary:
			//		Set the execute function
			this._execute = value;
		},
		_get_execute: function(){
			// summary:
			//		Get the execute function
			return this._execute;
		},
		
		cancel: function(){
			// summary:
			//		Cancels any part of the command that is in-flight.
			
		},
		
		undo: function(){
			// summary:
			//		Undos whatever .execute did.
			if (typeof this._undo === "function"){
				result = this._undo.apply(this, arguments);
				if (result && typeof result.then === "function"){
					var self = this;
					this._undoDeferred = result.then(function(data){
						self.emit("undo", { args: arguments, data: data, deferred: true });
					});
					return this._undoDeferred;
				}else{
					this.emit("undo", { args: arguments, data: result, deferred: false });
					return result;
				}
			}else{
				console.warn("Command: .undo() not set but called.");
			}
		},
		_set_undo: function(value){
			// summary:
			//		Set the undo function
			this._undo = value;
		},
		_get_undo: function(){
			// summary:
			//		Get the undo function
			return this._undo;
		},
		
		_get_undoable: function(){
			return typeof this._undo === "function";
		},
		
		_set_undoable: function(value){
			console.warn("Command: undoable is a read-only property.");
		}
		
	});
});