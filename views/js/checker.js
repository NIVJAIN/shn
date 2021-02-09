$(function(){
  $("#individual-checker-info-wrapper").scroll(function(){
    $("#individual-checker-info-header-wrapper")
      .scrollLeft($("#individual-checker-info-wrapper").scrollLeft());
  })
  $("#individual-checker-datetime-wrapper").scroll(function(){
    $("#individual-checker-info-wrapper")
      .scrollTop($("#individual-checker-datetime-wrapper").scrollTop());
  })

  $("#individual-checker-datetime-notch").click(function(){
    if ($("#individual-checker-datetime-wrapper").hasClass("expanded")) {
      $("#individual-checker-datetime-wrapper").removeClass("expanded");
      $("#individual-checker-info-wrapper").removeClass("expanded");
    } else {
      $("#individual-checker-datetime-wrapper").addClass("expanded");
      $("#individual-checker-info-wrapper").addClass("expanded");
    }
  })
});

var individual_checker_day = document.getElementById("individual-checker-day-range");
var individual_checker_user = document.getElementById("individual-checker-user");
var alert_individual_checker = document.getElementById("individual-checker-alert");

var individual_checker_sort_datetime = "none";
var individual_checker_sort_pin = "none";
var individual_checker_sort_value = "none";

function sortIndividualChecker(id, sort_datetime, sort_pin, sort_value) {
  var sort_symbol_asc = '<i class="fa fa-sort-asc" aria-hidden="true"></i>';
  var sort_symbol_desc = '<i class="fa fa-sort-desc" aria-hidden="true"></i>';
  var sort_symbol = '<i class="fa fa-sort" aria-hidden="true"></i>';

  if (sort_datetime) {
    individual_checker_sort_datetime = sort_datetime;
    if (sort_datetime == "asc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortIndividualChecker(this.id, 'desc', false, false)`),
        document.getElementById(id).innerHTML
          = `Date Time ${sort_symbol_asc}`;
      }
    }
    else if (sort_datetime == "desc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortIndividualChecker(this.id, 'none', false, false)`),
        document.getElementById(id).innerHTML
          = `Date Time ${sort_symbol_desc}`;
      }
    }
    else if (sort_datetime == "none") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortIndividualChecker(this.id, 'asc', false, false)`),
        document.getElementById(id).innerHTML
          = `Date Time ${sort_symbol}`;
      }
    }
  }
  if (sort_pin) {
    individual_checker_sort_pin = sort_pin;
    if (sort_pin == "asc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortIndividualChecker(this.id, false, 'desc', false)`),
        document.getElementById(id).innerHTML
          = `PIN ${sort_symbol_asc}`;
      }
    }
    else if (sort_pin == "desc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortIndividualChecker(this.id, false, 'none', false)`),
        document.getElementById(id).innerHTML
          = `PIN ${sort_symbol_desc}`;
      }
    }
    else if (sort_pin == "none") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortIndividualChecker(this.id, false, 'asc', false)`),
        document.getElementById(id).innerHTML
          = `PIN ${sort_symbol}`;
      }
    }
  }
  if (sort_value) {
    individual_checker_sort_value = sort_value;
    if (sort_value == "asc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortIndividualChecker(this.id, false, false, 'desc')`),
        document.getElementById(id).innerHTML
          = `Value ${sort_symbol_asc}`;
      }
    }
    else if (sort_value == "desc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortIndividualChecker(this.id, false, false, 'none')`),
        document.getElementById(id).innerHTML
          = `Value ${sort_symbol_desc}`;
      }
    }
    else if (sort_value == "none") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
          `sortIndividualChecker(this.id, false, false, 'asc')`),
        document.getElementById(id).innerHTML
          = `Value ${sort_symbol}`;
      }
    }
  }
  var array = sortIndividualCheckerArray();
  if (id) {
    rebuildIndividualCheckerRows(array);
  } else {
    return array;
  }
}

function sortIndividualCheckerArray() {
  var array = getIndividualCheckerArray();
  var sort_key = [];
  var sort_order = [];
  if (individual_checker_sort_datetime != "none") {
    sort_key.unshift("ts");
    sort_order.unshift(individual_checker_sort_datetime);
  }
  if (individual_checker_sort_value != "none") {
    sort_key.unshift("value");
    sort_order.unshift(individual_checker_sort_value);
  }
  if (individual_checker_sort_pin != "none") {
    sort_key.unshift("pin");
    sort_order.unshift(individual_checker_sort_pin);
  }
  console.log('sort_key', sort_key);
  console.log('sort_order', sort_order);
  return _.orderBy(array, sort_key, sort_order);
}

var individual_checker_prev_type = "";

var individual_checker_types
  = ['Type', 'Distance', 'Altitude', 'Wellness', 'Biometric', 'Account'];
var individual_checker_type = "Type";
var individual_checker_array_dist = [];
var individual_checker_array_alti = [];
var individual_checker_array_well = [];
var individual_checker_array_bio = [];
var individual_checker_array_acct = [];

function changeIndividualCheckerType(id) {
  var index = individual_checker_types.indexOf(individual_checker_type);
  index = (index + 1) % individual_checker_types.length;
  individual_checker_type = individual_checker_types[index];
  document.getElementById(id).innerHTML = individual_checker_type;
  var array = sortIndividualCheckerArray();
  rebuildIndividualCheckerRows(array);
}

function rebuildIndividualCheckerRows(array) {
  var rows_datetime = `<div class="col-12 px-1 py-0">&nbsp;</div>`;
  var rows_info = `<div class="col-12 px-1 py-0">&nbsp;</div>`;

  document.getElementById("individual-checker-datetime").innerHTML = rows_datetime,
  document.getElementById("individual-checker-info").innerHTML = rows_info;

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

  document.getElementById("individual-checker-datetime").innerHTML = rows_datetime,
  document.getElementById("individual-checker-info").innerHTML = rows_info;
  if (row_count == 0) {
    warningAlert(alert_individual_checker, "Nothing to display.", 3500);
  } else {
    successAlert(alert_individual_checker, "Successfully generated.", 3500);
  }
}

function setIndividualCheckerUser(pin) {
  individual_checker_user.value = pin;
}

function getIndividualCheckerByUser() {
  var user = individual_checker_user.value;
  console.log("user", user);
  if (user == "") {
    errorAlert(alert_individual_checker, "Error: Empty PIN/Mobile field.", 3500);
    return;
  }
  if (user.length < 8) {
    errorAlert(alert_individual_checker, "Error: Invalid PIN/Mobile length.", 3500);
    return;
  }
  var test = user.split('');
  var length = test.length;
  var numbers = /^[0-9]+$/;
  var letters = /^[A-Z]+$/;

  if (test[length - 1].match(letters) && test[length - 2].match(letters)
  && test[length - 5].match(letters) && test[length - 6].match(letters)) {
    getIndividualChecker(user);
  }
  else if (test[length - 1].match(numbers) && test[length - 2].match(numbers)
  && test[length - 5].match(numbers) && test[length - 6].match(numbers)) {
    var mobile = (user.length > 8) ? user : `65${user}`;
    var url = `https://www.locationreport.gov.sg/novel/getallmobile/${mobile}`
    getReqCallbackAuth(url, getIndividualCheckerByMobile);
  } else {
    errorAlert(alert_individual_checker, "Error: Invalid characters.", 3500);
    return;
  }
}

function getIndividualCheckerByMobile(result) {
  result = result.message;
  if (result.length == 0) {
    errorAlert(alert_individual_checker, "Error: PIN cannot be retrieved by mobile number.", 3500);
  } else {
    warningAlert(alert_individual_checker, "Please wait...", false);
    var pin = result[0].pin;
    individual_checker_user.value = pin;
    getIndividualChecker(pin);
  }
}

function getIndividualChecker(pin) {
  var orgid = localStorage.getItem("orgid");
  if (orgid && orgid != null && orgid != "") {
    var days = individual_checker_day.value;
    var url_get = "https://www.locationreport.gov.sg/novel/get";
    var url = `${url_get}/${days}/${orgid}/${pin}`;
    getReqCallbackWithParmAuth(url, days, processIndividualChecker);
  }
}

function clearIndividualCheckerArrays() {
  individual_checker_array_dist.length
    = individual_checker_array_alti.length = individual_checker_array_well.length
    = individual_checker_array_bio.length = individual_checker_array_acct.length = 0;
}

function consoleIndividualCheckerArrays() {
  console.log("individual_checker_array_dist length:", individual_checker_array_dist.length);
  console.log("individual_checker_array_alti length:", individual_checker_array_alti.length);
  console.log("individual_checker_array_bio length:", individual_checker_array_bio.length);
  console.log("individual_checker_array_well length:", individual_checker_array_well.length);
  console.log("individual_checker_array_acct length:", individual_checker_array_acct.length);
}

function processIndividualChecker(result, days) {
  clearIndividualCheckerArrays();
  consoleIndividualCheckerArrays();
  days = moment().subtract(days, "days").format("DD/MM/YYYY");
  console.log(days);
  days = moment(days, "DD/MM/YYYY").valueOf();
  var results = result.message;
  var length = results.length;
  if (length == 0) {
    errorAlert(alert_individual_checker, "Error: No available info of PIN.", 3500);
    return;
  }
  for (i = 0; i < length; i++) {
    var pin = results[i].pin;

    var trk = results[i].trk;
    if (trk && trk != undefined) {
      processIndividualTrk(trk, pin, days);
    }

    var biopush = results[i].biopush;
    if (biopush && biopush != undefined) {
      processIndividualBiopush(biopush, pin, days);
    }

    var bioupdate = results[i].bioupdate;
    if (bioupdate && bioupdate != undefined) {
      processIndividualBioupdate(bioupdate, pin, days);
    }
    
    var susbiotrk = results[i].susbiotrk;
    if (susbiotrk && susbiotrk != undefined) {
      processIndividualSusbiotrk(susbiotrk, pin, days);
    }
  }
  sortIndividualChecker("individual-checker-info-datetime", 'desc', false, false);
}

function processIndividualSusbiotrk(susbiotrk, pin, threshold) {
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
        individual_checker_array_bio.push(object);
      } 
      value = susbiotrk[j].issuspended;
      if (value != "NA" && value != undefined) {
        object.type = "Account";
        object.value = (value == "false") ? "Activated" : "Suspended";
        object.remarks = "-";
        individual_checker_array_acct.push(object);
      }
    }
  }
}

function processIndividualBioupdate(bioupdate, pin, threshold) {
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
      individual_checker_array_bio.push(object);
    }
  }
}

function processIndividualBiopush(biopush, pin, threshold) {
  var last_index = biopush.length - 1;
  for (j = last_index; j >= 0; j--) {
    var ts = biopush[j].ts;
    if (ts < threshold) {
      j = -1;
    } else {
      var object = {
        "ts": ts,
        "datetime": moment(ts).format("DD MMM hh:mma"),
        "pin": pin,
        "type": "Biometric",
        "remarks": "Push"
      }
      object["value"] = (biopush[j].status == "pass") ? "Pass" : "Fail";
      individual_checker_array_bio.push(object);
    }
  }
}

function processIndividualTrk(trk, pin, threshold) {
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
        individual_checker_array_well.push(object);
      } else {
        var dist = parseFloat(trk[j].dist);
        object.type = "Distance";
        object.value = dist;
        object.remarks = (trk[j].source == "mock") ? "Mock" : (trk[j].pf == "pass") ? "Pass" : "Fail"
        individual_checker_array_dist.push(object);
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
          individual_checker_array_alti.push(object);
        }
      }
    }
  }
}

function getIndividualCheckerArray() {
  switch(individual_checker_type) {
    case "Distance":
      return individual_checker_array_dist;
    case "Altitude":
      return individual_checker_array_alti;
    case "Wellness":
      return individual_checker_array_well;
    case "Biometric":
      return individual_checker_array_bio;
    case "Account":
      return individual_checker_array_acct;
    default:
    case "Type":
      return [].concat(individual_checker_array_dist)
               .concat(individual_checker_array_alti)
               .concat(individual_checker_array_well)
               .concat(individual_checker_array_bio)
               .concat(individual_checker_array_acct);
  }
}

function downloadIndividualCheckerCSV() {
  var array = sortIndividualChecker("", false, false, false);
  var length = array.length;
  if (length == 0) {
    errorAlert(alert_individual_checker, `Error: Empty CSV document.`, 3500);
    return;
  } else {
    successAlert(alert_individual_checker, 'Initiating download...', 3500);
  }

  var str = `Date Time,PIN,${individual_checker_type},Value,Remarks`;
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

  var pin = individual_checker_user.value;
  var fileName = `SHNQO_${pin}_${dateToday()}_${individual_checker_day.value}.csv`;
  var uriData = 'data:text/csv;charset=UTF-8,' + str;
  downloadFile(fileName, uriData);
}