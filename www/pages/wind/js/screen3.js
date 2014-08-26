//Call startup function onDeviceReady when device is ready
$(document).ready(function () {
    //document.addEventListener("deviceready", onDeviceReady, false);
    onDeviceReady();
});

// call the other functions used on screen 2
function onDeviceReady(){
    "use strict";
    console.log("onDeviceReady");
    document.addEventListener("backbutton", onBackKeyDown, true);

    var saved = window.localStorage.getItem(storageKeys.windSessionOutput);

    if(saved)
    {
        var vm = ko.mapping.fromJSON(window.localStorage.getItem(vmKeys.windScreen2));
        window.localStorage.removeItem(storageKeys.windSessionOutput);
        $("#div-footer-with-email").removeClass("hidden");

        // var data1 = window.localStorage.getItem(vmKeys.windScreen2);
        // var screen2vm = ko.mapping.fromJSON(data1);
        var vm = new screen3ViewModel(vm);
        calculations(vm);
        //ko.applyBindings(vm1);
    }
    else
    {
        var data = window.localStorage.getItem(vmKeys.windScreen2);
        var screen2vm = ko.mapping.fromJSON(data);
        var vm = new screen3ViewModel(screen2vm);

        calculations(vm);
        $("#div-footer-with-save").removeClass("hidden");
    }

    bindUI(vm);
    ko.applyBindings(vm);
}

function roundValue(number)
{
    if(ko.isObservable(number))
        number = number();

    if(isNaN(parseFloat(number)) && isFinite(number))
        return number;

    var decimals = 1;
    var newnumber = new Number(number + '').toFixed(parseInt(decimals));
    return parseFloat(newnumber);
}

function onBackKeyDown()
{
    navigateTo("screen2.html");
}

function bindUI(viewModel){
    $("#a-email").click(function() {
        var body = $("#div-fakeContent").html();
        if (viewModel.screen2ViewModel.screen1ViewModel.projectName) {
            var subject = viewModel.screen2ViewModel.screen1ViewModel.projectName();
        }
        else
        {
            var subject = "project name";
        }

        if(body)
        {
            var action = 'mailto: ?subject=' + subject + '&body=' + body;
            window.location = action;
        }
    });

    $("#a-back").click(function() {
        navigateTo("screen2.html");
    });
}

function calculations(viewModel) {
    "use strict";

    //set array size values
    var levelSize = viewModel.screen2ViewModel.screen1ViewModel.reverseLevels().length + 1;
    var levelIndex = levelSize-1;
    var levels;

    // Final values
    var round1 = [levelSize];
    var round2 = [levelSize];
    var round3 = [levelSize];
    var round4 = [levelSize];
    var round5 = [levelSize];
    var xFinalValues = [levelSize-1];
    var yFinalValues = [levelSize-1];
    var fknXValue, vknXValue, mknmXValue;
    var fknYValue, vknYValue, mknmYValue;
    var levelFXDir, levelVXDir, levelMXDir, levelFYDir, levelVYDir, levelMYDir;
    var blevelFXDir, blevelVXDir, blevelMXDir, blevelFYDir, blevelVYDir, blevelMYDir;
    var base = {
            hillSpeedCeCe: 0,
            windwardStaticCe: 0,
            windwardDynamicCe: 0,
            windwardSelectedCorrected: 0,
            leewardStaticCe: 0,
            leewardDynamicCe: 0,
            leewardSelectedCorrected: 0,
            xDirectionStaticCg: 0,
            xDirectionDynamicCg: 0,
            xDirectionSelectedCg: 0,
            xDirectionSelectedCorrected: 0,
            yDirectionStaticCg: 0,
            yDirectionDynamicCg: 0,
            yDirectionSelectedCg: 0,
            yDirectionSelectedCorrected: 0,
            tributaryHeightWindAbove: 0, 
            dXAbove: 0, 
            dYAbove: 0, 
            tributaryAx: 0, 
            tributaryAy: 0, 
            xWindPressure: 0, 
            yWindPressure: 0,
            xLeePressure: 0,
            yLeePressure: 0,
            totalForceXDirection: 0,
            totalForceYDirection: 0,
            totalShearXDir: 0,
            totalShearYDir: 0,
            totalOverTurningMomentHi: 0
        };

    //first round of variables
    var floorCode;
    var currHSM, currWXM, currWYM;
    var nextHSM, nextWXM, nextWYM;
    var alphaHill, deltaSMax, hillOption;
    var kHill, xHill, hh, lh;
    var terrainType;
    var currhi, prevhi;
    var procedureWind;
    var staticWindCe, dynamicWindCe, hillSpeedUpCe;
    var totalHeight;
    var cgDynamicX, staticCg, dynamicCg, xSelectedCg;
    var wxEffective;
    var wyEffective;
    var fnDX, fnDY;

    // first round function values
    var hi, hiDXi, hiDYi;
    var hillSpeedCeCe;
    var windwardStaticCe, windwardDynamicCe, windwardSelectedCorrected;
    var leewardStaticCe, leewardDynamicCe, leewardSelectedCorrected;
    var xDirectionStaticCg, xDirectionDynamicCg, xDirectionSelectedCg, xDirectionSelectedCorrected;
    var yDirectionStaticCg, yDirectionDynamicCg, yDirectionSelectedCg, yDirectionSelectedCorrected;

    //second round
    var secFloorCode;
    var parapet;
    var baseDimensionY;
    var baseDimensionX;

    // second round function values
    var tributaryHeightWindAbove;
    var tributaryHeightWindBelow;
    var tributaryAx;
    var tributaryAy;
    var dXAbove;
    var dYAbove;
    var cpXWindward;
    var cpYWindward;
    var cpYLeeward;
    var cpXLeeward;
    var xWindPressure;
    var yWindPressure;
    var xLeePressure;
    var yLeePressure;
    var totalForceXDirection;
    var totalForceYDirection;
    var totalShearXDir;
    var totalShearYDir;

    //third round
    var currXForce;
    var prevXForce;
    var currYForce;
    var prevYForce;

    //fourth round
    var prevTotalShearXDir;
    var prevTotalShearYDir;
    var currTotalShearXDir;
    var currTotalShearYDir;
    var totalOverTurningMomentHi;
    var totalOverTurningMomentYDir;
    var totalOverTurningMomentXDir;
    var prevTotalMomentHi;
    var prevHsWindBelow;
    var nextTotalOverTurningMomentYDir;
    var nextTotalOverTurningMomentXDir;

    //Dynamic Values
    var q150, factorWind;
    var backGroundTurbulence;
    var referenceWindSpeed;
    var exposureFactorTop;
    var meanWindSpeedTopOfStructure;
    var xW_hAspectRatio, yW_hAspectRatio;
    var xGustEnergyRatioX0, xGustEnergyRatioF, yGustEnergyRatioX0, yGustEnergyRatioF;
    var xWaveNumber, yWaveNumber;
    var xReducedFrequency, yReducedFrequency;
    var xSizeReductionFactor, ySizeReductionFactor;
    var dampingRatio;
    var yGustEffectFactor, xGustEffectFactor;
    var yPeakFactor, xPeakFactor;
    var yCoefficient_s_m, xCoefficient_s_m;
    var yAverageFluctationRate, xAverageFluctationRate;
    var surfaceRoughness;
    var xSumOfArea, ySumOfArea;
    var xBackGroundTurbulence, yBackGroundTurbulence;
    var windLoadFactor;

    //Sum variables
    var totalHi = 0;
    var totalHiDXi = 0;
    var totalHiDYi = 0;
    var sumHi = 0;
    var sumHiDXi = 0;
    var sumHiDYi = 0;

    //Parse Data
    hh = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.hh)));
    lh = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.lh)));
    deltaSMax = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.selectedHill.tValue)));
    xHill = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.x)));
    terrainType = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.selectedTerrainType.tValue)));
    procedureWind = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.selectedProcedure.tValue)));
    totalHeight = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.totalHeight)));
    q150 = 0;;
    if(viewModel.screen2ViewModel.referenceVelocityPressure != undefined)
    {
        q150 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.referenceVelocityPressure)));
    }
    surfaceRoughness = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.selectedTerrainType.surface)));
    dampingRatio = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.bPercentage)));
    dampingRatio = dampingRatio/100.000;
    factorWind = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.importanceFactor)));
    fnDX = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.fnDX)));
    fnDY = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.fnDY)));
    parapet = 0;
    if(viewModel.screen2ViewModel.screen1ViewModel.parapet != undefined)
    {
        parapet = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.parapet)));
    }
    windLoadFactor = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.calWindLoadFactor)));

    hillOption = deltaSMax;

    if(deltaSMax > 0){
        deltaSMax = setDimension(deltaSMax, hh, lh, xHill);
        alphaHill = deltaSMax[1];
        kHill = deltaSMax[2];
        deltaSMax = deltaSMax[0];
    }else{
        deltaSMax = 0;
        alphaHill = 0;
        kHill = 0;
        deltaSMax = 0;
    }
    hi =0;
    for (var i = levelIndex-1; i > -1; i--) {
        currHSM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i].hsM)));
        currWXM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i].wxM)));
        currWYM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i].wyM)));
        if(i+1 < levelIndex){
            nextHSM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i+1].hsM)));
            floorCode = getFloorCode(nextHSM, currHSM);
        }else{
            floorCode = getFloorCode(0, currHSM);
        }
        hi += currHSM;
        hiDXi = getEffectiveWidthHiDXi(currWXM,hi);
        hiDYi = getEffectiveWidthHiDYi(currWYM,hi);
        sumHi += hi;
        sumHiDYi += hiDYi;
        sumHiDXi += hiDXi;
    }

    viewModel.totalSumHi(sumHi);
    viewModel.totalSumHiDXi(sumHiDXi);
    viewModel.totalSumHiDYi(sumHiDYi);
    wxEffective =sumHiDXi/sumHi;
    wyEffective =sumHiDYi/sumHi;

    sumHi = 0;
    sumHiDYi = 0;
    sumHiDXi = 0; 
    totalHi = 0;
    totalHiDYi = 0;
    totalHiDXi = 0;

    // Dynamic X & Y
    console.log("Dynamic X & Y");
    referenceWindSpeed = getReferenceWindSpeed(factorWind,q150);
    exposureFactorTop = getexposureFactorTop(terrainType, totalHeight);
    meanWindSpeedTopOfStructure = getMeanWindSpeedTopOfStructure(referenceWindSpeed,exposureFactorTop);
    xWaveNumber = getWaveNumber(fnDX, meanWindSpeedTopOfStructure);
    yWaveNumber = getWaveNumber(fnDY, meanWindSpeedTopOfStructure);
    xW_hAspectRatio = getw_hAspectRatio(totalHeight, wxEffective);
    yW_hAspectRatio = getw_hAspectRatio(totalHeight, wyEffective);
    xGustEnergyRatioX0 = getGustEnergyRatioX0(xWaveNumber);
    yGustEnergyRatioX0 = getGustEnergyRatioX0(yWaveNumber);
    xGustEnergyRatioF = getGustEnergyRatioF(xGustEnergyRatioX0);
    yGustEnergyRatioF = getGustEnergyRatioF(yGustEnergyRatioX0);    
    xReducedFrequency = getReducedFrequency(fnDX, totalHeight, meanWindSpeedTopOfStructure);
    yReducedFrequency = getReducedFrequency(fnDY, totalHeight, meanWindSpeedTopOfStructure);
    xSizeReductionFactor = getSizeReductionFactor(xReducedFrequency, fnDX, wxEffective, meanWindSpeedTopOfStructure);
    ySizeReductionFactor = getSizeReductionFactor(yReducedFrequency, fnDY, wyEffective, meanWindSpeedTopOfStructure);
    xSumOfArea = getTrapezoidalIntegration(viewModel, totalHeight, wxEffective);
    ySumOfArea = getTrapezoidalIntegration(viewModel, totalHeight, wyEffective);
    xBackGroundTurbulence = getBackGroundTurbulence(xSumOfArea);
    yBackGroundTurbulence = getBackGroundTurbulence(ySumOfArea);
    xAverageFluctationRate = getAverageFluctationRate(fnDX, xSizeReductionFactor, xGustEnergyRatioF, dampingRatio, xBackGroundTurbulence);
    yAverageFluctationRate = getAverageFluctationRate(fnDY, ySizeReductionFactor, yGustEnergyRatioF, dampingRatio, yBackGroundTurbulence);
    xCoefficient_s_m = getCoefficient_s_m(surfaceRoughness, exposureFactorTop, xBackGroundTurbulence, xSizeReductionFactor, xGustEnergyRatioF,dampingRatio);
    yCoefficient_s_m = getCoefficient_s_m(surfaceRoughness, exposureFactorTop, yBackGroundTurbulence, ySizeReductionFactor, yGustEnergyRatioF,dampingRatio);
    xPeakFactor = getPeakFactor(xAverageFluctationRate);
    yPeakFactor = getPeakFactor(yAverageFluctationRate);
    xGustEffectFactor = getGustEffectFactor(xPeakFactor, xCoefficient_s_m);
    yGustEffectFactor = getGustEffectFactor(yPeakFactor, yCoefficient_s_m);

    // Round 1
    console.log("Round 1");
    //var i = 0; i < levelIndex; i++
    for(var i = levelIndex-1; i > -1; i--){
        levels = i+1;
        currHSM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i].hsM)));
        currWXM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i].wxM)));
        currWYM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i].wyM)));
        if(i-1 > -1){
            nextHSM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i-1].hsM)));
            nextWYM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i-1].wxM)));
            nextWXM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i-1].wyM)));
            floorCode = getFloorCode(nextHSM, currHSM);
        }else{
            nextHSM = 0;
            nextWXM = 0;
            nextWYM = 0;
            floorCode = getFloorCode(0, currHSM);
        }

        if(i === 0){
            base.hillSpeedCeCe = getHillSpeedUp(1,hillOption,hh,lh,deltaSMax,xHill,kHill, alphaHill,0);
            base.windwardStaticCe = getWindwardStaticCe(1,terrainType,0);
            base.windwardDynamicCe = getWindwardDynamicCe(1,terrainType, 0);
            base.windwardSelectedCorrected = getWindwardSelectedCorrected(procedureWind,base.windwardStaticCe,base.windwardDynamicCe,base.hillSpeedCeCe);
            base.leewardStaticCe = getLeewardStaticCe(1,terrainType,totalHeight);
            base.leewardDynamicCe = getLeewardDynamic(1,terrainType,totalHeight);
            base.leewardSelectedCorrected = getLeewardSelectedCorrected(procedureWind,base.leewardStaticCe,base.leewardDynamicCe,base.hillSpeedCeCe);
            base.xDirectionStaticCg = getXDirectionStaticCg(1);
            base.xDirectionDynamicCg = getXDirectionDynamicCg(1, xGustEffectFactor);
            base.xDirectionSelectedCg = getXDirectionSelectedCg(procedureWind, base.xDirectionStaticCg,base.xDirectionDynamicCg);
            base.xDirectionSelectedCorrected = getXDirectionSelectedCorrected(1, base.xDirectionSelectedCg, base.hillSpeedCeCe);
            base.yDirectionStaticCg = getYDirectionStaticCg(1);
            base.yDirectionDynamicCg = getYDirectionDynamicCg(1, yGustEffectFactor);
            base.yDirectionSelectedCg = getYDirectionSelectedCg(procedureWind, base.yDirectionStaticCg, base.yDirectionDynamicCg);
            base.yDirectionSelectedCorrected = getYDirectionSelectedCorrected(1,base.yDirectionSelectedCg, base.hillSpeedCeCe);
        }
        sumHi += currHSM;
        hi = getEffectiveWidthHi(sumHi,floorCode);
        hiDXi = getEffectiveWidthHiDXi(currWXM,hi);
        hiDYi = getEffectiveWidthHiDYi(currWYM,hi);
        totalHi += hi;
        totalHiDYi += hiDYi;
        totalHiDXi += hiDXi; 
        hillSpeedCeCe = getHillSpeedUp(floorCode,hillOption,hh,lh,deltaSMax,xHill,kHill, alphaHill,hi);
        windwardStaticCe = getWindwardStaticCe(floorCode,terrainType,hi);
        windwardDynamicCe = getWindwardDynamicCe(floorCode,terrainType, hi);
        windwardSelectedCorrected = getWindwardSelectedCorrected(procedureWind,windwardStaticCe,windwardDynamicCe,hillSpeedCeCe);
        leewardStaticCe = getLeewardStaticCe(floorCode,terrainType,totalHeight);
        leewardDynamicCe = getLeewardDynamic(floorCode,terrainType,totalHeight);
        leewardSelectedCorrected = getLeewardSelectedCorrected(procedureWind,leewardStaticCe,leewardDynamicCe,hillSpeedCeCe);
        xDirectionStaticCg = getXDirectionStaticCg(floorCode);
        xDirectionDynamicCg = getXDirectionDynamicCg(floorCode, xGustEffectFactor);
        xDirectionSelectedCg = getXDirectionSelectedCg(procedureWind, xDirectionStaticCg,xDirectionDynamicCg);
        xDirectionSelectedCorrected = getXDirectionSelectedCorrected(floorCode, xDirectionSelectedCg, hillSpeedCeCe);
        yDirectionStaticCg = getYDirectionStaticCg(floorCode);
        yDirectionDynamicCg = getYDirectionDynamicCg(floorCode, yGustEffectFactor);
        yDirectionSelectedCg = getYDirectionSelectedCg(procedureWind, yDirectionStaticCg, yDirectionDynamicCg);
        yDirectionSelectedCorrected = getYDirectionSelectedCorrected(floorCode,yDirectionSelectedCg, hillSpeedCeCe);

        //set round1 json values
        round1[i] = setRound1Values(floorCode,hi, hiDXi, hiDYi, hillSpeedCeCe, windwardStaticCe, windwardDynamicCe, windwardSelectedCorrected, 
                                    leewardStaticCe, leewardDynamicCe, leewardSelectedCorrected, 
                                    xDirectionStaticCg, xDirectionDynamicCg, xDirectionSelectedCg, xDirectionSelectedCorrected, 
                                    yDirectionStaticCg, yDirectionDynamicCg, yDirectionSelectedCg, yDirectionSelectedCorrected);

    }

    // Round 2
    console.log("Round 2");
    var currI = levelIndex-1;
    baseDimensionY = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[currI].wyM)));
    baseDimensionX = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[currI].wxM)));
    cpXWindward = getCpXWindward(totalHeight,baseDimensionY);
    cpXLeeward = getCpXLeeward(totalHeight,baseDimensionY);
    cpYWindward = getCpYWindward(totalHeight,baseDimensionX);
    cpYLeeward = getCpYLeeward(totalHeight,baseDimensionX);
    //var i = 0; i < levelIndex; i++
    for(var i = levelIndex-1; i > -1; i--){
        levels = i+1;
        currHSM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i].hsM)));
        currWXM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i].wxM)));
        currWYM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i].wyM)));
        if(i-1 > -1){
            secFloorCode = getSecondFloorCode(round1[i-1].windwardSelectedCorrected, round1[i].windwardSelectedCorrected);
            nextHSM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i-1].hsM)));
            nextWXM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i-1].wxM)));
            nextWYM = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.reverseLevels()[i-1].wyM)));
        }else{
            secFloorCode = getSecondFloorCode(round1[i].windwardSelectedCorrected, 0);
            nextHSM = 0;
            nextWXM = 0;
            nextWYM = 0;
        }
        if(i === levelIndex-1){
            base.tributaryHeightWindAbove = getTributaryHeightWindAbove(currHSM,1,parapet);
            base.dXAbove = getDXabove(1, 0, currWXM);
            base.dYAbove = getDYabove(1, 0, currWYM);
            base.tributaryAx = getTributaryAx(base.dXAbove,base.tributaryHeightWindAbove,0,0);
            base.tributaryAy = getTributaryAy(base.dYAbove,base.tributaryHeightWindAbove,0,0);
            base.xWindPressure = getXWindPressure(factorWind, q150, base.windwardSelectedCorrected, base.xDirectionSelectedCorrected, cpXWindward);
            base.xLeePressure = getXLeePressure(  factorWind, q150, base.leewardSelectedCorrected,  base.xDirectionSelectedCorrected, cpXLeeward );
            base.yWindPressure = getYWindPressure(factorWind, q150, base.windwardSelectedCorrected, base.yDirectionSelectedCorrected, cpYWindward);
            base.yLeePressure = getYLeePressure(  factorWind, q150, base.leewardSelectedCorrected,  base.yDirectionSelectedCorrected, cpYLeeward );
            base.totalForceXDirection = getTotalForceXDirection(base.xWindPressure,base.xLeePressure,base.tributaryAx);
            base.totalForceYDirection = getTotalForceYDirection(base.yWindPressure,base.yLeePressure,base.tributaryAy);
        }
        tributaryHeightWindAbove = getTributaryHeightWindAbove(nextHSM,secFloorCode,parapet);
        tributaryHeightWindBelow = getTributaryHeightWindBelow(currHSM);
        dXAbove = getDXabove(secFloorCode, currWXM, nextWXM);
        dYAbove = getDYabove(secFloorCode, currWYM, nextWYM);
        tributaryAx = getTributaryAx(dXAbove,tributaryHeightWindAbove,currWXM,tributaryHeightWindBelow);
        tributaryAy = getTributaryAy(dYAbove,tributaryHeightWindAbove,currWYM,tributaryHeightWindBelow); 

        xWindPressure = getXWindPressure(factorWind, q150, round1[i].windwardSelectedCorrected, round1[i].xDirectionSelectedCorrected, cpXWindward);
        xLeePressure = getXLeePressure(  factorWind, q150, round1[i].leewardSelectedCorrected,  round1[i].xDirectionSelectedCorrected, cpXLeeward );
        yWindPressure = getYWindPressure(factorWind, q150, round1[i].windwardSelectedCorrected, round1[i].yDirectionSelectedCorrected, cpYWindward);
        yLeePressure = getYLeePressure(  factorWind, q150, round1[i].leewardSelectedCorrected,  round1[i].yDirectionSelectedCorrected, cpYLeeward );

        totalForceXDirection = getTotalForceXDirection(xWindPressure,xLeePressure,tributaryAx);
        totalForceYDirection = getTotalForceYDirection(yWindPressure,yLeePressure,tributaryAy);  
    
        round2[i] = setRound2Values(secFloorCode, tributaryHeightWindAbove, tributaryHeightWindBelow, dXAbove, dYAbove, 
                                    tributaryAx, tributaryAy, cpXWindward, cpXLeeward, cpYWindward, cpYLeeward,
                                    xWindPressure, xLeePressure,yWindPressure, yLeePressure, 
                                    totalForceXDirection, totalForceYDirection );

    }

    // round 3
    console.log("Round 3");
    //var i = levelIndex-1; i >= 0; i--
    for(var i = 0; i <= levelIndex-1; i++){
        levels = i+1;
        //for x
        totalShearYDir=0;
        totalShearXDir=0;
        
        if(i != 0){
            currXForce = round2[i].totalForceXDirection;
            prevXForce = round3[i-1].totalShearXDir;
        }else{
            currXForce = round2[i].totalForceXDirection;
            prevXForce = 0;
        }
        totalShearXDir += currXForce + prevXForce;
        //for y
        
        if(i != 0){
            currYForce = round2[i].totalForceYDirection;
            prevYForce = round3[i-1].totalShearYDir;
        }else{
            currYForce = round2[i].totalForceYDirection;
            prevYForce = 0;
        }
        totalShearYDir += currYForce + prevYForce;
        round3[i] = setRound3Values(totalShearXDir,totalShearYDir);

        if(i === levelIndex-1){
            base.totalShearXDir = base.totalForceXDirection + totalShearXDir;
            base.totalShearYDir = base.totalForceYDirection + totalShearYDir;
        }

    }

    // round 4 
    console.log("Round 4");
    //var i = 0; i <= levelIndex; i++
    for(var i = levelIndex; i >= 0; i-- ){
        //levels = i+1; 
        if( i > 0){
            if(i === levelIndex){
                totalOverTurningMomentHi =  getTotalOverTurningMomentHi(1,round1[i-1].hi,0, parapet);
            }else{
                totalOverTurningMomentHi =  getTotalOverTurningMomentHi(round2[i].secFloorCode,round1[i-1].hi,round1[i].hi, parapet);
            }
        }else{
            // if(levelIndex === 1){
            //     totalOverTurningMomentHi =  getTotalOverTurningMomentHi(1,round1[i].hi,0, parapet);
            // }else{
                totalOverTurningMomentHi =  getTotalOverTurningMomentHi(2, 0, round1[i].hi, parapet);
            //}
        }
        round4[i] = setRound4Values(totalOverTurningMomentHi);
    }
    // if(levelIndex === 1 ){
    //     round4[levelIndex].totalOverTurningMomentHi = getTotalOverTurningMomentHi(2,round1[levelIndex-1].hi,0, parapet);
    // }
    //base.totalShearXDir
    //round 5
    console.log("Round 5");
    // var i = levelIndex; i >=0 ; i--
    for(var i = 0; i <= levelIndex; i++) {
        levels = i+1; 
 
        if(i === 0){
            totalOverTurningMomentXDir = getTotalOverTurningMomentXDir(2, round3[i].totalShearXDir,0, parapet, round4[i].totalOverTurningMomentHi,
                                                                         round4[i+1].totalOverTurningMomentHi, round2[i].tributaryHeightWindBelow, 
                                                                        0);
            totalOverTurningMomentYDir = getTotalOverTurningMomentYDir(2,round3[i].totalShearYDir, 0, parapet, round4[i].totalOverTurningMomentHi,
                                                                        round4[i+1].totalOverTurningMomentHi, round2[i].tributaryHeightWindBelow, 
                                                                        0);
        }else if( i < levelIndex){
            totalOverTurningMomentXDir = getTotalOverTurningMomentXDir(round2[i].secFloorCode, round3[i-1].totalShearXDir, round3[i].totalShearXDir, parapet, 
                                                                        round4[i].totalOverTurningMomentHi, round4[i+1].totalOverTurningMomentHi, round2[i].tributaryHeightWindBelow, 
                                                                        round5[i-1].totalOverTurningMomentXDir);
            totalOverTurningMomentYDir = getTotalOverTurningMomentYDir(round2[i].secFloorCode, round3[i-1].totalShearYDir, round3[i].totalShearYDir, parapet, 
                                                                        round4[i].totalOverTurningMomentHi, round4[i+1].totalOverTurningMomentHi, round2[i].tributaryHeightWindBelow, 
                                                                        round5[i-1].totalOverTurningMomentYDir);
        }else {
            totalOverTurningMomentXDir = getTotalOverTurningMomentXDir(1, round3[i-1].totalShearXDir, base.totalShearXDir, parapet, 
                                                                        round4[i].totalOverTurningMomentHi, 0, 0, round5[i-1].totalOverTurningMomentXDir);
            totalOverTurningMomentYDir = getTotalOverTurningMomentYDir(1, round3[i-1].totalShearYDir, base.totalShearYDir, parapet, 
                                                                        round4[i].totalOverTurningMomentHi, 0, 0, round5[i-1].totalOverTurningMomentYDir);
        }
        round5[i] = setRound5Values(totalOverTurningMomentXDir,totalOverTurningMomentYDir );  
        
    }
    console.log("Round 5.loop2");
    for(var i = 0; i <= levelIndex-1; i++){
        if(i < levelIndex){
            levelFXDir = getLevelFXDir(round1[i].floorCode, round2[i].totalForceXDirection, windLoadFactor);
            levelVXDir = getLevelVXDir(round1[i].floorCode, round3[i].totalShearXDir, windLoadFactor);
            levelMXDir = getLevelMXDir(round1[i].floorCode, round5[i+1].totalOverTurningMomentXDir, windLoadFactor);
            levelFYDir = getLevelFYDir(round1[i].floorCode, round2[i].totalForceYDirection, windLoadFactor);
            levelVYDir = getLevelVYDir(round1[i].floorCode, round3[i].totalShearYDir, windLoadFactor);
            levelMYDir = getLevelMYDir(round1[i].floorCode, round5[i+1].totalOverTurningMomentYDir, windLoadFactor);
        }
        
        if(i === levelIndex-1){
            blevelFXDir = getLevelFXDir(1, base.totalForceXDirection, windLoadFactor);
            blevelVXDir = getLevelVXDir(1, base.totalShearXDir, windLoadFactor);
            
            blevelFYDir = getLevelFYDir(1, base.totalForceYDirection, windLoadFactor);
            blevelVYDir = getLevelVYDir(1, base.totalShearYDir, windLoadFactor);

            xFinalValues[i+1] = setValueDisplayArray("Base", blevelFXDir, blevelVXDir, "");
            yFinalValues[i+1] = setValueDisplayArray("Base", blevelFYDir, blevelVYDir, "");
            xFinalValues[i] = setValueDisplayArray(levelIndex-i, levelFXDir, levelVXDir, levelMXDir);
            yFinalValues[i] = setValueDisplayArray(levelIndex-i, levelFYDir, levelVYDir, levelMYDir); 
        }else{

            xFinalValues[i] = setValueDisplayArray(levelIndex-i, levelFXDir, levelVXDir, levelMXDir);
            yFinalValues[i] = setValueDisplayArray(levelIndex-i, levelFYDir, levelVYDir, levelMYDir); 
        }
    }
    setObservableValues(viewModel,xFinalValues, yFinalValues);
}

function setRound1Values(floorCodeValue, hiValue, hiDXiValue, hiDYiValue, hillSpeedCeCeValue, 
                        windwardStaticCeValue, windwardDynamicCeValue, 
                        windwardSelectedCorrectedValue, leewardStaticCeValue, 
                        leewardDynamicCeValue, leewardSelectedCorrectedValue, 
                        xDirectionStaticCgValue, xDirectionDynamicCgValue, 
                        xDirectionSelectedCgValue, xDirectionSelectedCorrectedValue, 
                        yDirectionStaticCgValue, yDirectionDynamicCgValue, 
                        yDirectionSelectedCgValue, yDirectionSelectedCorrectedValue ){
    "use strict";
    var choice = null;
    choice = {
            floorCode: floorCodeValue,
            hi: hiValue, 
            hiDXi: hiDXiValue, 
            hiDYi: hiDYiValue, 
            hillSpeedCeCe: hillSpeedCeCeValue,
            windwardStaticCe: windwardStaticCeValue,
            windwardDynamicCe: windwardDynamicCeValue,
            windwardSelectedCorrected: windwardSelectedCorrectedValue,
            leewardStaticCe: leewardStaticCeValue, 
            leewardDynamicCe: leewardDynamicCeValue, 
            leewardSelectedCorrected: leewardSelectedCorrectedValue,
            xDirectionStaticCg: xDirectionStaticCgValue,
            xDirectionDynamicCg: xDirectionDynamicCgValue,
            xDirectionSelectedCg: xDirectionSelectedCgValue,
            xDirectionSelectedCorrected: xDirectionSelectedCorrectedValue,
            yDirectionStaticCg: yDirectionStaticCgValue,
            yDirectionDynamicCg: yDirectionDynamicCgValue,
            yDirectionSelectedCg: yDirectionSelectedCgValue,
            yDirectionSelectedCorrected: yDirectionSelectedCorrectedValue
        };
    return choice;
}

function setRound2Values(secFloorCodeValue, tributaryHeightWindAboveValue, tributaryHeightWindBelowValue, 
                        dXAboveValue, dYAboveValue, tributaryAxValue, tributaryAyValue, cpXWindwardValue, 
                        cpXLeewardValue, cpYWindwardValue, cpYLeewardValue, xWindPressureValue, xLeePressureValue, 
                        yWindPressureValue, yLeePressureValue, totalForceXDirectionValue, totalForceYDirectionValue){
    "use strict";
    var choice = null;
    choice = {
            secFloorCode: secFloorCodeValue,
            tributaryHeightWindAbove: tributaryHeightWindAboveValue, 
            tributaryHeightWindBelow: tributaryHeightWindBelowValue, 
            dXAbove: dXAboveValue, 
            dYAbove: dYAboveValue, 
            tributaryAx: tributaryAxValue, 
            tributaryAy: tributaryAyValue, 
            cpXWindward: cpXWindwardValue, 
            cpXLeeward: cpXLeewardValue, 
            cpYWindward: cpYWindwardValue, 
            cpYLeeward: cpYLeewardValue,
            xWindPressure: xWindPressureValue, 
            xLeePressure: xLeePressureValue,
            yWindPressure: yWindPressureValue, 
            yLeePressure: yLeePressureValue, 
            totalForceXDirection: totalForceXDirectionValue, 
            totalForceYDirection: totalForceYDirectionValue
        };
    return choice;
}

function setRound3Values(totalShearXDirValue, totalShearYDirValue){
    "use strict";
    var choice = null;
    choice = {
            totalShearXDir: totalShearXDirValue,
            totalShearYDir: totalShearYDirValue
    };
    return choice;
}

function setRound4Values(totalOverTurningMomentHiValue){
    "use strict";
    var choice = null;
    choice = {
            totalOverTurningMomentHi: totalOverTurningMomentHiValue
        };
    return choice;
}

function setRound5Values(totalOverTurningMomentXDirValue, totalOverTurningMomentYDirValue){
    "use strict";
    var choice = null;
    choice = {
            totalOverTurningMomentXDir: totalOverTurningMomentXDirValue,
            totalOverTurningMomentYDir: totalOverTurningMomentYDirValue
    };
    return choice;
}

function setValueDisplayArray(lvlValue, fknValue, vknValue, mknmValue){
    "use strict";
    var choice = null;
    choice = {level: lvlValue, fkn: fknValue, vkn: vknValue, mknm: mknmValue};
    return choice;
}

function setObservableValues(viewModel, xFinalValues, yFinalValues){
    "use strict";
    viewModel.xDirectionLoads(xFinalValues);
    viewModel.yDirectionLoads(yFinalValues);
}

function setDimension(deltaSMax, hh, lh, xHill){
    "use strict";
    var choice = null;
    if(deltaSMax === 1)
        choice = get2Dimensional(hh,lh,xHill);
    else if(deltaSMax === 2)
        choice = get2DimensionalEscarpments(hh,lh,xHill);
    else if(deltaSMax === 3)
        choice = get3Dimensional(hh,lh,xHill);
    return choice;
}

function getTrapezoidalIntegration(viewModel, totalHeight, wEffective){
    "use strict";   
    var choice = 0;
    var arrSize = 1001;
    var dynamic = [arrSize];
    var integration = 914/totalHeight;
    var currStep = 0, 
        currX = 0, 
        currFX = 0, 
        currArea = 0;

    dynamic[0] = {step: currStep, x: currX, fx: currFX, area: currArea};
    for (var i = 1; i < arrSize; i++){


            currStep = i;
            currX = getTrapeZoidalX(currStep, integration);
            currFX = getTrapeZoidalFx(currX, totalHeight, wEffective);
            currArea = getTrapeZoidalArea(currX, dynamic[(i-1)].x, currFX, dynamic[(i-1)].fx);
            dynamic[i] = {
                        step: currStep, 
                        x: currX, 
                        fx: currFX, 
                        area: currArea
                    };
    }

    for (var i = 0; i < arrSize; i++){
        choice += dynamic[i].area;
    }
    return choice;
}

