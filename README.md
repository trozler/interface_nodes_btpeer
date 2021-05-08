### interface node front end

This front end allows a user to pay for a service using ether.
Then if the payment is accepted, the front end will make a system to call and execute `btpeer_init_handler.py`. This process will send an "INIT" message to interface node running on port 1119. The transcription and translation process will then begin.

### How to run

Assumes you have [npm](https://www.npmjs.com/) and [node](https://nodejs.org/en/) installed.

```
git clone https://github.com/trozler/interface_nodes_btpeer.git
cd interface_nodes_btpeer
npm i
npm run build
node app.js
```
