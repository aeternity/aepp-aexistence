pragma solidity ^0.4.4;

contract AeToken {
	function balanceOf(address addr) returns (uint256);
}

contract AEProof {

	AeToken aeToken;
	mapping (bytes32 => Proof) private proofs;
	mapping (address => bytes32[]) private proofsByOwner;

	function AEProof(address tokenAddress) {
		aeToken = AeToken(tokenAddress);
	}

	struct Proof {
		address owner;
		uint timestamp;
		uint proofBlock;
		string comment;
		string ipfsHash;
		string document;
	}

	function notarize(string document, string comment, string ipfsHash) onlyTokenHolder {
		var proofHash = calculateHash(document);
		var proof = proofs[proofHash];
		require(proof.owner == address(0));
		proof.owner = msg.sender;
		proof.timestamp = block.timestamp;
		proof.proofBlock = block.number;
		proof.comment = comment;
		proof.ipfsHash = ipfsHash;
		proof.document = document;

		proofsByOwner[msg.sender].push(proofHash);
	}

	function calculateHash(string document) constant returns (bytes32) {
		return sha256(document);
	}

	function getProof(string document) constant returns (address owner, uint timestamp, uint proofBlock, string comment, string ipfsHash, string storedDocument) {
		var calcHash = calculateHash(document);
		var proof = proofs[calcHash];
		require(proof.owner != address(0));
		owner = proof.owner;
		timestamp = proof.timestamp;
		proofBlock = proof.proofBlock;
		comment = proof.comment;
		ipfsHash = proof.ipfsHash;
		storedDocument = proof.document;
	}

	function getProofByHash(bytes32 hash) constant returns (address owner, uint timestamp, uint proofBlock, string comment, string ipfsHash, string storedDocument) {
		var proof = proofs[hash];
		require(proof.owner != address(0));
		owner = proof.owner;
		timestamp = proof.timestamp;
		proofBlock = proof.proofBlock;
		comment = proof.comment;
		ipfsHash = proof.ipfsHash;
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
		uint balance = aeToken.balanceOf(msg.sender);
		require(balance > 0);
		_;
	}
}
