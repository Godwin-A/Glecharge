const tv_operators = document.getElementById('tv_operators')
const gotv_plans = document.getElementById('gotv_plans')
const dstv_plans = document.getElementById('dstv_plans')
const star_plans = document.getElementById('star_plans')
const service_id = document.getElementById('serviceID')
let h1 = document.getElementById('h1')


window.addEventListener('load', function(){
    if(service_id.value == 'dstv' ){
      this.alert('service id is dstv')
      gotv_plans.hidden = true
     star_plans.hidden = true
     dstv_plans.hidden = false
     console.log('operation done')  
    }else if(service_id.value == 'gotv'){
     this.alert('service id is gotv')
        dstv_plans.hidden = true
        star_plans.hidden = true
        gotv_plans.hidden = false
    }
    else if(service_id.value == 'startimes'){
      this.alert('service id is startimes')
          gotv_plans.hidden = true
          dstv_plans.hidden = true
          star_plans.hidden = false
     }
})
