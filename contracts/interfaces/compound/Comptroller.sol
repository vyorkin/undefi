// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface Comptroller {
    function markets(address)
        external
        view
        returns (
            bool,
            uint256,
            bool
        );

    function enterMarkets(address[] calldata cTokens)
        external
        returns (uint256[] memory);

    function getAccountLiquidity(address account)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        );

    function liquidationIncentiveMantissa() external view returns (uint256);

    function liquidateCalculateSeizeTokens(
        address cTokenBorrowed,
        address cTokenCollateral,
        uint256 actualRepayAmount
    ) external view returns (uint256, uint256);
}
