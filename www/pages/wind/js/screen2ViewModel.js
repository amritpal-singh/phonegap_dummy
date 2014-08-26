function screen2ViewModel(session){
	var self = this;
	
	self.screen1ViewModel = session;

	self.province = ko.observable();
    self.location = ko.observable();

	self.referenceVelocityPressure;

	self.isUserSpecified = ko.observable(false);

	self.totalHeight = ko.observable();

	self.selectedImportanceCategory = ko.observable();
	self.importanceCategory = ko.observableArray(getWindCategoryName(self.selectedImportanceCategory));

	self.selectedTerrainType = ko.observable();
	self.terrainType = ko.observableArray(getTerrainType());

	self.selectedLimitState = ko.observable();
	self.limitStates = ko.observableArray(getLimitStatesWind());

	self.selectedProcedure = ko.observable();
	self.procedures = ko.observableArray(getProcedure(self.selectedProcedure));

	self.selectedHill = ko.observable();
	self.hills = ko.observableArray(getHill());

	self.bPercentage = ko.observable(1.0).extend({ min: 0 });

	self.bValue = ko.computed(function(){
		return (self.bPercentage/100.00);
	});
	self.hh = ko.observable(6.00);
	self.fnDX = ko.observable(0.1).extend({ min: 0 });
	self.lh = ko.observable(12.0);
	self.fnDY = ko.observable(0.1).extend({ min: 0 });
	self.x = ko.observable(0.00);

	self.showWarning = ko.computed(function() {
		//dynamic procedure and fnD is less than 0.25
		return (self.selectedProcedure().tValue == 2) && (self.fnDX() < 0.25 || self.fnDY() < 0.25);
	});

	self.selectedWindLoadFactor = ko.observable();

	self.loadTypes = ko.observableArray(getLoadTypes());

	self.calWindLoadFactor = ko.computed(function () {
		var choice = 0;
		if(!self.selectedLimitState() ){
			choice = 0;
		}else{
			if(!self.selectedWindLoadFactor()){
				choice =  0;
			}else{
				var valWindLoadFactor = self.selectedWindLoadFactor().tValue;
				var valLimitStates = self.selectedLimitState().tValue;
				choice = getWindLoadFactor(valLimitStates, valWindLoadFactor);
			}
		}
		return choice;
	});

	self.importanceFactor = ko.computed(function (){
		var choice = 0;
		if(!self.selectedLimitState() ){
			choice = 0;
		}else{
			if(!self.importanceCategory()){
				choice = 0;
			}else{
				if(self.selectedLimitState().tValue === 1){
					self.isWindAsVisible(true);
					choice = getULSWindCategory(self.selectedImportanceCategory().tValue -1);
				}else if(self.selectedLimitState().tValue === 2){
					self.isWindAsVisible(false);
					choice = getSLSWindCategory(self.selectedImportanceCategory().tValue -1);
				}
			}
		}
		return choice;
	});

	self.isProcedureInputEnabled = ko.computed(function() {
		if(!self.selectedProcedure())
		{
			return false;
		}
		else
		{
			return (self.selectedProcedure().tValue == 2);	
		}
	});

	self.isHillInputEnabled = ko.computed(function() {
		if(!self.selectedHill())
		{
			return false;
		}
		else
		{
			return (self.selectedHill().tValue != 0);	
		}
	});

	self.isWindAsVisible = ko.observable(true);

    self.provinces = ko.observableArray();
    self.cities = ko.observableArray();
    self.locations;
}