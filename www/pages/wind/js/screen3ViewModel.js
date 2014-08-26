function screen3ViewModel(session){
	var self = this;
	
	self.screen2ViewModel = session;

	//Individual values
	self.totalSumHi = ko.observable();
	self.totalSumHiDXi = ko.observable();
	self.totalSumHiDYi = ko.observable();

    self.dXEffective = ko.observable();
    self.dYEffective = ko.observable();
    self.exposureFactorTop = ko.observable();

	//Calculation Arrays
	self.xTrapezoidalIntegration = ko.observableArray();
	self.yTrapezoidalIntegration = ko.observableArray();
	self.effectiveWidthHiDYi = ko.observableArray();

	self.hillSpeedCeCe = ko.observableArray();

	//display Arrays
	self.xDirectionLoads = ko.observableArray();
	self.yDirectionLoads = ko.observableArray();

    self.edit = function() {
        var inputData = JSON.parse(window.localStorage.getItem(storageKeys.windSessionInput));
        var data = window.localStorage.getItem(storageKeys.windSavedOutput);
        var dataArr = JSON.parse(data);

        for (var i = 0; dataArr.length > 0; i++)
        {
            if(inputData.id == dataArr[i].id)
            {
                window.localStorage.setItem(vmKeys.windScreen2, ko.toJSON(dataArr[i].data));
                window.localStorage.setItem(vmKeys.windScreen1, ko.toJSON(dataArr[i].data.screen2ViewModel.screen1ViewModel));
                break;
            }
            
        };
        navigateTo("../wind/screen1.html")
    }

	self.save = function()
    {
        $("#a-save").unbind()
                    .removeAttr("data-bind");
        $("#div-footer-with-save").addClass("hidden");
        $("#div-footer-with-output").removeClass("hidden");
        
        var data = window.localStorage.getItem(storageKeys.windSavedOutput);
        // var data = window.phoneGapDB.getItem(storageKeys.windSavedOutput);
        var items = JSON.parse(data);
        if (!(items && items instanceof Array))
        {
            items = new Array();
        }

        var output = new OutputViewModel(self);
        output.name = self.screen2ViewModel.screen1ViewModel.projectName();
        output.by = self.screen2ViewModel.screen1ViewModel.user();
        items.push(output);
        window.localStorage.removeItem(storageKeys.windSessionInput);
        window.localStorage.setItem(storageKeys.windSavedOutput, ko.toJSON(items));
        var archive = [],
        keys = Object.keys(window.localStorage);
        

        for (i = 0; i < keys.length; i++) {
            //archive.push( localStorage.getItem(keys[i]) );
            window.phoneGapDB.setItem(keys[i], localStorage.getItem(keys[i]));
        }

    }
}