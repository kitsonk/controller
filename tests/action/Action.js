define(["doh", "../../action/Action", "../../command/Command", "../../command/CommandStack"],
function(doh, Action, Command, CommandStack){

doh.register("tests.action.Action",
	[
		function basic(t){
			var output = [];
			var action1 = new Action();
			action1.set("run", function(){
				output = output.concat(Array.prototype.slice.call(arguments));
				return "foo";
			});
			var result = action1.run("bar", "baz");
			t.is(result, "foo");
			t.is(output, ["bar", "baz"]);
		},
		function scoping(t){
			var output = [];
			var action = new Action({
				run: function(){
					output.push(this.testValue);
				},
				scope: { testValue: "foo" }
			});
			action.run();
			t.is(output, ["foo"]);
		},
		function commandSupport(t){
			var output = [];
			var action2 = new Action({
				command: new Command({
					execute: function(){
						output = output.concat(Array.prototype.slice.call(arguments));
						return "foo";
					}
				})
			});
			var result = action2.run("bar", "baz");
			t.is(result, "foo");
			t.is(output, ["bar", "baz"]);
		},
		function commandStackSupport(t){
			var output = [];
			var commandStack1 = new CommandStack();
			var command1 = new Command({
				execute: function(){
					output = output.concat(Array.prototype.slice.call(arguments));
					return "foo";
				},
				undo: function(){
					return "foo";
				}
			});
			var command2 = new Command({
				execute: function(){
					output = output.concat(Array.prototype.slice.call(arguments));
					return "bar";
				},
				undo: function(){
					return "bar";
				}
			})
			var action3 = new Action({
				command: command1,
				commandStack: commandStack1
			});
			var action4 = new Action({
				command: command2,
				commandStack: commandStack1
			});
			var result1 = action3.run("baz");
			var result2 = action4.run("qux");
			t.is(result1, "foo");
			t.is(result2, "bar");
			t.is(commandStack1.get("undoCount"), 2);
			t.is(output, ["baz", "qux"]);
		}
	]
);

if(doh.isBrowser){
	doh.register("tests.action.Action_html", require.toUrl("../../dojo-controller/tests/action/Action.html"));
}

});