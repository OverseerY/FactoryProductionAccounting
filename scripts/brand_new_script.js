let myHeadersList = ["Цех", "Изделие", "Количество"];
let myHeadersList_perf = ["Цех", "Количество", "Станок"];
let myLabelsList = ["Начало", "Конец"];
let myWorkshopList = ["*"];
let myMachineList = ["*"];
let myProductList = ["*"];
let intervals_sec = [60, 300, 600, 900, 1200, 1800, 3600, 7200, 10800, 14400, 18000, 21600, 28800, 36000, 43200, 86400];
let big_intervals = [2592000, 31536000];
let global_start = 0;
let global_finish = 0;
let global_interval = 0;
let interval_index = 0;
let interval_text_value = "";


function ProductsAndTheirQuantity() {
    runMain();
}

function runMain() {
    let default_url = 'http://192.168.0.14:5005/?placeid=&starttime=0&endtime=&product=';
    loadJson(default_url, function (response) {
        mainFunction(response);
    });
}

function loadJson(url, callback) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function mainFunction(response) {
    let raw_array = JSON.parse(response);
    myWorkshopList = ["*"];
    buildTableWithData(raw_array);
    buildSelectors();
    removeUnusefulSelectors(0);
    redesignTable();
}

function buildTableWithData(data_array) {
    let table = document.createElement("table");
    table.setAttribute("id", "tableOfProducts");
    table.setAttribute("class", "display");

    let col = [];
    for (let i = 0; i < data_array.mydata.length; i++) {
        for (let key in data_array.mydata[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }

    let t_header = table.createTHead();
    let thr = t_header.insertRow(-1);
    for (let i = 0; i < col.length; i++) {
        let th = document.createElement("th");
        th.innerHTML = myHeadersList[i];
        thr.appendChild(th);
    }

    let t_body = table.createTBody();
    for (let i = 0; i < data_array.mydata.length; i++) {
        let tr = t_body.insertRow(-1);
        for (let j = (col.length - 1); j >= 0; j--) {
            let tabCell = tr.insertCell(-1);

            // Add unique names of workshops to array for later use in Select box
            if (!myWorkshopList.includes(data_array.mydata[i][col[2]])) {
                myWorkshopList.push(data_array.mydata[i][col[2]]);
            }

            // Add unique names of products to array for later use in Select box
            if (!myProductList.includes(data_array.mydata[i][col[1]])) {
                myProductList.push(data_array.mydata[i][col[1]]);
            }

            tabCell.innerHTML = data_array.mydata[i][col[j]];
        }
    }

    let divContainer = document.getElementById("showData");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
}

function buildSelectors() {
    createSelectBox("dropWorkshop", myWorkshopList, myHeadersList[0]);
    createSelectBox("dropProduct", myProductList, myHeadersList[1]);
    createSelectBox("dropMachine", myMachineList, myHeadersList_perf[2]);
    createDateTimePicker("dropDateStart", myLabelsList[0]);
    createDateTimePicker("dropDateFinish", myLabelsList[1]);
    createExecuteButton("btnShow");
    createExecuteButton("btnShowJibs");
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        setupModifiedTimepicker();
    }
}

function createSelectBox(elementId, itemsArray, labelText) {
    let select = document.getElementById(elementId);
    let selectBox = document.createElement("select");
    let label = document.createElement("label");
    for (let i = 0; i < itemsArray.length; i++) {
        let item = itemsArray[i];
        let option = document.createElement("option");
        option.textContent = item;
        option.value = item;
        selectBox.appendChild(option);
    }
    label.setAttribute("for", elementId);
    label.setAttribute("id", "label_" + elementId);
    label.innerHTML = labelText;
    selectBox.setAttribute("id", "_" + elementId);
    selectBox.addEventListener("change", function (ev) {
        //***
    });
    select.innerHTML = "";
    select.appendChild(label);
    select.appendChild(selectBox);
}

function createDateTimePicker(elementId, labelText) {
    let container = document.getElementById(elementId);
    let sub_container = document.createElement("div");
    let time_container = document.createElement("div");
    let datePicker = document.createElement("input");
    let timePicker = document.createElement("input");
    let label = document.createElement("label");

    sub_container.setAttribute("class", "custom-date-time");

    datePicker.setAttribute("id", "d_" + elementId)
    datePicker.setAttribute("type", "date");
    datePicker.min = "2018-11-01";
    datePicker.max = getCurrentDate(0,10);
    datePicker.addEventListener("change", function (ev) {
        //let date = new Date(datePicker.value);
        //console.log(date.getTime());
    });

    timePicker.setAttribute("id", "t_" + elementId)
    timePicker.setAttribute("type", "time");
    timePicker.setAttribute("class", "clockpicker");
    timePicker.addEventListener("change", function (ev) {
        let time = timePicker.value;
        console.log(time);
    });

    time_container.innerHTML = "";
    time_container.appendChild(timePicker);

    sub_container.innerHTML = "";
    sub_container.appendChild(datePicker);
    sub_container.appendChild(timePicker);

    label.setAttribute("for", elementId);
    label.innerHTML = labelText;
    container.innerHTML = "";
    container.appendChild(label);
    container.appendChild(sub_container);
}

function createExecuteButton(elementId) {
    let container = document.getElementById(elementId);
    let button = document.createElement("button");
    button.setAttribute("id", "_" + elementId);
    button.setAttribute("class", "custom-btn default");
    if (elementId === "btnShow") {
        button.addEventListener("click", function (ev) {
            applyParameters();
        });
    } else if (elementId === "btnShowJibs") {
        button.addEventListener("click", function (ev) {
            applyPerformanceParameters();
        });
    }
    button.innerHTML = "Применить";
    container.innerHTML = "";
    container.appendChild(button);
}

function getCurrentDate(start, finish) {
    let date = new Date();
    return date.toISOString().substring(start,finish);
}

function redesignTable() {
    $(document).ready(function () {
        $(document).ready(function () {
            $('#tableOfProducts').DataTable({
                "paging":   false,
                "info":     false,
                "searching": false
            });
        });
    });
}

function applyParameters() {
    loadJson(createUrl(), function (response) {
        let filtered_array = JSON.parse(response);
        buildTableWithData(filtered_array);
        redesignTable();
    });
}

function getCurrentValueOfDateField(elementId) {
    let dateField = document.getElementById(elementId);
    if (dateField.value !== "") {
        let millis = new Date(dateField.value);
        return millis.getTime()/1000;
    } else {
        return "";
    }
}

function getCurrentValueOfTimeField(elementId) {
    let timeField = document.getElementById(elementId);
    if (timeField.value !== "") {
        let hhs = timeField.value.toString().substring(0,2);
        let mms = timeField.value.toString().substring(3,5);
        return hhs * 3600 + mms * 60;
    } else {
        return "";
    }
}

function getCurrentValueOfWorkshopField(elementId) {
    let workshopField = document.getElementById(elementId);
    if (workshopField.value !== "*") {
        return workshopField.value;
    } else {
        return "";
    }
}

function getCurrentValueOfProductField(elementId) {
    let productField = document.getElementById(elementId);
    if (productField.value !== "*") {
        return productField.value;
    } else {
        return "";
    }
}

function getCurrentValueOfMachineField(elementId) {
    let machineField = document.getElementById(elementId);
    if (machineField.value !== "*") {
        return machineField.value;
    } else {
        return "";
    }
}

function combineDateAndTime(elementId) {
    let date_result = 0;
    let date_value = getCurrentValueOfDateField("d_" + elementId);
    let time_value = getCurrentValueOfTimeField("t_" + elementId);
    if (date_value !== "") {
        date_result += parseInt(date_value);
        if (time_value !== "") {
            date_result += parseInt(time_value);
        }
        date_result -= 21600;
    } else {
        date_result = (parseInt(getCurrentTimeAtMoment().toString().substring(0,10)));
    }

    return date_result;
}

function getCurrentTimeAtMoment() {
    let date = new Date();
    return date.getTime();
}

function createUrl() {
    let workshop = getCurrentValueOfWorkshopField("_dropWorkshop");
    let product = getCurrentValueOfProductField("_dropProduct");
    let begin = combineDateAndTime("dropDateStart");
    let end = combineDateAndTime("dropDateFinish");

    if (begin === end) {
        begin -= 86400;
    }

    //192.168.0.14 - production
    return 'http://192.168.0.14:5005/?placeid=' + workshop + '&starttime=' + begin + '&endtime=' + end + '&product=' + product;
}

//================ performance =====================

function PerformanceOfMachines() {
    runPerformance();
}

function runPerformance() {
    let default_url = 'http://192.168.0.14:5005/graphtotal?placeid=&roboid=&starttime=0&endtime=';
    loadJson(default_url, function (response) {
        performanceInit(response);
    });
}

function performanceInit(response) {
    let raw_array = JSON.parse(response);
    myWorkshopList = ["*"];
    buildTableOfPerformance(raw_array);
    buildSelectors();
    removeUnusefulSelectors(1);
    redesignPerfomanceTable();
}

function buildTableOfPerformance(data_array) {
    let table = document.createElement("table");
    table.setAttribute("id", "tableOfPerformance");
    table.setAttribute("class", "display");

    let col = [];
    for (let i = 0; i < data_array.mydata.length; i++) {
        for (let key in data_array.mydata[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }

    let t_header = table.createTHead();
    let thr = t_header.insertRow(-1);
    for (let i = 0; i < col.length; i++) {
        let th = document.createElement("th");
        if (i === 1) {
            th.innerHTML = myHeadersList_perf[2];
        } else if (i === 2) {
            th.innerHTML = myHeadersList_perf[1];
        } else {
            th.innerHTML = myHeadersList_perf[i];
        }
        thr.appendChild(th);
    }

    let t_body = table.createTBody();
    for (let i = 0; i < data_array.mydata.length; i++) {
        let tr = t_body.insertRow(-1);
        for (let j = 0; j < col.length; j++) {
            let tabCell = tr.insertCell(-1);

            // Add unique names of workshops to array for later use in Select box
            if (!myWorkshopList.includes(data_array.mydata[i][col[2]])) {
                myWorkshopList.push(data_array.mydata[i][col[2]]);
            }

            // Add unique names of workshops to array for later use in Select box
            if (!myMachineList.includes(data_array.mydata[i][col[0]])) {
                myMachineList.push(data_array.mydata[i][col[0]]);
            }

            if (j === 0) {
                tabCell.innerHTML = data_array.mydata[i][col[2]];
            } else if (j === 1) {
                tabCell.innerHTML = data_array.mydata[i][col[0]];
            } else {
                tabCell.innerHTML = data_array.mydata[i][col[1]];
            }
        }
    }

    let divContainer = document.getElementById("showData");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
}

function applyPerformanceParameters() {
    loadJson(createUrlForOperations(), function (response) {
        let filtered_array = JSON.parse(response);
        buildTableOfPerformance(filtered_array);
        redesignPerfomanceTable();
    });
}

function createUrlForOperations() {
    let workshop = getCurrentValueOfWorkshopField("_dropWorkshop");
    let machine = getCurrentValueOfMachineField("_dropMachine");
    let begin = combineDateAndTime("dropDateStart");
    let end = combineDateAndTime("dropDateFinish");

    if (begin === end) {
        begin -= 86400;
    }

    global_start = begin;
    global_finish = end;

    //192.168.0.14 - production
    return 'http://192.168.0.14:5005/graphtotal?placeid=' + workshop + '&roboid=' + machine + '&starttime=' + begin + '&endtime=' + end;
}

function removeUnusefulSelectors(flag) {
    if (flag === 1) {
        removeElement("_btnShow");
        removeElement("_dropProduct");
        removeElement("label_dropProduct");
    } else if (flag === 0) {
        removeElement("_btnShowJibs");
        removeElement("_dropMachine");
        removeElement("label_dropMachine");
    }
}

function removeElement(elementId) {
    let element = document.getElementById(elementId);
    if (element !== null) {
        element.parentNode.removeChild(element);
    }
}

function redesignPerfomanceTable() {
    $(document).ready(function () {
        $(document).ready(function () {
            let table = $('#tableOfPerformance').DataTable({
                "paging": false,
                "info": false,
                "searching": false
            });

            $('#tableOfPerformance tbody').on( 'click', 'tr', function () {
                let tr = $(this).closest('tr');
                let row = table.row( tr );

                if (row.child.isShown()) {
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    row.child(format(row.index())).show();
                    tr.addClass('shown');
                    //createButtonsForChartScale(row.index());
                    getOperationsForCurrentPosition(row.index(), row.data());
                }
            });
        });
    });
}

//================ charts =====================

function getRange(start, finish) {
    if (start === finish) {
        start -= 86400;
    }
    return (finish - start);
}

function getInterval(range) {
    if (range <= intervals_sec[1]) {
        global_interval = intervals_sec[0];
        interval_index = 0;
        interval_text_value = "1 мин.";
        return intervals_sec[0]; //1 min
    } else if (range <= intervals_sec[3] && range > intervals_sec[1]) {
        global_interval = intervals_sec[1];
        interval_index = 1;
        interval_text_value = "5 мин.";
        return intervals_sec[1]; //5 min
    } else if (range <= intervals_sec[5] && range > intervals_sec[3]) {
        global_interval = intervals_sec[2];
        interval_index = 2;
        interval_text_value = "10 мин.";
        return intervals_sec[2]; //10 min
    } else if (range <= intervals_sec[6] && range > intervals_sec[5]) {
        global_interval = intervals_sec[3];
        interval_index = 3;
        interval_text_value = "15 мин.";
        return intervals_sec[3]; //15 min
    } else if (range <= intervals_sec[7] && range > intervals_sec[6]) {
        global_interval = intervals_sec[4];
        interval_index = 4;
        interval_text_value = "20 мин.";
        return intervals_sec[4]; //20 min
    } else if (range <= intervals_sec[8] && range > intervals_sec[7]) {
        global_interval = intervals_sec[5];
        interval_index = 5;
        interval_text_value = "30 мин.";
        return intervals_sec[5]; //30 min
    } else if (range <= intervals_sec[14] && range > intervals_sec[8]) {
        global_interval = intervals_sec[6];
        interval_index = 6;
        interval_text_value = "1 ч.";
        return intervals_sec[6]; //1 h
    } else if (range <= intervals_sec[15] && range > intervals_sec[14]) {
        global_interval = intervals_sec[9];
        interval_index = 9;
        interval_text_value = "4 ч.";
        return intervals_sec[9]; //4 h
    } else if (range <= intervals_sec[15]*2 && range > intervals_sec[15]) {
        global_interval = intervals_sec[11];
        interval_index = 11;
        interval_text_value = "6 ч.";
        return intervals_sec[11]; //6 h
    } else if (range <= intervals_sec[15]*3 && range > intervals_sec[15]*2) {
        global_interval = intervals_sec[12];
        interval_index = 12;
        interval_text_value = "8 ч.";
        return intervals_sec[12]; //8 h
    } else if (range <= intervals_sec[15]*4 && range > intervals_sec[15]*3) {
        global_interval = intervals_sec[14];
        interval_index = 14;
        interval_text_value = "12 ч.";
        return intervals_sec[14]; //12 h
    } else if (range > intervals_sec[15]*4 && range <= big_intervals[0]) {
        global_interval = intervals_sec[15];
        interval_index = 15;
        interval_text_value = "1 день";
        return intervals_sec[15]; //1 day
    } else if (range > big_intervals[0] && range <= big_intervals[1]) {
        global_interval = big_intervals[0];
        return big_intervals[0];
    } else if (range > big_intervals[1]) {
        global_interval = big_intervals[1];
        return big_intervals[1];
    }
}

function getNumberOfIntervals(range, interval) {
    let number = range / interval;
    if (Math.round(number) < number) {
        return (Math.round(number) + 1);
    } else {
        return Math.round(number);
    }
}

function convertToDate(value) {
    value *= 1000;
    let date = new Date(value);

    let days = date.getDate();
    let months = date.getMonth() + 1;
    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    return(days + "/" + months + " " + hours + ":" + minutes);
}

function getLabels(intervals, interval, start, finish) {
    if (start === finish) {
        start -= 86400;
    }
    let labels_array = [];
    for (let i = 0; i < intervals; i++) {
        let value = start + interval*(i + 1);
        labels_array.push(convertToDate(value));
    }
    return labels_array;
}

function getOperationsForCurrentPosition(rowId, row_data) {
    if (row_data !== undefined) {
        let default_url = createUrlForCharts(row_data);
        console.log(default_url);
        console.log(global_start + " : " + global_finish);

        loadJson(default_url, function (response) {
            parseOperationsResponse(rowId, response);
        });
    }
}

function parseOperationsResponse(rowId, response) {
    let raw_array = JSON.parse(response);
    let parsed_array = parseArray(raw_array);

    let start = combineDateAndTime("dropDateStart");
    let finish = combineDateAndTime("dropDateFinish");
    let range = getRange(start, finish);
    let interval = getInterval(range);
    let intervals = getNumberOfIntervals(range, interval);

    let operations = scatterOperationsByIntervals(parsed_array[0], intervals, interval, start, finish);
    let labels = getLabels(intervals, interval, start, finish);

    addChartToContainer(rowId, operations, labels);
}

function parseArray(raw_array) {
    let operations_array = [];
    for (let i=0; i < raw_array.mydata.length; i++) {
        operations_array[i] = [];
        let str = raw_array.mydata[i].end_time[0].toString().substring(1).slice(0, -2);
        operations_array[i] = str.split(",  ");
    }
    return operations_array;
}

function scatterOperationsByIntervals(operations, intervals, interval, start, finish) {
    if (start === finish) {
        start -= 86400;
    }
    let operations_count = [];
    for (let i = 0; i < intervals; i++) {
        let counter = 0;
        let compare_value = start + interval * (i + 1);
        for (let j = 0; j < operations.length; j++) {
            if (operations[j] <= compare_value && operations[j] > (compare_value - interval)) {
                counter++;
            }
        }
        operations_count.push(counter);
    }
    return operations_count;
}

function createUrlForCharts(row_data) {
    let workshop = row_data[0];
    let machine = row_data[1];
    let begin = combineDateAndTime("dropDateStart");
    let end = combineDateAndTime("dropDateFinish");

    if (begin === end) {
        begin -= 86400;
    }

    global_start = begin;
    global_finish = end;

    return 'http://192.168.0.14:5005/graph?placeid=' + workshop + '&roboid=' + machine + '&starttime=' + begin + '&endtime=' + end;
}

function format( d ) {
    return '<div id="chartContainer'+d + '" class="chart-container" style="position: relative; width: 90%;">\n' +
        '</div>'
}

function buildChart(data_array, labels_array, canvas) {
    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels_array,
            datasets: [{
                label: 'кол-во операций',
                data: data_array,
                backgroundColor:
                    'rgba(255, 99, 132, 0.2)',
                borderColor:
                    'rgba(255,99,132,1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    },
                    scaleLabel: {
                        display:true,
                        labelString: 'Операции'
                    }
                }],
                xAxes: [{
                    gridLines: {
                        offsetGridLines: true
                    },
                    scaleLabel: {
                        display:true,
                        labelString: 'Интервал'
                    }
                }]
            }
        }
    });
}

function addChartToContainer(rowId, array_of_data, array_of_labels) {
    let div = document.getElementById("chartContainer" + rowId);
    let canvas = document.createElement("canvas");

    let subdiv = document.createElement("div");

    subdiv.setAttribute("class", "custom-container");

    let increaseButton = document.createElement("button");
    let decreaseButton = document.createElement("button");
    increaseButton.setAttribute("id", "incButton" + rowId);
    decreaseButton.setAttribute("id", "decButton" + rowId);
    increaseButton.setAttribute("class", "custom-chart");
    decreaseButton.setAttribute("class", "custom-chart");
    increaseButton.addEventListener("click", function (ev) {
        increaseInterval(this.id);
    });
    decreaseButton.addEventListener("click", function (ev) {
        decreaseInterval(this.id);
    });
    increaseButton.innerHTML = "Увеличить";
    decreaseButton.innerHTML = "Уменьшить";

    subdiv.innerHTML = "";
    subdiv.appendChild(increaseButton);
    subdiv.appendChild(decreaseButton);

    let myChart = buildChart(array_of_data, array_of_labels, canvas);

    div.innerHTML = "";
    div.appendChild(canvas);
    div.appendChild(subdiv);
}

function increaseInterval(value) {
    let row_index = value.substring(value.length-1, value.length);
    let x = document.getElementById(value).parentElement.parentElement.parentElement.parentElement.previousElementSibling.innerHTML;
    let variables_array = parseTableRow(x);

    if ((interval_index + 1) < intervals_sec.length) {
        interval_index += 1;
        global_interval = intervals_sec[interval_index];
    } else {
        alert("Максимальное значение инервала");
    }

    getOperationsForChartRebuilding(row_index, variables_array);
    //rebuildChartWithNewInterval(row_index);
}

function decreaseInterval(value) {
    let row_index = value.substring(value.length-1, value.length);
    let x = document.getElementById(value).parentElement.parentElement.parentElement.parentElement.previousElementSibling.innerHTML;
    let variables_array = parseTableRow(x);

    if ((interval_index - 1) >= 0) {
        interval_index -= 1;
        global_interval = intervals_sec[interval_index];
    } else {
        alert("Минимальное значение инервала");
    }

    getOperationsForChartRebuilding(row_index, variables_array);
    //rebuildChartWithNewInterval(row_index);
}

function rebuildChartWithNewInterval(rowId, response) {
    let raw_array = JSON.parse(response);
    let parsed_array = parseArray(raw_array);

    let range = getRange(global_start, global_finish);
    let intervals = getNumberOfIntervals(range, global_interval);

    let operations = scatterOperationsByIntervals(parsed_array[0], intervals, global_interval, global_start, global_finish);
    let labels = getLabels(intervals, global_interval, global_start, global_finish);

    addChartToContainer(rowId, operations, labels);
}

function parseTableRow(raw_string) {
    let str0 = raw_string.replace(" class=\"sorting_1\"", "");
    let str1 = str0.split(new RegExp('</*td>'));
    for (let i = 0; i < str1.length; i++) {
        if (str1[i] === "") {
            str1.splice(i, 1);
        }
    }
    console.log(str1);
    return str1;
}

function getOperationsForChartRebuilding(rowId, row_data) {
    let default_url = createUrlForCharts(row_data);
    console.log(default_url);

    loadJson(default_url, function (response) {
        rebuildChartWithNewInterval(rowId, response);
    });
}

function setupModifiedTimepicker() {
    $('.clockpicker').clockpicker({
        placement: 'top',
        align: 'left',
        donetext: 'Установить',
        'default': 'now'
    });
}
























