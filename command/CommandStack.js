define([
		"dojo/_base/declare", // declare declare.safeMixin
		"dojo/_base/window" // win.withDoc
], function(declare, win){
	return declare(null, {
		
		constructor: function(context){
			this._context = context;
			this._undoStack = [];
			this._redoStack = [];
		},
		
		execute: function(command){
			if (!command){
				return;
			}
			
			if (this._context){
				win.withDoc(this._context.getDocument(), "execute", command, [ this._context ]);
			}else{
				command.execute();
			}
			this._undoStack.push(command);
			this._redoStack = [];
			
			this.onExecute(command, "execute");
		},
		
		undo: function(){
			if (!this.canUndo()){
				return;
			}
			
			var command = this._undoStack.pop();
			if (command._runDelegate){
				command._runDelegate.undoDelegate(command);
			}else{
				if (this._context){
					win.withDoc(this._context.getDocument(), "undo", command);
				}else{
					command.undo();
				}
			}
			this._redoStack.push(command);
			
			this.onExecute(command, "undo");
		},
		
		redo: function(){
			if (!this.canRedo()){
				return;
			}
			
			var command = this._redoStack.pop();
			if (command._runDelegate){
				command._runDelegate.redoDelegate(command);
			}else{
				if (this._context){
					win.withDoc(this._context.getDocument(), "execute", command);
				}else{
					command.execute();
				}
			}
			this._undoStack.push(command);
			
			this.onExecute(command, "redo");
		},
		
		canUndo: function(){
			return (this._undoStack.length > 0);
		},
		
		canRedo: function(){
			return (this._redoStack.length > 0);
		},
		
		getUndoCount: function(){
			return this._undoStack.length;
		},
		
		getRedoCount: function(){
			return this._redoStack.length;
		},
		
		clear: function(){
			this._undoStack = [];
			this._redoStack = [];
		},
		
		jump: function(point, silent){
			var undoCount = this.getUndoCount(),
				redoCount = this.getRedoCount();
			if (point == undoCount){
				return point; // nothing to do
			}
			if (point < 0 || point > undoCount + redoCount){
				return -1; // invalid point
			}
			
			var n = point - undoCount;
			if (n < 0){
				while (n < 0){
					if (silent){
						this._redoStack.push(this._undoStack.pop());
					}else{
						this.undo();
					}
					n++;
				}
			}else{
				while (n > 0){
					if (silent){
						this._undoStack.push(this._redoStack.pop());
					}else{
						this.redo();
					}
					n--;
				}
			}
		},
		
		onExecute: function(command, reason){
			
		},
		
		undoDelegate: function(command){
			
		},
		
		redoDelegate: function(command){
			
		}
	});
});