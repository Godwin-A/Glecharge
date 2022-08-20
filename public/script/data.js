
    const phone_number = document.getElementById('phone')
    const email = document.getElementById('email')
    const name = document.getElementById('name')
    const sel = document.getElementById('network')
    const sel_value = sel.value
    const selected = sel.options[sel.selectedIndex];
    const variation_code =  selected.getAttribute('variation_code');


const h1 = document.getElementById('h1')
const operators = document.getElementById('operators')
const mtn = document.getElementById('mtn')
const glo = document.getElementById('glo')
const airtel = document.getElementById('airtel')
const etisalat = document.getElementById('etisalat')
const mtnown = document.getElementById('mtnown')
const gloown = document.getElementById('gloown')
const airtelown = document.getElementById('airtelown')
const etisalatown = document.getElementById('etisalatown')

operators.addEventListener("change", function(){
  if(this.value == 'glo-data'){
   mtnown.hidden = true
   airtelown.hidden = true
   etisalatown.hidden = true
   gloown.hidden = false
  }else if (this.value== 'mtn-data') {
    gloown.hidden = true
   airtelown.hidden = true
   etisalatown.hidden = true
   mtnown.hidden = false
  } else if(this.value == 'airtel-data') {
    mtnown.hidden = true
   gloown.hidden = true
   etisalatown.hidden = true
   airtelown.hidden = false
  }else if(this.value == 'etisalat-data'){
    mtnown.hidden = true
   airtelown.hidden = true
  gloown.hidden = true
  etisalatown.hidden = false
  }
 });