const btoa = require('btoa')
const fetch =  require('node-fetch');
module.exports = async (requestId,variation_code,serviceID,billersCode,phone)=>{
const optionss = {
  headers: {
'Authorization':'Basic '+btoa('sandbox@vtpass.com:sandbox'),
'Content-Type': 'application/json'                   
         },
 method: "POST",
body: JSON.stringify({         
   'request_id': requestId,
   'serviceID':serviceID,
   'billersCode': billersCode,
   'variation_code' : variation_code,
   'subscription_type':'change',
   'phone'     : phone,
})
}
const result = await fetch(new URL("https://sandbox.vtpass.com/api/pay"), optionss)
       .then(response => response.json())
       .then(json => {return json.response_description});

       return result
}