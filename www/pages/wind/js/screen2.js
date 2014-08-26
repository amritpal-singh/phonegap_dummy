//Call startup function onDeviceReady when device is ready
$(document).ready(function () {
    //document.addEventListener("deviceready", onDeviceReady, false);
    onDeviceReady();
});

// call the other functions used on screen 2
function onDeviceReady()
{
	console.log("onDeviceReady");
    var data = window.localStorage.getItem(vmKeys.windScreen1);
    var screen1vm = ko.mapping.fromJSON(data);
    var selLimitState, selWindLoadFactor;
    var vm = new screen2ViewModel(screen1vm);
    setTotalHeight(vm);
    loadJson(vm);

    var session = window.localStorage.getItem(storageKeys.windSessionInput);
    if(session)
    {
        window.localStorage.removeItem(storageKeys.windSessionInput);
        var input = JSON.parse(session);
        if(input.data != undefined)
        {
        input = input.data.screen2ViewModel;}
        vm.province(
            ko.utils.arrayFirst(vm.provinces(), function(item) {
                return item.symbol == input.province.symbol;
            })
        );

        vm.location(
            ko.utils.arrayFirst(vm.locations(), function(item) {
                return item.City == input.location.City;
            })
        );

        vm.location().q = input.location.q;

        vm.isUserSpecified(input.isUserSpecified);

        vm.selectedImportanceCategory(
            ko.utils.arrayFirst(vm.importanceCategory(), function(item) {
                return item.tValue == input.selectedImportanceCategory.tValue;
            })
        );

        vm.selectedTerrainType(
            ko.utils.arrayFirst(vm.terrainType(), function(item) {
                return item.tValue == input.selectedTerrainType.tValue;
            })
        );

        vm.selectedLimitState(
            ko.utils.arrayFirst(vm.limitStates(), function(item) {
                selLimitState = input.selectedLimitState.tValue;
                return item.tValue == input.selectedLimitState.tValue;
            })
        );

        //vm.importanceFactor(input.importanceFactor);

        vm.selectedProcedure(
            ko.utils.arrayFirst(vm.procedures(), function(item) {
                return item.tValue == input.selectedProcedure.tValue;
            })
        );

        vm.bPercentage(input.bPercentage);
        vm.hh(input.hh);
        vm.fnDX(input.fnDX);
        vm.lh(input.lh);
        vm.fnDY(input.fnDY);
        vm.x(input.x);

        vm.selectedHill(
            ko.utils.arrayFirst(vm.hills(), function(item) {
                return item.tValue == input.selectedHill.tValue;
            })
        );

        vm.selectedWindLoadFactor(
            ko.utils.arrayFirst(vm.loadTypes(), function(item) {
                selWindLoadFactor = input.selectedWindLoadFactor.tValue;
                return item.tValue == input.selectedWindLoadFactor.tValue;
            })
        );

        // vm.calWindLoadFactor(
        //     ko.utils.arrayFirst(vm.loadTypes(), function(item) {
        //         return getWindLoadFactor(selLimitState,selWindLoadFactor);
        //     })
        // );
        // vm.calWindLoadFactor = ko.computed(function(){
        //     return 2222222;
        // });
    }

    bindUI(vm);
    ko.applyBindings(vm);
}

function bindUI(viewModel) {
	$("#a-next").click(function() {
        saveSession(viewModel);
        navigateTo("screen3.html");
    });

    $("#a-back").click(function() {
        saveSession(viewModel);
        navigateTo("screen1.html");
    });
}

function loadJson(viewModel)
{
    loadJsonFile("../../json/provinces.json", function(data) {
        $.each(data, function(index, item) {
            viewModel.provinces().push(item);
        });
    });

    loadJsonFile("../../json/cities-rvp.json", function(data) {
        $.each(data, function(index, item) {
            viewModel.cities().push(item);
        });

        viewModel.locations = ko.computed(function() {
            return ko.utils.arrayFilter(viewModel.cities(), function(city) {
                if(viewModel.province())
                {
                    return city.Province == viewModel.province().symbol;
                }
            });
        });
    });
}

function setTotalHeight(viewModel) {
    var choice = 0;
    var levelSize = viewModel.screen1ViewModel.reverseLevels().length;
    for (var i = 0; i< levelSize;i++) {
        choice += parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.reverseLevels()[i].hsM)));
    }
    viewModel.totalHeight(choice);
}

function saveSession(viewModel)
{
    viewModel.referenceVelocityPressure = viewModel.location().q;

    var copy = viewModel;
    delete copy.importanceCategory;
    delete copy.terrainType;
    delete copy.limitStates;
    delete copy.procedures;
    delete copy.hills;
    delete copy.loadTypes;
    delete copy.reverseLevels;
    delete copy.provinces;
    delete copy.cities;
    delete copy.locations;

    var data = ko.toJSON(copy);

    window.localStorage.setItem(vmKeys.windScreen2, data);
    window.localStorage.setItem(storageKeys.windSessionInput, data);
}
