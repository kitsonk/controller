define([
		"dojo/_base/declare" // declare
], function(declare, win){
	return declare(null, {
		
		name: "compound",
		_commands: [],
		_args: {},
		
		constructor: function(args){
			this._commands = [];
			this._args: {};
		},
		
		add: function(command){
			
		},
		
		execute: function(args){
			
		},
		
		undo: function(){
			
		}
	});
});