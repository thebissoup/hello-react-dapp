//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/hardhat/console.sol";

// 1)User should be able to send money to an address

contract CoinTransfer {
    // add owner
    uint contractInitDate;
    address contractOwner;
    mapping(address => uint) public balanceReceived;

    constructor(uint _time) {
        contractInitDate = _time;
        contractOwner = msg.sender;
    }

    function getUserBalance() public view returns (uint) {
        return msg.sender.balance;
    }

    // security, should not execute for now
    event Received(address, uint);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }
}
