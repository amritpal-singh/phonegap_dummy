$(document).ready(function () {
    //document.addEventListener("deviceready", onDeviceReady, false);
    onDeviceReady();
});

function onDeviceReady()
{
    "use strict";
    console.log("onDeviceReady");
    var data = window.localStorage.getItem(vmKeys.seismicScreen1);
    var screen1vm = ko.mapping.fromJSON(data);
    var vm = new screen2ViewModel(screen1vm);

    var session = window.localStorage.getItem(storageKeys.seismicSessionInput);
    if(session)
    {
        window.localStorage.removeItem(storageKeys.seismicSessionInput);
        var input = JSON.parse(session);

        vm.buildHeight(input.buildHeight);
        vm.isUserSpecifiedBuildHeight(input.isUserSpecifiedBuildHeight);

        vm.xTFormula(input.xTFormula);
        vm.isUserSpecifiedXTFormula(input.isUserSpecifiedXTFormula);

        vm.yTFormula(input.yTFormula);
        vm.isUserSpecifiedYTFormula(input.isUserSpecifiedYTFormula);

        vm.xTaMechanice(input.xTaMechanice);
        vm.isUserSpecifiedXTaMechanice(input.isUserSpecifiedXTaMechanice);

        vm.yTaMechanice(input.yTaMechanice);
        vm.isUserSpecifiedYTaMechanice(input.isUserSpecifiedYTaMechanice);
    }

    calculations(vm);
    
    //validation for max height    
    vm.maxBuildHeight = vm.sumOfHsM();
    vm.buildHeight.extend({ max: vm.maxBuildHeight });

    vm.computedXTaMechanice(roundValue(vm.xTaMechanice()));
    vm.computedXTaMechanice.subscribe(function(value) {
        vm.computedXTaMechanice(value);
        vm.xTaMechanice(value);
    });

    vm.computedYTaMechanice(roundValue(vm.yTaMechanice()));
    vm.computedYTaMechanice.subscribe(function(value) {
        vm.computedYTaMechanice(value);
        vm.yTaMechanice(value);
    });

    bindUI(vm);
    ko.applyBindings(vm);
}

function bindUI(viewModel) {
    $("#a-recauculate").click(function() {
        calculations(viewModel);
    });

    $("#a-next").click(function() {
        calculations(viewModel);
        var copy = viewModel;

        var data = ko.toJSON(copy);

        window.localStorage.setItem(vmKeys.seismicScreen2, data);
        window.localStorage.setItem(storageKeys.seismicSessionInput, data);
        navigateTo("screen3.html");
    });

    $("#a-back").click(function() {
        var copy = viewModel;

        window.localStorage.setItem(storageKeys.seismicSessionInput, ko.toJSON(copy));
        navigateTo("screen1.html");
    });
}

function roundValue(number)
{
    if(ko.isObservable(number))
        number = number();

    if(isNaN(parseFloat(number)) && isFinite(number))
        return number;

    var decimals = 3;
    var newnumber = new Number(number + '').toFixed(parseInt(decimals));
    return parseFloat(newnumber);
}

function calculations(viewModel){
    "use strict";
    var arrSize = viewModel.screen1ViewModel.levels().length;
    var levels = [arrSize];

    var xTFormula;
    var yTFormula;
    var xTaLoad, xTaLoad_def;
    var yTaLoad, yTaLoad_def;
    var xRowLocation = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.xSelectedSFRS.RowNum)));
    var yRowLocation = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.ySelectedSFRS.RowNum)));
    var vmXValues;
    var vmYValues;
    var xTaMechanice = viewModel.xTaMechanice();
    var yTaMechanice = viewModel.yTaMechanice();
    var userHeight = viewModel.isUserSpecifiedBuildHeight();
    var height = viewModel.buildHeight();
    var xOtherTa = viewModel.isUserSpecifiedXTaMechanice();
    var yOtherTa = viewModel.isUserSpecifiedYTaMechanice();
    var xSystemLimitForDesign, ySystemLimitForDesign;
    var xSystemLimitForDeflections, ySystemLimitForDeflections;
    var xMvRow, yMvRow;

    ySystemLimitForDeflections = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.ySelectedSFRS.LimitForDeflection)));
    ySystemLimitForDesign = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.ySelectedSFRS.LimitForDesign)));
    yMvRow = parseInt(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.ySelectedSFRS.NumericalCode)));

    xSystemLimitForDeflections = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.xSelectedSFRS.LimitForDeflection)));
    xSystemLimitForDesign = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.xSelectedSFRS.LimitForDesign)));
    xMvRow = parseInt(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.xSelectedSFRS.NumericalCode)));

    var currHsM = 0,
        totalHsm = 0,
        currWkM = 0,
        totalWkM = 0;
    for(var i = 0; i <= arrSize-1; i++){
        //height
        currHsM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.levels()[i].hsM)));
        totalHsm += currHsM;

        //weight
        currWkM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.levels()[i].wkN)));
        totalWkM += currWkM;
    }

    viewModel.sumOfHsM(totalHsm);
    viewModel.sumOfWkM(totalWkM);
    if(!userHeight)
        height = totalHsm;
    xTFormula = getTa(height,xRowLocation);
    yTFormula = getTa(height,yRowLocation);
    xTaLoad = getTaLoad(xOtherTa, xTaMechanice, xTFormula, getLimitDesign(xTFormula, xSystemLimitForDesign));
    yTaLoad = getTaLoad(yOtherTa, yTaMechanice, yTFormula, getLimitDesign(yTFormula, ySystemLimitForDesign));

    xTaLoad_def = getTaLoad(xOtherTa, xTaMechanice, xTFormula, xSystemLimitForDeflections);
    yTaLoad_def = getTaLoad(yOtherTa, yTaMechanice, yTFormula, ySystemLimitForDeflections);
    

    if(!xOtherTa)
        xTaMechanice = xTFormula;
    if(!yOtherTa)
        yTaMechanice = yTFormula;

    vmXValues = setSeismic(viewModel, xTaLoad, xTaLoad_def, xTaMechanice, xRowLocation , xOtherTa , xSystemLimitForDesign, xSystemLimitForDeflections, xMvRow);
    vmYValues = setSeismic(viewModel, yTaLoad, yTaLoad_def, yTaMechanice, yRowLocation , yOtherTa , ySystemLimitForDesign, ySystemLimitForDeflections, yMvRow);
    setObservables(viewModel, totalHsm, xTFormula, yTFormula, vmXValues, vmYValues, xOtherTa, yOtherTa, userHeight);
}

function setObservables(viewModel, totalHsm, xTFormula, yTFormula, vmXValues, vmYValues, xOtherTa, yOtherTa, userHeight){
    "use strict";
    if(!userHeight)
        viewModel.buildHeight(totalHsm);
    viewModel.xTFormula(xTFormula);
    viewModel.yTFormula(yTFormula);
    if(!xOtherTa)
        viewModel.xTaMechanice(xTFormula);
    if(!yOtherTa)
        viewModel.yTaMechanice(yTFormula);
    /*      Index   Order               
            [0]     #Ta             = TaLoads
            [1]     #TaDeflections  = xTa_Deflection
            [2]     #STa            = xSTa_Loads
            [3]     #STaMv          = sTaMv
            [4]     #jForTa         = jforTa
            [5]     #iefasa02       = iefasa02
            [6]     #iefvsa10       = iefvsa10
            [7]     #fasa02         = fasa02
            [8]     #s2Mv           = s2M
            [9]     #s4Mv           = s4M
            [10]    #s_02           = tmpSTVals
            [11]    #site           = site
    */
    
    viewModel.xTa(vmXValues[0]);
    viewModel.xTaDeflections(vmXValues[1]);
    viewModel.xSTa(vmXValues[2]);
    viewModel.xSTaMv(vmXValues[3]);
    viewModel.xJforTa(vmXValues[4]);
    viewModel.iefasa02(vmXValues[5]);
    viewModel.iefvsa10(vmXValues[6]);
    viewModel.fasa02(vmXValues[7]);
    viewModel.xS_02(vmXValues[10]);
    viewModel.siteValue(vmXValues[11]);
    viewModel.xSTaMv_TaD(vmXValues[12]); 
    viewModel.xJForTa_TaD(vmXValues[13]);
    viewModel.fa(vmXValues[14]);
    viewModel.fv(vmXValues[15]);

    viewModel.xS4Mv(vmXValues[9]);
    viewModel.xS2Mv(vmXValues[8]);
    viewModel.xS1Mv(vmXValues[16]);
    viewModel.xS02Mv(vmXValues[17]);
    viewModel.xS05Mv(vmXValues[18]);
    

    viewModel.yS4Mv(vmYValues[9]);
    viewModel.yS2Mv(vmYValues[8]);
    viewModel.yS1Mv(vmYValues[16]);
    viewModel.yS02Mv(vmYValues[17]);
    viewModel.yS05Mv(vmYValues[18]);
    

    viewModel.yTa(vmYValues[0]);
    viewModel.yTaDeflections(vmYValues[1]);
    viewModel.ySTa(vmYValues[2]);
    viewModel.ySTaMv(vmYValues[3]);
    viewModel.yJforTa(vmYValues[4]);
    viewModel.yS_02(vmYValues[10]);
    viewModel.ySTaMv_TaD(vmYValues[12]); 
    viewModel.yJForTa_TaD(vmYValues[13]);


}

function setSeismic(viewModel, tFormula,  taLoads_def, taMechanice, rowLocation , otherTa, systemLimitForD, systemLimitForDf, mvRow){
    "use strict";
    var faColHeader = [0.25, 0.5, 0.75, 1,   1.25];
    var fvColHeader = [0.1,  0.2, 0.3,  0.4, 0.5];
    var faInterpRange = [0.2, 0.5, 1.0, 2.0, 4.0];
    var site;
    var sa1, sa02, sa05, sa20;
    var importance_Cate;
    //Formula variables
    var faRow, fvRow;
    var faInterp, fvInterp;
    var faTaInterp = [6];
    var fvTaInterp = [6];
    var ieFaSa2, ieFvSa1;
    var taLoads = tFormula;
    var ta_Deflection = taLoads_def;
    //var yTaLoads = yTFormula;
    var stValues;
    var tmpSTVals;
    var sTa_Loads;
    var sTa_defections;
    
    //var yTaDefections = xTaLoads;
    var mvBaseRowVal = [6];
    var faFinalValue, fvFinalValue;
    var fvsa2, fasa2;
    var vmValues = [19];

    var s02M, s05M, s1M, s2M, s4M;

    var sTaMv1, sTaMv12, sTaMv24, sTaMv4, sTaMv;
    var jSTaMv1, jSTaMv12, jSTaMv24, jSTaMv4, jForTa;

    var sTaMv1_TaD, sTaMv12_TaD, sTaMv24_TaD, sTaMv4_TaD, sTaMv_TaD;
    var jSTaMv1_TaD, jSTaMv12_TaD, jSTaMv24_TaD, jSTaMv4_TaD, jForTa_TaD;
    var row = mvRow;

    //Parsing data from screen1
    site = ko.toJSON(viewModel.screen1ViewModel.siteClass['Site Properties']); 
    site = formatSiteOption(site);
    // sa1 = ko.toJSON(viewModel.screen1ViewModel.location.Sa10);
    // sa1 = parseFloat(JSON.parse(sa1));
    // sa02 = ko.toJSON(viewModel.screen1ViewModel.location.Sa02);
    // sa02 = parseFloat(JSON.parse(sa02));
    // sa05 = ko.toJSON(viewModel.screen1ViewModel.location.Sa05);
    // sa05 = parseFloat(JSON.parse(sa05));
    // sa20 = ko.toJSON(viewModel.screen1ViewModel.location.Sa20);
    // sa20 = parseFloat(JSON.parse(sa20));
    sa1 = ko.toJSON(viewModel._Sa10);
    sa1 = parseFloat(JSON.parse(sa1));
    sa02 = ko.toJSON(viewModel._Sa02);
    sa02 = parseFloat(JSON.parse(sa02));
    sa05 = ko.toJSON(viewModel._Sa05);
    sa05 = parseFloat(JSON.parse(sa05));
    sa20 = ko.toJSON(viewModel._Sa20);
    sa20 = parseFloat(JSON.parse(sa20));

    importance_Cate =  ko.toJSON(viewModel.screen1ViewModel.importanceCategory.value);
    importance_Cate = parseFloat(JSON.parse(importance_Cate));
    row = getApplicableLine(getsa02sa20(sa02,sa20), mvRow);

    mvBaseRowVal[0] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.mvBase()[row-1].MvForTaEqLt10)));
    mvBaseRowVal[1] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.mvBase()[row-1].MvForTaEq20)));
    mvBaseRowVal[2] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.mvBase()[row-1].MvForTaEqGt40)));
    mvBaseRowVal[3] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.mvBase()[row-1].JForTaEqLt05)));
    mvBaseRowVal[4] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.mvBase()[row-1].JForTaEq20)));
    mvBaseRowVal[5] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.mvBase()[row-1].JForTaEqGt40)));

    //calling formula methods
    if(site != 5){
        faRow = getTableRow(faTable(),site,5);
        fvRow = getTableRow(fvTable(),site,5);
    }else{
        var faInput = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.fa)));
        var fvInput = parseFloat(JSON.parse(ko.toJSON(viewModel.screen1ViewModel.fv)));
        faRow = [faInput,faInput,faInput,faInput,faInput];
        fvRow = [fvInput,fvInput,fvInput,fvInput,fvInput];
    }
    faInterp = getFAVInterp(faRow,sa02, faColHeader);
    fvInterp = getFAVInterp(fvRow,sa1, fvColHeader);
    faFinalValue = getFAV(faInterp);
    fvFinalValue = getFAV(fvInterp);
    fvsa2 = (fvFinalValue*sa20);
    stValues = getSTValue(faFinalValue,fvFinalValue,sa02,sa05,sa1, sa20, fvsa2);
    tmpSTVals = stValues.slice();
    tmpSTVals = tmpSTVals;
    stValues = stValues;

    //taLoads =  getTaLoad(otherTa, taMechanice, tFormula, systemLimitForD);
    //ta_Deflection = getTaLoad(otherTa, taMechanice, tFormula, systemLimitForDf);

    faTaInterp[0] = getInterp02(taLoads, tmpSTVals[0]);
    faTaInterp[1] = getInterp0205(taLoads, tmpSTVals[0], tmpSTVals[1]);
    faTaInterp[2] = getInterp0510(taLoads, tmpSTVals[1], tmpSTVals[2]);
    faTaInterp[3] = getInterp1020(taLoads, tmpSTVals[2], tmpSTVals[3]);
    faTaInterp[4] = getInterp2040(taLoads, tmpSTVals[3], tmpSTVals[4]);
    faTaInterp[5] = getInterp40(taLoads, tmpSTVals[4]);

    fvTaInterp[0] = getInterp02(taLoads_def, tmpSTVals[0]);
    fvTaInterp[1] = getInterp0205(taLoads_def, tmpSTVals[0], tmpSTVals[1]);
    fvTaInterp[2] = getInterp0510(taLoads_def, tmpSTVals[1], tmpSTVals[2]);
    fvTaInterp[3] = getInterp1020(taLoads_def, tmpSTVals[2], tmpSTVals[3]);
    fvTaInterp[4] = getInterp2040(taLoads_def, tmpSTVals[3], tmpSTVals[4]);
    fvTaInterp[5] = getInterp40(taLoads_def, tmpSTVals[4]);

    //calling formula methods
    ieFaSa2 = getIeFAVSa(importance_Cate,faFinalValue,sa02);
    ieFvSa1 = getIeFAVSa(importance_Cate,fvFinalValue,sa1);
    fasa2 = faFinalValue * sa02;

    sTa_Loads = getFAV(faTaInterp);
    sTa_defections = getFAV(fvTaInterp);

    

    s02M = getS02M(tmpSTVals[0], mvBaseRowVal[0]);
    s05M = getS05M(tmpSTVals[1], mvBaseRowVal[0]);
    s1M = getS10M(tmpSTVals[2], mvBaseRowVal[0]);
    s2M = getS20M(tmpSTVals[3], mvBaseRowVal[1]);
    s4M = getS40M(tmpSTVals[4], mvBaseRowVal[2]);
    //var sTaMv = Math.max(s02M,s05M,s1M,s2M,s4M);

    //console.log("xMvBaseRowVal: "+xMvBaseRowVal);
    //console.log("yMvBaseRowVal: "+yMvBaseRowVal);
    console.log("taLoads: "+taLoads);
    // console.log("ta_Deflection: "+ta_Deflection);
    // console.log("mvBaseRowVal: "+mvBaseRowVal);
    console.log("s02M: "+s02M);
    console.log("s05M: "+s05M); 
    console.log("s1M: "+s1M);
    console.log("s2M: "+s2M);
    console.log("s4M: "+s4M);

    sTaMv1 = getInterpolationTEqLt1(taLoads,sTa_Loads,mvBaseRowVal[0]);   
    sTaMv12 = getInterpolationTEqGt1Lt2(taLoads,s1M,s2M);
    sTaMv24 = getInterpolationTEqGt2Lt4(taLoads,s2M,s4M);
    // sTaMv12 = getInterpolationTEqGt1Lt2(taLoads,tmpSTVals[2],tmpSTVals[3]);
    // sTaMv24 = getInterpolationTEqGt2Lt4(taLoads,tmpSTVals[3],tmpSTVals[4]);
    sTaMv4 = getInterpolationTEqGt4(taLoads, sTa_Loads, mvBaseRowVal[3]);
    
    jSTaMv1 = getJForTEqLt1(taLoads, mvBaseRowVal[3]);   
    jSTaMv12 = getJForTEqGt1Lt2(taLoads,mvBaseRowVal[3],mvBaseRowVal[4]);
    jSTaMv24 = getJForTEqGt2Lt4(taLoads,mvBaseRowVal[4],mvBaseRowVal[5]);
    jSTaMv4 = getJForTEqGt4(taLoads, mvBaseRowVal[5]);
    console.log("jSTaMv1: "+jSTaMv1);
    console.log("jSTaMv12: "+jSTaMv12);
    console.log("jSTaMv24: "+jSTaMv24);
    console.log("jSTaMv4: "+jSTaMv4);

    jForTa = Math.max(jSTaMv1,jSTaMv12,jSTaMv24,jSTaMv4);
    sTaMv = Math.max(sTaMv1,sTaMv12,sTaMv24,sTaMv4);
    
    // //xTa_Deflection

    sTaMv1_TaD = getInterpolationTEqLt1(ta_Deflection, sTa_defections,mvBaseRowVal[0]);   
    sTaMv12_TaD = getInterpolationTEqGt1Lt2(ta_Deflection,s1M,s2M);
    //sTaMv12_TaD = getInterpolationTEqGt1Lt2(ta_Deflection,tmpSTVals[2],tmpSTVals[3]);
    //sTaMv24_TaD = getInterpolationTEqGt2Lt4(ta_Deflection,tmpSTVals[3],tmpSTVals[4]);
    sTaMv24_TaD = getInterpolationTEqGt2Lt4(ta_Deflection,s2M,s4M);
    sTaMv4_TaD = getInterpolationTEqGt4(ta_Deflection, sTa_defections, mvBaseRowVal[3]);

    jSTaMv1_TaD = getJForTEqLt1(ta_Deflection, mvBaseRowVal[3]);   
    jSTaMv12_TaD = getJForTEqGt1Lt2(ta_Deflection,mvBaseRowVal[3],mvBaseRowVal[4]);
    jSTaMv24_TaD = getJForTEqGt2Lt4(ta_Deflection,mvBaseRowVal[4],mvBaseRowVal[5]);
    jSTaMv4_TaD = getJForTEqGt4(ta_Deflection, mvBaseRowVal[5]);
    
    jForTa_TaD = Math.max(jSTaMv1_TaD,jSTaMv12_TaD,jSTaMv24_TaD,jSTaMv4_TaD);
    sTaMv_TaD = Math.max(sTaMv1_TaD,sTaMv12_TaD,sTaMv24_TaD,sTaMv4_TaD);

    //display
    


    console.log("otherTa: "+otherTa);
    console.log("taMechanice: "+taMechanice);
    console.log("systemLimitForDesign: "+systemLimitForD);

    vmValues[0] = taLoads;
    vmValues[1] = ta_Deflection; 
    vmValues[2] = sTa_Loads; 
    vmValues[3] = sTaMv; 
    vmValues[4] = jForTa;
    vmValues[5] = ieFaSa2;
    vmValues[6] = ieFvSa1;
    vmValues[7] = fasa2;
    vmValues[10] = tmpSTVals[0];
    vmValues[11] = site;
    vmValues[12] = sTaMv_TaD; 
    vmValues[13] = jForTa_TaD;
    vmValues[14] = faFinalValue;
    vmValues[15] = fvFinalValue;

    vmValues[9] = s4M;
    vmValues[8] = s2M;
    vmValues[16] = s1M;
    vmValues[17] = s02M;
    vmValues[18] = s05M;

    console.log(vmValues);
            
    return vmValues;
}
