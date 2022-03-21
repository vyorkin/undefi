# @version ^0.3.1

greet: public(String[100])
value: public(uint256)
owner: public(address)

@external
@payable
def __init__():
  self.greet = "Hello World"
  self.owner = msg.sender
  self.value = msg.value

@external
@pure
def simple(x: uint256, b: bool, s: String[10]) -> (uint256, bool, String[100]):
  return (x + 1, not b, concat(s, "?"))

@internal
@pure
def intFn(x: uint256, y: uint256) -> (uint256, bool):
  return (x + y, True)

@external
@view
def extFn(x: uint256) -> uint256:
  i: uint256 = 1
  b: bool = False
  (i, b) = self.intFn(1, 2)
  return x * x

@external
@payable
def receiveEther():
  self.value = msg.value