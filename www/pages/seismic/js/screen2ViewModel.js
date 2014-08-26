function screen2ViewModel(session){
	var self = this;

	self.screen1ViewModel = session;

	//input

	self.rd = ko.observable();
	self.ro = ko.observable();
	self.maxBuildHeight;
	self.buildHeight = ko.observable().extend({ min: 0 });
	self.isUserSpecifiedBuildHeight = ko.observable(false);
	self.sysRow = ko.observable(self.screen1ViewModel.selectedSFRS);
	self.xTFormula = ko.observable();
	self.yTFormula = ko.observable();
    self.isUserSpecifiedXTFormula = ko.observable(false);
    self.isUserSpecifiedYTFormula = ko.observable(false);
	self.xTaMechanice = ko.observable();
	self.yTaMechanice = ko.observable();
	self.isUserSpecifiedXTaMechanice = ko.observable(false);
    self.isUserSpecifiedYTaMechanice = ko.observable(false);

	self.computedXTaMechanice = ko.observable();
	self.computedYTaMechanice = ko.observable();

	self.sumOfHsM = ko.observable();
	self.sumOfWkM = ko.observable();

	self.xTa = ko.observable();
	self.yTa = ko.observable();
	self.xSTa = ko.observable();
	self.ySTa = ko.observable();
	self.xSTaMv = ko.observable();
	self.ySTaMv = ko.observable();
	self.xJforTa = ko.observable();
	self.yJforTa = ko.observable();
	//self.isPermittedByNBC = ko.observable(false);

	self.xS4Mv = ko.observable();
	self.xS2Mv = ko.observable();
	self.xS1Mv = ko.observable();
	self.xS02Mv = ko.observable();
	self.xS05Mv = ko.observable();

	self.yS4Mv = ko.observable();
	self.yS2Mv = ko.observable();
	self.yS1Mv = ko.observable();
	self.yS02Mv = ko.observable();
	self.yS05Mv = ko.observable();

	self.xS_02 = ko.observable();
	self.yS_02 = ko.observable();
	self.xTaLoads = ko.observable();
	self.yTaLoads = ko.observable();
	self.xTaDeflections = ko.observable();
	self.yTaDeflections = ko.observable();
	self.xSTaMv_TaD = ko.observable(); 
    self.xJForTa_TaD = ko.observable();
    self.ySTaMv_TaD = ko.observable(); 
    self.yJForTa_TaD = ko.observable();

    //table 2
    self.siteClass = ko.observable(self.screen1ViewModel.siteClass);
    self.siteValue = ko.observable();
    self.sa02 = ko.observable();
    self.fa = ko.observable();
    self.fv = ko.observable();
    self.fasa02 = ko.observable();
    self.iefasa02 = ko.observable();
    self.iefvsa10 = ko.observable();

    self.vAmpDelf = ko.observable();
    self.vAmp = ko.observable();

    //table 3 data
    self.StructuralSystem = ko.observable();
    self.lt02 = ko.observable();
    self.gteq02lt035 = ko.observable();
    self.gteq035lt075 = ko.observable();
    self.gt075 = ko.observable();
    self.gt03 = ko.observable();
    self.heightLimit = ko.observable();

    self._Sa02 = ko.observable(self.screen1ViewModel._Sa02);
    self._Sa05 = ko.observable(self.screen1ViewModel._Sa05);
    self._Sa10 = ko.observable(self.screen1ViewModel._Sa10);
    self._Sa20 = ko.observable(self.screen1ViewModel._Sa20);
}