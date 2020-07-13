pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/SafeERC20.sol";
import "@aragon/os/contracts/lib/token/ERC20.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-vault/contracts/Vault.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@aragon/os/contracts/lib/math/SafeMath64.sol";


contract StakingManager is AragonApp {
    using SafeERC20 for ERC20;
    using SafeMath for uint256;
    using SafeMath64 for uint64;

    // prettier-ignore
    bytes32 public constant CHANGE_LOCK_TIME_ROLE = keccak256("CHANGE_LOCK_TIME_ROLE");
    // prettier-ignore
    bytes32 public constant CHANGE_MAX_LOCKS_ROLE = keccak256("CHANGE_MAX_LOCKS_ROLE");
    // prettier-ignore
    bytes32 public constant CHANGE_VAULT_ROLE = keccak256("CHANGE_VAULT_ROLE");

    // prettier-ignore
    string private constant ERROR_ADDRESS_NOT_CONTRACT = "STAKING_MANAGER_ADDRESS_NOT_CONTRACT";
    // prettier-ignore
    string private constant ERROR_TOKEN_WRAP_REVERTED = "STAKING_MANAGER_WRAP_REVERTED";
    // prettier-ignore
    string private constant ERROR_INSUFFICENT_TOKENS = "STAKING_MANAGER_INSUFFICENT_TOKENS";
    // prettier-ignore
    string private constant ERROR_INSUFFICENT_UNLOCKED_TOKENS = "STAKING_MANAGER_INSUFFICENT_UNLOCKED_TOKENS";
    // prettier-ignore
    string private constant ERROR_NOT_ENOUGH_UNWRAPPABLE_TOKENS = "STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS";
    // prettier-ignore
    string private constant ERROR_MAXIMUN_LOCKS_REACHED = "STAKING_MANAGER_MAXIMUN_LOCKS_REACHED";
    // prettier-ignore
    string private constant ERROR_LOCK_TIME_TOO_LOW = "STAKING_MANAGER_LOCK_TIME_TOO_LOW";
    // prettier-ignore
    string private constant ERROR_IMPOSSIBLE_TO_INSERT = "STAKING_MANAGER_IMPOSSIBLE_TO_INSERT";

    uint64 private constant PUSH_THREESHOLD = 1;
    uint64 private constant NOT_PUSH_THREESHOLD = 2;

    struct Lock {
        uint64 lockTime;
        uint256 amount;
        uint256 lockDate;
    }

    TokenManager public tokenManager;
    Vault public vault;

    address public depositToken;
    uint64 public minLockTime;
    uint64 public maxLocks;

    mapping(address => Lock[]) public addressWrapLocks;

    event Staked(
        address sender,
        address receiver,
        uint256 amount,
        uint64 lockTime
    );
    event Unstaked(address receiver, uint256 amount);
    event LockTimeChanged(uint256 lockTime);
    event MaxLocksChanged(uint64 maxLocks);
    event VaultChanged(address vault);

    /**
     * @notice Initialize StakingManager app contract
     * @param _tokenManager TokenManager address
     * @param _vault Vault address
     * @param _depositToken Accepted token address
     * @param _minLockTime number of seconds after which it's possible to unwrap tokens related to a wrap
     * @param _maxLocks number of possible stakedLocks for a given address before doing an unwrap
     */
    function initialize(
        address _tokenManager,
        address _vault,
        address _depositToken,
        uint64 _minLockTime,
        uint64 _maxLocks
    ) external onlyInit {
        require(isContract(_tokenManager), ERROR_ADDRESS_NOT_CONTRACT);
        require(isContract(_depositToken), ERROR_ADDRESS_NOT_CONTRACT);
        require(isContract(_vault), ERROR_ADDRESS_NOT_CONTRACT);

        tokenManager = TokenManager(_tokenManager);
        vault = Vault(_vault);
        depositToken = _depositToken;
        minLockTime = _minLockTime;
        maxLocks = _maxLocks;

        initialized();
    }

    /**
     * @notice Stake a given amount of `depositToken` into tokenManager's token
     * @dev This function requires the MINT_ROLE permission on the TokenManager specified
     * @param _amount Wrapped amount
     * @param _lockTime lock time for this wrapping
     * @param _receiver address who will receive back once unwrapped
     */
    function stake(
        uint256 _amount,
        uint64 _lockTime,
        address _receiver
    ) external returns (bool) {
        require(
            ERC20(depositToken).balanceOf(msg.sender) >= _amount,
            ERROR_INSUFFICENT_TOKENS
        );

        require(_canInsert(_receiver), ERROR_MAXIMUN_LOCKS_REACHED);

        require(_lockTime >= minLockTime, ERROR_LOCK_TIME_TOO_LOW);

        require(
            ERC20(depositToken).safeTransferFrom(
                msg.sender,
                address(vault),
                _amount
            ),
            ERROR_TOKEN_WRAP_REVERTED
        );

        tokenManager.mint(_receiver, _amount);

        uint64 position = _whereInsert(_receiver);
        require(
            position < maxLocks.add(NOT_PUSH_THREESHOLD),
            ERROR_IMPOSSIBLE_TO_INSERT
        );

        // if there is at least an empty slot
        if (position < maxLocks.add(PUSH_THREESHOLD)) {
            addressWrapLocks[_receiver][position] = Lock(
                _lockTime,
                _amount,
                block.timestamp
            );
        } else {
            addressWrapLocks[_receiver].push(
                Lock(_lockTime, _amount, block.timestamp)
            );
        }

        emit Staked(msg.sender, _receiver, _amount, _lockTime);
        return true;
    }

    /**
     * @notice Unstake a given amount of tokenManager's token
     * @dev This function requires the BURN_ROLE permissions on the TokenManager and TRANSFER_ROLE on the Vault specified
     * @param _amount Wrapped amount
     */
    function unstake(uint256 _amount) external returns (uint256) {
        require(
            tokenManager.token().balanceOf(msg.sender) >= _amount,
            ERROR_INSUFFICENT_UNLOCKED_TOKENS
        );

        require(
            _unstake(msg.sender, _amount),
            ERROR_NOT_ENOUGH_UNWRAPPABLE_TOKENS
        );

        tokenManager.burn(msg.sender, _amount);
        vault.transfer(depositToken, msg.sender, _amount);

        emit Unstaked(msg.sender, _amount);
        return _amount;
    }

    /**
     * @notice Change lock time
     * @param _minLockTime Lock time
     */
    function changeMinLockTime(uint64 _minLockTime)
        external
        auth(CHANGE_LOCK_TIME_ROLE)
    {
        minLockTime = _minLockTime;
        emit LockTimeChanged(minLockTime);
    }

    /**
     * @notice Change max stakedLocks
     * @param _maxLocks Maximun number of stakedLocks allowed for an address
     */
    function changeMaxLocks(uint64 _maxLocks)
        external
        auth(CHANGE_MAX_LOCKS_ROLE)
    {
        maxLocks = _maxLocks;
        emit MaxLocksChanged(maxLocks);
    }

    /**
     * @notice Change vault
     * @param _vault new Vault address
     */
    function changeVault(address _vault) external auth(CHANGE_VAULT_ROLE) {
        require(isContract(_vault), ERROR_ADDRESS_NOT_CONTRACT);

        vault = Vault(_vault);
        emit VaultChanged(_vault);
    }

    /**
     * @notice Return all Locks for a given _address
     * @param _address address
     */
    function getStakedLocks(address _address) external view returns (Lock[]) {
        return addressWrapLocks[_address];
    }

    /**
     * @notice Check if it's possible to unwrap the specified _amount of token and updates (or deletes) related stakedLocks
     * @param _unwrapper address who want to unwrap
     * @param _amount amount
     */
    function _unstake(address _unwrapper, uint256 _amount)
        internal
        returns (bool)
    {
        Lock[] storage stakedLocks = addressWrapLocks[_unwrapper];

        uint256 total = 0;
        uint64[] memory lockToRemove = new uint64[](stakedLocks.length);
        uint64 indexLockToRemove = 0;

        bool result = false;
        for (uint64 i = 0; i < stakedLocks.length; i++) {
            if (
                block.timestamp >=
                stakedLocks[i].lockDate.add(stakedLocks[i].lockTime) &&
                !_isWrapLockEmpty(stakedLocks[i])
            ) {
                total = total.add(stakedLocks[i].amount);

                if (_amount == total) {
                    lockToRemove[indexLockToRemove] = i;
                    indexLockToRemove = indexLockToRemove.add(1);
                    result = true;
                    break;
                } else if (_amount < total) {
                    // remainder. update it from the last lock
                    stakedLocks[i].amount = total.sub(_amount);
                    result = true;
                    break;
                } else {
                    lockToRemove[indexLockToRemove] = i;
                    indexLockToRemove = indexLockToRemove.add(1);
                }
            }
        }

        for (uint64 j = 0; j < indexLockToRemove; j++) {
            delete stakedLocks[lockToRemove[j]];
        }

        return result;
    }

    /**
    * @notice Returns the position in which it's possible to insert a new Lock within addressWrapLocks.
              .add(PUSH_THREESHOLD) it means that the array can grow, .add(NOT_PUSH_THREESHOLD) it means error othewise returns the index
              in which it's possible to insert a new Lock
    * @param _address address
    */
    function _whereInsert(address _address) internal view returns (uint64) {
        Lock[] storage stakedLocks = addressWrapLocks[_address];

        if (stakedLocks.length < maxLocks) return maxLocks.add(PUSH_THREESHOLD);

        for (uint64 i = 0; i < stakedLocks.length; i++) {
            if (_isWrapLockEmpty(stakedLocks[i])) {
                return i;
            }
        }

        return maxLocks.add(NOT_PUSH_THREESHOLD);
    }

    /**
     * @notice Check if there an address has reached the max limit of allowed Lock
     * @param _address address
     */
    function _canInsert(address _address) internal view returns (bool) {
        Lock[] storage stakedLocks = addressWrapLocks[_address];

        if (stakedLocks.length < maxLocks) return true;

        for (uint256 i = 0; i < stakedLocks.length; i++) {
            if (_isWrapLockEmpty(stakedLocks[i])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @notice Check if a Lock is empty
     * @param _lock lock
     */
    function _isWrapLockEmpty(Lock memory _lock) internal pure returns (bool) {
        return _lock.lockTime == 0 && _lock.lockDate == 0 && _lock.amount == 0;
    }
}
