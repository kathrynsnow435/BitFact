const Web3 = require("web3");
const sinon = require("sinon");
const chai = require("chai");
const assert = chai.assert;
const BitFact = require("../BitFact");

// testing bitfact object (with faked data).
const bitfact = new BitFact({
  provider: "https://mainnet.infura.io/v3/37a0db22401bbe211112", // no http requests used in tests
  privateKey:
    "67ccc16df9e7581ec11e7483c7eba5f2ae937b7ab37db413bad46470165629cf",
});

// -------

describe("BitFact", () => {
  describe("constructor()", () => {
    it("should return an object", () => {
      assert.typeOf(bitfact, "object");
    });
  });
  describe("formReply()", () => {
    const bf = 'BitFact({"algo":"sha256","hash":"b94e2efcde9","type":"text","memo":"this is memo-izing"})';
    const reply = bitfact.formReply(bf, {
      to: '0xface74f0d85cf2fc5a7cd4f55258493c0535f89b',
      transactionHash: '0x8978f838f6e3f10fb87478c5e6d2cdcddc3b451b39e09d1bba0974d9e4086a96',
      transactionIndex: 4
    });

    it("object should return 3 keys", async () => {
      assert.equal(Object.keys(reply).length, 3);
    });
    it("keys should have correct names", async () => {
      assert.include(Object.keys(reply), "txid");
      assert.include(Object.keys(reply), "hash");
      assert.include(Object.keys(reply), "meta");
    });
    it(".txid and .hash should be strings", async () => {
      assert.isString(reply.txid);
      assert.isString(reply.hash);
    });
    it(".meta should be an object", async () => {
      assert.isObject(reply.meta);
    });
  });

  describe("getPublicKey()", () => {
    it("should return public key", async () => {
      const testKey = "0x9BDf7a7F7FDF391b6EFD32D16c2594ADE09Ff041";
      sinon
        .stub(bitfact.web3.eth.accounts, "privateKeyToAccount")
        .returns({ address: testKey });
      const publicKey = await bitfact.getPublicKey();
      assert.equal(publicKey, testKey);
    });
  });
  describe("getTransactionCount()", () => {
    it("should return number", async () => {
      sinon.stub(bitfact.web3.eth, "getTransactionCount").returns(20);
      const txCount = await bitfact.getTransactionCount();
      assert.isNumber(txCount);
    });
  });
  describe("getGasPrice()", () => {
    it("should return number", async () => {
      sinon.stub(bitfact.web3.eth, "getGasPrice").returns("100000000");
      const gasPrice = await bitfact.getGasPrice();
      assert.isString(gasPrice); // gas price is a string.
    }).timeout(5000);
  });
  describe("buildTx()", () => {
    it("should return object", async () => {
      const txObject = await bitfact.buildTx();
      assert.isObject(txObject); // is object
    });
  });
  describe("signTx()", () => {
    it("should return object", async () => {
      const signedTx = await bitfact.signTx({
        blank: true,
      });
      assert.equal(typeof signedTx, "object"); // returns a buffer, if "object" via js but not chai.
    });
  });
  describe("broadcastTx()", () => {
    it("should return object", async () => {
      const signedTx = await bitfact.signTx({
        blank: true,
      });
      sinon.stub(bitfact.web3.eth, "sendSignedTransaction").returns({
        transactionHash: "0x60868331cbe9ba5e2f39edccac324646ca4536d",
      });
      const broadcastedTx = await bitfact.broadcastTx(signedTx);

      assert.isObject(broadcastedTx);
    });
  });

  // ------------------

  describe("buildFact()", () => {
    const info = {
      algo: "sha256",
      hash: "b94e2efcde9",
      type: "text",
      memo: "this is memo-izing",
    };
    const input = bitfact.buildFact(info.type, info.hash, info.memo);
    it("should be a string", () => {
      assert.isString(input);
    });
    it("should match expected string.", () => {
      assert.equal(input, "BitFact(" + JSON.stringify(info) + ")");
    });
  });
  describe("parseFact()", () => {
    const parsedFact = bitfact.parseFact(
      'BitFact({"algo":"sha256","hash":"b94e2efcde9","type":"text","memo":"this is memo-izing"})'
    );
    it("should return a object from string", async () => {
      assert.isObject(parsedFact);
    });
    it("should have expected matching values", async () => {
      assert.equal(parsedFact.algo, "sha256");
      assert.equal(parsedFact.hash, "b94e2efcde9");
      assert.equal(parsedFact.type, "text");
      assert.equal(parsedFact.memo, "this is memo-izing");
    });
  });
});
