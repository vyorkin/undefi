//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@aave/core-v3/contracts/flashloan/base/FlashLoanReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract TryAaveV3 is FlashLoanReceiverBase {
    event Log(string message, uint256 amount);

    constructor(IPoolAddressesProvider _provider)
        FlashLoanReceiverBase(_provider)
    {}

    function test(address asset, uint256 amount) external {
        uint256 balance = IERC20(asset).balanceOf(address(this));
        require(balance > amount, "balance <= amount");

        address receiver = address(this);
        address[] memory assets = new address[](1);
        assets[0] = asset;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        // 0 - don't open any debt, just revert if funds can't be transferred from the receiver
        // 1 - open debt at stable rate for the value of the amount flash-borrowed to the `onBehalfOf` address
        // 2 - open debt at variable rate for the value of the amount flash-borrowed to the `onBehalfOf` address
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        address onBehalfOf = address(this);

        bytes memory params = "";
        uint16 referralCode = 0;

        POOL.flashLoan(
            receiver,
            assets,
            amounts,
            modes,
            onBehalfOf,
            params,
            referralCode
        );
    }

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address, /*_initiator*/
        bytes calldata /*_params*/
    ) external returns (bool) {
        for (uint256 i = 0; i < assets.length; i++) {
            emit Log("borrowed", amounts[i]);
            emit Log("fee", premiums[i]);

            // do smth with the received funds...

            // repay the loan
            uint256 amountOwing = amounts[i] + premiums[i];
            IERC20(assets[i]).approve(address(POOL), amountOwing);
        }

        return true;
    }
}
