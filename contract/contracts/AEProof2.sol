pragma solidity ^0.4.4;

contract AeToken {
	function balanceOf(address addr) returns (uint256);
}

contract AEProof2 {

	mapping (bytes32 => Proof) private proofs;
	mapping (address => bytes32[]) private proofsByOwner;

	struct Proof {
		address owner;
		bytes32 proofHash;
		uint timestamp;
		uint proofBlock;
		string comment;
		string document;
	}

	function notarize(string document, string comment) onlyTokenHolder {
		var proofHash = calculateHash(document);
		var proof = proofs[proofHash];
		require(proof.owner == address(0));
		proof.owner = msg.sender;
		proof.proofHash = proofHash;
		proof.timestamp = block.timestamp;
		proof.proofBlock = block.number;
		proof.comment = comment;
		proof.document = document;

		proofsByOwner[msg.sender].push(proofHash);
	}

	function calculateHash(string document) constant returns (bytes32) {
		return sha256(document);
	}

	function getProof(string document) constant returns (address owner, bytes32 proofHash, uint timestamp, uint proofBlock, string comment, string storedDocument) {
		var calcHash = calculateHash(document);
		var proof = proofs[calcHash];
		require(proof.owner != address(0));
		owner = proof.owner;
		proofHash = proof.proofHash;
		timestamp = proof.timestamp;
		proofBlock = proof.proofBlock;
		comment = proof.comment;
		storedDocument = proof.document;
	}

	function getProofByHash(bytes32 hash) constant returns (address owner, bytes32 proofHash, uint timestamp, uint proofBlock, string comment, string storedDocument) {
		var proof = proofs[hash];
		require(proof.owner != address(0));
		owner = proof.owner;
		proofHash = proof.proofHash;
		timestamp = proof.timestamp;
		proofBlock = proof.proofBlock;
		comment = proof.comment;
		storedDocument = proof.document;
	}

	function hasProof(string document) constant returns (bool) {
		var calcHash = calculateHash(document);
		var storedProof = proofs[calcHash];
		if (storedProof.owner == address(0)) {
			return false;
		}
		return true;
	}

	function getProofsByOwner(address owner) constant returns (bytes32[]) {
		return proofsByOwner[owner];
	}

	modifier onlyTokenHolder() {
		AeToken aeToken = AeToken(0x973555E78C6e394ed83238dCBBf2645FA4e0cA33);
		uint balance = aeToken.balanceOf(msg.sender);
		require(balance > 0);
		_;
	}
}
