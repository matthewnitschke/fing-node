const fing = require('../src/fing-node.js')

fing.on('scanComplete', (hosts) => {
    console.log(hosts)
})
fing.start()