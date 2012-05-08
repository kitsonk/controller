define([
		"dojo/_base/declare", // declare declare.safeMixin
		"dojo/Stateful",
		"dojo/Evented"
], function(declare, Stateful, Evented){

// module:
//		dojo-controller/command/Command
// summary:
//		An object that allows abstraction and management of "command" 
//		type logic.

	return declare([Stateful, Evented], {
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
		
		// name: String
		//		The name of the command.  Defaults to empty.
		name: "",
		
		// type: String
		//		A string the represents the type of command.
		type: "command",
		
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
			//		Executes the command.  Any arguments provided are passed to the 
			//		execute function.
			if (typeof this._execute === "function"){
				result = this._execute.apply(this._context || this, arguments);
				if (result && typeof result.then === "function"){
					var self = this;
					this._executeReturn = result;
					this._executeDeferred = result.then(function(data){
						self.emit("execute", { args: arguments, data: data, deferred: true });
						return data;
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
		_executeSetter: function(value){
			// summary:
			//		Set the execute function
			this._execute = value;
		},
		_executeGetter: function(){
			// summary:
			//		Get the execute function
			return this._execute;
		},
		
		undo: function(){
			// summary:
			//		Undos whatever .execute did.
			if (typeof this._undo === "function"){
				result = this._undo.apply(this._context || this, arguments);
				if (result && typeof result.then === "function"){
					var self = this;
					this._undoReturn = result;
					this._undoDeferred = result.then(function(data){
						self.emit("undo", { args: arguments, data: data, deferred: true });
						return data;
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
		_undoSetter: function(value){
			// summary:
			//		Set the undo function
			this._undo = value;
		},
		_undoGetter: function(){
			// summary:
			//		Get the undo function
			return this._undo;
		},
		
		_undoableGetter: function(){
			// summary:
			//		Customer getter for `undoable` attribute.
			return typeof this._undo === "function";
		},
		_undoableSetter: function(value){
			// summary:
			//		Customer setter for `undoable` attribute.
			console.warn("Command: undoable is a read-only attribute.");
		},
		
		cancel: function(){
			// summary:
			//		Cancels any part of the command that is in-flight.
			if (this._executeReturn && (this._executeReturn.fired == -1)){
				this._executeReturn.cancel();
			}
			delete this._executeReturn;
			this._executeDeferred = null;
			if (this._undoReturn && (this._undoReturn.fired == -1)){
				this._undoReturn.cancel();
			}
			delete this._undoReturn;
			this._undoDeferred = null;
		},
		
		destroy: function(){
			this.cancel();
			this.inherited(arguments);
		},
		
		_contextGetter: function(){
			return this._context;
		},
		_contextSetter: function(value){
			this._context = value;
		}
		
	});
});