// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocumentSigner {
    struct Document {
        bytes32 documentHash;
        string dropboxUrl;
        address[] signers;
        mapping(address => bool) hasSigned;
    }

    mapping(bytes32 => Document) public documents;
    bytes32[] public documentHashes;

    function addDocument(bytes32 _documentHash, string memory _dropboxUrl, address[] memory _signers) public {
        require(documents[_documentHash].documentHash == 0, "Document already exists");

        documents[_documentHash].documentHash = _documentHash;
        documents[_documentHash].dropboxUrl = _dropboxUrl;
        documents[_documentHash].signers = _signers;
        documentHashes.push(_documentHash);
    }

    function signDocument(bytes32 _documentHash) public {
        require(documents[_documentHash].documentHash != 0, "Document not found");
        require(documents[_documentHash].hasSigned[msg.sender] == false, "Already signed");

        bool isSigner = false;
        for (uint i = 0; i < documents[_documentHash].signers.length; i++) {
            if (documents[_documentHash].signers[i] == msg.sender) {
                isSigner = true;
                break;
            }
        }
        require(isSigner, "Not a signer");
        documents[_documentHash].hasSigned[msg.sender] = true;
    }

    function getSignersStatus(bytes32 _documentHash) public view returns (address[] memory, bool[] memory) {
        address[] memory signers = documents[_documentHash].signers;
        bool[] memory signedStatus = new bool[](signers.length);

        for (uint i = 0; i < signers.length; i++) {
            signedStatus[i] = documents[_documentHash].hasSigned[signers[i]];
        }

        return (signers, signedStatus);
    }

    function getDocumentDropboxUrl(bytes32 _documentHash) public view returns (string memory) {
        require(documents[_documentHash].documentHash != 0, "Document not found");
        return documents[_documentHash].dropboxUrl;
    }

    // Функция для получения списка неподписанных документов для заданного адреса
    function getUnsignedDocuments(address _signer) public view returns (bytes32[] memory) {
        bytes32[] memory unsignedDocuments = new bytes32[](0);
        uint count = 0;

        for (uint documentIndex = 0; documentIndex < documentHashes.length; documentIndex++) {
            bytes32 documentHash = documentHashes[documentIndex];
            bool isSigner = false;
            for (uint i = 0; i < documents[documentHash].signers.length; i++) {
                if (documents[documentHash].signers[i] == _signer) {
                    isSigner = true;
                    break;
                }
            }

            if (isSigner && !documents[documentHash].hasSigned[_signer]) {
                count++;
                bytes32[] memory tempArray = new bytes32[](count);
                for (uint j = 0; j < unsignedDocuments.length; j++) {
                    tempArray[j] = unsignedDocuments[j];
                }
                tempArray[count - 1] = documentHash;
                unsignedDocuments = tempArray;
            }
        }

        return unsignedDocuments;
    }

    // Функция для получения списка подписанных документов для заданного адреса
    function getSignedDocuments(address _signer) public view returns (bytes32[] memory) {
        bytes32[] memory signedDocuments = new bytes32[](0);
        uint count = 0;

        for (uint documentIndex = 0; documentIndex < documentHashes.length; documentIndex++) {
            bytes32 documentHash = documentHashes[documentIndex];
            bool isSigner = false;
            for (uint i = 0; i < documents[documentHash].signers.length; i++) {
                if (documents[documentHash].signers[i] == _signer) {
                    isSigner = true;
                    break;
                }
            }

            if (isSigner && documents[documentHash].hasSigned[_signer]) {
                count++;
                bytes32[] memory tempArray = new bytes32[](count);
                for (uint j = 0; j < signedDocuments.length; j++) {
                    tempArray[j] = signedDocuments[j];
                }
                tempArray[count - 1] = documentHash;
                signedDocuments = tempArray;
            }
        }

        return signedDocuments;
    }

}
