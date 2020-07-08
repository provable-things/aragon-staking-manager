pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/SafeERC20.sol";
import "@aragon/os/contracts/lib/token/ERC20.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-vault/contracts/Vault.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";


contract LockableTokenWrapper is AragonApp {
    using SafeERC20 for ERC20;
    using SafeMath for uint256;

    // prettier-ignore
    bytes32 public constant CHANGE_LOCK_TIME_ROLE = keccak256("CHANGE_LOCK_TIME_ROLE");
    // prettier-ignore
    bytes32 public constant CHANGE_MAX_LOCKS_ROLE = keccak256("CHANGE_MAX_LOCKS_ROLE");

    // prettier-ignore
    string private constant ERROR_ADDRESS_NOT_CONTRACT = "LOCKABLE_TOKEN_WRAPPER_ADDRESS_NOT_CONTRACT";
    // prettier-ignore
    string private constant ERROR_TOKEN_WRAP_REVERTED = "LOCKABLE_TOKEN_WRAPPER_WRAP_REVERTED";
    // prettier-ignore
    string private constant ERROR_INSUFFICENT_WRAP_TOKENS = "LOCKABLE_TOKEN_WRAPPER_INSUFFICENT_WRAP_TOKENS";
    // prettier-ignore
    string private constant ERROR_INSUFFICENT_UNWRAP_TOKENS = "LOCKABLE_TOKEN_WRAPPER_INSUFFICENT_UNWRAP_TOKENS";
    // prettier-ignore
    string private constant ERROR_NOT_ENOUGH_UNWRAPPABLE_TOKENS = "LOCKABLE_TOKEN_WRAPPER_NOT_ENOUGH_UNWRAPPABLE_TOKENS";
    // prettier-ignore
    string private constant ERROR_MAXIMUN_LOCKS_REACHED = "LOCKABLE_TOKEN_WRAPPER_MAXIMUN_LOCKS_REACHED";

    struct Lock {
        uint256 unlockableTime;
        uint256 amount;
    }

    TokenManager public tokenManager;
    Vault public vault;

    address public depositToken;
    uint256 public lockTime;
    uint256 public maxLocks;

    mapping(address => Lock[]) public addressWrapLocks;

    event Wrap(address sender, uint256 amount);
    event Unwrap(address sender, uint256 amount);
    event LockTimeChanged(uint256 lockTime);
    event MaxLocksChanged(uint256 maxLocks);

    /**
     * @notice Initialize LockableTokenWrapper app contract
     * @param _tokenManager TokenManager address
     * @param _vault Vault address
     * @param _depositToken Accepted token address
     * @param _lockTime number of seconds after which it's possible to unwrap tokens related to a wrap
     * @param _maxLocks number of possible lockedWraps for a given address before doing an unwrap
     */
    function initialize(
        address _tokenManager,
        address _vault,
        address _depositToken,
        uint256 _lockTime,
        uint256 _maxLocks
    ) external onlyInit {
        require(isContract(_tokenManager), ERROR_ADDRESS_NOT_CONTRACT);
        require(isContract(_depositToken), ERROR_ADDRESS_NOT_CONTRACT);
        require(isContract(_vault), ERROR_ADDRESS_NOT_CONTRACT);

        tokenManager = TokenManager(_tokenManager);
        vault = Vault(_vault);
        depositToken = _depositToken;
        lockTime = _lockTime;
        maxLocks = _maxLocks;

        initialized();
    }

    /**
     * @notice Wrap a given amount of `depositToken` into tokenManager's token
     * @dev This function requires the MINT_ROLE permission on the TokenManager specified
     * @param _amount Wrapped amount
     */
    function wrap(uint256 _amount) external returns (uint256) {
        require(
            ERC20(depositToken).balanceOf(msg.sender) >= _amount,
            ERROR_INSUFFICENT_WRAP_TOKENS
        );

        require(
            addressWrapLocks[msg.sender].length < maxLocks,
            ERROR_MAXIMUN_LOCKS_REACHED
        );

        require(
            ERC20(depositToken).safeTransferFrom(
                msg.sender,
                address(vault),
                _amount
            ),
            ERROR_TOKEN_WRAP_REVERTED
        );

        tokenManager.mint(msg.sender, _amount);

        uint256 unlockableTime = block.timestamp.add(lockTime);
        addressWrapLocks[msg.sender].push(Lock(unlockableTime, _amount));

        emit Wrap(msg.sender, _amount);
        return _amount;
    }

    /**
     * @notice Unrap a given amount of tokenManager's token
     * @dev This function requires the BURN_ROLE permissions on the TokenManager and TRANSFER_ROLE on the Vault specified
     * @param _amount Wrapped amount
     */
    function unwrap(uint256 _amount) external returns (uint256) {
        require(
            tokenManager.token().balanceOf(msg.sender) >= _amount,
            ERROR_INSUFFICENT_UNWRAP_TOKENS
        );

        require(
            canUnwrap(msg.sender, _amount),
            ERROR_NOT_ENOUGH_UNWRAPPABLE_TOKENS
        );

        tokenManager.burn(msg.sender, _amount);
        vault.transfer(depositToken, msg.sender, _amount);

        emit Unwrap(msg.sender, _amount);
        return _amount;
    }

    /**
     * @notice Change lock time
     * @param _lockTime Lock time
     */
    function changeLockTime(uint256 _lockTime)
        external
        auth(CHANGE_LOCK_TIME_ROLE)
    {
        lockTime = _lockTime;
        emit LockTimeChanged(lockTime);
    }

    /**
     * @notice Change max lockedWraps
     * @param _maxLocks Maximun number of lockedWraps allowed for an address
     */
    function changeMaxLocks(uint256 _maxLocks)
        external
        auth(CHANGE_MAX_LOCKS_ROLE)
    {
        maxLocks = _maxLocks;
        emit MaxLocksChanged(maxLocks);
    }

    /**
    * @notice Return all locked wraps for a given _address
    * @param _address address
    */
    function getWrapLocks(address _address) external view returns (Lock[]) {
        return addressWrapLocks[_address];
    }

    /**
     * @notice Check if it's possible to unwrap the specified _amount of token and updates (or deletes) related lockedWraps
     * @dev lock.unlockableTime corresponds to the date after which tokens can be unlocked
     * @param _unwrapper address who want to unwrap
     * @param _amount amount
     */
    function canUnwrap(address _unwrapper, uint256 _amount)
        internal
        returns (bool)
    {
        Lock[] storage lockedWraps = addressWrapLocks[_unwrapper];

        uint256 total = 0;
        uint256[] memory lockToRemove = new uint256[](lockedWraps.length);
        uint256 indexLockToRemove = 0;

        bool result = false;
        for (uint64 i = 0; i < lockedWraps.length; i++) {
            if (block.timestamp >= lockedWraps[i].unlockableTime) {
                total = total.add(lockedWraps[i].amount);

                if (_amount == total) {
                    lockToRemove[indexLockToRemove] = i;
                    indexLockToRemove = indexLockToRemove.add(1);
                    result = true;
                    break;
                } else if (_amount < total) {
                    // remainder. update it from the last lock
                    lockedWraps[i].amount = total.sub(_amount);
                    result = true;
                    break;
                } else {
                    lockToRemove[indexLockToRemove] = i;
                    indexLockToRemove = indexLockToRemove.add(1);
                }
            }
        }

        for (uint64 j = 0; j < indexLockToRemove; j++) {
            delete lockedWraps[lockToRemove[j]];
        }

        return result;
    }
}
