import { exit } from "process";
import { AccessPolicy, PolicyType } from "../dist";

// Load SDK library.
const sdk = require("../dist/index.js");
const fs = require("fs");

// Create new wallet. It follows a singleton approach.
const wal = sdk.Wallet.Instance;
console.log(wal)

// Initialize new FileKeystore with storage at ./keystore
const ks = new sdk.FileKeystore("file", "./keystore");
wal.setKeystore(ks)

const ccp = JSON.parse(fs.readFileSync("../connection-profile.json", 'utf8'));
const config = {
    stateStore: '/tmp/statestore',
    caURL: 'https://ca.did.byondz.io:7054',
    caName: 'ca-did',
    caAdmin: 'didadmin',
    caPassword: 'didadminpw',
    tlsOptions: {
        trustedRoots: "-----BEGIN CERTIFICATE-----\nMIICvjCCAmWgAwIBAgIUZtE1bxTys5M2IE1Mf3diJRwVYgEwCgYIKoZIzj0EAwIw\nXDELMAkGA1UEBhMCS1IxDjAMBgNVBAgTBVNlb3VsMQ4wDAYDVQQHEwVTZW91bDES\nMBAGA1UECxMJYnlvbmR6LmlvMRkwFwYDVQQDExBmYWJyaWMtY2Etc2VydmVyMB4X\nDTIzMDQwNzA0MTkwMFoXDTI0MDQwNjA0MjQwMFowWzELMAkGA1UEBhMCVVMxFzAV\nBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQKEwtIeXBlcmxlZGdlcjENMAsG\nA1UECxMEcGVlcjEOMAwGA1UEAxMFcGVlcjAwWTATBgcqhkjOPQIBBggqhkjOPQMB\nBwNCAATAO26F9RQ30HBB0NfIYAcg4/tuv1TPceIiw6oKerjwJ7x4YrwZPKIo9n8U\nzd34oRZyHF43NCmrdHl1iyex0NMyo4IBBDCCAQAwDgYDVR0PAQH/BAQDAgOoMB0G\nA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1Ud\nDgQWBBQe+0nJt2el+MfjJpwFilqOICGXWzAfBgNVHSMEGDAWgBSPsl+4MPOzNDG5\n39nUIQyDanTBYjApBgNVHREEIjAgghNwZWVyMC5kaWQuYnlvbmR6Lmlvgglsb2Nh\nbGhvc3QwVgYIKgMEBQYHCAEESnsiYXR0cnMiOnsiaGYuQWZmaWxpYXRpb24iOiIi\nLCJoZi5FbnJvbGxtZW50SUQiOiJwZWVyMCIsImhmLlR5cGUiOiJwZWVyIn19MAoG\nCCqGSM49BAMCA0cAMEQCIGJcTr2Ugop6l4fRZcDuk5L0Ch6prq7vzY3rd9ii8PkG\nAiBcU/rYXoMELtb14Hw6hdOE1jA3OgexRQUJw3HUXjLPlQ==\n-----END CERTIFICATE-----\n",
        verify: false
    },
    mspId: 'didMSP',
    walletID: 'didMSP Admin',
    asLocalhost: false,
    ccp: ccp,
    chaincodeName: "trustId",
    fcn: "proxy",
    channel: "mychannel"
}

async function configureNetwork() {
    console.log("[*] Configuring network driver...")
    // Create HF driver
    var trustID = new sdk.TrustIdHf(config);
    // Add and configure the network driver in our wallet.
    wal.addNetwork("hf", trustID);
    await wal.networks["hf"].configureDriver()
}

// Create you own DID key pair and register it in the TrustID platform.
async function createDID() {
    // Generate key pair locally.
    const did = await wal.generateDID("RSA", "test", "test")
    console.log("[*] Generated DID: \n", did)
    await did.unlockAccount("test")
    // Register in the platform.
    await wal.networks.hf.createSelfIdentity(did)
    console.log("[*] Self identity registered")
    wal.setDefault(did)
    // Get the registered identity.
    let res = await wal.networks.hf.getIdentity(did, did.id)
    console.log("[*] Get registered identity\n", res)
    let didList = await wal.listDID()
    console.log("[*] DID list: ", didList)
}

// Interact with a service in the platform (you need to create a service before
// being able to call it).
async function serviceInteraction() {
    const did = await wal.getDID("default")

    let access: AccessPolicy = { policy: PolicyType.PublicPolicy }

    // Set Service
    try {
        await wal.networks.hf.createService(did, "byondz-did-v1", "trustId", access, "mychannel")
    } catch (err) {
        console.error(err)
    }
    // Get service
    let res = await wal.networks.hf.getService(did, "byondz-did-v1")
    console.log("[*] Service info:\n", res)
    // Create an asset in the service
    const asset = { assetId: "test" + Date.now(), data: { "a": 1, "b": 2 }, metadata: { "c": 4 } }
    const assetStr = JSON.stringify(asset)
    try {
        res = await wal.networks.hf.invoke(did, "byondz-did-v1", ["createAsset", assetStr], "mychannel")
    } catch (err) {
        console.error(err)
    }
    console.log("[*] Asset creation:\n", res)
    // Get the created asset.
    try {
        res = await wal.networks.hf.invoke(did, "byondz-did-v1", ["getAsset", JSON.stringify({ assetId: asset.assetId })], "mychannel")
    } catch (err) {
        console.error(err)
    }
    console.log("[*] Asset registered\n", res)
}

// Use the wallet to make offchain interactions with your DID
async function walletInteraction() {
    const did = await wal.getDID("default")
    const payload = { hello: "AWESOME PROJECT!!!" }
    console.log("[*] Signing payload: \n", payload)
    const sign = await did.sign(payload)
    console.log("[*] DID signature\n", sign)
    let verify = await did.verify(sign, did)
    console.log("[*] Signature verification\n", verify)
    // const did2 = await wal.generateDID("RSA", "test", "test")
    // verify = await did.verify(sign, did2)
    // console.log("[*] Signature wrong verification\n", verify)
}

// Main async function.
async function main() {
    await configureNetwork()
    await createDID()
    await serviceInteraction()
    await walletInteraction()
    exit(1);
}

main().then(() => { }).catch(console.log)
// tsc getting-started.ts && node getting-started.js
