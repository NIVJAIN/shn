var shnchange_card = document.getElementById('card-shnchange');
var shnchange_input_pin = document.getElementById('shnchange-pin-input');
var shnchange_title = document.getElementById('shnchange-title');
var shnchange_input_date = document.getElementById('shnchange-date-input');
var shnchange_btn_submit = document.getElementById('shnchange-submit-button');
var shnchange_btn_cancel = document.getElementById('shnchange-cancel-button');

function cancelSHNChange() {
  shnchange_card.classList.add("d-none"),
  shnchange_input_pin.value = "",
  shnchange_input_date.value = "";
}

var shnchange_type = "";

function makeSHNChange(pin, shn_type, current_date) {
  var title = "";
  shnchange_type = shn_type;
  if (shn_type == "start") {
    title = "Change SHN Start Date";
  }
  else if (shn_type == "end") {
    title = "Change SHN End Date";
  } else {
    shnchange_type = "";
    return;
  }
  shnchange_title.innerHTML = title,
  shnchange_input_pin.value = pin,
  shnchange_input_date.placeholder = current_date,
  shnchange_card.classList.remove("d-none");
}

var alert_shnchange = document.getElementById('shnchange-alert');

function submitSHNChange() {
  if (shnchange_type == "") {
    cancelSHNChange();
  }
  var pin = shnchange_input_pin.value;
  if (pin == "") {
    errorAlert(alert_shnchange, "Error: Empty PIN field.", 3500);
    return;
  }
  if (pin.length != 8) {
    errorAlert(alert_shnchange, "Error: Invalid PIN length.", 3500);
    return;
  }

  var date = shnchange_input_date.value;
  if (date == "") {
    warningAlert(alert_shnchange, "Date field left empty. No change made.", 3500);
    return;
  }
  date = date.split('/');
  if (date.length != 3) {
    errorAlert(alert_shnchange, "Error: Incorrect date format. Should be DD/MM/YYYY.", 3500);
    return;
  }
  console.log('date[2] len',date[2].length);
  if (date[0].length > 2 || date[1].length > 2 || date[2].length != 4) {
    errorAlert(alert_shnchange, "Error: Incorrect date format. Should be DD/MM/YYYY.", 3500);
    return;
  }
  date[0] = (date[0].length == 1) ? `0${date[0]}` : date[0];
  date[1] = (date[1].length == 1) ? `0${date[1]}` : date[1];
  date = `${date[0]}/${date[1]}/${date[2]}`;
  shnchange_input_date.value = date;

  var url = "";
  if (shnchange_type == "start") {
    url = "https://www.locationreport.gov.sg/virusrip/novel/changestartdate";
  }
  else if (shnchange_type == "end") {
    url = "https://www.locationreport.gov.sg/virusrip/novel/changeenddate";
  }

  var payload = {
    "pin": pin,
    "newdate": date
  }
  
  postReqCallbackAuth(url, payload, resultSHNChange);
}

function resultSHNChange(result) {
  result = result.message;
  if (result) {
    var alert = "";
    if (shnchange_type == "start") {
      alert = `SHN start date successfully changed to ${result.loastart}.`;
    } else {
      alert = `SHN end date successfully changed to ${result.loaend}.`;
    }
    successAlert(alert_shnchange, alert, 3500);
  } else {
    errorAlert(alert_shnchange, `Error: Unable to alter date for ${shnchange_input_pin}.`, 3500);
  }
  return;
}