
const meter_number = document.getElementById('meter_number')
const meter_value = meter_number.value
const results = document.getElementById('results')


meter_number.addEventListener('input', get_data)

function get_data(e) {
  results.textContent = e.target.value
 }