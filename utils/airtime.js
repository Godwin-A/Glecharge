const btoa = require('btoa')
const fetch =  require('node-fetch');
module.exports = async (requestId,service_id,amount,phone)=>{
const optionss = {
  headers: {
'Authorization':'Basic '+btoa('sandbox@vtpass.com:sandbox'),
'Content-Type': 'application/json'                   
         },
 method: "POST",
body: JSON.stringify({         
   'request_id': requestId,
   'serviceID' : service_id,
   'amount'    : amount,
   'phone'     : phone,
})
}
 await fetch(new URL("https://sandbox.vtpass.com/api/pay"), optionss)
       .then(response => response.json())
       .then(json => console.log(json));
}
