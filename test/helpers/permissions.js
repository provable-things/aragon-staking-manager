const ANY_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'

const setOpenPermission = async (acl, appAddress, role, rootAddress) => {
  await acl.createPermission(ANY_ADDRESS, appAddress, role, rootAddress, {
    from: rootAddress,
  })
}

const setPermission = async (acl, address, appAddress, role, rootAddress) => {
  await acl.createPermission(address, appAddress, role, rootAddress, {
    from: rootAddress,
  })
}

module.exports = {
  setOpenPermission,
  setPermission,
}
