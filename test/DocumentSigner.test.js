const {expect} = require("chai");

describe("DocumentSigner", function () {
    let DocumentSigner, documentSigner, owner, signer1, signer2, signer3;

    beforeEach(async () => {
        DocumentSigner = await ethers.getContractFactory("DocumentSigner");
        [owner, signer1, signer2, signer3] = await ethers.getSigners();
        documentSigner = await DocumentSigner.deploy();
        await documentSigner.deployed();
    });

    describe("addDocument", function () {
        it("should add a new document", async function () {
            const documentHash = ethers.utils.id("My Document");
            const signers = [signer1.address, signer2.address];

            await documentSigner.connect(owner).addDocument(documentHash, signers);

            // Используем функцию getSignersStatus, чтобы получить список подписантов
            const [returnedSigners, _] = await documentSigner.getSignersStatus(documentHash);

            expect(returnedSigners.length).to.equal(signers.length);
            expect(returnedSigners[0]).to.equal(signers[0]);
            expect(returnedSigners[1]).to.equal(signers[1]);
        });


        it("should not allow adding the same document twice", async function () {
            const documentHash = ethers.utils.id("My Document");
            const signers = [signer1.address, signer2.address];

            await documentSigner.connect(owner).addDocument(documentHash, signers);

            await expect(
                documentSigner.connect(owner).addDocument(documentHash, signers)
            ).to.be.revertedWith("Document already exists");
        });
    });

    describe("signDocument", function () {
        it("should allow a signer to sign a document", async function () {
            const documentHash = ethers.utils.id("My Document");
            const signers = [signer1.address, signer2.address];

            await documentSigner.connect(owner).addDocument(documentHash, signers);
            await documentSigner.connect(signer1).signDocument(documentHash);

            // Используем функцию getSignersStatus, чтобы получить статусы подписи для подписантов
            const [_, signedStatus] = await documentSigner.getSignersStatus(documentHash);

            expect(signedStatus[0]).to.be.true;
        });


        it("should not allow signing a non-existent document", async function () {
            const documentHash = ethers.utils.id("Non-existent Document");

            await expect(
                documentSigner.connect(signer1).signDocument(documentHash)
            ).to.be.revertedWith("Document not found");
        });

        it("should not allow signing a document twice", async function () {
            const documentHash = ethers.utils.id("My Document");
            const signers = [signer1.address, signer2.address];

            await documentSigner.connect(owner).addDocument(documentHash, signers);
            await documentSigner.connect(signer1).signDocument(documentHash);

            await expect(
                documentSigner.connect(signer1).signDocument(documentHash)
            ).to.be.revertedWith("Already signed");
        });

        it("should not allow a non-signer to sign a document", async function () {
            const documentHash = ethers.utils.id("My Document");
            const signers = [signer1.address, signer2.address];

            await documentSigner.connect(owner).addDocument(documentHash, signers);

            await expect(
                documentSigner.connect(signer3).signDocument(documentHash)
            ).to.be.revertedWith("Not a signer");
        });
    });

    describe("getSignersStatus", function () {
        it("should return signer addresses and their signing statuses", async function () {
            const documentHash = ethers.utils.id("My Document");
            const signers = [signer1.address, signer2.address];

            await documentSigner.connect(owner).addDocument(documentHash, signers);
            await documentSigner.connect(signer1).signDocument(documentHash);

            const [returnedSigners, signedStatus] = await documentSigner.getSignersStatus(documentHash);

            expect(returnedSigners.length).to.equal(signers.length);
            expect(returnedSigners[0]).to.equal(signers[0]);
            expect(returnedSigners[1]).to.equal(signers[1]);
            expect(signedStatus[0]).to.be.true;
            expect(signedStatus[1]).to.be.false;
        });

        it("should return empty arrays for non-existent document", async function () {
            const documentHash = ethers.utils.id("Non-existent Document");

            const [returnedSigners, signedStatus] = await documentSigner.getSignersStatus(documentHash);

            expect(returnedSigners.length).to.equal(0);
            expect(signedStatus.length).to.equal(0);
        });
    });
});
