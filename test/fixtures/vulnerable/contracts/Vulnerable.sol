// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Vulnerable {
    address public owner;
    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    // Critical: hardcoded 21000 gas limit for transfer
    function sendEth(address payable to) external {
        uint256 gasForCall = 21000;
        (bool ok,) = to.call{gas: gasForCall}("");
        require(ok, "Transfer failed");
    }

    // High: volatile opcode then heavy computation
    function volatileCompute() external view returns (uint256) {
        uint256 ts = block.timestamp;
        uint256 result = 0;
        for (uint256 i = 0; i < 1000; i++) {
            result += uint256(keccak256(abi.encodePacked(ts, i)));
        }
        return result;
    }

    // High: prevrandao
    function getRandom() external view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp)));
    }

    // High: block.difficulty
    function pseudoRandom() external view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
    }

    // High: block.coinbase
    function getCoinbase() external view returns (address) {
        return block.coinbase;
    }

    // High: BLOBBASEFEE
    function getBlobFee() external view returns (uint256) {
        return block.blobbasefee;
    }

    // High: hardcoded block count (7200 = 1 day at 12s blocks)
    uint256 public constant BLOCKS_PER_DAY = 7200;

    // High: selfdestruct
    function destroy() external {
        require(msg.sender == owner, "Not owner");
        selfdestruct(payable(owner));
    }

    // Moderate: gasleft()
    function gasCheck() external view returns (uint256) {
        return gasleft();
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
}
