function screen3ViewModel(session){
	var self = this;

	self.screen2ViewModel = session;

	self.xPermittedByNBC = ko.observable(false);
    self.yPermittedByNBC = ko.observable(false);
	self.totalWeight = ko.observable();
	
    self.xBaseShear = ko.observable();
	self.xTopForce = ko.observable();
    self.yBaseShear = ko.observable();
    self.yTopForce = ko.observable();

    self.xTa = ko.observable();
    self.xSTa = ko.observable();
    self.xSTaMv = ko.observable();
    self.xJForTa = ko.observable();

    self.yTa = ko.observable();
    self.ySTa = ko.observable();
    self.ySTaMv = ko.observable();
    self.yJForTa = ko.observable();

    self.minLateralEarthquakeForce = ko.observable();
    self.lowerLimitV = ko.observable();
    self.upperLimitV = ko.observable();
    self.baseShearV = ko.observable();
    self.amphn = ko.observable();
    self.shearCorr = ko.observable();
    self.ampBaseShear = ko.observable();

	self.xPeriodUsedTaDeflection = ko.observable();
	self.xMultiForDeflection = ko.observable();
	self.yPeriodUsedTaDeflection = ko.observable();
	self.yMultiForDeflection = ko.observable();
	self.xSeismic = ko.observableArray();

	self.xFinalList = ko.observableArray();
	self.yFinalList = ko.observableArray();

/*  X-axis - >  dottedLineT
                finalT

    Y-axis - >  dottedLineSTMv
                finalSTMv
*/
    self.xIntersection = ko.observableArray();      // only shows a red dot -> Intersection[0] = x-axis     |     Intersection[1] = y-axis
    self.xDottedLineT = ko.observableArray();       // x-axis
    self.xDottedLineSTMv = ko.observableArray();    // y-axis
    self.xFinalT = ko.observableArray();            // x-axis
    self.xFinalSTMv = ko.observableArray();         // y-axis
    self.xDottedGraph = ko.observableArray();
    self.xSolidGraph = ko.observableArray();

    self.yIntersection = ko.observableArray();      // only shows a red dot -> Intersection[0] = x-axis     |     Intersection[1] = y-axis
    self.yDottedLineT = ko.observableArray();       // x-axis
    self.yDottedLineSTMv = ko.observableArray();    // y-axis
    self.yFinalT = ko.observableArray();            // x-axis
    self.yFinalSTMv = ko.observableArray();         // y-axis
    self.yDottedGraph = ko.observableArray();
    self.ySolidGraph = ko.observableArray();

    self.showSAMessage = ko.observable(false);
    self.showXOtherSFRSMessage = ko.observable(false);
    self.showYOtherSFRSMessage = ko.observable(false);

    self.edit = function() {
        var inputData = JSON.parse(window.localStorage.getItem(storageKeys.seismicSessionInput));
        var data = window.localStorage.getItem(storageKeys.seismicSavedOutput);
        var dataArr = JSON.parse(data);

        for (var i = 0; dataArr.length > 0; i++)
        {
            if(inputData.id == dataArr[i].id)
            {
                window.localStorage.setItem(vmKeys.seismicScreen2, ko.toJSON(dataArr[i].data));
                window.localStorage.setItem(vmKeys.seismicScreen1, ko.toJSON(dataArr[i].data.screen2ViewModel.screen1ViewModel));
                break;
            }
            
        };
        navigateTo("../seismic/screen1.html")
    }
	self.save = function() {
		$("#a-save").unbind()
                    .removeAttr("data-bind");
        $("#div-footer-with-save").addClass("hidden");
        $("#div-footer-with-output").removeClass("hidden");

        var data = window.localStorage.getItem(storageKeys.seismicSavedOutput);
        var items = JSON.parse(data);
        if (!(items && items instanceof Array))
        {
            items = new Array();
        }

        var output = new OutputViewModel(self);
        output.name = self.screen2ViewModel.screen1ViewModel.projectName();
        output.by = self.screen2ViewModel.screen1ViewModel.user();
        items.push(output);

        window.localStorage.setItem(storageKeys.seismicSavedOutput, ko.toJSON(items));
        keys = Object.keys(window.localStorage);
        

        for (i = 0; i < keys.length; i++) {
            //archive.push( localStorage.getItem(keys[i]) );
            window.phoneGapDB.setItem(keys[i], localStorage.getItem(keys[i]));
        }
	}

    
}