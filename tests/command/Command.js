define(["doh", "dojo/Deferred", "dojo/has", "dojo/sniff", "../../command/Command"],
function(doh, Deferred, has, sniff, Command){

var delay = function(ms) {
	var d = new Deferred();
	ms = ms || 20;
	if(this.setTimeout){
		setTimeout(function(){
			d.progress(0.5);
		},ms/2);
		setTimeout(function(){
			d.resolve();
		},ms);
	}else{
		d.progress(0.5);
		d.resolve();
	}
	return d.promise;
};

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
			t.is(command1.get("undoable"), false);
			t.is(command2.get("undoable"), true);
		},
		function eventHandling(t){
			var output = [];
			var command1 = new Command({
				execute: function() {
					output.push(1);
				},
				undo: function() {
					output.push(2);
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
		},
		function executeArguments(t){
			var output = [];
			var command1 = new Command({
				execute: function(){
					output.concat(arguments);
				}
			});
			
			command1.execute("foo", "bar", "baz");
			
			t.is(output, "foo", "bar", "baz");
		},
		function executeDeferred(t){
			var td = new doh.Deferred;
			var command1 = new Command({
				execute: delay
			});
			command1.on("execute", function(e){
				t.assertEqual(e.deferred, true);
			});
			command1.execute().then(function(){
				td.callback(true);
			});
			return td;
		},
		function executeDeferredCancel(t){
			var td = new doh.Deferred;
			var command1 = new Command({
				execute: delay
			});
			command1.execute().then(function(data){
				td.callback(true);
			});
			command1.cancel();
			return td;
		}
	]
);
});