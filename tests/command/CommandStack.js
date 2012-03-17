define(["doh", "../../command/Command", "../../command/CommandStack"],
function(doh, Command, CommandStack){

doh.register("tests.command.CommandStack",
	[
		function basic(t){
			var output = [];
			var commandStack1 = new CommandStack({
				name: "commandStack1"
			});
			var command1 = new Command({
				execute: function(){
					output = output.concat(Array.prototype.slice.call(arguments));
					return "baz";
				},
				undo: function(){
					output.push("undo command1");
				}
			});
			var command2 = new Command({
				execute: function(){
					output = output.concat(Array.prototype.slice.call(arguments));
					return "qux";
				},
				undo: function(){
					output.push("undo command2");
				}
			});
			t.is(commandStack1.get("canUndo"), false);
			t.is(commandStack1.get("canRedo"), false);
			t.is(commandStack1.get("undoCount"), 0);
			t.is(commandStack1.get("redoCount"), 0);
			var result1 = commandStack1.execute(command1, "foo", "bar");
			var result2 = commandStack1.execute(command2, "quux", "corge");
			t.is(result1, "baz");
			t.is(result2, "qux");
			t.is(commandStack1.get("canUndo"), true);
			t.is(commandStack1.get("canRedo"), false);
			t.is(commandStack1.get("undoCount"), 2);
			t.is(commandStack1.get("redoCount"), 0);
			commandStack1.undo();
			t.is(commandStack1.get("canUndo"), true);
			t.is(commandStack1.get("canRedo"), true);
			t.is(commandStack1.get("undoCount"), 1);
			t.is(commandStack1.get("redoCount"), 1);
			commandStack1.undo();
			t.is(commandStack1.get("canUndo"), false);
			t.is(commandStack1.get("canRedo"), true);
			t.is(commandStack1.get("undoCount"), 0);
			t.is(commandStack1.get("redoCount"), 2);
			commandStack1.redo("redo");
			t.is(commandStack1.get("canUndo"), true);
			t.is(commandStack1.get("canRedo"), true);
			t.is(commandStack1.get("undoCount"), 1);
			t.is(commandStack1.get("redoCount"), 1);
			commandStack1.redo("redo again");
			t.is(commandStack1.get("canUndo"), true);
			t.is(commandStack1.get("canRedo"), false);
			t.is(commandStack1.get("undoCount"), 2);
			t.is(commandStack1.get("redoCount"), 0);
			t.is(commandStack1.get("name"), "commandStack1");
			t.is(output, ["foo", "bar", "quux", "corge", "undo command2", "undo command1", "redo", "redo again"]);
		},
		function eventHandling(t){
			var output = [];
			var commandStack1 = new CommandStack();
			commandStack1.on("execute", function(e){
				output.push("execute");
				output.push(e.command.get("name"));
				t.is(e.deferred, false);
			});
			commandStack1.on("undo", function(e){
				output.push("undo");
				output.push(e.command.get("name"));
				t.is(e.deferred, false);
			});
			var command1 = new Command({
				name: "command1",
				execute: function(){
					return "baz";
				},
				undo: function(){
					return "foo";
				}
			});
			var command2 = new Command({
				name: "command2",
				execute: function(){
					return "qux";
				},
				undo: function(){
					return "bar";
				}
			});
			t.is(commandStack1.execute(command1), "baz");
			t.is(commandStack1.execute(command2), "qux");
			t.is(commandStack1.undo(), "bar");
			t.is(commandStack1.undo(), "foo");
			t.is(commandStack1.redo(), "baz");
			t.is(commandStack1.redo(), "qux");
			t.is(output, ["execute", "command1", "execute", "command2", "undo", "command2", 
				"undo", "command1", "execute", "command1", "execute", "command2"]);
		}
	]
);

});