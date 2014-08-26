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
        
        vm.xFinalList().reverse();
        vm.yFinalList().reverse();

        // var data1 = window.localStorage.getItem(vmKeys.seismicScreen2);
        // var screen2vm = ko.mapping.fromJSON(data1);
        // var vm1 = new screen3ViewModel(screen2vm);
        // ko.applyBindings(vm1);
        
        var data = window.localStorage.getItem(vmKeys.seismicScreen2);
        var screen2vm = ko.mapping.fromJSON(data);
        var vm = new screen3ViewModel(screen2vm);
        calculations(vm,true);
        calculations(vm,false);


        $("#div-basic-footer").addClass("hidden");
        $("#a-save").unbind()
                    .removeAttr("data-bind");
        $("#div-footer-with-email").removeClass("hidden");
    }
    else
    {
        var data = window.localStorage.getItem(vmKeys.seismicScreen2);
        var screen2vm = ko.mapping.fromJSON(data);
        var vm = new screen3ViewModel(screen2vm);
        calculations(vm,true);
        calculations(vm,false);

        $("#div-basic-footer").addClass("hidden");
        $("#div-footer-with-save").removeClass("hidden");
    }

    processGraphValues(vm);
    renderGraph(vm);
    bindUI(vm);
    ko.applyBindings(vm);
}

function roundValue(number, decimals)
{
    if(number == undefined)
        return;

    if(ko.isObservable(number))
        number = number();

    if(isNaN(parseFloat(number)) && isFinite(number))
        return number;

    if(!decimals)
    {
        decimals = 1;
    }
    var newnumber = new Number(number + '').toFixed(parseInt(decimals));
    var result = parseFloat(newnumber);
    
    if(isNaN(result))
        result = "-";

    return result;
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

function renderGraph(viewModel) {
    var xgraph = $.jqplot("xgraph", [viewModel.xDottedGraph(), viewModel.xSolidGraph(), [viewModel.xIntersection()]],
                        {
                            series: [
                                {
                                    color: '#214e77',
                                    linePattern: 'dashed',
                                    showMarker: false,
                                },
                                {
                                    color: '#214e77',
                                    showMarker: false,
                                },
                                {
                                    color: '#ff0000'
                                }
                            ],
                            axes: {
                                xaxis: {
                                    min: 0,
                                    max: 5,
                                    tickInterval: 0.5,
                                    label: "Period, T (s)",
                                },
                                yaxis: {
                                    labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                                    min: 0,
                                    label: "Mod. Design Spectral Acc. S(T) Mv(g)"
                                }
                            }
                        });

    var ygraph = $.jqplot("ygraph", [viewModel.yDottedGraph(), viewModel.ySolidGraph(), [viewModel.yIntersection()]],
                        {
                            series: [
                                {
                                    color: '#214e77',
                                    linePattern: 'dashed',
                                    showMarker: false,
                                },
                                {
                                    color: '#214e77',
                                    showMarker: false,
                                },
                                {
                                    color: '#ff0000'
                                }
                            ],
                            axes: {
                                xaxis: {
                                    min: 0,
                                    max: 5,
                                    tickInterval: 0.5,
                                    label: "Period, T (s)",
                                },
                                yaxis: {
                                    labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                                    min: 0,
                                    label: "Mod. Design Spectral Acc. S(T) Mv(g)"
                                }
                            }
                        });
}

function processGraphValues(viewModel) {

    // X
    var xDottedLineT = viewModel.xDottedLineT();
    for(var i = 0; i < xDottedLineT.length; i++)
    {
        var x = viewModel.xDottedLineT()[i];
        var y = viewModel.xDottedLineSTMv()[i];
        viewModel.xDottedGraph.push([x, y]);
    }

    var xSolidLineT = viewModel.xFinalT();
    for(var i = 0; i < xSolidLineT.length; i++)
    {
        var x = viewModel.xFinalT()[i];
        var y = viewModel.xFinalSTMv()[i];
        viewModel.xSolidGraph.push([x, y]);
    }

    // Y
    viewModel.yMaxStMv = 0;
    
    var yDottedLineT = viewModel.yDottedLineT();
    for(var i = 0; i < xDottedLineT.length; i++)
    {
        var x = viewModel.yDottedLineT()[i];
        var y = viewModel.yDottedLineSTMv()[i];
        viewModel.yDottedGraph.push([x, y]);
    }

    var ySolidLineT = viewModel.yFinalT();
    for(var i = 0; i < ySolidLineT.length; i++)
    {
        var x = viewModel.yFinalT()[i];
        var y = viewModel.yFinalSTMv()[i];
        viewModel.ySolidGraph.push([x, y]);
    }
}

function calculations(viewModel, xORy){
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
    var buildHeight;
    var sTaMv;
    var sTa;
    var totalW;
    var rowRo;
    var rowRd;
    var rowNum;
    var importance_Cate;
    var s_02;
    var s02Mv,s05Mv,s1Mv,s2Mv,s4Mv;
    var numericalCode;
    var iefaSa02;
    var iefvSa10;
    var site;
    var taLoads;
    var taDeflections;
    var j_Ta;
    var j_Ta_TaD;
    var sTaMv_TaD;
    var fa;
    var fv;
    var _Sa02;
    var graphVal;

    buildHeight = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.buildHeight)));
    totalW = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.sumOfWkM)));
    importance_Cate =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.importanceCategory.value)));
    iefaSa02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.iefasa02)));
    iefvSa10 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.iefvsa10)));
    site = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.siteValue)));
    fa = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.fa)));
    fv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.fv)));
    _Sa02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel._Sa02)));

    if(iefaSa02 <= 0.12)
    {
        viewModel.showSAMessage(true);
    }

    // if calculations are for x
    if(xORy){
    
        sTaMv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xSTaMv)));
        sTa = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xSTa)));
        rowRo =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.Ro)));
        rowRd =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.Rd)));
        rowNum =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.RowNum)));   
        s_02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xS_02)));

        s4Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xS4Mv)));  
        s2Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xS2Mv)));
        s1Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xS1Mv)));  
        s02Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xS02Mv)));
        s05Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xS05Mv)));  

        numericalCode = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.NumericalCode)));
        taLoads = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xTa)));
        taDeflections = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xTaDeflections)));
        j_Ta = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xJforTa)));
        j_Ta_TaD = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xJForTa_TaD)));
        sTaMv_TaD = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.xSTaMv_TaD)));
    
        if(rowNum > 11)
        {
            viewModel.showXOtherSFRSMessage(true);
        }

    }else{
        // if calculations are for y

        sTaMv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.ySTaMv)));
        sTa = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.ySTa)));
        rowRo =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.Ro)));
        rowRd =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.Rd)));
        rowNum =  parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.RowNum)));   
        s_02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yS_02)));

        s4Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yS4Mv)));
        s2Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yS2Mv)));
        s1Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yS1Mv)));
        s02Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yS02Mv)));
        s05Mv = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yS05Mv)));

        numericalCode = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.NumericalCode)));  
        taLoads = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yTa)));
        taDeflections = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yTaDeflections)));
        j_Ta = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yJforTa)));
        j_Ta_TaD = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.yJForTa_TaD)));
        sTaMv_TaD = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.ySTaMv_TaD)));

        if(rowNum > 11)
        {
            viewModel.showYOtherSFRSMessage(true);
        }
    }


    // new calculated values
    var permitted = null;
    if(xORy){
        permitted = xSetPermitted(viewModel, buildHeight, importance_Cate,rowNum);
    }else{
        permitted = ySetPermitted(viewModel, buildHeight, importance_Cate,rowNum);
    }
    if(permitted){
        var vMin = getMinLateralEarthquakeForce(sTaMv, importance_Cate, rowRd, rowRo, permitted);
        var vMax = getUpperLimitV(s_02, rowRd, importance_Cate, rowRo, permitted);
        var vMaxRdRo = getShearCorr(sTaMv,importance_Cate,permitted);
        var vMin2 = getLowerLimitV(numericalCode,s2Mv,s4Mv,importance_Cate,rowRd,rowRo,permitted);
        var forceAmplification = getForceAmplification(importance_Cate,fa,_Sa02,rowNum, iefaSa02, iefvSa10, buildHeight);
        var ampHn = getAmpHn(forceAmplification, permitted);
        var vBaseShear = getBaseShear(rowRd, site, vMax, vMin, vMin2, permitted);
        var vAmp = getAmpBaseShear(rowNum, ampHn, vMaxRdRo ,vBaseShear,permitted);
        var vtotal = getVTotal(permitted, vAmp, totalW);
        var ft = getFt(permitted,taLoads, vtotal);

        var vMin_TaD = getMinLateralEarthquakeForce(sTaMv_TaD, importance_Cate, rowRd, rowRo, permitted);
        var vMax_TaD = getUpperLimitV(s_02, rowRd, importance_Cate, rowRo, permitted);
        var vMaxRdRo_TaD = getShearCorr(sTaMv_TaD,importance_Cate,permitted);
        var vMin2_TaD = getLowerLimitV(numericalCode,s2Mv,s4Mv,importance_Cate,rowRd,rowRo,permitted);
        var forceAmplification_TaD = getForceAmplification(importance_Cate,fa,_Sa02,rowNum, iefaSa02, iefvSa10, buildHeight);
        var ampHn_TaD = getAmpHn(forceAmplification_TaD, permitted);
        var vBaseShear_TaD = getBaseShear(rowRd, site, vMax_TaD, vMin_TaD, vMin2_TaD, permitted);
        var vAmp_TaD = getAmpBaseShear(rowNum, ampHn_TaD, vMaxRdRo_TaD ,vBaseShear_TaD,permitted);
        var vtotal_TaD = getVTotal(permitted, vAmp_TaD, totalW);
        var ft_TaD = getFt(permitted,taDeflections, vtotal_TaD);
        var vAmpDefl = getAmpBaseShear(rowNum, ampHn_TaD, vMaxRdRo_TaD ,vBaseShear_TaD,permitted);

        var multiDef = getMuitDeflection(permitted, vAmpDefl, vAmp);

        var currVal= 0, prevVal = 0, sumVal = 0;
        
        var sumHx =0;
        var sumHxWx = 0;
        var sumFxkN = 0;

        
        console.log("permitted: "+permitted);

        for( var i =0; i <= levelIndex; i++){
            
            hsm = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.levels()[levelIndex - i].hsM)));
            wkn = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.levels()[levelIndex - i].wkN)));
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
            }else if(i === levelIndex){
                currFxkN = getFxkN(round1[i].currFloorCode, round1[i].currHxWx, 0, sumHxWx, ft, vtotal);
            }else if (i+1 < levelSize){
                currFxkN = getFxkN(round1[i].currFloorCode, round1[i].currHxWx, round1[i+1].currHxWx, sumHxWx, ft, vtotal);
            }

            round2[i] = setRound2(currFxkN);
          
        }
        currVxkN = 0;
        for(var i = levelSize-1; i > -1; i--){
            console.log("round3");
           
            if(round1[i].currFloorCode != 0)
                currVxkN += round2[i].currFxkN;

            console.log("currVxkN: "+currVxkN);
            round3[i] = setRound3(currVxkN);
            
        }
        for(var i= 0; i <= levelIndex;i++){
            console.log("round4");
            if( levelSize === 1 && i === 0){
                currVxhx = getVxhx(round1[i].currFloorCode, 0, round1[i].currHx, round3[i].currVxkN);
                currJx = getJx(round1[i].currFloorCode, buildHeight, j_Ta, 0);
        
            }if(i === 0 ){
                currVxhx = getVxhx(round1[i].currFloorCode, 0, round1[i].currHx, round3[i].currVxkN);
                currJx = getJx(round1[i].currFloorCode, buildHeight, j_Ta, 0);
            }else{
                currVxhx = getVxhx(round1[i].currFloorCode, round1[i-1].currHx, round1[i].currHx, round3[i].currVxkN);
                currJx = getJx(round1[i].currFloorCode, buildHeight, j_Ta, round1[i-1].currHx);
            }
           

            round4[i] =  setRound4(currVxhx, currJx);
            
        }
        var tmp =0;
        for(var i = levelIndex; i >= 0; i--){
            console.log("round5");
            if( levelSize === 1){
                currMx = getMx(round1[i].currFloorCode, round1[i].currHx, 0, 0, round4[i].currVxhx);
                currMxRed = getMxRedkNm(round1[i].currFloorCode, currMx, round4[i].currJx); 
            }else if(i === levelIndex){
                currMx = getMx(round1[i].currFloorCode, round1[i].currHx, round1[i-1].currHx, 0, round4[i].currVxhx);
                currMxRed = getMxRedkNm(round1[i].currFloorCode, currMx, round4[i].currJx);
            }else if (i+1 < levelSize){
                currMx = getMx(round1[i].currFloorCode, round1[i].currHx, round1[i+1].currHx, round5[i+1].currMx, round4[i].currVxhx);
                currMxRed = getMxRedkNm(round1[i].currFloorCode, currMx, round4[i].currJx);
            }
            tmp = i+1;
          
            if(rowNum < 12){
                currMxRed = "-";
            }
            round5[i] = setRound5(currMx,currMxRed);
            levels[i] = setValueDisplayArray(   round1[i].currFloorCode, tmp ,round1[i].currHx,round1[i].currWxkN,
                                                round1[i].currHxWx,round2[i].currFxkN,round3[i].currVxkN, 
                                                round4[i].currVxhx,currMx,round4[i].currJx,currMxRed);
        }
        
        if(xORy){
            setXObservables(viewModel, levels, totalW, permitted, vtotal, ft, sTaMv, taLoads, j_Ta, sTa, taDeflections,multiDef);
        }else{
            setYObservables(viewModel, levels, totalW, permitted, vtotal, ft, sTaMv, taLoads, j_Ta, sTa, taDeflections,multiDef);
        }
        createGraph(xORy, viewModel, rowRd, rowRo, importance_Cate, vAmp, vMax, site, s02Mv, s05Mv, s1Mv, s2Mv, s4Mv, taLoads, permitted);
    }else{
        if(xORy){
             //viewModel.xPermittedByNBC(permitted);
             setFailedXObservables(viewModel, totalW, permitted, sTaMv, taLoads, j_Ta, sTa,taDeflections)
         }else{
             //viewModel.yPermittedByNBC(permitted);
             setFailedYObservables(viewModel, totalW, permitted, sTaMv, taLoads, j_Ta, sTa,taDeflections)
         }
         createGraph(xORy, viewModel, rowRd, rowRo, importance_Cate, 0, 0, site, s02Mv, s05Mv, s1Mv, s2Mv, s4Mv, taLoads, permitted);
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
    viewModel.xPermittedByNBC(displayPermitted);
    viewModel.xBaseShear(vtotal);
    viewModel.xFinalList(levels);

    viewModel.xTa(taLoads);
    viewModel.xSTa(sTa);
    viewModel.xSTaMv(sTaMv);
    viewModel.xJForTa(j_Ta);

    viewModel.xTopForce(roundVal(ft, 2));
    viewModel.xPeriodUsedTaDeflection(taDeflections);
    viewModel.xMultiForDeflection(multiDef);
}

function setFailedXObservables(viewModel, totalW, displayPermitted, sTaMv, taLoads, j_Ta, sTa,taDeflections){
    "use strict"
    viewModel.totalWeight(totalW);
    viewModel.xPermittedByNBC(displayPermitted);

    viewModel.xBaseShear(0);
    viewModel.xTopForce(0);
    viewModel.xMultiForDeflection(0);

    viewModel.xTa(taLoads);
    viewModel.xSTa(sTa);
    viewModel.xSTaMv(sTaMv);
    viewModel.xJForTa(j_Ta);

    viewModel.xPeriodUsedTaDeflection(taDeflections);
    // viewModel.xMultiForDeflection(multiDef);
}
function setFailedYObservables(viewModel, totalW, displayPermitted, sTaMv, taLoads, j_Ta, sTa,taDeflections){
    "use strict"
    viewModel.totalWeight(totalW);
    viewModel.yPermittedByNBC(displayPermitted);
    
    viewModel.yBaseShear(0);
    viewModel.yTopForce(0);
    viewModel.yMultiForDeflection(0);

    viewModel.yTa(taLoads);
    viewModel.ySTa(sTa);
    viewModel.ySTaMv(sTaMv);
    viewModel.yJForTa(j_Ta);

    viewModel.yPeriodUsedTaDeflection(taDeflections);
}


function setYObservables(viewModel, levels, totalW, displayPermitted, vtotal, ft, sTaMv, taLoads, j_Ta, sTa,taDeflections, multiDef){
    "use strict";
    viewModel.totalWeight(totalW);
    viewModel.yPermittedByNBC(displayPermitted);
    viewModel.yBaseShear(vtotal);
    viewModel.yFinalList(levels);

    viewModel.yTa(taLoads);
    viewModel.ySTa(sTa);
    viewModel.ySTaMv(sTaMv);
    viewModel.yJForTa(j_Ta);

    viewModel.yTopForce(roundVal(ft, 2));
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

function ySetPermitted(viewModel, totalW, importance_Cate, rowNum){
    "use strict";
    var restrictions = [0,0,0,0];
    var apIeFvSa10;
    var apIeFaSa02;
    var restrictionIeFvSa02;
    var displayPermitted = null;
    var finalRestriction = null;
    var ieFASA = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.iefasa02)));
    var ieFVSA = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.iefvsa10)));

    restrictions[0] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.lt02)));
    restrictions[1] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.gteq02lt035)));
    restrictions[2] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.gteq035lt075)));
    restrictions[3] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.gt075)));

    restrictionIeFvSa02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.ySelectedSFRS.gt03)));

    apIeFaSa02 = getAppRestrFASa02(ieFASA,restrictions);
    apIeFvSa10 = getAppRestrFVSa10(ieFVSA,restrictionIeFvSa02);

    finalRestriction = getFinalRestr(apIeFvSa10,apIeFaSa02,getCtgryChoice(importance_Cate,rowNum));
    console.log(finalRestriction);
    displayPermitted = checkPermitted(totalW,finalRestriction);
    console.log(displayPermitted);
    return displayPermitted;
}

function xSetPermitted(viewModel, totalW, importance_Cate, rowNum){
    "use strict";
    var restrictions = [0,0,0,0];
    var apIeFvSa10;
    var apIeFaSa02;
    var restrictionIeFvSa02;
    var displayPermitted = null;
    var finalRestriction = null;
    var ieFASA = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.iefasa02)));
    var ieFVSA = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.iefvsa10)));

    restrictions[0] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.lt02)));
    restrictions[1] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.gteq02lt035)));
    restrictions[2] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.gteq035lt075)));
    restrictions[3] = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.gt075)));

    restrictionIeFvSa02 = parseFloat(JSON.parse(ko.toJSON(viewModel.screen2ViewModel.screen1ViewModel.xSelectedSFRS.gt03)));

    apIeFaSa02 = getAppRestrFASa02(ieFASA,restrictions);
    apIeFvSa10 = getAppRestrFVSa10(ieFVSA,restrictionIeFvSa02);

    finalRestriction = getFinalRestr(apIeFvSa10,apIeFaSa02,getCtgryChoice(importance_Cate,rowNum));
    console.log(finalRestriction);
    displayPermitted = checkPermitted(totalW,finalRestriction);
    console.log(displayPermitted);
    return displayPermitted;
}
/*  X-axis - >  dottedLineT
                finalT

    Y-axis - >  dottedLineSTMv
                finalSTMv
*/
function createGraph(xORy, viewModel, rd, ro, ie, vAmp, vMax, choiceSiteProperty, s02Mv, s05Mv, s1Mv, s2Mv, s4Mv, taLoads,permitted){
    "use strict"
    var graphSet1Val = [2];
    var limitLine;
    var graphSet3Val;
    var graphSet4Val = [3];
    var intersection = [2];
    var dottedLineT = [4];
    var dottedLineSTMv = [4];
    var finalT = [10];
    var finalSTMv = [10];
    var choice = [5];
    var s02Mv_cg = s02Mv*permitted;
    var s05Mv_cg = s05Mv*permitted;
    var s1Mv_cg = s1Mv*permitted;
    var s2Mv_cg = s2Mv*permitted;
    var s4Mv_cg = s4Mv*permitted;


    graphSet1Val = graphSet1(rd,ro,ie,vAmp,vMax);
    limitLine = graphSet2LimitLine(rd,choiceSiteProperty);
    graphSet3Val = graphSet3(limitLine); 
    graphSet4Val[0] = graphSet4Intersection(graphSet1Val, limitLine, s02Mv_cg, s05Mv_cg, 0);
    graphSet4Val[1] = graphSet4Intersection(graphSet1Val, limitLine, s05Mv_cg, s1Mv_cg, 1);
    graphSet4Val[2] = graphSet4Intersection(graphSet1Val, limitLine, s1Mv_cg, s2Mv_cg, 2);
    intersection[0] = taLoads;
    intersection[1] = graphSet1Val[0];
    dottedLineT = graphDottedLineT(limitLine,graphSet4Val[0], graphSet4Val[1], graphSet4Val[2]);
    dottedLineSTMv = graphDottedLineSTMv(s02Mv_cg, s05Mv_cg, s1Mv_cg, graphSet4Val[1], graphSet4Val[2], graphSet1Val);
    finalT = graphFinalT(graphSet4Val[0], graphSet4Val[1], graphSet4Val[2]);
    finalSTMv = graphFinalSTMv(limitLine,graphSet1Val, graphSet4Val[1], graphSet4Val[2], s02Mv_cg, s05Mv_cg, s1Mv_cg, s2Mv_cg, s4Mv_cg);
    
    setGraph(xORy, viewModel, intersection, dottedLineT, dottedLineSTMv, finalT, finalSTMv);
}

function setGraph(xORy, viewModel, intersection, dottedLineT, dottedLineSTMv, finalT, finalSTMv){
    "use strict"
    if(xORy){
        viewModel.xIntersection(intersection);
        viewModel.xDottedLineT(dottedLineT);
        viewModel.xDottedLineSTMv(dottedLineSTMv);
        viewModel.xFinalT(finalT);
        viewModel.xFinalSTMv(finalSTMv);
    } else {
        viewModel.yIntersection(intersection);
        viewModel.yDottedLineT(dottedLineT);
        viewModel.yDottedLineSTMv(dottedLineSTMv);
        viewModel.yFinalT(finalT);
        viewModel.yFinalSTMv(finalSTMv);
    }
}


function graphSet1(rd,ro,ie,vAmp,vMax){
    "use strict"
    var choice = [0.0, 0.0];
    choice[0] = vAmp*rd*ro/ie;
    choice[1] = vMax*rd*ro/ie;
    return choice;
}

function graphSet2LimitLine(rd,choiceSiteProperty){
    "use strict"
    var choice = 0.0;
    if(rd >= 1.5 && choiceSiteProperty < 5){
        choice = 1;
    }else {
        choice = 0;
    }
    return choice;
}

function graphSet3(graphSet2Val){
    "use strict"
    var choice;
    choice = Math.max((graphSet2Val+1),6);
    return choice;
}

function graphSet4Intersection( graphSet1Val, graphSet2Val,sMv_1,sMv_2, pick){
    "use strict"
    var choice = 0.0;
    var op1 = [0.5, 1.0, 2.0];
    var op2 = [0.3, 0.5, 1.0];
    if(graphSet1Val[1]<=sMv_1 && graphSet1Val[1]>=sMv_2){
        choice = op1[pick]-(graphSet1Val[1]-sMv_2)/(sMv_1-sMv_2)*op2[pick];
    }else {
        choice = 0.0;
    }

    choice = choice *graphSet2Val;
    return choice;
}

function graphIntersection(val1, val2, val3){
    "use strict"
    var choice = 0.0;
    choice = Math.max(val1,val2,val3);
    return choice;
}

function graphDottedLineT(graphSet2Val,intersec1,intersec2,intersec3){
    "use strict"
    var choice = [0.0, 0.0, 0.0, 0.0, 0.0];
    choice[1] = graphSet2Val * 0.2;

    //choice [4] must be calculated first
    choice[4] = Math.max(intersec1,intersec2,intersec3)*graphSet2Val;

    if(intersec3>0){
        choice[2] = Math.min(0.5,choice[4]);
    } else {
        choice[2] = Math.min(choice[4],0.5*graphSet2Val);
    }

    if(intersec3>0){
        choice[3] = Math.min(1.0,choice[4]);
    } else {
        choice[3] = Math.min(choice[4],1.0*graphSet2Val);
    }

    return choice;
}

function graphDottedLineSTMv(s02Mv, s05Mv, s1Mv, intersec2, intersec3, graphSet1Val){
    "use strict"
    var choice = [0.0, 0.0, 0.0, 0.0, 0.0];
    choice[0] = s02Mv; 
    choice[1] = s02Mv;

    if(intersec2 > 0){
        choice[2] = s05Mv;
    }else{
        if(intersec3>0){
            choice[2] = s05Mv;
        }else{
            choice[2] = graphSet1Val[1];
        }
    }

    if(intersec3>0){
        choice[3] = s1Mv;
    } else {
        choice[3] = graphSet1Val[1];
    }

    choice[4] = graphSet1Val[1];

    return choice;
}

function graphFinalT(intersec1, intersec2, intersec3){
    "use strict"
    var choice = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    choice[1] = 0.2;
    choice[3] = 0.5;
    choice[5] = 1.0;
    choice[7] = 2.0;
    choice[8] = 4.0;
    choice[9] = 6.0;

    if(intersec1 > 0){
        choice[2] = intersec1;
    } else {
        choice[2] = 0.2;
    }

    if(intersec2 > 0){
        choice[4] = intersec2;
    } else {
        choice[4] = 1;
    }

    if(intersec3>0){
        choice[6] = intersec3;
    } else {
        choice[6] = 2.0;
    }

    return choice;
}

function graphFinalSTMv(graphSet2Val,graphSet1Val, intersec2, intersec3, s02Mv, s05Mv, s1Mv, s2Mv, s4Mv){
    "use strict"
    var choice = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    var i =0;

    if(graphSet2Val==1){
        choice[0] = Math.min(s02Mv,graphSet1Val[1]);
    } else {
        choice[0] = s02Mv;
    }

    if(graphSet2Val==1){
        choice[1] = Math.min(s02Mv,graphSet1Val[1]);
    } else {
        choice[1] = s02Mv;
    }

    if(graphSet2Val==1){
        choice[2] = Math.min(s02Mv,graphSet1Val[1]);
    } else {
        choice[2] = s02Mv;
    }

    if(graphSet2Val==1){
        choice[3] = Math.min(s05Mv,graphSet1Val[1]);
    } else {
        choice[3] = s05Mv;
    }

    choice[5] = Math.min(s1Mv,graphSet1Val[1]);

    choice[7] = Math.min(s2Mv,graphSet1Val[1]);

    choice[8] = Math.min(s4Mv,graphSet1Val[1]);

    choice[9] = Math.min(s4Mv,graphSet1Val[1]);

    if(intersec2>0){
        choice[4] = Math.max(s1Mv,graphSet1Val[1]);
    } else { 
        choice[4] = choice[5]; 
    }

    if(intersec3 > 0){
        choice[6] = Math.max(s2Mv,graphSet1Val[1]);
    } else {
        choice[6] = choice[7];
    }

    return choice;
}