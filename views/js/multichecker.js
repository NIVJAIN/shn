$(function(){
  $("#group-checker-info-wrapper").scroll(function(){
    $("#group-checker-info-header-wrapper")
      .scrollLeft($("#group-checker-info-wrapper").scrollLeft());
  })
  $("#group-checker-datetime-wrapper").scroll(function(){
    $("#group-checker-info-wrapper")
      .scrollTop($("#group-checker-datetime-wrapper").scrollTop());
  })

  $("#group-checker-datetime-notch").click(function(){
    if ($("#group-checker-datetime-wrapper").hasClass("expanded")) {
      $("#group-checker-datetime-wrapper").removeClass("expanded");
      $("#group-checker-info-wrapper").removeClass("expanded");
    } else {
      $("#group-checker-datetime-wrapper").addClass("expanded");
      $("#group-checker-info-wrapper").addClass("expanded");
    }
  })
});

var multi_checker_day = document.getElementById("group-checker-day-range");
var multi_checker

var alert_multi_checker = document.getElementById("group-checker-alert");

var multi_checker_sort_datetime = "none";
var multi_checker_sort_pin = "none";
var multi_checker_sort_value = "none";

function sortMultiChecker(id, sort_datetime, sort_pin, sort_value) {
  var sort_symbol_asc = '<i class="fa fa-sort-asc" aria-hidden="true"></i>';
  var sort_symbol_desc = '<i class="fa fa-sort-desc" aria-hidden="true"></i>';
  var sort_symbol = '<i class="fa fa-sort" aria-hidden="true"></i>';

  if (sort_datetime) {
    multi_checker_sort_datetime = sort_datetime;
    if (sort_datetime == "asc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortMultiChecker(this.id, 'desc', false, false)`);
        document.getElementById(id).innerHTML
        = `Date Time ${sort_symbol_asc}`;
      }
    }
    else if (sort_datetime == "desc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortMultiChecker(this.id, 'none', false, false)`);
        document.getElementById(id).innerHTML
          = `Date Time ${sort_symbol_desc}`;
      }
    }
    else if (sort_datetime == "none") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortMultiChecker(this.id, 'asc', false, false)`);
        document.getElementById(id).innerHTML
          = `Date Time ${sort_symbol}`;
      }
    }
  }
  if (sort_pin) {
    multi_checker_sort_pin = sort_pin;
    if (sort_pin == "asc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortMultiChecker(this.id, false, 'desc', false)`),
        document.getElementById(id).innerHTML
          = `PIN ${sort_symbol_asc}`;
      }
    }
    else if (sort_pin == "desc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortMultiChecker(this.id, false, 'none', false)`),
        document.getElementById(id).innerHTML
          = `PIN ${sort_symbol_desc}`;
      }
    }
    else if (sort_pin == "none") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortMultiChecker(this.id, false, 'asc', false)`),
        document.getElementById(id).innerHTML
          = `PIN ${sort_symbol}`;
      }
    }
  }
  if (sort_value) {
    multi_checker_sort_value = sort_value;
    if (sort_value == "asc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortMultiChecker(this.id, false, false, 'desc')`),
        document.getElementById(id).innerHTML
          = `Value ${sort_symbol_asc}`;
      }
    }
    else if (sort_value == "desc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortMultiChecker(this.id, false, false, 'none')`),
        document.getElementById(id).innerHTML
          = `Value ${sort_symbol_desc}`;
      }
    }
    else if (sort_value == "none") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortMultiChecker(this.id, false, false, 'asc')`),
        document.getElementById(id).innerHTML
          = `Value ${sort_symbol}`;
      }
    }
  }
  var array = sortMultiCheckerArray();
  if (id) {
    rebuildMultiCheckerRows(array);
  } else {
    return array;
  }
}

function sortMultiCheckerArray() {
  var array = getMultiCheckerArray();
  var sort_key = [];
  var sort_order = [];
  if (multi_checker_sort_datetime != "none") {
    sort_key.unshift("ts");
    sort_order.unshift(multi_checker_sort_datetime);
  }
  if (multi_checker_sort_value != "none") {
    sort_key.unshift("value");
    sort_order.unshift(multi_checker_sort_value);
  }
  if (multi_checker_sort_pin != "none") {
    sort_key.unshift("pin");
    sort_order.unshift(multi_checker_sort_pin);
  }
  console.log('sort_key', sort_key);
  console.log('sort_order', sort_order);
  return _.orderBy(array, sort_key, sort_order);
}

var multi_checker_prev_type = "";

var multi_checker_types
  = ['Type', 'Distance', 'Altitude', 'Wellness', 'Biometric', 'Account'];
var multi_checker_type = "Type";
var multi_checker_array_dist = [];
var multi_checker_array_alti = [];
var multi_checker_array_well = [];
var multi_checker_array_bio = [];
var multi_checker_array_acct = [];

function changeMultiCheckerType(id) {
  var index = multi_checker_types.indexOf(multi_checker_type);
  index = (index + 1) % multi_checker_types.length;
  multi_checker_type = multi_checker_types[index];
  document.getElementById(id).innerHTML = multi_checker_type;
  var array = sortMultiCheckerArray();
  rebuildMultiCheckerRows(array);
}

function rebuildMultiCheckerRows(array) {
  var rows_datetime = `<div class="col-12 px-1 py-0">&nbsp;</div>`;
  var rows_info = `<div class="col-12 px-1 py-0">&nbsp;</div>`;

  document.getElementById("group-checker-datetime").innerHTML = rows_datetime,
  document.getElementById("group-checker-info").innerHTML = rows_info;

  rows_datetime = rows_info = "";

  var row_count = array.length;
  for (i = 0; i < row_count; i++) {
    var datetime = array[i].datetime;
    rows_datetime += `<div class="col-12 px-1 py-0">${datetime}</div>`;
    var pin = array[i].pin;
    rows_info += `<div class="col-2 px-1 py-0">${pin}</div>`;
    var type = array[i].type;
    rows_info += `<div class="col-2 px-1 py-0">${type}</div>`;
    var value = array[i].value;
    var remarks = array[i].remarks;
    var status = "";
    if (type == "Distance" || type == "Altitude") {
      value = value.toFixed(1) + 'm';
    }
    else if (type == "Wellness") {
      status = (value >= 38) ? "status-fail" : "status-pass";
      remarks = (remarks != '-') ? `${remarks}.` : remarks;
      value = value + '°C';
    }
    if (remarks == "Fail" || remarks == "Mock" || value == "Fail" || value == "Suspended") {
      status = "status-fail";
    }
    else if (remarks == "Pass" || value == "Pass") {
      status = "status-pass";
    }
    else if (value == "Activated") { status = "status-amber"; }
    rows_info += `<div class="col-2 px-1 py-0 ${status}">${value}</div>`;
    rows_info += `<div class="col-6 px-1 py-0">${remarks}</div>`;
  }
  rows_datetime += `<div class="col-12 px-1 py-0">&nbsp;</div>`;
  rows_info += `<div class="col-12 px-1 py-0">&nbsp;</div>`;

  document.getElementById("group-checker-datetime").innerHTML = rows_datetime,
  document.getElementById("group-checker-info").innerHTML = rows_info;
  if (row_count == 0) {
    warningAlert(alert_multi_checker, "Nothing to display.", 3500);
  } else {
    successAlert(alert_multi_checker, "Successfully generated.", 3500);
  }
}

function getMultiChecker() {
  var orgid = localStorage.getItem("orgid");
  if (orgid && orgid != null && orgid != "") {
    var days = multi_checker_day.value;
    var url_get = "https://www.locationreport.gov.sg/novel/get";
    var url = `${url_get}/${days}/${orgid}`;
    getReqCallbackWithParmAuth(url, days, processMultiChecker);
  }
}

function clearMultiCheckerArrays() {
  multi_checker_array_dist.length
    = multi_checker_array_alti.length = multi_checker_array_well.length
    = multi_checker_array_bio.length = multi_checker_array_acct.length = 0;
}

function consoleMultiCheckerArrays() {
  console.log("multi_checker_array_dist length:", multi_checker_array_dist.length);
  console.log("multi_checker_array_alti length:", multi_checker_array_alti.length);
  console.log("multi_checker_array_bio length:", multi_checker_array_bio.length);
  console.log("multi_checker_array_well length:", multi_checker_array_well.length);
  console.log("multi_checker_array_acct length:", multi_checker_array_acct.length);
}

function processMultiChecker(result, days) {
  clearMultiCheckerArrays();
  consoleMultiCheckerArrays();
  days = moment().subtract(days, "days").format("DD/MM/YYYY");
  console.log(days);
  days = moment(days, "DD/MM/YYYY").valueOf();
  var results = result.message;
  var length = results.length;
  for (i = 0; i < length; i++) {
    var pin = results[i].pin;

    var trk = results[i].trk;
    if (trk && trk != undefined) {
      processTrk(trk, pin, days);
    }
    /*
    var biopush = results[i].biopush;
    if (biopush && biopush != undefined) {
      processBiopush(biopush, pin, days);
    }
    */
    var bioupdate = results[i].bioupdate;
    if (bioupdate && bioupdate != undefined) {
      processBioupdate(bioupdate, pin, days);
    }
    
    var susbiotrk = results[i].susbiotrk;
    if (susbiotrk && susbiotrk != undefined) {
      processSusbiotrk(susbiotrk, pin, days);
    }
  }
  sortMultiChecker("group-checker-info-datetime", 'desc', false, false);
}

function processSusbiotrk(susbiotrk, pin, threshold) {
  var last_index = susbiotrk.length - 1;
  for (j = last_index; j >= 0; j--) {
    var ts = susbiotrk[j].ts;
    if (ts < threshold) {
      j = -1;
    } else {
      var object = {
        "ts": ts,
        "datetime": moment(ts).format("DD MMM hh:mma"),
        "pin": pin
      }
      var value = susbiotrk[j].isbiometric;
      if (value != "NA" && value != undefined) {
        object.type = "Biometric";
        object.value = (value == "true") ? "Activated" : "Suspended";
        object.remarks = "-";
        multi_checker_array_bio.push(object);
      } 
      value = susbiotrk[j].issuspended;
      if (value != "NA" && value != undefined) {
        object.type = "Account";
        object.value = (value == "false") ? "Activated" : "Suspended";
        object.remarks = "-";
        multi_checker_array_acct.push(object);
      }
    }
  }
}

function processBioupdate(bioupdate, pin, threshold) {
  var last_index = bioupdate.length - 1;
  for (j = last_index; j >= 0; j--) {
    var ts = bioupdate[j].ts;
    ts = parseInt(ts);
    if (ts == NaN) {
      ts = ts.split('-');
      ts = parseInt(ts[0]);
    }
    if (ts < threshold) {
      j = -1;
    } else {
      var object = {
        "ts": ts,
        "datetime": moment(ts).format("DD MMM hh:mma"),
        "pin": pin,
        "type": "Biometric",
        "remarks": "Update"
      }
      object["value"] = (bioupdate[j].status == 1) ? "Pass" : "Fail";
      multi_checker_array_bio.push(object);
    }
  }
}

function processTrk(trk, pin, threshold) {
  var last_index = trk.length - 1;
  for (j = last_index; j >= 0; j--) {
    var ts = trk[j].ts;
    if (ts < threshold) {
      j = -1;
    } else {
      var object = {
        "ts": ts,
        "datetime": moment(ts).format("DD MMM hh:mma"),
        "pin": pin
      }
      temp = trk[j].temp;
      if (temp != "NA") {
        object.type = "Wellness";
        object.value = temp;
        var remarks = trk[j].symptoms.split(',').join(', ');
        object.remarks = (remarks == "") ? '-' : remarks;
        multi_checker_array_well.push(object);
      } else {
        var dist = parseFloat(trk[j].dist);
        object.type = "Distance";
        object.value = dist;
        object.remarks = (trk[j].source == "mock") ? "Mock" : (trk[j].pf == "pass") ? "Pass" : "Fail"
        multi_checker_array_dist.push(object);
        var alti = trk[j].appalt || trk[j].altitude;
        if (alti != "NA" && alti != null) {
          alti = parseFloat(alti);
          var object = {
            "ts": ts,
            "datetime": moment(ts).format("DD MMM hh:mma"),
            "pin": pin,
            "type": "Altitude",
            "value": alti,
            "remarks": (trk[j].source == "mock") ? "Mock" : (trk[j].pf == "pass") ? "Pass" : "Fail"
          }
          multi_checker_array_alti.push(object);
        }
      }
    }
  }
}

function getMultiCheckerArray() {
  switch(multi_checker_type) {
    case "Distance":
      return multi_checker_array_dist;
    case "Altitude":
      return multi_checker_array_alti;
    case "Wellness":
      return multi_checker_array_well;
    case "Biometric":
      return multi_checker_array_bio;
    case "Account":
      return multi_checker_array_acct;
    default:
    case "Type":
      return [].concat(multi_checker_array_dist)
               .concat(multi_checker_array_alti)
               .concat(multi_checker_array_well)
               .concat(multi_checker_array_bio)
               .concat(multi_checker_array_acct);
  }
}

function downloadMultiCheckerCSV() {
  var array = sortMultiChecker("", false, false, false);
  var length = array.length;
  if (length == 0) {
    errorAlert(alert_multi_checker, `Error: Empty CSV document.`, 3500);
    return;
  } else {
    successAlert(alert_multi_checker, 'Initiating download...', 3500);
  }

  var str = `Date Time,PIN,${multi_checker_type},Value,Remarks`;
  str += '\n';
  for (i = 0; i < length; i++) {
    str += moment(array[i].ts).format("DD/MM/YYYY HH:mm:ss");
    str += ',';
    str += array[i].pin;
    str += ',';
    var type = array[i].type;
    str += type + ',';
    var value = array[i].value;
    if (type == "Distance" || type == "Altitude") {
      value = parseFloat(value).toFixed(1) + 'm';
    }
    else if (type == "Wellness") {
      value = parseFloat(value).toFixed(1) + '°C';
    }
    str += value + ',';
    str += array[i].remarks;
    str += '\n';
  }
  str = str.replace(/,\r\n/g,'\n');

  var orgid = localStorage.getItem('orgid');
  var fileName = `SHNQO_${orgid}_${dateToday()}_${multi_checker_day.value}.csv`;
  var uriData = 'data:text/csv;charset=UTF-8,' + str;
  downloadFile(fileName, uriData);
}