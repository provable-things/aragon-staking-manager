const { hash } = require('eth-ens-namehash')
const { getEventArgument } = require('@aragon/test-helpers/events')
const Kernel = artifacts.require('@aragon/os/build/contracts/kernel/Kernel')
const ACL = artifacts.require('@aragon/os/build/contracts/acl/ACL')
const EVMScriptRegistryFactory = artifacts.require(
  '@aragon/os/build/contracts/factory/EVMScriptRegistryFactory'
)
const DAOFactory = artifacts.require(
  '@aragon/os/build/contracts/factory/DAOFactory'
)

const newDao = async (rootAccount) => {
  // Deploy a DAOFactory.
  const kernelBase = await Kernel.new(true)
  const aclBase = await ACL.new()
  const registryFactory = await EVMScriptRegistryFactory.new()
  const daoFactory = await DAOFactory.new(
    kernelBase.address,
    aclBase.address,
    registryFactory.address
  )

  // Create a DAO instance.
  const daoReceipt = await daoFactory.newDAO(rootAccount)
  const dao = await Kernel.at(getEventArgument(daoReceipt, 'DeployDAO', 'dao'))

  // Grant the rootAccount address permission to install apps in the DAO.
  const acl = await ACL.at(await dao.acl())
  const APP_MANAGER_ROLE = await kernelBase.APP_MANAGER_ROLE()
  await acl.createPermission(
    rootAccount,
    dao.address,
    APP_MANAGER_ROLE,
    rootAccount,
    { from: rootAccount }
  )

  return { dao, acl }
}

const newApp = async (dao, appName, baseAppAddress, rootAccount) => {
  const receipt = await dao.newAppInstance(
    hash(`${appName}.aragonpm.test`),
    baseAppAddress,
    '0x',
    false,
    { from: rootAccount }
  )

  // Find the deployed proxy address in the tx logs.
  const logs = receipt.logs
  const log = logs.find((l) => l.event === 'NewAppProxy')
  const proxyAddress = log.args.proxy

  return proxyAddress
}

module.exports = {
  newDao,
  newApp,
}
