var profile = (function(){
	var testResourceRe = /^controller\/tests\//,

		copyOnly = function(filename, mid){
			var list = {
				"controller/controller.profile":1,
				"controller/package.json":1
			};
			return (mid in list) || (/^controller\/resources\//.test(mid) && !/\.css$/.test(filename)) || /(png|jpg|jpeg|gif|tiff)$/.test(filename);
		};

	return {
		resourceTags:{
			test: function(filename, mid){
				return testResourceRe.test(mid);
			},

			copyOnly: function(filename, mid){
				return copyOnly(filename, mid);
			},

			amd: function(filename, mid){
				return !testResourceRe.test(mid) && !copyOnly(filename, mid) && /\.js$/.test(filename);
			}
		},

		trees:[
			[".", ".", /(\/\.)|(~$)/]
		]
	};
})();
