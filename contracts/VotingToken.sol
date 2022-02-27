//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VotingToken is ERC20 {
    constructor() ERC20("Ballots", "BBB"){}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}