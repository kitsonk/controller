dojo.provide("dojo-controller.tests.Attributed");

var Attributed = dojo.require("dojo-controller.Attributed");

doh.register("tests.Attributed",
	[
		function basic(t){
			var AttrClass1 = dojo.declare([Attributed],{
				foo: "",
				bar: 0,
				baz: "",
				
				_setFoo: function(value){
					this.foo = value;
				},
				_getFoo: function(){
					return "bar";
				},
				
				_setBar: function(value){
					this.bar = value;
				}
			});
			
			var attr1 = new AttrClass1();
			attr1.set("foo", "nothing");
			attr1.set("bar", 2);
			attr1.set("baz", "bar");
			
			t.is(attr1.foo, "nothing");
			t.is(attr1.get("foo"), "bar");
			t.is(attr1.bar, 2);
			t.is(attr1.get("bar"), 2);
			t.is(attr1.get("baz"), "bar");
			t.is(attr1.baz, "bar");
		},
		function paramHandling(t){
			var AttrClass2 = dojo.declare([Attributed], {
				foo: null,
				bar: 5,
				
				_setFoo: function(value){
					this.foo = value;
				},
				_setBar: function(value){
					this.bar = value;
				}
			});
			
			var attr2 = new AttrClass2({
				foo: function() {
					return "baz";
				},
				bar: 4
			});
			
			t.is(typeof attr2.foo, "function");
			t.is(attr2.foo(), "baz");
			t.is(attr2.get("bar"), 4);
		},
		function hashSetting(t){
			var AttrClass3 = dojo.declare([Attributed], {
				foo: null,
				bar: 5,
				
				_setFoo: function(value){
					this.foo = value;
				},
				_setBar: function(value){
					this.bar = value;
				}
			});
			
			var attr3 = new AttrClass3();
			attr3.set({
				foo: function() {
					return "baz";
				},
				bar: 4
			});
			
			t.is(typeof attr3.foo, "function");
			t.is(attr3.foo(), "baz");
			t.is(attr3.get("bar"), 4);
		},
		function watchHandling(t){
			var output = [];
			var AttrClass4 = dojo.declare([Attributed],{
				foo: "old",
				bar: 0
			});
			
			var attr4 = new AttrClass4();
			var handle = attr4.watch("foo", function (property, oldValue, value){
				output.push(property);
				output.push(oldValue);
				output.push(value);
			});
			var handle2 = attr4.watch(function (property, oldValue, value){
				output.push(property);
				output.push(oldValue);
				output.push(value);
			});
			
			attr4.set("foo", "new");
			attr4.set("bar", 1);
			handle.unwatch();
			handle2.unwatch();
			attr4.set("foo", "again");
			
			t.is(output, ["foo", "old", "new", "foo", "old", "new", "bar", 0, 1]);
			t.is(attr4.get("foo"), "again");
		}
	]
);