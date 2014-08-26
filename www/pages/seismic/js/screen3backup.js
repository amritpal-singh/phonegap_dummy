$(document).ready(function () {

    //document.addEventListener("deviceready", onDeviceReady, false);
    onDeviceReady();
});

function onDeviceReady()
{
    console.log("onDeviceReady");
    document.addEventListener("backbutton", onBackKeyDown, true);

    var saved = window.localStorage.getItem(storageKeys.seismicSessionOutput);

    if(saved)
    {
        var vm = ko.mapping.fromJSON(saved);
        window.localStorage.removeItem(storageKeys.seismicSessionOutput);

        $("#div-basic-footer").addClass("hidden");
        $("#div-footer-with-email").removeClass("hidden");
    }
    else
    {
        var data = window.localStorage.getItem(vmKeys.seismicScreen2);
        var screen2vm = ko.mapping.fromJSON(data);
        var vm = new screen3ViewModel(screen2vm);
        xCalculations(vm);
        yCalculations(vm);

        $("#div-basic-footer").addClass("hidden");
        $("#div-footer-with-save").removeClass("hidden");
    }

    bindUI(vm);
    ko.applyBindings(vm);
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

function xCalculations(viewModel){
    "use strict";
    var levelSize = viewModel.screen2ViewModel.screen1ViewModel.levels().length;
    var levelIndex = levelSize -1;
    var levels = [levelSize];
    var round1 = [levelSize];
    var round2 = [levelSize];
    var round3 = [levelSize];
    var round4 = [levelSize];
    var round5 = [levelSize];
    var round6 = [levelSize];

    var currFloorCode;
    var currHx;
    var currWxkN;
    var currHxWx;
    var currFxkN;
    var currVxkN;
    var currVxhx;
    var currMx;
    var currMxRed;
    var currJx;
    var hsm;
    var wkn;
    var base;

    // pre-calculated values from other viewmodels
    var buildHeight = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.buildHeight)));
    var sTaMv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xSTaMv)));
    var sTa = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xSTa)));
    var totalW = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.sumOfWkM)));
    var rowRo =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.Ro)));
    var rowRd =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.Rd)));
    var rowNum =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.RowNum)));
    var importance_Cate =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.importanceCategory.value)));
    var s_02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xS_02)));
    var s2Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xS2Mv)));
    var numericalCode = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.NumericalCode)));
    var s4Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xS4Mv)));
    var iefaSa02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.iefasa02)));
    var iefvSa10 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.iefvsa10)));
    var site = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.siteValue)));
    var taLoads = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xTa)));
    var taDeflections = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xTaDeflections)));
    var j_Ta = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xJforTa)));
    var j_Ta_TaD = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xJForTa_TaD)));
    var sTaMv_TaD = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xSTaMv_TaD)));
    var fa = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.fa)));
    var fv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.fv)));
    var _Sa02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel._Sa02)));

    // new calculated values
    var permitted = null;
    permitted = xSetPermitted(viewModel, buildHeight, importance_Cate);
    if(permitted){
        var vMin = getMinLateralEarthquakeForce(sTaMv, importance_Cate, rowRd, rowRo, permitted);
        var vMax = getUpperLimitV(s_02, rowRd, importance_Cate, rowRo, permitted);
        var vMaxRdRo = getShearCorr(sTaMv,importance_Cate,permitted);
        var vMin2 = getLowerLimitV(numericalCode,s2Mv,s4Mv,importance_Cate,rowRd,rowRo,permitted);
        var forceAmplification = getForceAmplification(importance_Cate,fa,_Sa02,rowNum, iefaSa02, iefvSa10, totalW);
        var ampHn = getAmpHn(forceAmplification, permitted);
        var vBaseShear = getBaseShear(rowRd, site, vMax, vMin, vMin2, permitted);
        var vAmp = getAmpBaseShear(rowNum, ampHn, vMaxRdRo ,vBaseShear,permitted);
        var vtotal = getVTotal(permitted, vAmp, totalW);
        var ft = getFt(permitted,taLoads, vtotal);

        var vMin_TaD = getMinLateralEarthquakeForce(sTaMv_TaD, importance_Cate, rowRd, rowRo, permitted);
        var vMax_TaD = getUpperLimitV(s_02, rowRd, importance_Cate, rowRo, permitted);
        var vMaxRdRo_TaD = getShearCorr(sTaMv_TaD,importance_Cate,permitted);
        var vMin2_TaD = getLowerLimitV(numericalCode,s2Mv,s4Mv,importance_Cate,rowRd,rowRo,permitted);
        var forceAmplification_TaD = getForceAmplification(importance_Cate,fa,_Sa02,rowNum, iefaSa02, iefvSa10, totalW);
        var ampHn_TaD = getAmpHn(forceAmplification_TaD, permitted);
        var vBaseShear_TaD = getBaseShear(rowRd, site, vMax_TaD, vMin_TaD, vMin2_TaD, permitted);
        var vAmp_TaD = getAmpBaseShear(rowNum, ampHn_TaD, vMaxRdRo_TaD ,vBaseShear_TaD,permitted);
        var vtotal_TaD = getVTotal(permitted, vAmp_TaD, totalW);
        var ft_TaD = getFt(permitted,taDeflections, vtotal_TaD);
        var vAmpDefl = getAmpBaseShear(rowNum, ampHn_TaD, vMaxRdRo_TaD ,vBaseShear_TaD,permitted);

        var multiDef = getMuitDeflection(permitted, vAmpDefl, vAmp);

        console.log("rowNum: "+rowNum);
        console.log("totalW: "+totalW);
        console.log("iefaSa02: "+iefaSa02);
        console.log("iefvSa10: "+iefvSa10);   
        console.log("vMin: "+vMin);
        console.log("vMax: "+vMax);
        console.log("vMaxRdRo: "+vMaxRdRo);
        console.log("vMn2: "+vMin2);
        console.log("forceAmplification: "+forceAmplification);
        console.log("ampHn: "+ampHn);
        console.log("vBaseShear: "+vBaseShear);
        console.log("vAmp: "+vAmp);
        console.log("vtotal: "+vtotal);
        console.log("ft: "+ft);
        console.log("j_Ta: "+j_Ta);
         var currVal= 0, prevVal = 0, sumVal = 0;
        //
        var sumHx =0;
        var sumHxWx = 0;
        var sumFxkN = 0;

        //var minLateralEarthquakeForce = getMinLateralEarthquakeForce();
        console.log("permitted: "+permitted);

        for( var i =0; i <= levelIndex; i++){
            // console.log("round1");
            hsm = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.levels()[i].hsM)));
            wkn = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.levels()[i].wkN)));
            currFloorCode = getFloorCode(hsm,permitted);

            //Sum totals
            sumHx += hsm;
            //finals
            currHx = getFinalHxm(currFloorCode,sumHx);
            currWxkN = getFinalWkN(currFloorCode,wkn);
            currHxWx = getFinalhxWx(currFloorCode,currHx, currWxkN);
            sumHxWx += currHxWx;

            round1[i] = setRound1(currFloorCode, currHx, currWxkN, currHxWx);
            
        }
        for(var i =0; i <= levelIndex; i++){
            // console.log("round2");
            sumFxkN += currFxkN;
            if( levelSize === 1){
                currFxkN = getFxkN(round1[i].currFloorCode, round1[i].currHxWx, 0, sumHxWx, ft, vtotal);
            }else if(i === levelSize){
                currFxkN = getFxkN(round1[i].currFloorCode, round1[i].currHxWx, 0, sumHxWx, ft, vtotal);
            }else if (i+1 < levelSize){
                currFxkN = getFxkN(round1[i].currFloorCode, round1[i].currHxWx, round1[i+1].currHxWx, sumHxWx, ft, vtotal);
            }

            round2[i] = setRound2(currFxkN);
            // console.log("round2[i]: "+round2[i]);
            // console.log("currFxkN: "+currFxkN);
        }
        currVxkN = 0;
        for(var i = levelSize-1; i > -1; i--){
            console.log("round3");
            // if (levelSize === 1){
            //     sumVal += 0;
            //     currVxkN = getVxkN(round1[i].currFloorCode, sumVal);
            //     console.log("set 1");
            // }else if(i === levelIndex){
            //     console.log("set 2");
            //     sumVal += 0;
            //     currVxkN = getVxkN(round1[i].currFloorCode, sumVal);
            // }else if (i+1 <= levelIndex){
            //     console.log("set 3");
            //     sumVal += round2[i + 1].currFxkN;
            //     currVxkN = getVxkN(round1[i].currFloorCode, sumVal);
            // }
            // console.log("currVxkN: "+currVxkN);
            // round3[i] = setRound3(currVxkN);

            console.log("round3");
            // if (levelSize === 1){
            //     sumVal += 0;
            //     currVxkN = getVxkN(round1[i].currFloorCode, sumVal);
            //     console.log("set 1");
            // }else if(i === levelIndex){
            //     console.log("set 2");
            //     sumVal += 0;
            //     currVxkN = getVxkN(round1[i].currFloorCode, sumVal);
            // }else if (i+1 <= levelIndex){
            //     console.log("set 3");
            //     sumVal += round2[i + 1].currFxkN;
            //     currVxkN = getVxkN(round1[i].currFloorCode, sumVal);
            // }
            if(round1[i].currFloorCode != 0)
                currVxkN += round2[i].currFxkN;

            console.log("currVxkN: "+currVxkN);
            round3[i] = setRound3(currVxkN);
            
        }
        for(var i= 0; i <= levelIndex;i++){
            console.log("round4");
            if( levelSize === 1){
                currVxhx = getVxhx(round1[i].currFloorCode, 0, round1[i].currHx, round3[i].currVxkN);
                currJx = getJx(round1[i].currFloorCode, totalW, j_Ta, round1[i].currHx);
            }else if(i === levelIndex){
                currVxhx = getVxhx(round1[i].currFloorCode, round1[i-1].currHx,round1[i].currHx, round3[i].currVxkN);
                currJx = getJx(round1[i].currFloorCode, totalW, j_Ta, round1[i].currHx);
            }
            // else if(i+1 < levelSize) {
            //     currVxhx = getVxhx(round1[i].currFloorCode, round1[i].currHx, round1[i+1].currHx, round3[i].currVxkN);
            //     currJx = getJx(round1[i].currFloorCode, totalW, j_Ta, round1[i].currHx);
            // }
            console.log("currVxhx: "+currVxhx);

            round4[i] =  setRound4(currVxhx, currJx);
            
        }
        var tmp =0;
        for(var i = levelIndex; i >= 0; i--){
            console.log("round5");
            if( levelSize === 1){
                currMx = getMx(round1[i].currFloorCode, round1[i].currHx, 0, 0, round4[i].currVxhx);
                currMxRed = getMxRedkNm(round1[i].currFloorCode, currMx, round4[i].currJx); 
            }else if(i === levelIndex){
                currMx = getMx(round1[i].currFloorCode, round1[i].currHx, 0, 0, round4[i].currVxhx);
                currMxRed = getMxRedkNm(round1[i].currFloorCode, currMx, round4[i].currJx);
            }else if (i+1 < levelSize){
                currMx = getMx(round1[i].currFloorCode, round1[i].currHx, round1[i+1].currHx, round5[i+1].currMx, round4[i].currVxhx);
                currMxRed = getMxRedkNm(round1[i].currFloorCode, currMx, round4[i].currJx);
            }
            tmp = i+1;
            console.log("rowNum: "+rowNum);
            if(rowNum < 12){
                currMxRed = "-";
            }
            round5[i] = setRound5(currMx,currMxRed);
            levels[i] = setValueDisplayArray(   round1[i].currFloorCode, tmp ,round1[i].currHx,round1[i].currWxkN,
                                                round1[i].currHxWx,round2[i].currFxkN,round3[i].currVxkN, 
                                                round4[i].currVxhx,currMx,round4[i].currJx,currMxRed);
        }
        var vvx = 0;
        var vvxhx = 0;
        var mmx = 0;
        var jjx = 0;
        var mmxred = 0;
        for(var i = 0; i < round2.length-1; i++){vvx += round2[i].currFxkN;}
        vvxhx = getVxhx(1, 0, round1[0].currHx, vvx);
        mmx = getMx(1, 0, round1[0].currHx, round5[0].currMx, vvxhx);
        jjx = getJx(1, totalW, j_Ta, 0);
        mmxred = getMxRedkNm(1, mmx, jjx);
        for (var i = levels.length-1; i > -1 ; i--) {
            if(i-1 != 0 && i > 0){
                //levels[i].vkn = levels[i-1].vkn;
                levels[i].mknm = levels[i-1].mknm;
                levels[i].j = levels[i-1].j;
                levels[i].mknmRed = levels[i-1].mknmRed;
            }else if(i === 0){
                //levels[i].vkn = vvx;
                levels[i].mknm = mmx;
                levels[i].j = jjx;
                if(rowNum < 12){
                    levels[i].mknmRed = "-";
                }else{
                    levels[i].mknmRed = mmxred;
                }
            }
        }
        setXObservables(viewModel, levels, totalW, permitted, vtotal, ft, sTaMv, taLoads, j_Ta, sTa, taDeflections,multiDef);
    }else{
        viewModel.xPermittedByNBC(permitted);
    }
}

function setRound1(currFloorCodeValue, currHxValue, currWxkNValue, currHxWxValue){
    "use strict";
    var choice = null;
    choice = {
                currFloorCode: currFloorCodeValue, 
                currHx: currHxValue, 
                currWxkN: currWxkNValue, 
                currHxWx: currHxWxValue
        };
    return choice;
}

function setRound2(currFxkNValue){
    "use strict";
    var choice = null;
    choice = {
                currFxkN: currFxkNValue
        };
    return choice;
}

function setRound3(currVxkNValue){
    "use strict";
    var choice = null;
    choice = {
                currVxkN: currVxkNValue
        };
    return choice;
}

function setRound4(currVxhxValue, currJxValue){
    "use strict";
    var choice = null;
    choice = {
                currVxhx: currVxhxValue, 
                currJx: currJxValue
        };
    return choice;
}

function setRound5(currMxValue,currMxRedValue){
    "use strict";
    var choice = null;
    choice = {
                currMx: currMxValue,
                currMxRed: currMxRedValue
        };
    return choice;
}

function setXObservables(viewModel, levels, totalW, displayPermitted, vtotal, ft, sTaMv, taLoads, j_Ta, sTa,taDeflections, multiDef){
    "use strict";
    viewModel.totalWeight(totalW);
    // viewModel.permittedByNBC(displayPermitted);
    viewModel.baseShear(vtotal);
    viewModel.xFinalList(levels);

    viewModel.xTa(taLoads);
    viewModel.xSTa(sTa);
    viewModel.xSTaMv(sTaMv);
    viewModel.xJForTa(j_Ta);

    viewModel.topForce(roundVal(ft, 2));
    viewModel.xPeriodUsedTaDeflection(taDeflections);
    viewModel.xMultiForDeflection(multiDef);
}

function yCalculations(viewModel){
    "use strict";
    var levelSize = viewModel.screen2ViewModel.screen1ViewModel.levels().length;
    var levelIndex = levelSize -1;
    var levels = [levelSize];
    var round1 = [levelSize];
    var round2 = [levelSize];
    var round3 = [levelSize+1];
    var round4 = [levelSize+1];
    var round5 = [levelSize+1];


    var currFloorCode;
    var currHx;
    var currWxkN;
    var currHxWx;
    var currFxkN;
    var currVxkN;
    var currVxhx;
    var currMx;
    var currMxRed;
    var currJx;
    var hsm;
    var wkn;

    // pre-calculated values from other viewmodels
    var sTaMv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.ySTaMv)));
    var sTa = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.ySTa)));
    var totalW = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.sumOfWkM)));
    var rowRo =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.Ro)));
    var rowRd =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.Rd)));
    var rowNum =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.RowNum)));
    var importance_Cate =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.importanceCategory.value)));
    var s_02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yS_02)));
    var s2Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yS2Mv)));
    var numericalCode = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.NumericalCode)));
    var s4Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yS4Mv)));
    var iefaSa02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.iefasa02)));
    var iefvSa10 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.iefvsa10)));
    var site = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.siteValue)));
    var taLoads = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yTa)));
    var taDeflections = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yTaDeflections)));
    var j_Ta = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yJforTa)));
    var j_Ta_TaD = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yJForTa_TaD)));
    var sTaMv_TaD = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.ySTaMv_TaD)));
    var fa = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.fa)));
    var fv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.fv)));
    var _Sa02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel._Sa02)));

   // new calculated values
    var permitted = null;
    permitted = ySetPermitted(viewModel, totalW, importance_Cate);
    if(permitted){
        var vMin = getMinLateralEarthquakeForce(sTaMv, importance_Cate, rowRd, rowRo, permitted);
        var vMax = getUpperLimitV(s_02, rowRd, importance_Cate, rowRo, permitted);
        var vMaxRdRo = getShearCorr(sTaMv,importance_Cate,permitted);
        var vMin2 = getLowerLimitV(numericalCode,s2Mv,s4Mv,importance_Cate,rowRd,rowRo,permitted);
        var forceAmplification = getForceAmplification(importance_Cate,fa,_Sa02,rowNum, iefaSa02, iefvSa10, totalW);
        var ampHn = getAmpHn(forceAmplification, permitted);
        var vBaseShear = getBaseShear(rowRd, site, vMax, vMin, vMin2, permitted);
        var vAmp = getAmpBaseShear(rowNum, ampHn, vMaxRdRo ,vBaseShear,permitted);
        var vtotal = getFinalBaseShear(permitted, vAmp, totalW);
        var ft = getFt(permitted,taLoads, vtotal);



        var vMin_TaD = getMinLateralEarthquakeForce(sTaMv_TaD, importance_Cate, rowRd, rowRo, permitted);
        var vMax_TaD = getUpperLimitV(s_02, rowRd, importance_Cate, rowRo, permitted);
        var vMaxRdRo_TaD = getShearCorr(sTaMv_TaD,importance_Cate,permitted);
        var vMin2_TaD = getLowerLimitV(numericalCode,s2Mv,s4Mv,importance_Cate,rowRd,rowRo,permitted);
        var forceAmplification_TaD = getForceAmplification(importance_Cate,fa,_Sa02,rowNum, iefaSa02, iefvSa10, totalW);
        var ampHn_TaD = getAmpHn(forceAmplification_TaD, permitted);
        var vBaseShear_TaD = getBaseShear(rowRd, site, vMax_TaD, vMin_TaD, vMin2_TaD, permitted);
        var vAmp_TaD = getAmpBaseShear(rowNum, ampHn_TaD, vMaxRdRo_TaD ,vBaseShear_TaD,permitted);
        var vtotal_TaD = getFinalBaseShear(permitted, vAmp_TaD, totalW);
        var ft_TaD = getFt(permitted,taDeflections, vtotal_TaD);
        var vAmpDefl = getAmpBaseShear(rowNum, ampHn_TaD, vMaxRdRo_TaD ,vBaseShear_TaD,permitted);

        var multiDef = getMuitDeflection(permitted, vAmpDefl, vAmp);

        console.log("rowNum: "+rowNum);
        console.log("totalW: "+totalW);
        console.log("iefaSa02: "+iefaSa02);
        console.log("iefvSa10: "+iefvSa10);   
        console.log("vMin: "+vMin);
        console.log("vMax: "+vMax);
        console.log("vMaxRdRo: "+vMaxRdRo);
        console.log("vMn2: "+vMin2);
        console.log("forceAmplification: "+forceAmplification);
        console.log("ampHn: "+ampHn);
        console.log("vBaseShear: "+vBaseShear);
        console.log("vAmp: "+vAmp);
        console.log("vtotal: "+vtotal);
        console.log("ft: "+ft);
        console.log("j_Ta: "+j_Ta);
         var currVal= 0, prevVal = 0, sumVal = 0;
        //
        var sumHx =0;
        var sumHxWx = 0;
        var sumFxkN = 0;

        //var minLateralEarthquakeForce = getMinLateralEarthquakeForce();
        console.log("permitted: "+permitted);

        for( var i =0; i <= levelIndex; i++){
            // console.log("round1");
            hsm = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.levels()[i].hsM)));
            wkn = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.levels()[i].wkN)));
            currFloorCode = getFloorCode(hsm,permitted);

            //Sum totals
            sumHx += hsm;
            //finals
            currHx = getFinalHxm(currFloorCode,sumHx);
            currWxkN = getFinalWkN(currFloorCode,wkn);
            currHxWx = getFinalhxWx(currFloorCode,currHx, currWxkN);
            sumHxWx += currHxWx;

            round1[i] = setRound1(currFloorCode, currHx, currWxkN, currHxWx);
            
        }
        for(var i =0; i <= levelIndex; i++){
            // console.log("round2");
            sumFxkN += currFxkN;
            if( levelSize === 1){
                currFxkN = getFxkN(round1[i].currFloorCode, round1[i].currHxWx, 0, sumHxWx, ft, vtotal);
            }else if(i === levelSize){
                currFxkN = getFxkN(round1[i].currFloorCode, round1[i].currHxWx, 0, sumHxWx, ft, vtotal);
            }else if (i+1 < levelSize){
                currFxkN = getFxkN(round1[i].currFloorCode, round1[i].currHxWx, round1[i+1].currHxWx, sumHxWx, ft, vtotal);
            }

            round2[i] = setRound2(currFxkN);
            // console.log("round2[i]: "+round2[i]);
            // console.log("currFxkN: "+currFxkN);
        }
       currVxkN =0;
        for(var i = levelSize-1; i > -1; i--){
            console.log("round3");
            // if (levelSize === 1){
            //     sumVal += 0;
            //     currVxkN = getVxkN(round1[i].currFloorCode, sumVal);
            //     console.log("set 1");
            // }else if(i === levelIndex){
            //     console.log("set 2");
            //     sumVal += 0;
            //     currVxkN = getVxkN(round1[i].currFloorCode, sumVal);
            // }else if (i+1 <= levelIndex){
            //     console.log("set 3");
            //     sumVal += round2[i + 1].currFxkN;
            //     currVxkN = getVxkN(round1[i].currFloorCode, sumVal);
            // }
            if(round1[i].currFloorCode != 0)
                currVxkN += round2[i].currFxkN;

            console.log("currVxkN: "+currVxkN);
            round3[i] = setRound3(currVxkN);
            
        }
        for(var i= 0; i <= levelIndex;i++){
            console.log("round4");
            if( levelSize === 1){
                currVxhx = getVxhx(round1[i].currFloorCode, 0, round1[i].currHx, round3[i].currVxkN);
                currJx = getJx(round1[i].currFloorCode, totalW, j_Ta, round1[i].currHx);
            }else if(i === levelIndex){
                currVxhx = getVxhx(round1[i].currFloorCode, round1[i-1].currHx,round1[i].currHx, round3[i].currVxkN);
                currJx = getJx(round1[i].currFloorCode, totalW, j_Ta, round1[i].currHx);
            }
            // else if(i+1 < levelSize) {
            //     currVxhx = getVxhx(round1[i].currFloorCode, round1[i].currHx, round1[i+1].currHx, round3[i].currVxkN);
            //     currJx = getJx(round1[i].currFloorCode, totalW, j_Ta, round1[i].currHx);
            // }
            console.log("currVxhx: "+currVxhx);

            round4[i] =  setRound4(currVxhx, currJx);
            
        }
        var tmp =0;
        for(var i = levelIndex; i >= 0; i--){
            console.log("round5");
            if( levelSize === 1){
                currMx = getMx(round1[i].currFloorCode, round1[i].currHx, 0, 0, round4[i].currVxhx);
                currMxRed = getMxRedkNm(round1[i].currFloorCode, currMx, round4[i].currJx); 
            }else if(i === levelIndex){
                currMx = getMx(round1[i].currFloorCode, round1[i].currHx, 0, 0, round4[i].currVxhx);
                currMxRed = getMxRedkNm(round1[i].currFloorCode, currMx, round4[i].currJx);
            }else if (i+1 < levelSize){
                currMx = getMx(round1[i].currFloorCode, round1[i].currHx, round1[i+1].currHx, round5[i+1].currMx, round4[i].currVxhx);
                currMxRed = getMxRedkNm(round1[i].currFloorCode, currMx, round4[i].currJx);
            }
            tmp = i+1;
            console.log("rowNum: "+rowNum);
            if(rowNum < 12){
                currMxRed = "-";
            }
            round5[i] = setRound5(currMx,currMxRed);
            levels[i] = setValueDisplayArray(   round1[i].currFloorCode, tmp ,round1[i].currHx,round1[i].currWxkN,
                                                round1[i].currHxWx,round2[i].currFxkN,round3[i].currVxkN, 
                                                round4[i].currVxhx,currMx,round4[i].currJx,currMxRed);
        }
        var vvx = 0;
        var vvxhx = 0;
        var mmx = 0;
        var jjx = 0;
        var mmxred = 0;
        for(var i = 0; i < round2.length-1; i++){vvx += round2[i].currFxkN;}
        vvxhx = getVxhx(1, 0, round1[0].currHx, vvx);
        mmx = getMx(1, 0, round1[0].currHx, round5[0].currMx, vvxhx);
        jjx = getJx(1, totalW, j_Ta, 0);
        mmxred = getMxRedkNm(1, mmx, jjx);
        for (var i = levels.length-1; i > -1 ; i--) {
            if(i-1 != 0 && i > 0){
                //levels[i].vkn = levels[i-1].vkn;
                levels[i].mknm = levels[i-1].mknm;
                levels[i].j = levels[i-1].j;
                levels[i].mknmRed = levels[i-1].mknmRed;
            }else if(i === 0){
                //levels[i].vkn = vvx;
                levels[i].mknm = mmx;
                levels[i].j = jjx;
                if(rowNum < 12){
                    levels[i].mknmRed = "-";
                }else{
                    levels[i].mknmRed = mmxred;
                }
            }
        }
        setYObservables(viewModel, levels, totalW, permitted, vtotal, ft, sTaMv, taLoads, j_Ta, sTa, taDeflections,multiDef);

    }else{
        viewModel.yPermittedByNBC(permitted);
    }
}


function setYObservables(viewModel, levels, totalW, displayPermitted, vtotal, ft, sTaMv, taLoads, j_Ta, sTa,taDeflections, multiDef){
    "use strict";
    viewModel.totalWeight(totalW);
    //viewModel.permittedByNBC(displayPermitted);
    viewModel.baseShear(vtotal);
    viewModel.yFinalList(levels);

    viewModel.yTa(taLoads);
    viewModel.ySTa(sTa);
    viewModel.ySTaMv(sTaMv);
    viewModel.yJForTa(j_Ta);

    viewModel.topForce(roundVal(ft, 2));
    viewModel.yPeriodUsedTaDeflection(taDeflections);
    viewModel.yMultiForDeflection(multiDef);
}


function setValueDisplayArray(fcValue, lvlValue, hmValue, wknValue, hxwxValue, fknValue, vknValue, vxhxValue, mknmValue, jValue, mknmRedValue){
    "use strict";
    var choice = null;
    choice = {  floorCode: fcValue, 
                level: lvlValue, 
                hm: hmValue, 
                wkn: wknValue, 
                hxwx: hxwxValue, 
                fkn: fknValue, 
                vkn: vknValue, 
                mknm: mknmValue, 
                j: jValue, 
                mknmRed: mknmRedValue
            };
    return choice;
}

function ySetPermitted(viewModel, totalW, importance_Cate){
    "use strict";
    var restrictions = [0,0,0,0];
    var apIeFvSa10;
    var apIeFaSa02;
    var restrictionIeFvSa02;
    var displayPermitted = null;
    var finalRestriction = null;


    restrictions[0] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.lt02)));
    restrictions[1] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.gteq02lt035)));
    restrictions[2] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.gteq035lt075)));
    restrictions[3] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.gt075)));

    restrictionIeFvSa02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.gt03)));

    apIeFaSa02 = getAppRestrFASa02(viewModel.iefasa02,restrictions);
    apIeFvSa10 = getAppRestrFVSa10(viewModel.iefvsa10,restrictionIeFvSa02);

    finalRestriction = getFinalRestr(apIeFvSa10,apIeFaSa02,getCtgryChoice(importance_Cate));
    console.log(finalRestriction);
    displayPermitted = checkPermitted(totalW,finalRestriction);
    console.log(displayPermitted);
    return displayPermitted;
}

function xSetPermitted(viewModel, totalW, importance_Cate){
    "use strict";
    var restrictions = [0,0,0,0];
    var apIeFvSa10;
    var apIeFaSa02;
    var restrictionIeFvSa02;
    var displayPermitted = null;
    var finalRestriction = null;


    restrictions[0] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.lt02)));
    restrictions[1] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.gteq02lt035)));
    restrictions[2] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.gteq035lt075)));
    restrictions[3] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.gt075)));

    restrictionIeFvSa02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.gt03)));

    apIeFaSa02 = getAppRestrFASa02(viewModel.iefasa02,restrictions);
    apIeFvSa10 = getAppRestrFVSa10(viewModel.iefvsa10,restrictionIeFvSa02);

    finalRestriction = getFinalRestr(apIeFvSa10,apIeFaSa02,getCtgryChoice(importance_Cate));
    console.log(finalRestriction);
    displayPermitted = checkPermitted(totalW,finalRestriction);
    console.log(displayPermitted);
    return displayPermitted;
}