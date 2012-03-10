define([
		"dojo/_base/declare", // declare declare.safeMixin
		"dojo/_base/array", // array.forEach
		"dojo/has",
		"dojo/Stateful"
], function (declare, array, has, Stateful){

// module:
//		dojo-controller/Attributed
// summary:
//		A class that builds upon dojo/Stateful by adding on auto-magic getters and setters 
//		functionality.

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

	return declare([Stateful], {
		// summary:
		//		A class that builds upon dojo/Stateful by adding on auto-magic getters and 
		//		setters functionality.
		//
		// description:
		//		A class that provides the functionality to auto-magically manage getters
		//		and setters for object attributes/properties, as well as provides 
		//		dojo/Stateful watch functionality and dojo/Evented emit/on functionality 
		//		for the attributes/properties.
		//		
		//		Getters and Setters should follow the format of _getXxx or _setXxx where 
		//		the Xxx is a CamelCased version of the attribute to handle.  So an 
		//		attribute of "foo" would have a custom getter of _getFoo and a custom 
		//		setter of _setFoo.
		
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
				s: "_set"+uc,	// converts dashes to camel case, ex: accept-charset --> _setAcceptCharset
				g: "_get"+uc
			});
		},
		
		postscript: function(/*Object?*/ params){
			if (params){ this.set(params); }
			this._created = true;
		},
		
		get: function(name){
			// summary:
			//		Get a property from an object.
			//	name:
			//		The property to get.
			// description:
			//		Get a named property from an object. The property may
			//		potentially be retrieved via a getter method. If no getter is defined, this
			//		just retrieves the object's property.
			//
			//		For example, if the widget has properties `foo` and `bar`
			//		and a method named `_getFoo()`, calling:
			//		`myObject.get("foo")` would be equivalent to calling
			//		`myObject._getFoo()` and `myObject.get("bar")`
			//		would be equivalent to the expression
			//		`myObject.bar`
			var names = this._getAttrNames(name);
			return this[names.g] ? this[names.g]() : this[name];
		},

		set: function(name, value){
			// summary:
			//		Set a property on a widget
			//	name:
			//		The property to set or an object that is a hash of properties and values.
			//	value:
			//		The value to set in the property.
			// description:
			//		Sets named properties on a widget which may potentially be handled by a
			//		setter in the widget.
			//
			//		For example, if the widget has properties `foo` and `bar`
			//		and a method named `_setFoo()`, calling
			//		`myObject.set("foo", "Howdy!")` would be equivalent to calling
			//		`obj._setFoo("Howdy!")` and `myObject.set("bar", 3)`
			//		would be equivalent to the statement `obj.bar = 3;`
			//
			//		set() may also be called with a hash of name/value pairs, ex:
			//
			//	|	obj.set({
			//	|		foo: "Howdy",
			//	|		bar: 3
			//	|	});
			//
			//	This is equivalent to calling `set(foo, "Howdy")` and `set(bar, 3)`

			if(typeof name === "object"){
				for(var x in name){
					this.set(x, name[x]);
				}
				return this;
			}
			var names = this._getAttrNames(name),
				setter = this[names.s],
				getter = this[names.g],
				oldValue = typeof getter === "function" ? getter.call(this, name) : this[name];
			if(typeof setter === "function"){
				// use the explicit setter
				var result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
			}else{
				this[name] = value;
			}
			if(this._created){
				if(this._watchCallbacks){
					this._watchCallbacks(name, oldValue, value);
				}
			}
			return result || this;
		}
	});
});