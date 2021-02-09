// URL endpoint  POST for initial login during registration for app.
https://www.locationreport.gov.sg/virusrip/novel/register 

// URL endpoint POST to update heartbeat for app.
https://www.locationreport.gov.sg/virusrip/novel/update 

// URL endpoint POST to update postalcaode by app.
https://www.locationreport.gov.sg/virusrip/novel/updatetoken

// URL endpoint GET to get TOKEN via pin.
https://www.locationreport.gov.sg/virusrip/novel/gettoken/{pin}

// URL endpoint POST to update postalcaode  by user via app.
https://www.locationreport.gov.sg/virusrip/novel/updatemyloc


// URL endpoint GET to get TOKEN via mobile.
https://www.locationreport.gov.sg/virusrip/novel/token/{mobile}


// URL endpoint GET all pins by days.
https://www.locationreport.gov.sg/virusrip/novel/getallpins/{days}

// URL endpoint GET biopush by days.
https://www.locationreport.gov.sg/virusrip/novel/get/{days}

// URL endpoint GET biopush by days b y orgid.
https://www.locationreport.gov.sg/virusrip/novel/get/{days}/{orgid}


// URL endpoint GET biopush by days b y orgid via pin.
https://www.locationreport.gov.sg/virusrip/novel/get/{days}/{orgid}/{pin}

// URL endpoint GET distinct orgids.
https://www.locationreport.gov.sg/virusrip/novel/orgids

// URL endpoint GET distinct pins {will give all pins}.
https://www.locationreport.gov.sg/virusrip/novel/

// URL endpoint GET distinct pins by orgid {will give all pins}.
https://www.locationreport.gov.sg/virusrip/novel/pins/{orgid}


// URL endpoint GET all pins with out trk and biopush.
https://www.locationreport.gov.sg/virusrip/novel/onlypins


// URL endpoint GET all floatingpins, these pins where mobile is not assigned
https://www.locationreport.gov.sg/virusrip/novel/floatingpins

// URL endpoint GET all floating pins by orgid
https://www.locationreport.gov.sg/virusrip/novel/floatingpins/{orgid}


// URL endpoint GET all for push notification
https://www.locationreport.gov.sg/virusrip/novel/push


// URL endpoint GET all for push notification by orgid
https://www.locationreport.gov.sg/virusrip/novel/push/{orgid}


// URL endpoint GET all for biopush notification
https://www.locationreport.gov.sg/virusrip/novel/biopins


// URL endpoint GET all for biopush notification by orgid
https://www.locationreport.gov.sg/virusrip/novel/biopins/{orgid}


// URL endpoint POST all for bioUPDATE
https://www.locationreport.gov.sg/virusrip/novel/bioupdate

// URL endpoint POST all for update challenge via biometric
https://www.locationreport.gov.sg/virusrip/novel/updastechallenge


// URL endpoint GET all suspended pins via bool
https://www.locationreport.gov.sg/virusrip/novel/getallsuspendedpins/{bool}

// URL endpoint GET all suspended pins via bool via orgid
https://www.locationreport.gov.sg/virusrip/novel/getallsuspendedpins/{bool}/{orgid}

// URL endpoint POST send push notification to suspended pin
https://www.locationreport.gov.sg/virusrip/novel/suspension

// URL endpoint POST enable or disable multilogin via pin
https://www.locationreport.gov.sg/virusrip/novel/multilogin

// URL endpoint POST change expiry date of the pin
https://www.locationreport.gov.sg/virusrip/novel/changeenddate


// URL endpoint POST change start date of the pin
https://www.locationreport.gov.sg/virusrip/novel/changestartdate

// URL endpoint POST change organization id
https://www.locationreport.gov.sg/virusrip/novel/changeorgid


// URL endpoint POST change organization id
https://www.locationreport.gov.sg/virusrip/novel/changeconfig


// URL endpoint GET all data for all the pins
https://www.locationreport.gov.sg/virusrip/novel/getall

// URL endpoint GET all data for all per pin
https://www.locationreport.gov.sg/virusrip/novel/getall/{pin}


// URL endpoint GET all data via mobile
https://www.locationreport.gov.sg/virusrip/novel/getallmobile/{mobile}


// URL endpoint GET all pins {no trk, no biopush, no bioupdate}
https://www.locationreport.gov.sg/virusrip/novel/getallpins


// URL endpoint GET all pins by days {no trk, no biopush, no bioupdate}
https://www.locationreport.gov.sg/virusrip/novel/getallpins/{days}



// URL endpoint GET trk data only via pin 
https://www.locationreport.gov.sg/virusrip/novel/gettrk/{days}/{pin}


// URL endpoint POST update max distance, endpoint for CheeCheng to call. 
https://www.locationreport.gov.sg/virusrip/novel/maxdist

// URL endpoint POST show temperature for wellness page 
https://www.locationreport.gov.sg/virusrip/novel/showtemperature

// URL endpoint POST change attribute for any field, only meant as a backdoor or admin portal
https://www.locationreport.gov.sg/virusrip/novel/globalchange


// URL endpoint POST during login via app
https://www.locationreport.gov.sg/virusrip/otp/login

// URL endpoint POST verify otp
https://www.locationreport.gov.sg/virusrip/otp/verifyotp

// URL endpoint POST generate JWT json webtokens
https://www.locationreport.gov.sg/virusrip/otp/genjwt

// URL endpoint POST set app urls
https://www.locationreport.gov.sg/virusrip/otp/setappurls


// URL endpoint POST to create new admin
https://www.locationreport.gov.sg/virusrip/user/adminsignup

// URL endpoint POST to login as admin
https://www.locationreport.gov.sg/virusrip/user/adminlogin


