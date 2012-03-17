define(["doh", "../../command/Command", "../../command/CompoundCommand"],
function(doh, Command, CompoundCommand){

doh.register("tests.command.CompoundCommand",
	[
		function basic(t){
			var output = [];
			var command1 = new Command({
				execute: function(){
					output.push("command1 execute");
					return "foo";
				},
				undo: function(){
					output.push("command1 undo");
					return "baz";
				}
			});
			var command2 = new Command({
				execute: function(){
					output.push("command2 execute");
					return "bar";
				}
			});
			var compoundCommand1 = new CompoundCommand();
			compoundCommand1.add(command1);
			compoundCommand1.add(command2);
			var commandCount = compoundCommand1.get("count");
			var executeResults = compoundCommand1.execute();
			var undoResults = compoundCommand1.undo();
			t.is(commandCount, 2);
			t.is(executeResults, ["foo", "bar"]);
			t.is(undoResults, ["baz"]);
			t.is(output, ["command1 execute", "command2 execute", "command1 undo"]);
		}
	]
);

});