$(function(){
  $("#trigger-info-wrapper").scroll(function(){
    $("#trigger-info-header-wrapper")
      .scrollLeft($("#trigger-info-wrapper").scrollLeft());
  })
  $("#trigger-pin-wrapper").scroll(function(){
    $("#trigger-info-wrapper")
      .scrollTop($("#trigger-pin-wrapper").scrollTop());
  })

  $("#trigger-notch").click(function(){
    if ($("#trigger-pin-wrapper").hasClass("expanded")) {
      $("#trigger-pin-wrapper").removeClass("expanded");
      $("#trigger-info-wrapper").removeClass("expanded");
    } else {
      $("#trigger-pin-wrapper").addClass("expanded");
      $("#trigger-info-wrapper").addClass("expanded");
    }
  })
});

function loadTrigger(orgid) {
  var url = `https://www.locationreport.gov.sg/virusrip/novel/getbiometric/${orgid}`;
  getReqCallbackAuth(url, loadAndSortTriggerDetails);
}

function refreshTrigger() {
  var orgid = localStorage.getItem('orgid');
  var url = `https://www.locationreport.gov.sg/virusrip/novel/getbiometric/${orgid}`;
  getReqCallbackAuth(url, refreshTriggerDetails);
}

var trigger_details = [];
var trigger_details_filtered = [];

function loadAndSortTriggerDetails(result) {
  loadTriggerDetails(result);
  if (trigger_details.length > 0) {
    sortTriggerDetails("trigger-info-pin", "asc", false, false, false);
  }
}

function refreshTriggerDetails(result) {
  trigger_details.length = 0;
  loadTriggerDetails(result);
  if (trigger_details.length > 0) {
    sortTriggerDetails(true, false, false, false, false);
  }
}

function loadTriggerDetails(result) {
  result = result.message;
  if (result.includes("invalid request")) {
    return;
  }
  if (result.length < 1) {
    return;
  } else {
    var length = result.length;
    for (i = 0; i < length; i++) {
      var trigger_detail = {
        "pin": result[i].pin,
        "mobile": result[i].mobile,
        "start": moment(result[i].loastart, "DD/MM/YYYY").valueOf(),
        "start_str": result[i].loastart.trim(),
        "end": moment(result[i].loaend, "DD/MM/YYYY").valueOf(),
        "end_str": result[i].loaend.trim(),
        "expired": result[i].expiry,
        "suspended": result[i].issuspended,
        "multilogin": result[i].multilogin,
        "wellness": result[i].showtemperature,
        "biometric": result[i].isbiometric,
        "adhocpush": "false",
        "heartbeat": "false",
        "frsm": "false"
      }
      trigger_details.push(trigger_detail);
    }
  }
}

var trigger_sort_pin = "none";
var trigger_sort_mobile = "none";
var trigger_sort_start = "none";
var trigger_sort_end = "none";

var trigger_filter_pin = document.getElementById("trigger-pin-filter");
var trigger_filter_mobile = document.getElementById("trigger-mobile-filter");
var trigger_filter_start = document.getElementById("trigger-start-filter");
var trigger_filter_end = document.getElementById("trigger-end-filter");

function sortTriggerDetails(id, sort_pin, sort_mobile, sort_start, sort_end) {
  var sort_symbol_asc = '<i class="fa fa-sort-asc" aria-hidden="true"></i>';
  var sort_symbol_desc = '<i class="fa fa-sort-desc" aria-hidden="true"></i>';
  var sort_symbol = '<i class="fa fa-sort" aria-hidden="true"></i>';

  if (sort_pin) {
    trigger_sort_pin = sort_pin;
    if (sort_pin == "asc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, 'desc', false, false, false)`),
        document.getElementById(id).innerHTML
          = `PIN ${sort_symbol_asc}`;
      }
    }
    else if (sort_pin == "desc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, 'none', false, false, false)`),
        document.getElementById(id).innerHTML
          = `PIN ${sort_symbol_desc}`;
      }
    }
    else if (sort_pin == "none") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, 'asc', false, false, false)`),
        document.getElementById(id).innerHTML
          = `PIN ${sort_symbol}`;
      }
    }
  }

  if (sort_mobile) {
    trigger_sort_mobile = sort_mobile;
    if (sort_mobile == "asc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, false, 'desc', false, false)`),
        document.getElementById(id).innerHTML
          = `Mobile ${sort_symbol_asc}`;
      }
    }
    else if (sort_mobile == "desc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, false, 'none', false, false)`),
        document.getElementById(id).innerHTML
          = `Mobile ${sort_symbol_desc}`;
      }
    }
    else if (sort_mobile == "none") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, false, 'asc', false, false)`),
        document.getElementById(id).innerHTML
          = `Mobile ${sort_symbol}`;
      }
    }
  }
  
  if (sort_start) {
    trigger_sort_start = sort_start;
    if (sort_start == "asc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, false, false, 'desc', false)`),
        document.getElementById(id).innerHTML
          = `SHN Start ${sort_symbol_asc}`;
      }
    }
    else if (sort_start == "desc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, false, false, 'none', false)`),
        document.getElementById(id).innerHTML
          = `SHN Start ${sort_symbol_desc}`;
      }
    }
    else if (sort_start == "none") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, false, false, 'asc', false)`),
        document.getElementById(id).innerHTML
          = `SHN Start ${sort_symbol}`;
      }
    }
  }
  
  if (sort_end) {
    trigger_sort_end = sort_end;
    if (sort_end == "asc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, false, false, false, 'desc')`),
        document.getElementById(id).innerHTML
          = `SHN End ${sort_symbol_asc}`;
      }
    }
    else if (sort_end == "desc") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, false, false, false, 'none')`),
        document.getElementById(id).innerHTML
          = `SHN End ${sort_symbol_desc}`;
      }
    }
    else if (sort_end == "none") {
      if (id) {
        document.getElementById(id).setAttribute('onclick',
        `sortTriggerDetails(this.id, false, false, false, 'asc')`),
        document.getElementById(id).innerHTML
          = `SHN End ${sort_symbol}`;
      }
    }
  }
  sortTriggerDetailsArray();
  if (id) {
    rebuildTriggerDetailsRows();
  } else {
    return trigger_details;
  }
}

function sortTriggerDetailsArray() {
  var sort_key = [];
  var sort_order = [];
  if (trigger_sort_pin != "none") {
    sort_key.unshift("pin");
    sort_order.unshift(trigger_sort_pin);
  }
  if (trigger_sort_mobile != "none") {
    sort_key.unshift("mobile");
    sort_order.unshift(trigger_sort_mobile);
  }
  if (trigger_sort_start != "none") {
    sort_key.unshift("start");
    sort_order.unshift(trigger_sort_start);
  }
  if (trigger_sort_end != "none") {
    sort_key.unshift("end");
    sort_order.unshift(trigger_sort_end);
  }
  console.log('sort_key', sort_key);
  console.log('sort_order', sort_order);

  trigger_details = _.orderBy(trigger_details, sort_key, sort_order);
}

function filterTriggerDetails() {
  var filter_pin = trigger_filter_pin.value;
  var filter_mobile = trigger_filter_mobile.value;
  var filter_start = trigger_filter_start.value;
  var filter_end = trigger_filter_end.value;

  trigger_details_filtered.length = 0;
  trigger_details_filtered = trigger_details_filtered.concat(trigger_details);

  if (filter_pin == "" && filter_mobile == ""
  && filter_start == "" && filter_end == "") {
    return trigger_details_filtered;
  }

  if (filter_pin != "" && trigger_details_filtered.length > 0) {
    trigger_details_filtered = _.filter(trigger_details_filtered, function(item) {
      return item.pin.indexOf(filter_pin) > -1;
    });
  }
  if (filter_mobile != "" && trigger_details_filtered.length > 0) {
    trigger_details_filtered = _.filter(trigger_details_filtered, function(item) {
      return item.mobile.indexOf(filter_mobile) > -1;
    });
  }
  if (filter_start != "" && trigger_details_filtered.length > 0) {
    trigger_details_filtered = _.filter(trigger_details_filtered, function(item) {
      return item.start_str.indexOf(filter_start) > -1;
    });
  }
  if (filter_end != "" && trigger_details_filtered.length > 0) {
    trigger_details_filtered = _.filter(trigger_details_filtered, function(item) {
      return item.end_str.indexOf(filter_end) > -1;
    });
  }
  return trigger_details_filtered;
}

var trigger_pin_content = document.getElementById('trigger-pin');
var trigger_info_content = document.getElementById('trigger-info');

var trigger_suspended = [];
var trigger_non_suspended = [];
var trigger_multilogin = [];
var trigger_non_multilogin = [];
var trigger_biometric = [];
var trigger_non_biometric = [];
var trigger_wellness = [];
var trigger_non_wellness = [];

var trigger_adhocpush = [];
var trigger_heartbeat = [];
var trigger_frsm = [];

function rebuildTriggerDetailsRows() {
  var array = filterTriggerDetails();
  var length = array.length;

  var rows_pin = "";
  var rows_info = "";

  for (i = 0; i < length; i++) {
    var pin = array[i].pin;
    var mobile = array[i].mobile;
    var start = array[i].start_str;
    var end = array[i].end_str;
    var expired = array[i].expired;
    expired = (expired == "true") ? "<span class='status-fail'>Yes</span>" :
    "<span class='status-pass'>No</span>";
    var suspended = array[i].suspended;
    suspended = (suspended == "true")
    ? "<input type='checkbox' checked " : "<input type='checkbox' ";
    suspended += `onclick="(this.checked)
    ? pinArraysPushSplice('${pin}', trigger_suspended, trigger_non_suspended)
    : pinArraysPushSplice('${pin}', trigger_non_suspended, trigger_suspended)"/>`;
    var multilogin = array[i].multilogin;
    multilogin = (multilogin == "true")
    ? "<input type='checkbox' checked " : "<input type='checkbox' ";
    multilogin += `onclick="(this.checked)
    ? pinArraysPushSplice('${pin}', trigger_multilogin, trigger_non_multilogin)
    : pinArraysPushSplice('${pin}', trigger_non_multilogin, trigger_multilogin)"/>`;
    var wellness = array[i].wellness;
    wellness = (wellness == "true")
    ? "<input type='checkbox' checked " : "<input type='checkbox' ";
    wellness += `onclick="(this.checked)
    ? pinArraysPushSplice('${pin}', trigger_wellness, trigger_non_wellness)
    : pinArraysPushSplice('${pin}', trigger_non_wellness, trigger_wellness)"/>`;
    var biometric = array[i].biometric;
    biometric = (biometric == "true")
    ? "<input type='checkbox' checked " : "<input type='checkbox' ";
    biometric += `onclick="(this.checked)
    ? pinArraysPushSplice('${pin}', trigger_biometric, trigger_non_biometric)
    : pinArraysPushSplice('${pin}', trigger_non_biometric, trigger_biometric)"/>`;
    var adhocpush = array[i].adhocpush;
    adhocpush = (adhocpush == "true")
    ? "<input type='checkbox' class='trigger-checkbox-adhocpush' checked "
    : "<input type='checkbox' class='trigger-checkbox-adhocpush' ";
    adhocpush += `onclick="(this.checked)
    ? trigger_adhocpush.push('${pin}')
    : trigger_adhocpush.splice(trigger_adhocpush.indexOf('${pin}'), 1)"/>`;
    var heartbeat = array[i].heartbeat;
    heartbeat = (heartbeat == "true")
    ? "<input type='checkbox' class='trigger-checkbox-heartbeat' checked "
    : "<input type='checkbox' class='trigger-checkbox-heartbeat' ";
    heartbeat += `onclick="(this.checked)
    ? trigger_heartbeat.push('${pin}')
    : trigger_heartbeat.splice(trigger_heartbeat.indexOf('${pin}'), 1)"/>`;
    var frsm = array[i].frsm;
    frsm = (frsm == "true")
    ? "<input type='checkbox' class='trigger-checkbox-frsm' checked "
    : "<input type='checkbox' class='trigger-checkbox-frsm' ";
    frsm += `onclick="(this.checked)
    ? trigger_frsm.push('${mobile}')
    : trigger_frsm.splice(trigger_frsm.indexOf('${mobile}'), 1)"/>`;

    rows_pin += `<div class="col-12 px-1 py-0">${pin}</div>`;
    rows_info += `<div class="div-unit px-1 py-0">${mobile}</div>`;
    rows_info += `<div class="div-unit-2 px-1 py-0">${start}
    &nbsp;<i class="fa fa-pencil" aria-hidden="true" style="cursor:pointer;"
    onclick="makeSHNChange('${pin}', 'start', '${start}')"></i></div>`;
    rows_info += `<div class="div-unit-2 px-1 py-0">${end}
    &nbsp;<i class="fa fa-pencil" aria-hidden="true" style="cursor:pointer;"
    onclick="makeSHNChange('${pin}', 'end', '${end}')"></i></div>`;
    rows_info += `<div class="div-unit-3 px-1 py-0">${expired}</div>`;
    rows_info += `<div class="div-unit-2 px-1 py-0 v-mid">${suspended}</div>`;
    rows_info += `<div class="div-unit-2 px-1 py-0 v-mid">${multilogin}</div>`;
    rows_info += `<div class="div-unit-3 px-1 py-0 v-mid">${wellness}</div>`;
    rows_info += `<div class="div-unit-3 px-1 py-0 v-mid">${biometric}</div>`;
    rows_info += `<div class="div-unit-3 px-1 py-0 v-mid">${adhocpush}</div>`;
    rows_info += `<div class="div-unit-3 px-1 py-0 v-mid">${heartbeat}</div>`;
    rows_info += `<div class="div-unit-3 px-1 py-0 v-mid">${frsm}</div>`;
  }
  rows_pin += `<div class="col-12 px-1 py-0">&nbsp;</div>`;
  rows_info += `<div class="col-12 px-1 py-0">&nbsp;</div>`;
  trigger_pin_content.innerHTML = rows_pin;
  trigger_info_content.innerHTML = rows_info;
}

var trigger_count = 0;

function updateTriggerCount() {
  trigger_count -= 1;
  console.log('trigger_count',trigger_count);
  if (trigger_count <= 0) {
    btn_trigger.disabled = false;
  }
}

var btn_trigger = document.getElementById('trigger-button');
var triggered = 0;

btn_trigger.addEventListener('click', function() {
  var max_capacity = 20;
  var str = "";
  triggered = 0;
  var length = trigger_adhocpush.length;
  if (length > 0) {
    batches = Math.floor(length / max_capacity);
    remainder = (length % max_capacity == 0) ? false : true;

    btn_trigger.disabled = true;
    trigger_count = (remainder) ? batches + 1 : batches;

    console.log('Ad-hoc push:', trigger_adhocpush.join(', '));
    str = "Updating...";
    triggered += length;

    for (i = 0; i < batches; i++) {
      var pins = trigger_adhocpush.splice(0, max_capacity);
      console.log(pins);
      postReqCallbackAuth(ad_hoc_push, { "pins": pins }, updateTriggerCount);
    }
    if (remainder) {
      console.log(trigger_adhocpush);
      postReqCallbackAuth(ad_hoc_push, { "pins": trigger_adhocpush }, updateTriggerCount);
    }
    trigger_adhocpush.length = 0;
    clearCheckboxes('trigger-checkbox-adhocpush');
  }
  length = trigger_heartbeat.length;
  if (length > 0) {
    batches = Math.floor(length / max_capacity);
    remainder = (length % max_capacity == 0) ? false : true;

    btn_trigger.disabled = true;
    trigger_count = (remainder) ? batches + 1 : batches;

    console.log('Distance Request:', trigger_heartbeat.join(', '));
    str = "Updating...";
    triggered += length;

    for (i = 0; i < batches; i++) {
      var pins = trigger_heartbeat.splice(0, max_capacity);
      console.log(pins);
      postReqCallbackAuth(dist_request, { "arrayofpins": pins }, updateTriggerCount);
    }
    if (remainder) {
      console.log(trigger_heartbeat);
      postReqCallbackAuth(dist_request, { "arrayofpins": trigger_heartbeat }, updateTriggerCount);
    }
    trigger_heartbeat.length = 0;
    clearCheckboxes('trigger-checkbox-heartbeat');
  }
  length = trigger_frsm.length;
  if (length > 0) {
    batches = Math.floor(length / max_capacity);
    remainder = (length % max_capacity == 0) ? false : true;

    btn_trigger.disabled = true;
    trigger_count = (remainder) ? batches + 1 : batches;

    console.log('FRSM Push:', trigger_frsm.join(', '));
    str = "Updating...";
    triggered += length;

    for (i = 0; i < batches; i++) {
      var mobiles = trigger_frsm.splice(0, max_capacity);
      console.log(mobiles);
      postReqCallbackAuth(ad_hoc_frsm, { "arrayofmobiles": mobiles }, updateTriggerCount);
    }
    if (remainder) {
      console.log(trigger_frsm);
      postReqCallbackAuth(ad_hoc_frsm, { "arrayofmobiles": trigger_frsm }, updateTriggerCount);
    }
    trigger_frsm.length = 0;
    clearCheckboxes('trigger-checkbox-frsm');
  }

  length = trigger_multilogin.length;
  if (length > 0) {
    batches = Math.floor(length / max_capacity);
    remainder = (length % max_capacity == 0) ? false : true;

    btn_trigger.disabled = true;
    trigger_count = (remainder) ? batches + 1 : batches;

    console.log('Multi-login enabled for:', trigger_multilogin.join(', '));
    str = "Updating...";
    triggered += length;

    for (i = 0; i < batches; i++) {
      var pins = trigger_multilogin.splice(0, max_capacity);
      console.log(pins);
      postReqCallbackAuth(set_multi_login, { "pins": pins, "value": "true"}, updateTriggerCount);
    }
    if (remainder) {
      console.log(trigger_multilogin);
      postReqCallbackAuth(set_multi_login, { "pins": trigger_multilogin, "value": "true"}, updateTriggerCount);
    }
    trigger_multilogin.length = 0;
  }
  length = trigger_non_multilogin.length;
  if (length > 0) {
    batches = Math.floor(length / max_capacity);
    remainder = (length % max_capacity == 0) ? false : true;

    btn_trigger.disabled = true;
    trigger_count = (remainder) ? batches + 1 : batches;

    console.log('Multi-login disabled for:', trigger_non_multilogin.join(', '));
    str = "Updating...";
    triggered += length;

    for (i = 0; i < batches; i++) {
      var pins = trigger_non_multilogin.splice(0, max_capacity);
      console.log(pins);
      postReqCallbackAuth(set_multi_login, { "pins": pins, "value": "false"}, updateTriggerCount);
    }
    if (remainder) {
      console.log(trigger_non_multilogin);
      postReqCallbackAuth(set_multi_login, { "pins": trigger_non_multilogin, "value": "false"}, updateTriggerCount);
    }
    trigger_non_multilogin.length = 0;
  }

  length = trigger_wellness.length;
  if (length > 0) {
    batches = Math.floor(length / max_capacity);
    remainder = (length % max_capacity == 0) ? false : true;

    btn_trigger.disabled = true;
    trigger_count = (remainder) ? batches + 1 : batches;

    console.log('Wellness enabled for:', trigger_wellness.join(', '));
    str = "Updating...";
    triggered += length;

    for (i = 0; i < batches; i++) {
      var pins = trigger_wellness.splice(0, max_capacity);
      console.log(pins);
      postReqCallbackAuth(set_wellness, { "arrayofpins": pins, "value": "true"}, updateTriggerCount);
    }
    if (remainder) {
      console.log(trigger_wellness);
      postReqCallbackAuth(set_wellness, { "arrayofpins": trigger_wellness, "value": "true"}, updateTriggerCount);
    }
    trigger_wellness.length = 0;
  }
  length = trigger_non_wellness.length;
  if (length > 0) {
    batches = Math.floor(length / max_capacity);
    remainder = (length % max_capacity == 0) ? false : true;

    btn_trigger.disabled = true;
    trigger_count = (remainder) ? batches + 1 : batches;

    console.log('Wellness disabled for:', trigger_non_wellness.join(', '));
    str = "Updating...";
    triggered += length;

    for (i = 0; i < batches; i++) {
      var pins = trigger_non_wellness.splice(0, max_capacity);
      console.log(pins);
      postReqCallbackAuth(set_wellness, { "arrayofpins": pins, "value": "false"}, updateTriggerCount);
    }
    if (remainder) {
      console.log(trigger_non_wellness);
      postReqCallbackAuth(set_wellness, { "arrayofpins": trigger_non_wellness, "value": "false"}, updateTriggerCount);
    }
    trigger_non_wellness.length = 0;
  }

  length = trigger_suspended.length;
  if (length > 0) {
    batches = Math.floor(length / max_capacity);
    remainder = (length % max_capacity == 0) ? false : true;

    btn_trigger.disabled = true;
    trigger_count = (remainder) ? batches + 1 : batches;

    console.log('Suspended:', trigger_suspended.join(', '));
    str = "Updating...";
    triggered += length;

    for (i = 0; i < batches; i++) {
      var pins = trigger_suspended.splice(0, max_capacity);
      console.log(pins);
      postReqCallbackAuth(set_suspended, { "pins": pins, "value": "true"}, updateTriggerCount);
    }
    if (remainder) {
      console.log(trigger_suspended);
      postReqCallbackAuth(set_suspended, { "pins": trigger_suspended, "value": "true"}, updateTriggerCount);
    }
    trigger_suspended.length = 0;
  }
  length = trigger_non_suspended.length;
  if (length > 0) {
    batches = Math.floor(length / max_capacity);
    remainder = (length % max_capacity == 0) ? false : true;

    btn_trigger.disabled = true;
    trigger_count = (remainder) ? batches + 1 : batches;

    console.log('Not suspended:', trigger_non_suspended.join(', '));
    str = "Updating...";
    triggered += length;

    for (i = 0; i < batches; i++) {
      var pins = trigger_non_suspended.splice(0, max_capacity);
      console.log(pins);
      postReqCallbackAuth(set_suspended, { "pins": pins, "value": "false"}, updateTriggerCount);
    }
    if (remainder) {
      console.log(trigger_non_suspended);
      postReqCallbackAuth(set_suspended, { "pins": trigger_non_suspended, "value": "false"}, updateTriggerCount);
    }
    trigger_non_suspended.length = 0;
  }
  
  length = trigger_biometric.length;
  if (length > 0) {
    btn_trigger.disabled = true;
    trigger_count = length;

    console.log('Enabling biometric:', trigger_biometric.join(', '));
    str = "Updating...";
    triggered += length;

    var interval = 250;

    for (i = 0; i < length; i++) {
      var pin = trigger_biometric[i];
      postReqCallbackIntervalAuth(`${set_biometric}/${pin}?bool=true`, {}, updateTriggerCount, i * interval);
    }
    trigger_biometric.length = 0;
  }
  length = trigger_non_biometric.length;
  if (length > 0) {
    btn_trigger.disabled = true;
    trigger_count = length;

    console.log('Disabling biometric:', trigger_non_biometric.join(', '));
    str = "Updating...";
    triggered += length;

    var interval = 250;

    for (i = 0; i < length; i++) {
      var pin = trigger_non_biometric[i];
      postReqCallbackIntervalAuth(`${set_biometric}/${pin}?bool=false`, {}, updateTriggerCount, i * interval);
    }
    trigger_non_biometric.length = 0;
  }
  if (str == "") {
    errorAlert(alert_trigger, "Error: Nothing to trigger.", 3500);
  } else {
    //warningAlert(alert_trigger, str, false);
    triggered = (triggered > 1) ? `${triggered} variables` : `${triggered} variable`;
    successAlert(alert_trigger, `Successfully updated ${triggered}.`, 3500);
  }
});

function clearCheckboxes(class_name) {
  var elements = document.getElementsByClassName(class_name);
  for (i = 0; i < elements.length; i++) {
    elements[i].checked = false;
  }
}
