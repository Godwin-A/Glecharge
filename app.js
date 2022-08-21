const express =                        require('express')
const mongoose =                        require('mongoose')
 const Payer =                           require('./models/payer')
 const fetch =                            require('node-fetch');
 const axios =                             require('axios').default;
 const btoa =                               require('btoa')
const { json, response } =                  require('express');
const requestId =                            require('./utils/requestID')
 const buy_airtime =                          require('./utils/airtime')
 const buy_data =                              require('./utils/data') 
 const buy_electricity=                         require('./utils/electricity')  
const app =                                     express();
 app.use(express.urlencoded({extended : true}));
 app.use(express.json({extended : true }));
app.set('view engine', 'ejs')
app.use('/public', express.static('public'));
mongoose.connect('mongodb+srv://Glecharge:itsmine@glecharge.ybbbk.mongodb.net/glechargeretryWrites=true&w=majority')
.then(()=>{ console.log('DB connected successfully') })
.catch((err)=>{console.log(err)})   

 
// app.get('/home', (req, res)=>{
//   res.render('home')
// })


app.get('/airtime', (req,res)=>{
  res.render('airtime')
})
   //buy airtime route
app.get('/airtime/verify', async (req, res)=>{
  const { transaction_id } = req.query;
  const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
  const response = await axios({
    url,
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `FLWSECK_TEST-cfb4553d9ad6e8573502240f1258b60a-X`,
    },
  })
  if(response){
    try {
       console.log(response.data.data)
            const payerDetails = {
              full_name : response.data.data.customer.name,
              reference: response.data.data.tx_ref,
              amount : response.data.data.amount,
              email : response.data.data.customer.email,
              number : response.data.data.customer.phone_number,
            }
              const service_id = response.data.data.meta.service_id;
            console.log(service_id)
            const payerOne = new Payer(payerDetails)
         await payerOne.save()
            if(payerOne){
              res.send(`you have been saved to the database ${payerOne.full_name}`)
            buy_airtime(requestId,service_id,payerDetails.amount,payerDetails.number)
            }else{
              console.log('there was an error')
            }
    } catch (error) {
      console.log(`there was an error ${error}`)
    }
  }
})
app.get('/data',(req, res)=>{
  res.render('data')
})

// buy data route
app.get('/data/approved', async (req, res)=>{
    const { transaction_id } = req.query;
  const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
  const response = await axios({
    url,
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `FLWSECK_TEST-cfb4553d9ad6e8573502240f1258b60a-X`,
    },
  })
  if(response){
    console.log(response.data.data)
    try {
      console.log(response.data.data)
           const payerDetails = {
             full_name : response.data.data.customer.name,
             reference: response.data.data.tx_ref,
             email : response.data.data.customer.email,
             amount : response.data.data.amount,
             number : response.data.data.customer.phone_number,
           }
             const service_id = response.data.data.meta.service_id;
             const variation_code = response.data.data.meta.variation_code
           console.log(`take a look at the service_id and varition code -- ${service_id} and ${variation_code}`)
           const payerOne = new Payer(payerDetails)
        await payerOne.save()
           if(payerOne){
             res.send(`you have been saved to the database ${payerOne.full_name}`)
           buy_data(requestId,variation_code, service_id, payerDetails.number)
           }else{
             console.log('there was an error')
           }
   }catch (error){
    console.log(`its not you, its us, sorry for the error ${error}`)
   }
  }
})

// electricity route
     app.get('/merchant/verify', function(req, res){
       res.render('power')
     })

     app.post('/merchant/data', async(req, res)=>{
   const { meter_number , type, service_id, } = req.body
   const options = {
    headers: {
  'Authorization':'Basic '+btoa('sandbox@vtpass.com:sandbox'),
  'Content-Type': 'application/json'                   
           },
   method: "POST",
  body: JSON.stringify({         
     'serviceID': service_id,
     'billersCode': meter_number,
     'type'     : type,
  })
  }
  const result = await fetch(new URL("https://sandbox.vtpass.com/api/merchant-verify"), options)
   if(result){
       try {
        console.log('there is a result , hurray!!!!!')
        // console.log(result)
     const json = await  result.json().then(res => {
      return res
     })
     console.log(json)
        const {Customer_Name, MeterNumber, Address , Meter_Type} = json.content
               res.render('buy_power', {Customer_Name, MeterNumber, Address,Meter_Type, service_id })
          } catch (error) {
            console.log(`there was an error ${error}`)
          }
         }
     })
 


     app.get('/buy_electricity',async (req, res)=>{
      const { transaction_id } = req.query;
  const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
  const response = await axios({
    url,
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `FLWSECK_TEST-cfb4553d9ad6e8573502240f1258b60a-X`,
    },
  })
   if(response){
    try {
           const payerDetails = {
             full_name : response.data.data.customer.name,
             reference: response.data.data.tx_ref,
             email : response.data.data.customer.email,
             amount : response.data.data.amount,
             number : response.data.data.customer.phone_number,
           }
           console.log(payerDetails)
             const service_id = response.data.data.meta.service_id.trim();
             const MeterNumber = response.data.data.meta.MeterNumber.trim()
             const Address = response.data.data.meta.Address
             const Meter_Type = response.data.data.meta.Meter_Type
             const variation_code = Meter_Type.toLowerCase().trim()
          // console.log(`take a look at the meter number  and customer name -- ${MeterNumber} and ${payerDetails.full_name} and ${service_id}`)
           const payerOne = new Payer(payerDetails)
        await payerOne.save()
           if(payerOne){
            const min = 10000;
const max = 99999;
const num = Math.floor(Math.random() * (max - min + 1)) + min;
const date = new Date()
const year = date.getFullYear();
const month = `${(date.getMonth() + 1) < 10 ? '0' : ''}${date.getMonth() + 1}`;
const hour = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`
const seconds = `${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()}`;
const minutes =`${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
const daten = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
const requestId = `${year}${month}${daten}${hour}${minutes}${seconds}${num}`
            let phone = Number(payerDetails.number)
           // console.log(requestId,Meter_Type, MeterNumber,payerDetails.amount,service_id, payerDetails.number)
        const result = await buy_electricity(requestId,variation_code, MeterNumber,payerDetails.amount,service_id, payerDetails.number)
        const token = result.Token
        console.log(token)
          res.render('show_token', {token})
           }else{
             console.log('there was an error')
           }
   }catch (error){
    console.log(`its not you, its us, sorry for the error ${error}`)
   }
   }
 })


app.get('/tv_subscription', async(req, res)=>{
      res.render('tv')
})


app.post('/verify_smartcard', async(req, res)=>{
  const { card,  serviceID} = req.body
  const options = {
   headers: {
 'Authorization':'Basic '+btoa('sandbox@vtpass.com:sandbox'),
 'Content-Type': 'application/json'                   
          },
  method: "POST",
 body: JSON.stringify({         
    'serviceID': serviceID,
    'billersCode': card,
 })
 }
 const result = await fetch(new URL("https://sandbox.vtpass.com/api/merchant-verify"), options)
  if(result){
      try {
        //humor makes coding more fun :)
       console.log('there is a result , hurray!!!!!')
    const json = await result.json().then(res => {return res})
    console.log(json)
       const {Customer_Name, Customer_Type, DUE_DATE , Customer_Number} = json.content
  res.render('buy_tv', {Customer_Name, Customer_Type, DUE_DATE,Customer_Number, serviceID})
         } catch (error) {
           console.log(`there was an error ${error}`)
         }
        }
})
//fetch(new URL("https://sandbox.vtpass.com/api/service-variations?serviceID=dstv"))
//.then(res => res.json())
//.then(json => console.log(json.content.varations))


//app.get('')



const PORT = process.env.PORT || 5000

app.listen(PORT, function(){
  console.log(`server started in port ${PORT}`)
})





   //  fetch(new URL("https://sandbox.vtpass.com/api/service-variations?serviceID=mtn-data"))
    //  .then(response => response.json())
    //  .then(json => console.log(json.content.varations));







































    // 'public-key':'PK_200347c6cf196216b7230b3abf1eee2267614644002'          
 // const  secretKey
//  https:sandbox.vtpass.com/api/pay
//  ServiceID: abuja-electric
//  1111111111111
//  Sandbox: https:sandbox.vtpass.com/api/merchant-verify
 

// app.use('/users', require('./routes/user'));
// app.use('/auth', require('./routes/auth'));
// app.use('/login', require('./routes/login'));
// app.use('/logout', require('./routes/logout'))