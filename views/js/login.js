var input_email = document.getElementById('input-email');
var input_password = document.getElementById('input-password');
var alert_login = document.getElementById('login-alert');

function login() {
  var email = input_email.value;
  var password = input_password.value;
  console.log("email", email); //sheng_yang_chua_from.tp@imda.gov.sg
  console.log("password", password);

  if (email == "") {
    errorAlert(alert_login, "Empty email address field.", 3500);
    return;
  }
  if (!email.includes("@")) {
    errorAlert(alert_login, "Invalid email address.", 3500);
    return;
  } 
  if (password == "") {
    errorAlert(alert_login, "Empty password field.", 3500);
    return;
  }

  var orgid = email.split('@');
  orgid = orgid[1].split('.');
  orgid = orgid[orgid.length - 3].toUpperCase();

  var payload = {
    'orgid': orgid,
    'email': email,
    'password': password
  }

  localStorage.setItem('email', payload.email);
  localStorage.setItem('orgid', payload.orgid);

  var url = "https://www.locationreport.gov.sg/user/adminlogin";
  postReqCallback(url, payload, loginResult);
}

function loginResult(result) {
  console.log(result);
  if (result.token) {
    localStorage.setItem('token', result.token);
    loadPage();
    clearCurtain();
    clearLogin();
    return;
  }
  if (result.error) {
    errorAlert(alert_login, "Wrong email or password.", 3500);
    input_email.value = "";
    input_password.value = "";
  }
  localStorage.removeItem('email');
  localStorage.removeItem('orgid');
}

function showLogin() {
  var login = document.getElementById('login');
  login.style['z-index'] = 2;
  login.classList.add('show');
}

function clearLogin() {
  var login = document.getElementById('login');
  login.classList.remove('show');
  
  setTimeout(function() {
    login.classList.add('d-none');
    login.style['z-index'] = -99;
  }, 500);
}

function quit() {
  localStorage.removeItem('email');
  localStorage.removeItem('orgid');
  localStorage.removeItem('token');
  window.location.reload(true);
}