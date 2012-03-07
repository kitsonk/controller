define([
		"dojo/_base/declare", // declare declare.safeMixin
		"dojo/_base/Deferred",
		"dojo/Evented"
], function(declare, Deferred, Evented){

// module:
//		dojo-controller/command/Command
// summary:
//		An object that allows abstraction and management of "command" 
//		type logic.

	return declare([Evented], {
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
		
		// undoable: [const] Boolean
		//		Returns true if the Command supports the undo function.  It is assumed 
		//		that the Command will be able to fully 
		undoable: false,
		
		// cancelable: Boolean
		//		Returns true if the Command can be cancelled and false if it cannot be.
		cancelable: false,

		constructor: function(/*Object?*/ args){
			declare.safeMixin(this, args);
			if (args.undo){
				this.undoable = true;
			}
		},
		
		execute: function(/*Object?*/ args){
			// summary:
			//		Executes the command.
			// tags:
			//		extension
			this.emit("execute", { args: args });
		},
		
		cancel: function(){
			// summary:
			//		Cancels any part of the command that is in-flight.
			
		},
		
		undo: function(){
			// summary:
			//		Undos whatever .execute did.
			// tags:
			//		extension
			this.emit("undo", {});
		}
	});
});