dojo.provide("dojo-controller.tests.command.Command");

var Command = dojo.require("dojo-controller.command.Command");
doh.register("tests.command.Command",
	[
		function basic(t){
			var order = [];
			var command1 = new Command({
				execute: function() {
					order.push(0);
				}
			});
			command1.execute();
			
			var command2 = new Command({
				execute: function() {
					order.push(1);
				},
				undo: function() {
					return order.pop();
				}
			});
			command2.execute();
			command2.undo();
			
			t.is(order, [0]);
			t.is(command1.undoable, false);
			t.is(command2.undoable, true);
		},
		function eventHandling(t){
			var output = [];
			var command1 = new Command({
				execute: function() {
					output.push(1);
					this.inherited(arguments);
				},
				undo: function() {
					output.push(2);
					this.inherited(arguments);
				}
			});
			command1.on("execute", function(){
				output.push(3);
			});
			command1.on("undo", function(){
				output.push(4);
			});
			
			command1.execute();
			command1.undo();
			
			t.is(output, [1, 3, 2, 4]);
		}
	]
);