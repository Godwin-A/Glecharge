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
const total = `${year}${month}${daten}${hour}${minutes}${seconds}${num}`

module.exports = total