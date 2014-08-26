function SavedViewModel(items)
{
	self = this;

	self.items = ko.observableArray(items);
    self.raw = items;

    self.navigate = function(item) {
        window.localStorage.setItem(storageKeys.windSessionOutput, ko.toJSON(item.data));
        for(var i = 0; i < self.raw.length; i++)
        {
            if(self.raw[i].id == item.id)
            {
                window.localStorage.setItem(storageKeys.windSessionInput, ko.toJSON(self.raw[i]));
                break;
            }
        }
        navigateTo("../wind/screen3.html")
    };

    self.delete = function(item) {
        for(var i = 0; i < self.raw.length; i++)
        {
            if(self.raw[i].id == item.id)
            {
                self.raw.splice(i, 1);
                break;
            }
        }

        window.localStorage.setItem(storageKeys.windSavedOutput, ko.toJSON(self.raw));
        window.phoneGapDB.setItem(storageKeys.windSavedOutput, ko.toJSON(self.raw));
        self.refresh();
    };

    self.refresh = function()
    {
        window.location.reload();
    }
}

$(document).ready(function () {
    //document.addEventListener("deviceready", onDeviceReady, false);
    onDeviceReady();
});

function onDeviceReady()
{
    console.log("onDeviceReady");

    var data = window.localStorage.getItem(storageKeys.windSavedOutput);
	var items = JSON.parse(data);

	var vm = new SavedViewModel(items);
	ko.applyBindings(vm);
}
