define([
		"dojo/_base/declare", // declare declare.safeMixin
		"dojo/_base/window", // win.withDoc
		"dojo/Stateful",
		"dojo/Evented"
], function(declare, win, Stateful, Evented){
	return declare([Stateful, Evented], {
		
		// _undoStack: Array
		//		Private array used for storing commands that can be undone.
		_undoStack: [],
		
		// _redoStack: Array
		//		Private array used for storing commands that can be redone.
		_redoStack: [],
		
		// _context: Object
		//		Used to store the context that was passed during construction.
		
		// canUndo: Boolean
		//		Returns if there are commands that can be undone.
		
		// canRedo: Boolean
		//		Returns if there are commands that can be redone.
		
		// undoCount: Number
		//		The count of commands that can be undone.
		
		// redoCount: Number
		//		The count of commands that can be redone.
		
		// name: String
		//		The name of the command.  Defaults to empty.
		name: "",
		
		postscript: function(/*Object?*/ context, /*Object?*/ params){
			if (context && !params){
				params = context;
			}else{
				this._context = context;
			}
			this._undoStack = [];
			this._redoStack = [];
			this.inherited(arguments);
		},
		
		execute: function(command){
			// summary:
			//		Executes the passed command and then pushes it onto the undo stack if it 
			//		is undoable and clears the redo stack.
			if (!command){
				return;
			}
			
			if (this._context){
				var result = win.withDoc(this._context.getDocument(), "execute", command, [ this._context ].concat(Array.prototype.slice.call(arguments, 1)));
			}else{
				var result = command.execute.apply(command, Array.prototype.slice.call(arguments, 1));
			}
			if (command.get("undoable")){
				this._undoStack.push(command);
			}
			this._redoStack = [];
			
			if (result && typeof result.then === "function"){
				var self = this;
				return result.then(function(data){
					self.emit("execute", { args: arguments, command: command, data: data, deferred: true });
					return data;
				});
			}else{
				this.emit("execute", { args: arguments, command: command, data: result, deferred: false });
				return result;
			}
		},
		
		undo: function(){
			// summary:
			//		Removes a command from the stack and then executes the undo method and pushes it 
			//		onto the redo stack.
			if (!this.get("canUndo")){
				return;
			}
			
			var command = this._undoStack.pop();
			if (command._runDelegate){
				command._runDelegate.undoDelegate(command);
			}else{
				if (this._context){
					var result = win.withDoc(this._context.getDocument(), "undo", command, [ this._context ].concat(Array.prototype.slice.call(arguments)));
				}else{
					var result = command.undo.apply(command, Array.prototype.slice.call(arguments));
				}
			}
			this._redoStack.push(command);
			
			if (result && typeof result.then === "function"){
				var self = this;
				return result.then(function(data){
					self.emit("undo", { args: arguments, command: command, data: data, deferred: true });
					return data;
				});
			}else{
				this.emit("undo", { args: arguments, command: command, data: result, deferred: false });
				return result;
			}
		},
		
		redo: function(){
			// summary:
			//		Removes a command from the redo stack and then executes it and pushes it onto the
			//		undo stack.
			if (!this.get("canRedo")){
				return;
			}
			
			var command = this._redoStack.pop();
			if (command._runDelegate){
				command._runDelegate.redoDelegate(command);
			}else{
				if (this._context){
					var result = win.withDoc(this._context.getDocument(), "execute", command, [ this._context ].concat(Array.prototype.slice.call(arguments)));
				}else{
					var result = command.execute.apply(command, Array.prototype.slice.call(arguments));
				}
			}
			this._undoStack.push(command);
			
			if (result && typeof result.then === "function"){
				var self = this;
				return result.then(function(data){
					self.emit("execute", { args: arguments, command: command, data: data, deferred: true });
					return data;
				});
			}else{
				this.emit("execute", { args: arguments, command: command, data: result, deferred: false });
				return result;
			}
		},
		
		_canUndoGetter: function(){
			// summary:
			//		Attribute getter for canUndo
			return (this._undoStack.length > 0);
		},
		_canUndoSetter: function(value){
			// summary:
			//		Attribute setter for canUndo
			console.warn("CommandStack: canUndo is a read-only attribute");
		},
		
		_canRedoGetter: function(){
			// summary:
			//		Attribute getter for canRedo
			return (this._redoStack.length > 0);
		},
		_canRedoSetter: function(){
			// summary:
			//		Attribute setter for canRedo
			console.warn("CommandStack: canRedo is a read-only attribute");
		},
		
		_undoCountGetter: function(){
			// summary:
			//		Attribute getter for undoCount
			return this._undoStack.length;
		},
		_undoCountSetter: function(){
			// summary:
			//		Attribute setter for undoCount
			console.warn("CommandStack: undoCount is a read-only attribute");
		},
		
		_redoCountGetter: function(){
			// summary:
			//		Attribute getter for redoCount
			return this._redoStack.length;
		},
		
		cancel: function(){
			// summary:
			//		Cancels any of the commands that are in flight.
		},
		
		clear: function(){
			// summary:
			//		Clear the undo and redo stacks.
			this._undoStack = [];
			this._redoStack = [];
		},
		
		jump: function(point, silent){
			// summary:
			//		Jump to a particular point in the stack.
			//	point: Number
			//		The particular point in the stack to number to.
			//	silent: Boolean
			//		If the commands should actually be undone or redone.  True if they 
			//		should be or false if they should just be moved in the stack without 
			//		being executed.
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
		}
	});
});