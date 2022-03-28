//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// foo, bar, baz, qux, quux, quuz, corge, grault,
// garply, waldo, fred, plugh, xyzzy, thud

contract TrySolidity1 {
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

    function testRevert() external pure returns (uint256[] memory) {
        uint256[] memory memArr = new uint256[](3);
        memArr[1] = 10;

        revert("fucked up");

        return memArr;
    }
}
