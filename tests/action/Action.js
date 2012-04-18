define(["doh", "dojo/Deferred", "../../action/Action", "../../command/Command", "../../command/CommandStack"],
function(doh, Deferred, Action, Command, CommandStack){

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
		},
		function runningSupport(t){
			var td = new doh.Deferred();
			var output = [];
			var action5 = new Action({
				run: function(){
					var deferred = new Deferred();
					setTimeout(function(){ 
						deferred.resolve({ called: true });
					}, 50);
					return deferred;
				}
			});
			action5.watch("running", function(property, oldValue, newValue){
				output = output.concat([property, oldValue, newValue]);
			});
			action5.on("run", function(e){
				output.push(e);
			});
			action5.run().then(function(result){
				output.push(result);
				t.is(output, ["running", false, true, "running", true, false, 
					{ args: [{ called: true }], data: { called: true }, deferred: true }, 
					{ called: true }], "output matches expectations");
				td.callback(true);
			}, function(err){
				console.error(err);
			});
			return td;
		},
		function timeoutSupport(t){
			var td = new doh.Deferred();
			var output = [];
			var action5 = new Action({
				timeout: 50,
				run: function(){
					var deferred = new Deferred();
					setTimeout(function(){
						output.push("called");
					}, 100);
					return deferred;
				}
			});
			action5.on("run", function(e){
				output.push(e);
			});
			action5.on("cancelled", function(e){
				output.push(e);
				t.is(output, [{ reason: "timeout" }], "output matches expectations");
				td.callback(true);
			});
			action5.run().then(function(result){
				output.push(result);
			}, function(err){
				output.push(err);
			});
			return td;
		}
	]
);

if(doh.isBrowser){
	doh.register("tests.action.Action_html", require.toUrl("../../dojo-controller/tests/action/Action.html"));
}

});