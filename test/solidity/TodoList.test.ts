import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { TodoList } from "../../typechain";

describe("TodoList", () => {
  let todoList: TodoList;
  let signers: Record<string, SignerWithAddress>;

  beforeEach(async () => {
    await deployments.fixture("TodoList");

    todoList = await ethers.getContract("TodoList");
    signers = await ethers.getNamedSigners();
  });

  it("works", async () => {
    await todoList.create("foo");
    const todo = await todoList.todos(0);
    expect(todo.text).to.eq("foo");
    expect(todo.completed).to.eq(false);
  });
});
