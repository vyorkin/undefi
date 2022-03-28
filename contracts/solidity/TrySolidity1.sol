//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// foo, bar, baz, qux, quux, quuz, corge, grault,
// garply, waldo, fred, plugh, xyzzy, thud

library TrySolidityLib1 {
    // internal means that function max is embedded in the calling contract
    function max(uint256 x, uint256 y) internal pure returns (uint256) {
        return x >= y ? x : y;
    }

    // we're going to call this on contract state var
    // so we use "storage" data location
    function find(uint256[] storage arr, uint256 x)
        internal
        view
        returns (uint256)
    {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == x) {
                return i;
            }
        }
        revert("not found");
    }
}

contract TrySolidity1 {
    using TrySolidityLib1 for uint256[];

    function testMax(uint256 x, uint256 y) external pure returns (uint256) {
        return TrySolidityLib1.max(x, y);
    }

    uint256[] public arr = [3, 2, 1];

    function testFind() external view returns (uint256) {
        // return TrySolidityLib1.find(arr, 2);
        return arr.find(2);
    }

    // like constant but initializes on contract deploy
    // uses less Gas
    address public immutable owner = msg.sender;

    uint256[] private amounts;
    // can't push and pop from fixed-size arrays
    uint256[5] private ids = [1, 2, 3, 4, 5];

    function getArrays()
        external
        view
        returns (uint256[] memory, uint256[5] memory)
    {
        return (amounts, ids);
    }

    struct Foo {
        uint256 x;
        string y;
    }

    function getLengths() external view returns (uint256, uint256) {
        return (amounts.length, ids.length);
    }

    mapping(address => Foo) public foos;

    function setFoo(uint256 _x, string memory _y) external {
        foos[msg.sender] = Foo({x: _x, y: _y});
    }

    function updateFoo(string memory _y) external returns (Foo memory) {
        // ERROR: Data location must be "storage", "memory" or
        // "calldata" for variable, but none was given
        // Foo s = foos[msg.sender];

        Foo storage s = foos[msg.sender];
        s.y = _y;
        return s;
    }

    function notUpdateFoo() external view returns (Foo memory) {
        Foo memory s = foos[msg.sender];
        s.y = "not updated";
        return s;
    }

    function bar(uint256[] calldata xs, string calldata s) external {
        // no copying, saves Gas
        _barNoCopy(xs, s);
        // copy each element in xs and s, Gas wasted
        _barCopy(xs, s);
    }

    function _barCopy(uint256[] memory, string memory) private {}

    function _barNoCopy(uint256[] calldata xs, string calldata s) private {}

    function testRevert() external pure returns (uint256[] memory) {
        uint256[] memory memArr = new uint256[](3);
        memArr[1] = 10;

        revert("fucked up");

        return memArr;
    }
}
