const jsonrpc = '2.0'
const id = 0

const send = (method, params = []) =>
  new Promise((resolve, reject) => {
    web3.currentProvider.send({ id, jsonrpc, method, params }, (err, res) => {
      err ? reject(err) : resolve(res)
    })
  })

const timeTravel = async (seconds) => {
  await send('evm_increaseTime', [seconds])
  await send('evm_mine')
}

module.exports = timeTravel
