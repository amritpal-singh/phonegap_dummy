var storageKeys = {
	windSessionOutput: "windSessionOutput",
	windSavedOutput: "windSavedOutput",
	windSessionInput: "windSessionInput",
	seismicSessionOutput: "seismicSessionOutput",
	seismicSavedOutput: "seismicSavedOutput",
	seismicSessionInput: "seismicSessionInput",
};

var vmKeys = {
	windScreen1: "windScreen1",
	windScreen2: "windScreen2",
	seismicScreen1: "seismicScreen1",
	seismicScreen2: "seismicScreen2"
};

function navigateTo(page)
{
    window.location = page;
}

//ko extension
ko.bindingHandlers.isolatedOptions = {
    init: function(element, valueAccessor) {
        var args = arguments;
        ko.computed({
            read:  function() {
               ko.utils.unwrapObservable(valueAccessor());
               ko.bindingHandlers.options.update.apply(this, args);
            },
            owner: this,
            disposeWhenNodeIsRemoved: element
        });
    }
};
