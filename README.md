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

### Ethereum logging and ether scanner

We use a smart contract to log successful transaction. The smart contract can be found here: [trozler/logging_contract_image_translator](https://github.com/trozler/logging_contract_image_translator)

If you want to inspect the logs on ether scanner you can do the following:

1. Wait for callback to be executed server side, indicating transaction has been mined. Use server logs to keep updated.

2. Go to the following etherscanner link and inspect the logs: https://ropsten.etherscan.io/address/0xa09a8dA457e5282BD9D018A9BeA6e5Ac65aBB466.
