function postReqCallback(url, obj, callback) {
  if (debug) {
    console.log("url", url);
    console.log("obj", obj);
  }
  $.ajax({
    url : `${url}`,
    type: "POST",
    processData: true,
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(obj),
    success: function(data, textStatus, jqXHR)
    {
      if (debug) { console.log(textStatus); console.log(data); }      
      callback(data);
    },
    error: function (err) {
      data = {
        error: err.status
      }
      console.log(data);
      callback(data);
    }
  });
}

function getReqCallback(url, callback) {
  if (debug) { console.log("url", url); }
  $.ajax({
    url : `${url}`,
    type: "GET",
    processData: false,
    contentType: 'application/json',
    success: function(data, textStatus, jqXHR)
    {
      if (debug) { console.log(textStatus); console.log(data); }
      callback(data);
    },
    error: function (err) {
      data = {
        error: err.status
      }
      console.log(data);
      callback(data);
    }
  });
}