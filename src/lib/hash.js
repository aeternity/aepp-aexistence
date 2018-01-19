const sha256 = require('js-sha256')

let generateHashFromFile = function (file, done) {
  console.log('generateHashFromFile', file)
  readFile(file, (err, binaryString) => {
    if (err) {
      return done(err)
    }
    return done(null, generateHash(binaryString))
  })
}

let readFile = function (file, done) {
  let fileReader = new FileReader()
  fileReader.onload = (event) => {
    let binaryString = event.target.result
    return done(null, binaryString)
  }
  fileReader.readAsArrayBuffer(file)
}

let generateHash = function (binaryString) {
  return sha256(binaryString)
}

module.exports = generateHashFromFile
