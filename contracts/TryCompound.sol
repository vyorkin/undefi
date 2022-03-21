//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/compound/CERC20.sol";

contract TryCompound {
    IERC20 public token;
    CERC20 public cToken;

    constructor(address _token, address _cToken) {
        token = IERC20(_token);
        cToken = CERC20(_cToken);
    }

    function supply(uint256 _amount) external {
        token.transferFrom(msg.sender, address(this), _amount);
        token.approve(address(cToken), _amount);
        require(cToken.mint(_amount) == 0, "mint failed");
    }

    function getCTokenBalance() external view returns (uint256) {
        return cToken.balanceOf(address(this));
    }

    function getInfo()
        external
        returns (uint256 exchangeRate, uint256 supplyRate)
    {
        // Exchange rate from cToken to underlying
        exchangeRate = cToken.exchangeRateCurrent();
        // Interest rate for supplying
        supplyRate = cToken.supplyRatePerBlock();
    }

    function estimateBalanceOfUnderlying() external returns (uint256) {
        uint256 cTokenBalance = cToken.balanceOf(address(this));
        uint256 exchangeRate = cToken.exchangeRateCurrent();
        uint256 decimals = 8; // WBTC
        uint256 cTokenDecimals = 8;

        return
            (cTokenBalance * exchangeRate) /
            10**(18 + decimals - cTokenDecimals);
    }

    function balanceOfUnderlying() external returns (uint256) {
        return cToken.balanceOfUnderlying(address(this));
    }

    function redeem(uint256 _cTokenAmount) external {
        require(cToken.redeem(_cTokenAmount) == 0, "redeem failed");
    }
}
