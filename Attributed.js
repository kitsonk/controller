define([
		"dojo/_base/declare", // declare
		"dojo/has", // has.add
		"dojo/Evented",
		"dojo/Stateful"
], function (declare, has, Evented, Stateful){

// module:
//		dojo-controller/Attributed
// summary:
//		A class that builds upon dojo/Stateful and dojo/Evented by adding on 
//		auto-magic getters and setters functionality as well as emitting events
//		when attributes change their value.

	// Feature detection of fully compliant ES5 defineProperty, IE8's defineProperty is not 
	// es5 compliant.
	has.add("es5-defineproperty", function(){
		if (typeof Object.defineProperty === "function"){
			try{
				// IE8 will throw
				Object.defineProperty({}, 'x', {});
				return true;
			}catch(e){
				return false;
			}
		} else {
			return false;
		}
	});

	// Feature detection of non-standard __defineGetter__ and __defineSetter__
	has.add("accessors", function(){
		return "__defineGetter__" in Object.prototype;
	});

	return declare([Stateful, Evented], {
		// summary:
		//		A class that builds upon dojo/Stateful and dojo/Evented by adding on 
		//		auto-magic getters and setters functionality.
		//
		// description:
		//		A class that provides the functionality to auto-magically manage getters
		//		and setters for object attributes/properties, as well as provides 
		//		dojo/Stateful watch functionality and dojo/Evented emit/on functionality 
		//		for the attributes/properties.
		//		
		//		Getters and Setters should follow the format of _get_xxx or _set_xxx where 
		//		the xxx is a name of the attribute to handle.  So an attribute of "foo" 
		//		would have a custom getter of _get_foo and a custom setter of _set_foo.
		//
		//		Global accessors that are supported, which are _getter and _setter and 
		//		will be called if defined versus reverting to directly accessing the 
		//		attribute/property.
		
		// _attrPairNames: Hash
		//		Used across all instances a hash to cache attribute names and their getter 
		//		and setter names.
		_attrPairNames: {},
		
		_getAttrNames: function(name){
			// summary:
			//		Helper function for get() and set().
			//		Caches attribute name values so we don't do the string ops every time.
			// tags:
			//		private

			var apn = this._attrPairNames;
			if(apn[name]){ return apn[name]; }
			var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function(c){ return c.charAt(c.length-1).toUpperCase(); });
			return (apn[name] = {
				s: "_set_" + name,
				g: "_get_" + name,
				so: "_set" + uc + "Attr",	// converts dashes to camel case, ex: accept-charset --> _setAcceptCharset
				go: "_get" + uc + "Attr"
			});
		},
		
		postscript: function(/*Object?*/ params){
			// Automatic setting of params during construction
			if (params){ this.set(params); }
			
			// Flag to ensure that changes aren't emitted or watched during initialisation
			this._created = true;
		},
		
		_get: function(name, names){
			// summary:
			//		Private function that does a get based off a hash of names
			//	names:
			//		Hash of names of custom attributes
			return typeof this[names.g] === "function" ? this[names.g]() 
				: typeof this[names.go] === "function" ? this[names.go]() // TODO: Remove in 2.0
				: typeof this._getter === "function" ? this._getter(name) : this[name];
		},
		
		get: function(name){
			// summary:
			//		Get a property from an object.
			//
			//	name:
			//		The property to get.
			//
			// description:
			//		Get a named property from an object. The property may
			//		potentially be retrieved via a getter method. If no getter is defined, this
			//		just retrieves the object's property.
			//
			//		For example, if the widget has properties `foo` and `bar`
			//		and a method named `_get_foo()`, calling:
			//		`myObject.get("foo")` would be equivalent to calling
			//		`myObject._get_foo()` and `myObject.get("bar")`
			//		would be equivalent to the expression
			//		`myObject.bar`
			// returns:
			//		The value of the property.
			
			return this._get(name, this._getAttrNames(name));
		},

		set: function(name, value){
			// summary:
			//		Set a property on a widget
			//
			//	name: String|Object
			//		The property to set or an object that is a hash of properties and values.
			//
			//	value: Mixed
			//		The value to set in the property.
			//
			// description:
			//		Sets named properties on a object which may potentially be handled by a
			//		setter in the widget.
			//
			//		For example, if the object has properties `foo` and `bar`
			//		and a method named `_set_foo()`, calling
			//		`myObject.set("foo", "Howdy!")` would be equivalent to calling
			//		`obj._set_foo("Howdy!")` and `myObject.set("bar", 3)`
			//		would be equivalent to the statement `obj.bar = 3;` except that there 
			//		is no way of emitting events or triggering watches when the value is 
			//		set directly.
			//
			//		set() may also be called with a hash of name/value pairs, ex:
			//
			//	|	obj.set({
			//	|		foo: "Howdy",
			//	|		bar: 3
			//	|	});
			//
			//	This is equivalent to calling `set(foo, "Howdy")` and `set(bar, 3)`

			// If an object is used, iterate through object
			if(typeof name === "object"){
				for(var x in name){
					this.set(x, name[x]);
				}
				return this;
			}
			
			var names = this._getAttrNames(name),
				oldValue = this._get(name, names),
				setter = this[names.s],
				setterOld = this[names.so], // TODO Remove in 2.0
				globalSetter = this._setter;
			if(typeof setter === "function"){
				// use the explicit setter
				var result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
			}else if(typeof setterOld === "function"){
				// use old style explicit setter
				// TODO Remove in 2.0
				var result = setterOld.apply(this, Array.prototype.slice.call(arguments, 1));
			}else if(typeof globalSetter === "function"){
				// use global setter
				var result = globalSetter.call(this, name, value);
			}else{
				// no setter or global setter so set attribute directly
				this[name] = value;
			}
			
			if(this._watchCallbacks){
				this._watchCallbacks(name, oldValue, value);
			}
			if(this._created){
				this.emit("changed", { attrName: name, prevValue: oldValue, newValue: value });
				this.emit("changed-" + name, { prevValue: oldValue, newValue: value });
			}
			
			return result || this;
		},
		
		_changeAttrValue: function(name, value){
			// summary:
			//		Internal helper for directly changing an attribute value.
			//
			//	name: String
			//		The property to set.
			//	value: Mixed
			//		The value to set in the property.
			//
			// description:
			//		Directly change the value of an attribute on an object, bypassing any 
			//		accessor setter.  Also handles the calling of watch and emitting events. 
			//		It is designed to be used by descendent class when there are two values 
			//		of attributes that are linked, but calling .set() is not appropriate.
			
			var oldValue = this.get(name);
			this[name] = value;
			if(this._watchCallbacks){
				this._watchCallbacks(name, oldValue, value);
			}
			this.emit("changed", { attrName: name, prevValue: oldValue, newValue: value });
			this.emit("changed-" + name, { prevValue: oldValue, newValue: value });
		}
		
	});
});
