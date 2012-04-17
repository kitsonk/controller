define(["doh", "dojo/_base/declare", "dojo/has", "dojo/sniff", "../Attributed"],
function(doh, declare, has, sniff, Attributed){

doh.register("tests.Attributed",
	[
		function basic(t){
			var AttrClass1 = declare([Attributed],{
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
			
			t.is(attr1.foo, "nothing", "attribute set properly");
			t.is(attr1.get("foo"), "bar", "getter working properly");
			t.is(attr1.bar, 2, "attribute set properly");
			t.is(attr1.get("bar"), 2, "getter working properly");
			t.is(attr1.get("baz"), "bar", "getter working properly");
			t.is(attr1.baz, "bar", "properly set properly");
		},
		function paramHandling(t){
			var AttrClass2 = declare([Attributed], {
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
			
			t.is(typeof attr2.foo, "function", "function attribute set");
			t.is(attr2.foo(), "baz", "function has proper return value");
			t.is(attr2.get("bar"), 4, "attribute has proper value");
		},
		function hashSetting(t){
			var AttrClass3 = declare([Attributed], {
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
			
			t.is(typeof attr3.foo, "function", "function attribute set");
			t.is(attr3.foo(), "baz", "function has proper return value");
			t.is(attr3.get("bar"), 4, "attribute has proper value");
		},
		function watchHandling(t){
			var output = [];
			var AttrClass4 = declare([Attributed],{
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
			
			t.is(output, ["foo", "old", "new", "foo", "old", "new", "bar", 0, 1], "output matches expectations");
			t.is(attr4.get("foo"), "again", "attribute has correct value");
		},
		function globalAccessors(t){
			var output = [];
			var AttrClass5 = declare([Attributed],{
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
			
			t.is(output, ["foo", "foo", "baz", 5, "foo"], "output matches expectations");
			t.is(result1, "baz", "attribute has correct value");
			t.is(result2, 5, "attribute has correct value");
		},
		function eventFunctionality(t){
			var output = [];
			var AttrClass6 = declare([Attributed],{
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
		function legacyAccessors(t){
			var output = [];
			var AttrClass7 = declare([Attributed],{
				foo: "",
				bar: 0,
				_setFooAttr: function(value){
					output.push(value);
					this.foo = value;
				},
				_setBarAttr: function(value){
					output.push(value);
					this.bar = value;
				},
				_getFooAttr: function(){
					output.push("_getFooAttr");
					return this.foo;
				},
				_getBarAttr: function(){
					output.push("_getBarAttr");
					return this.bar;
				}
			});
			
			var attr7 = new AttrClass7();
			attr7.watch("foo", function(){
				output.push("watch.foo");
			});
			attr7.watch("bar", function(){
				output.push("watch.bar");
			});
			attr7.on("changed", function(){
				output.push("changed");
			});
			
			attr7.set("foo", "baz");
			attr7.set("bar", 1);
			
			t.is(attr7.get("foo"), "baz", "attribute set");
			t.is(attr7.get("bar"), 1, "attribute set");
			t.is(output, ["_getFooAttr", "baz", "watch.foo", "changed", "_getBarAttr", 1, "watch.bar", "changed", "_getFooAttr", "_getBarAttr"], "results match expectations");
		},
		function featureDetection(t){
			var hasDefineProperty = has("es5-defineproperty");
			if (has("ie") <= 8){
				t.is(hasDefineProperty, false, "has defined properly");
			}else{
				t.is(hasDefineProperty, true, "has defined properly");
			}
			var hasAccessors = has("accessors");
			if (has("ie") <= 8){
				t.is(hasAccessors, false, "has defined properly");
			}else{
				t.is(hasAccessors, true, "has defined properly");
			}
		}
	]
);
});