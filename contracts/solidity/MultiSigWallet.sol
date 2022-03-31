//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract MultiSigWallet {
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event Submit(
        address indexed owner,
        uint256 indexed index,
        address indexed to,
        uint256 value,
        bytes data
    );
    event Confirm(address indexed owner, uint256 indexed index);
    event Revoke(address indexed owner, uint256 indexed index);
    event Execute(address indexed owner, uint256 indexed index);

    struct Tx {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }

    address[] public owners;
    uint256 public numConfirmationsRequired;
    mapping(address => bool) isOwner;
    mapping(uint256 => mapping(address => bool)) isConfirmed;
    Tx[] public txs;

    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= owners.length,
            "invalid number of required confirmations"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "invalid owner");
            require(isOwner[owner], "owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    function deposit() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier txExists(uint256 _index) {
        require(_index < txs.length, "tx does not exist");
        _;
    }

    modifier notExecuted(uint256 _index) {
        require(!txs[_index].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint256 _index) {
        require(!isConfirmed[_index][msg.sender], "tx already confirmed");
        _;
    }

    function submit(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner {
        uint256 index = txs.length;
        Tx memory t = Tx({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0
        });
        txs.push(t);
        emit Submit(msg.sender, index, _to, _value, _data);
    }

    function confirm(uint256 _index)
        public
        onlyOwner
        txExists(_index)
        notExecuted(_index)
        notConfirmed(_index)
    {
        Tx storage t = txs[_index];
        isConfirmed[_index][msg.sender] = true;
        t.numConfirmations += 1;
        emit Confirm(msg.sender, _index);
    }

    function execute(uint256 _index)
        public
        onlyOwner
        txExists(_index)
        notExecuted(_index)
    {
        Tx storage t = txs[_index];
        require(
            t.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx"
        );
        t.executed = true;
        (bool success, ) = t.to.call{value: t.value}(t.data);
        require(success, "tx failed");
        emit Execute(msg.sender, _index);
    }

    function revoke(uint256 _index)
        public
        onlyOwner
        txExists(_index)
        notExecuted(_index)
    {
        Tx storage t = txs[_index];
        require(isConfirmed[_index][msg.sender], "tx not confirmed");
        isConfirmed[_index][msg.sender] = false;
        t.numConfirmations -= 1;

        emit Revoke(msg.sender, _index);
    }
}
