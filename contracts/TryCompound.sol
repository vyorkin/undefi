//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/compound/CERC20.sol";
import "./interfaces/compound/Comptroller.sol";
import "./interfaces/compound/PriceOracle.sol";

contract TryCompound {
    event Log(string message, uint256 val);

    function supply(
        IERC20 _token,
        CERC20 _cToken,
        uint256 _amount
    ) external {
        _token.transferFrom(msg.sender, address(this), _amount);
        _token.approve(address(_cToken), _amount);
        require(_cToken.mint(_amount) == 0, "mint failed");
    }

    function getCTokenBalance(CERC20 _cToken) external view returns (uint256) {
        return _cToken.balanceOf(address(this));
    }

    function getInfo(CERC20 _cToken)
        external
        returns (uint256 exchangeRate, uint256 supplyRate)
    {
        // Exchange rate from cToken to underlying
        // exchangeRate = (getCash() + totalBorrows() - totalReserves()) / totalSupply()
        exchangeRate = _cToken.exchangeRateCurrent();
        // Interest rate for supplying:
        // Amount added to your supply balance per block
        supplyRate = _cToken.supplyRatePerBlock();
    }

    function estimateBalanceOfUnderlying(
        CERC20 _cToken,
        uint256 _decimals,
        uint256 _cTokenDecimals
    ) external returns (uint256) {
        uint256 cTokenBalance = _cToken.balanceOf(address(this));
        uint256 exchangeRate = _cToken.exchangeRateCurrent();

        return
            (cTokenBalance * exchangeRate) /
            10**(18 + _decimals - _cTokenDecimals);
    }

    // The user's underlying balance, representing their assets in the protocol,
    // is equal to the user's cToken balance multiplied by the Exchange Rate
    function balanceOfUnderlying(CERC20 _cToken) external returns (uint256) {
        return _cToken.balanceOfUnderlying(address(this));
    }

    function redeem(CERC20 _cToken, uint256 _cTokenAmount) external {
        require(_cToken.redeem(_cTokenAmount) == 0, "redeem failed");
    }

    Comptroller public comptroller =
        Comptroller(0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B);
    PriceOracle public priceOracle =
        PriceOracle(0x046728da7cb8272284238bD3e47909823d63A58D);

    function getCollateralFactor(CERC20 _cToken)
        external
        view
        returns (uint256)
    {
        (, uint256 collateralFactorMantissa, ) = comptroller.markets(
            address(_cToken)
        );
        // divide by 1e18 to get in %
        return collateralFactorMantissa;
    }

    function getAccountLiquidity()
        external
        view
        returns (uint256 liquidity, uint256 shortfall)
    {
        // liquidity and shortfall in USD scaled up by 1e18
        (uint256 error, uint256 _liquidity, uint256 _shortfall) = comptroller
            .getAccountLiquidity(address(this));

        require(error == 0, "error");
        // normal circumstance: liquidity > 0 and shortfall == 0
        // liquidity > 0 means account can borrow up to `liquidity`
        // shortfall > 0 is subject to liquidation, you borrowed over limit
        return (_liquidity, _shortfall);
    }

    // open price feed - USD price of token to borrow
    function getPriceFeed(address _cToken) external view returns (uint256) {
        // scaled up by 1e18
        return priceOracle.getUnderlyingPrice(_cToken);
    }

    // enter market and borrow
    function borrow(
        CERC20 _cToken,
        CERC20 _cTokenToBorrow,
        uint256 _decimals
    ) external {
        // enter the supply market so you can borrow another type of asset
        address[] memory cTokens = new address[](1);
        cTokens[0] = address(_cToken);
        uint256[] memory errors = comptroller.enterMarkets(cTokens);
        require(errors[0] == 0, "Comptroller.enterMarkets failed");

        // represents the USD value borrowable by a user
        (uint256 error, uint256 liquidity, uint256 shortfall) = comptroller
            .getAccountLiquidity(address(this));
        require(error == 0, "error");
        require(shortfall == 0, "shortfall > 0");
        require(liquidity > 0, "liquidity = 0");

        // most recent price for a token in USD (18 decimals precision)
        uint256 price = priceOracle.getUnderlyingPrice(
            address(_cTokenToBorrow)
        );

        // _decimals - decimals of token to borrow
        uint256 maxBorrow = (liquidity * (10**_decimals)) / price;
        require(maxBorrow > 0, "max borrow = 0");
        // borrow 50%
        uint256 amount = (maxBorrow * 50) / 100;
        require(_cTokenToBorrow.borrow(amount) == 0, "borrow failed");
    }

    // the user's current borrow balance (with interest) in
    // units of the underlying asset
    // (not view function)
    function getBorrowedBalance(address _cTokenBorrowed)
        public
        returns (uint256)
    {
        return CERC20(_cTokenBorrowed).borrowBalanceCurrent(address(this));
    }

    // the current borrow rate as an unsigned integer, scaled by 1e18
    function getBorrowRatePerBlock(address _cTokenBorrowed)
        external
        view
        returns (uint256)
    {
        return CERC20(_cTokenBorrowed).borrowRatePerBlock();
    }

    function repay(
        IERC20 _tokenBorrowed,
        CERC20 _cTokenBorrowed,
        uint256 _amount
    ) external {
        _tokenBorrowed.approve(address(_cTokenBorrowed), _amount);
        require(_cTokenBorrowed.repayBorrow(_amount) == 0, "repay failed");
    }
}
