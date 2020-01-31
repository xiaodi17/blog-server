const fs = require('fs')
const path = require('path')
const readline = require('readline')

const fileName = path.join(__dirname, '../', '../', 'logs', 'access.log')

//create read stream
const readStream = fs.createReadStream(fileName)

//create readline object
const rl = readline.createInterface({
  input: readStream
})

let chromeNum = 0
let num = 0

//line finish reading trigger
rl.on('line', lineData => {
  if (!lineData) {
    return
  }

  //record total line
  sum++

  const arr = lineData.split('--')
  if (arr[2] && arr[2].indexOf('Chrome') > 0) {
    chromeNum++
  }
})

rl.on('close', () => {
  console.log('chrome:' + chromeNum / sum)
})
