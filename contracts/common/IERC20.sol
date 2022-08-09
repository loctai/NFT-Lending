// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
interface IERC20 {
    function transferFrom(address from, address to, uint tokens) external returns (bool success);
    function balanceOf(address owner) external view returns (uint balance);
    function transfer(address recipient, uint amount) external returns (bool success);
}