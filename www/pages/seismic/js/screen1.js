$(document).ready(function () {
    //document.addEventListener("deviceready", onDeviceReady, false);
    onDeviceReady();
});

function onDeviceReady()
{
    console.log("onDeviceReady");
    var vm = new screen1ViewModel();
    loadJson(vm);

    var session = window.localStorage.getItem(storageKeys.seismicSessionInput);
    if(session)
    {
        var input = JSON.parse(session);
        input = input.data.screen2ViewModel;

        vm.projectName(input.screen1ViewModel.projectName);
        vm.user(input.screen1ViewModel.user);
        vm.currentlySelectedLevel(input.screen1ViewModel.currentlySelectedLevel)
        vm.levels(input.screen1ViewModel.levels);

        vm.province(
            ko.utils.arrayFirst(vm.provinces(), function(item) {
                return item.symbol == input.screen1ViewModel.province.symbol;
            })
        );

        vm.location(
            ko.utils.arrayFirst(vm.cities(), function(item) {
                return item.City == input.screen1ViewModel.location.City;
            })
        );

        vm.isUserSpecified(input.screen1ViewModel.isUserSpecified);
        if(input.screen1ViewModel.isUserSpecified == true)
        {
            vm.location().Sa02 = input.screen1ViewModel.location.Sa02;
            vm.location().Sa05 = input.screen1ViewModel.location.Sa05;
            vm.location().Sa10 = input.screen1ViewModel.location.Sa10;
            vm.location().Sa20 = input.screen1ViewModel.location.Sa20;
        }

        vm.importanceCategory(
            ko.utils.arrayFirst(vm.importanceCategories(), function(item) {
                return item.value == input.screen1ViewModel.importanceCategory.value;
            })
        );

        vm.siteClass(
            ko.utils.arrayFirst(vm.siteProperties(), function(item) {
                return item['Site Properties'] == input.screen1ViewModel.siteClass['Site Properties'];
            })
        );

        if(vm.isOtherSiteClass())
        {
            vm.fa(input.screen1ViewModel.fa);
            vm.fv(input.screen1ViewModel.fv);
        }

        vm.xSelectedSFRS(
            ko.utils.arrayFirst(vm.typesOfSFRS(), function(item) {
                return item.RowNum == input.screen1ViewModel.xSelectedSFRS.RowNum;
            })
        );

        vm.ySelectedSFRS(
            ko.utils.arrayFirst(vm.typesOfSFRS(), function(item) {
                return item.RowNum == input.screen1ViewModel.ySelectedSFRS.RowNum;
            })
        );
    }

    bindUI(vm);
    
    ko.applyBindings(vm);
}

function bindUI(viewModel) {
    
    $("#a-next").click(function() {

        viewModel._Sa02 = viewModel.location().Sa02;
        viewModel._Sa05 = viewModel.location().Sa05;
        viewModel._Sa10 = viewModel.location().Sa10;
        viewModel._Sa20 = viewModel.location().Sa20;

        var copy = viewModel;
        delete copy.provinces;
        delete copy.cities;
        delete copy.locations;
        delete copy.importanceCategories;
        delete copy.siteProperties;
        delete copy.levelAmount;
        delete copy.typesOfSFRS;
        
        //alert(ko.toJSON(copy, null, 2));
        window.localStorage.removeItem(storageKeys.seismicSessionInput);
        window.localStorage.setItem(vmKeys.seismicScreen1, ko.toJSON(copy));
        navigateTo("screen2.html");
    });
    
        $("input, select, textarea").bind("focus",function() {
        $(".footer").addClass("footerkeyboardopen");
    });

    $("input, select, textarea").bind("blur",function() {
        $(".footer").removeClass("footerkeyboardopen");
    });
}

function loadJson(viewModel)
{
   
    loadJsonFile("../../json/structural_system_LF10.json", function(data) {
        $.each(data, function(index, item) {
            viewModel.typesOfSFRS().push(item);
        });
    });

    loadJsonFile("../../json/Mv_and_Base.json", function(data) {
        $.each(data, function(index, item) {
            viewModel.mvBase().push(item);
        });
    });

    loadJsonFile("../../json/provinces.json", function(data) {
        // $.each(data, function(index, item) {
        //     viewModel.provinces().push(item);
        // });
        viewModel.provinces(data);
    });
    
    loadJsonFile("../../json/cities.json", function(data) {
        // $.each(data, function(index, item) {
        //     viewModel.cities().push(item);
        // });
        viewModel.cities(data);
    });
    
    viewModel.locations = ko.computed(function() {
            return ko.utils.arrayFilter(viewModel.cities(), function(city) {
                if(viewModel.province())
                {
                    return city.Province == viewModel.province().symbol;
                }
            });
        });

    loadJsonFile("../../json/importance_categories.json", function(data) {
        var initial;

        $.each(data, function(index, item) {
            viewModel.importanceCategories().push(item);
            if(item["Importance Category"] == "Normal")
            {
                initial = item;
            }
        });

        viewModel.importanceCategory(initial);
    });

    loadJsonFile("../../json/site_classes.json", function(data) {
        var initial;

        $.each(data, function(index, item) {

            viewModel.siteProperties().push(item);
            if(item["Site Properties"] == "C")
            {
                initial = item;
            }
        });

        viewModel.siteClass(initial);
    });
    ko.applyBindings(viewModel);
}

