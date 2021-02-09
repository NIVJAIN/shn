var alert_frsm_batch = document.getElementById('frsm-batch-alert');
var btn_batch_frsm = document.getElementById('frsm-batch-button');

function getAllMobileForFRSM() {
  var url_get = "https://www.locationreport.gov.sg/virusrip/novel/get";
  var orgid = localStorage.getItem('orgid');
  getReqCallbackAuth(`${url_get}/0/${orgid}`, downloadAllMobileCSV);
}

function downloadAllMobileCSV(result) {
  result = result.message;
  var length = result.length;
  if (length <= 0) {
    errorAlert(alert_frsm_batch, "Error: No mobile numbers to download.", 3500);
    return;
  } else {
    successAlert(alert_frsm_batch, 'Initiating download...', 3500);
  }

  var str = `Mobile`;
  str += '\n';
  for (i = 0; i < length; i++) {
    str += result[i].mobile;
    str += '\n';
  }
  str = str.replace(/,\r\n/g,'\n');

  var orgid = localStorage.getItem('orgid');
  var fileName = `SHNQO_${orgid}_${dateToday()}_mobile-numbers.csv`;
  var uriData = 'data:text/csv;charset=UTF-8,' + str;
  downloadFile(fileName, uriData);
}

function batchFRSMUpload() {
  var file = document.getElementById("frsm-batch-file").files[0];
  if (file) {
    var fileName = document.getElementById("frsm-batch-file").value;
    fileName = fileName.substring(fileName.lastIndexOf("\\") + 1, fileName.length);
    var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
    if (fileExt.toLowerCase() != "csv") {
      errorAlert(alert_frsm_batch, `Error: ${fileName} is not a valid CSV file.`, 3500);
      return;
    }
    fileName = fileName.substring(0, fileName.lastIndexOf("."));
    console.log(fileName);

    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
      var result = evt.target.result;
      console.log(result);
      processBatchFRSMUpload(result);
    }
    reader.onerror = function (evt) {
      errorAlert(alert_frsm_batch, "Error: Unable to read file.", 3500);
    }
  }
}

var template_header_frsm = "Mobile";
var batch_frsm = [];

function processBatchFRSMUpload(result) {
  result = result.split('\n');
  var error_frsm = [];
  var length = result.length;
  if (length <= 1) {
    errorAlert(alert_frsm_batch, "Error: CSV file lacking contents.", 3500);
    return;
  } else {
    var count = 0;
    var header = result[0];
    console.log(header);
    var result = result.splice(1);
    batch_frsm = [];
    if (header.trim().toLowerCase() == template_header_frsm.trim().toLowerCase()) {
      length = result.length;
      for (i = 0; i < length; i++) {
        console.log(result[i]);
        var _element = result[i].split(',');
        if (_element.length == 0 || _element == "") { continue; }
        if (_element[0] != "") {
          batch_frsm.push(_element[0]);
          count++;
        } else {
          error_frsm.push(i);
        }
      }
      if (error_frsm.length > 0) {
        errorAlert(alert_frsm_batch, `Error: Row ${error_frsm.join(', ')}.`, 3500);
        if (count > 0) {
          setTimeout(function() {
            warningAlert(alert_frsm_batch, `Commencing batch FRSM challenge of remaining ${count} users.`, false);
          }, 3510);
          setTimeout(function() {
            sendBatchFRSM();
          }, 5000);
        }
      } else {
        warningAlert(alert_frsm_batch, `Commencing batch FRSM challenge of ${count} users.`, false);
        setTimeout(function() {
          sendBatchFRSM();
        }, 3500);
      }
    } else {
      errorAlert(alert_frsm_batch, 'Error: Header should only consist of "Mobile".', 3500);
      return;
    }
  }
}

function sendBatchFRSM() {
  var max_capacity = 50;
  var length = batch_frsm.length;
  
  batches = Math.floor(length / max_capacity);
  remainder = (length % max_capacity == 0) ? false : true;

  btn_batch_frsm.disabled = true;
  frsm_count = (remainder) ? batches + 1 : batches;

  str = "Updating...";

  var url_frsm = "https://lufthansadsl.tk/virusrip/novel/frsm";
  var interval = 250;
  for (i = 0; i < batches; i++) {
    var batch = batch_frsm.splice(0, max_capacity);
    console.log(batch);
    postReqCallbackIntervalAuth(url_frsm, { "arrayofmobiles": batch }, updateFRSMCount, interval * i);
  }
  if (remainder) {
    console.log(batch_frsm);
    postReqCallbackIntervalAuth(url_frsm, { "arrayofmobiles": batch_frsm }, updateFRSMCount, interval * i);
  }
}

var frsm_count = 0;
function updateFRSMCount() {
  frsm_count -= 1;
  console.log('frsm_count',frsm_count);
  if (frsm_count <= 0) {
    btn_batch_frsm.disabled = false;
    successAlert(alert_frsm_batch, "Successfully pushed.", 3500);
    batch_frsm.length = 0;
  }
}