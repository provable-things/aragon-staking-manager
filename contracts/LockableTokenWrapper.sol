pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/SafeERC20.sol";
import "@aragon/os/contracts/lib/token/ERC20.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-vault/contracts/Vault.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";


contract LockableTokenWrapper is AragonApp {
    using SafeERC20 for ERC20;
    using SafeMath for uint256;

    // bytes32 public constant CHANGE_LOCK_TIME = keccak256("CHANGE_LOCK_TIME");
    // prettier-ignore
    bytes32 public constant CHANGE_LOCK_TIME = 0x0de662b08a8e500dc68984655a8d4ef796f9c697661693a04531c26d3f7bfb99;

    // prettier-ignore
    string private constant ERROR_ADDRESS_NOT_CONTRACT = "EXTERNAL_TOKEN_WRAPPER_ADDRESS_NOT_CONTRACT";
    // prettier-ignore
    string private constant ERROR_TOKEN_WRAP_REVERTED = "EXTERNAL_TOKEN_WRAPPER_WRAP_REVERTED";
    // prettier-ignore
    string private constant ERROR_INSUFFICENT_WRAP_TOKENS = "EXTERNAL_TOKEN_WRAPPER_INSUFFICENT_WRAP_TOKENS";
    // prettier-ignore
    string private constant ERROR_INSUFFICENT_UNWRAP_TOKENS = "EXTERNAL_TOKEN_WRAPPER_INSUFFICENT_UNWRAP_TOKENS";
    // prettier-ignore
    string private constant ERROR_NOT_ENOUGH_UNWRAPPABLE_TOKENS = "EXTERNAL_TOKEN_WRAPPER_NOT_ENOUGH_UNWRAPPABLE_TOKENS";

    struct Lock {
        uint256 unlockableTime;
        uint256 amount;
    }

    TokenManager public tokenManager;
    Vault public vault;

    address public depositToken;
    uint256 public lockTime;

    mapping(address => Lock[]) public addressesWrapLock;

    event Wrap(address sender, uint256 amount);
    event Unwrap(address sender, uint256 amount);
    event LockTimeChanged(uint256 lockTime);

    /**
     * @notice Initialize LockableTokenWrapper app contract
     * @param _tokenManager TokenManager address
     * @param _vault Vault address
     * @param _depositToken Accepted token address
     * @param _lockTime number of seconds after which it's possible to unwrap tokens related to a wrap
     */
    function initialize(
        address _tokenManager,
        address _vault,
        address _depositToken,
        uint256 _lockTime
    ) external onlyInit {
        require(isContract(_tokenManager), ERROR_ADDRESS_NOT_CONTRACT);
        require(isContract(_depositToken), ERROR_ADDRESS_NOT_CONTRACT);
        require(isContract(_vault), ERROR_ADDRESS_NOT_CONTRACT);

        tokenManager = TokenManager(_tokenManager);
        vault = Vault(_vault);
        depositToken = _depositToken;
        lockTime = _lockTime;

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

        // TODO check impossible to do more than 20 wrap

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
        addressesWrapLock[msg.sender].push(Lock(unlockableTime, _amount));

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
        auth(CHANGE_LOCK_TIME)
        returns (uint256)
    {
        lockTime = _lockTime;
        emit LockTimeChanged(lockTime);
        return lockTime;
    }

    /**
     * @dev lock.unlockableTime corresponds to the date after which tokens can be unlocked
     */
    function canUnwrap(address _unlocker, uint256 _amount)
        internal
        returns (bool)
    {
        Lock[] storage locks = addressesWrapLock[_unlocker];

        uint256 total = 0;
        for (uint64 i = 0; i < locks.length; i++) {
            if (locks[i].unlockableTime > block.timestamp) {
                sum.add(locks[i].amount);

                // if there is remainder subtract from the last lock
                if (_amount <= total) {
                    // TODO
                }
            }
        }

        return false;
    }
}
