define([
		"dojo/_base/declare" // declare declare.safeMixin
], function(declare){

// module:
//		dojo-controller/command/Command
// summary:
//		An object that allows abstraction and management of "command" 
//		type logic.

	return declare(null, {
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
		
		isUndoable: true,

		constructor: function(/*Object?*/ args){
			declare.safeMixin(this, args);
		},
		
		execute: function(/*Object?*/ args){
			// summary:
			//		Executes the command.
			// tags:
			//		extension
		},
		
		cancel: function(){
			
		},
		
		undo: function(){
			// summary:
			//		Undos whatever .execute did.
			// tags:
			//		extension
		},
		
		onExecute: function(args){
			
		},
		
		onUndo: function(){
			
		}
	});
});