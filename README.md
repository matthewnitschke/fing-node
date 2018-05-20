# fing-node
A simple wrapper around overlook's fing cli network scanner tool

# Installation
first make sure [fing](https://www.fing.io/download-free-ip-scanner-desktop-linux-windows-osx/) is installed. Then install fing-node via yarn or npm
```
yarn add fing-node
```

# Usage
```javascript
const fing = require('fing-node')

fing.on('scanComplete', (hosts) => {
  console.log(hosts)
})
fing.start()
```
