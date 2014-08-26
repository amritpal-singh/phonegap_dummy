function screen1ViewModel(){
	var self = this;

	//input
	self.projectName = ko.observable();
	self.user = ko.observable();
	
	self.currentlySelectedLevel = ko.observable(1).extend({ min: 1, max: 100, pattern: {
							                		message: 'Only integers are expected.',
							                    	params: '^[0-9]+$'
							                	}});
	self.levels;

	self.levelAmount = function() {
		var options = [100];
		for(var i = 0; i < 100; i++){
			options[i] = i+1; 
		}

		return options;
	};
	
	self.reverseLevels = ko.computed(function() {
		if(self.currentlySelectedLevel() > 100)
		{
			return;
		}

		if(!self.levels)
		{
			var lvl = [{level:1, hsM: 0, wkN: 0}];
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

				lvl.unshift({level: size, hsM: 0, wkN:0});
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

    self.fa = ko.observable(0);
    self.fv = ko.observable(0);

	self.province = ko.observable();
    self.location = ko.observable();
    self.importanceCategory = ko.observable();
    self.siteClass = ko.observable();
    
    self.isUserSpecified = ko.observable(false);
    self.isUserSpecifiedAccel = ko.observable(false);

    self.isOtherSiteClass = ko.computed(function() {
        if(self.siteClass())
        {
            var selected = self.siteClass();
            return (selected["Site Properties"] == "F");
        }

        return false;
    });

    self.xSelectedSFRS = ko.observable();
    self.ySelectedSFRS = ko.observable();
    self.typesOfSFRS = ko.observableArray();

    //data
    self.provinces = ko.observableArray();
    self.cities = ko.observableArray();
    self.locations;
    self.importanceCategories = ko.observableArray();
    self.siteProperties = ko.observableArray();
    self.mvBase = ko.observableArray();

    self._Sa02 = ko.observable();
    self._Sa05 = ko.observable();
    self._Sa10 = ko.observable();
    self._Sa20 = ko.observable();
}