function screen1ViewModel(){
	var self = this;

	//input
	self.projectName = ko.observable();
	self.user = ko.observable();
	
	self.currentlySelectedLevel = ko.observable(1).extend({ min: 1, max: 100, pattern: {
							                		message: 'Only integers are expected.',
							                    	params: '^[0-9]+$'
							                	}});

	self.parapet = ko.observable().extend({ min: 0, max: 1.5 });
	self.levels;

	self.reverseLevels = ko.computed(function() {
		if(self.currentlySelectedLevel() > 100)
		{
			return;
		}

		if(!self.levels)
		{
			var lvl = [{level:1, hsM: 0, wxM: 0, wyM: 0}];
			self.levels = ko.observableArray(lvl);
		}

		var lvl = [];
		var rlvl = [];
		lvl = self.levels();

		var set = lvl.length;
		var diff = self.currentlySelectedLevel() - lvl.length;
		
		if(diff > 0 ){
			for(var i = 0; i < diff; i++) {
				var size = self.levels().length + 1;
				lvl.unshift({level: size, hsM: 0, wxM: 0, wyM:0});
			}
		}
		else if(diff < 0) {
			diff = diff*(-1);
			for(var i = 0; i < diff; i++){
				lvl.shift();
			}
		}
		
		self.levels = ko.observableArray(lvl);
		return self.levels;
	});
}