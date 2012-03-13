dojo.provide("dojo-controller.tests.Attributed");

var Attributed = dojo.require("dojo-controller.Attributed"),
	has = dojo.require("dojo.has"),
	on = dojo.require("dojo.on"),
	sniff = dojo.require("dojo.sniff");

doh.register("tests.Attributed",
	[
		function basic(t){
			var AttrClass1 = dojo.declare([Attributed],{
				foo: "",
				bar: 0,
				baz: "",
				
				_set_foo: function(value){
					this.foo = value;
				},
				_get_foo: function(){
					return "bar";
				},
				
				_set_bar: function(value){
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
				
				_set_foo: function(value){
					this.foo = value;
				},
				_set_bar: function(value){
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
				
				_set_foo: function(value){
					this.foo = value;
				},
				_set_bar: function(value){
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
				bar: 0,
				
				_set_foo: function(value){
					this.foo = value;
				}
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
		},
		function globalAccessors(t){
			var output = [];
			var AttrClass5 = dojo.declare([Attributed],{
				foo: "",
				bar: 0,
				
				_setter: function(name, value){
					output.push(name);
					output.push(value);
					this[name] = value;
				},
				
				_getter: function(name){
					output.push(name);
					return this[name];
				},
				
				_set_bar: function(value){
					output.push(value);
					this.bar = value;
				},
				
				_get_bar: function(){
					return this.bar;
				}
			});
			
			var attr5 = new AttrClass5();
			attr5.set("foo", "baz");
			attr5.set("bar", 5);
			var result1 = attr5.get("foo");
			var result2 = attr5.get("bar");
			
			t.is(output, ["foo", "foo", "baz", 5, "foo"]);
			t.is(result1, "baz");
			t.is(result2, 5);
		},
		function eventFunctionality(t){
			var output = [];
			var AttrClass6 = dojo.declare([Attributed],{
				foo: "",
				bar: 0
			});
			
			var attr6 = new AttrClass6({
				foo: "bar",
				bar: 1
			});
			
			attr6.on("changed", function(e){
				output.push(e.attrName);
				output.push(e.prevValue);
				output.push(e.newValue);
			});
			attr6.on("changed-foo", function(e){
				output.push(e.prevValue);
				output.push(e.newValue);
			});
			attr6.set("foo", "baz");
			attr6.set("bar", 6);
			
			t.is(output, ["foo", "bar", "baz", "bar", "baz", "bar", 1, 6]);
		},
		function featureDetection(t){
			var hasDefineProperty = has("es5-defineproperty");
			if (has("ie") <= 8){
				t.is(hasDefineProperty, false);
			}else{
				t.is(hasDefineProperty, true);
			}
			var hasAccessors = has("accessors");
			if (has("ie") <= 8){
				t.is(hasAccessors, false);
			}else{
				t.is(hasAccessors, true);
			}
		}
	]
);