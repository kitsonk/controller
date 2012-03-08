define([
		"dojo/_base/declare", // declare declare.safeMixin
		"dojo/_base/Deferred",
		"../Attributed"
], function(declare, Deferred, Attributed){

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
		
		// _execute: Function
		//		Private function where the Command's execute function is actually stored
		_execute: null,
		
		// _undo: Function
		//		Private function where the Command's execute function is actually stored
		_undo: null,
		
		// undoable: [const] Boolean
		//		Returns true if the Command supports the undo function.  It is assumed 
		//		that the Command will be able to fully 
		undoable: false,
		
		// cancelable: Boolean
		//		Returns true if the Command can be cancelled and false if it cannot be.
		cancelable: false,

		execute: function(/*Object?*/ args){
			// summary:
			//		Executes the command.
			if (typeof this._execute === "function"){
				this._execute(args);
			}
			this.emit("execute", { args: args });
		},
		_setExecute: function(value){
			// summary:
			//		Set the execute function
			this._execute = value;
		},
		_getExecute: function(){
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
				result = this._undo();
			}
			this.emit("undo", {});
			return result;
		},
		_setUndo: function(value){
			// summary:
			//		Set the undo function
			this.undoable = value ? true : false;
			this._undo = value;
		},
		_getUndo: function(){
			// summary:
			//		Get the undo function
			return this._undo;
		}
		
	});
});