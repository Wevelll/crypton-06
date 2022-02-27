//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DAO is Ownable, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private propsID;

    bytes32 private constant PROP_ADMIN = keccak256("PROP_ADMIN");
    bytes32 private constant VOTER = keccak256("VOTER");

    address public votingToken;
    uint256 public minQuorum;
    uint256 public debateDuration;

    mapping(address => uint256) public balances;
    mapping(address => uint) public latestProp;
    mapping(uint => proposal) public props;

    struct proposal {
        address recepient;
        bool active;
        uint256 quorum;
        uint256 started;
        uint256 finished;
        string description;
        bytes callData;
        int256 votesSum;
        uint256 votedCount;
        mapping(address => bool) voted;
    }

    constructor(
        address chairPerson,
        address _voteToken,
        uint256 _minimumQuorum,
        uint256 _debatingPeriodDuration
    ) {
        _grantRole(PROP_ADMIN, address(this));
        _grantRole(PROP_ADMIN, chairPerson);
        votingToken = _voteToken;
        minQuorum = _minimumQuorum;
        debateDuration = _debatingPeriodDuration;
    }

    event Proposal(uint indexed id, bool active);
    event Vote(uint indexed id, address indexed voter, bool supportAgainst);
    modifier propActive(uint256 id) {
        require(props[id].active, "Prop finished!");
        _;
    }

    function setPropAdmin(address who) external onlyOwner {
        _grantRole(PROP_ADMIN, who);
    }

    function unsetPropAdmin(address who) external onlyOwner {
        _revokeRole(PROP_ADMIN, who);
    }

    function setQuorum(uint256 value) external onlyOwner {
        require(value > 2, "Not enough!");
        minQuorum = value;
    }

    function setPropQuorum(uint256 id, uint256 value)
        public
        propActive(id)
        onlyRole(PROP_ADMIN)
    {
        require(value > 2, "Not enough!");
        props[id].quorum = value;
    }

    function setDebateDuration(uint256 duration) external onlyOwner {
        require(duration > 1 days, "Period too short!");
        debateDuration = duration;
    }

    function addDebateTime(uint256 id, uint256 value)
        public
        propActive(id)
        onlyRole(PROP_ADMIN)
    {
        props[id].finished += value;
    }

    function setCallData(
        uint256 id,
        address recepient,
        bytes memory callData
    ) public propActive(id) onlyRole(PROP_ADMIN) {
        props[id].recepient = recepient;
        props[id].callData = callData;
    }

    function deposit(uint256 amount) external {
        ERC20(votingToken).transferFrom(msg.sender, address(this), amount);
        if (balances[msg.sender] == 0) {
            _grantRole(VOTER, msg.sender);
        }
        balances[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external onlyRole(VOTER) {
        require(
            props[latestProp[msg.sender]].active == false,
            "Finish proposal first!"
        );
        require(balances[msg.sender] >= amount, "Amount exceeds balance!");
        balances[msg.sender] -= amount;
        if (balances[msg.sender] == 0) {
            _revokeRole(VOTER, msg.sender);
        }
        ERC20(votingToken).transfer(msg.sender, amount);
    }

    function addProposal(
        bytes memory callData,
        address _recepient,
        string memory description
    ) external onlyRole(PROP_ADMIN) returns (uint256 id) {
        id = propsID.current();
        proposal storage newProp = props[id];
        newProp.recepient = _recepient;
        newProp.active = true;
        newProp.quorum = minQuorum;
        newProp.started = block.timestamp;
        newProp.finished = block.timestamp + debateDuration;
        newProp.description = description;
        newProp.callData = callData;
        propsID.increment();

        emit Proposal(id, true);
    }

    function vote(uint id, bool supportAgainst)
        external
        propActive(id)
        onlyRole(VOTER)
    {
        proposal storage prop = props[id];
        require(prop.voted[msg.sender] == false, "Already voted!");
        if (supportAgainst) {
            //suppose we won't have issues with int/uint conversion
            prop.votesSum += int256(balances[msg.sender]);
        } else {
            prop.votesSum -= int256(balances[msg.sender]);
        }
        latestProp[msg.sender] = id;
        prop.voted[msg.sender] = true;
        prop.votedCount += balances[msg.sender];

        emit Vote(id, msg.sender, supportAgainst);
    }

    function finishProposal(uint id) external propActive(id) {
        proposal storage prop = props[id];
        require(block.timestamp > prop.finished, "Cannot finish yet!");
        prop.active = false;
        address recepient = prop.recepient;
        if (prop.votedCount >= prop.quorum) {
            if (prop.votesSum > 0) {
                (bool success, ) = recepient.call(prop.callData);
                require(success, "Function call failed!");
            }
        }

        emit Proposal(id, false);
    }
}
