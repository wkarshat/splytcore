const Web3 = require('web3')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')

let account;


if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHEREUM_URI));
}

// connection check
web3.eth.getAccounts( function(err, res) {
  if(err) {
    console.error(chalk.red('Could not connect to ethereum on ', process.env.ETHEREUM_URI))
    console.log(err)
  } else {
    console.log(chalk.green('Connected to ethereum on ', process.env.ETHEREUM_URI))
    account = res[0]
  }
})

var splytTrackerAbi = [{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_listingId","type":"string"},{"name":"_listingAddressS","type":"address"}],"name":"addToTracker","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_listingId","type":"string"}],"name":"getAddressById","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ownedBy","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_contractAddr","type":"address"}],"name":"getIdByAddress","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_version","type":"uint256"},{"name":"_ownedBy","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
var listingAbi = [{"constant":false,"inputs":[{"name":"_title","type":"string"}],"name":"changeTitle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getListingConfig","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"bool"},{"name":"","type":"string"},{"name":"","type":"address"},{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_expirationDate","type":"string"}],"name":"changeExpirationDate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_isActive","type":"bool"}],"name":"changeActiveInactive","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_listingId","type":"string"},{"name":"_title","type":"string"},{"name":"_listedByUserId","type":"string"},{"name":"_dateListed","type":"string"},{"name":"_expirationDate","type":"string"},{"name":"_assetAddress","type":"address"}],"payable":true,"stateMutability":"payable","type":"constructor"}];
var assetAbi = [{"constant":false,"inputs":[{"name":"_title","type":"string"}],"name":"changeTitle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_userId","type":"string"}],"name":"contribute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_userId","type":"string"}],"name":"getMyContributions","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getAssetConfig","outputs":[{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"bool"},{"name":"","type":"uint256"},{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_assetId","type":"string"},{"name":"_term","type":"uint256"},{"name":"_termType","type":"string"},{"name":"_title","type":"string"},{"name":"_totalCost","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}];
var splytTrackerAddress = "0x1b7264fefA6a7A0858ec34B0D2E0c394c2d03122";

var assetData = '0x6060604052604051610941380380610941833981016040528080518201919060200180519190602001805182019190602001805182019190602001805191506000905085805161005392916020019061009b565b506001849055600283805161006c92916020019061009b565b506005805460ff19166001179055600482805161008d92916020019061009b565b506006555061013692505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106100dc57805160ff1916838001178555610109565b82800160010185558215610109579182015b828111156101095782518255916020019190600101906100ee565b50610115929150610119565b5090565b61013391905b80821115610115576000815560010161011f565b90565b6107fc806101456000396000f3006060604052361561005f5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416632dbe07c781146100935780635c43217b146100e45780638672aeff1461012a578063994dfab51461018d575b600160a060020a0333163480156108fc0290604051600060405180830381858888f19350505050151561009157600080fd5b005b341561009e57600080fd5b61009160046024813581810190830135806020601f8201819004810201604051908101604052818152929190602084018383808284375094965061032395505050505050565b61009160046024813581810190830135806020601f8201819004810201604051908101604052818152929190602084018383808284375094965061035295505050505050565b341561013557600080fd5b61017b60046024813581810190830135806020601f8201819004810201604051908101604052818152929190602084018383808284375094965061044c95505050505050565b60405190815260200160405180910390f35b341561019857600080fd5b6101a06104bb565b604051808060200189815260200180602001888152602001806020018715151515815260200186815260200185600160a060020a0316600160a060020a0316815260200184810384528c818151815260200191508051906020019080838360005b83811015610219578082015183820152602001610201565b50505050905090810190601f1680156102465780820380516001836020036101000a031916815260200191505b5084810383528a818151815260200191508051906020019080838360005b8381101561027c578082015183820152602001610264565b50505050905090810190601f1680156102a95780820380516001836020036101000a031916815260200191505b50848103825288818151815260200191508051906020019080838360005b838110156102df5780820151838201526020016102c7565b50505050905090810190601f16801561030c5780820380516001836020036101000a031916815260200191505b509b50505050505050505050505060405180910390f35b60075433600160a060020a039081169116141561034f57600481805161034d929160200190610726565b505b50565b60055460009060ff16151561039857600160a060020a0333163480156108fc0290604051600060405180830381858888f19350505050151561039357600080fd5b600080fd5b6103a06106fe565b905080156103da57600160a060020a0333163480156108fc0290604051600060405180830381858888f1935050505015156103da57600080fd5b346008836040518082805190602001908083835b6020831061040d5780518252601f1990920191602091820191016103ee565b6001836020036101000a038019825116818451168082178552505050505050905001915050908152602001604051908190039020805490910190555050565b60006008826040518082805190602001908083835b602083106104805780518252601f199092019160209182019101610461565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020549050919050565b6104c36107a4565b60006104cd6107a4565b60006104d76107a4565b60008060008060015460026003546004600560009054906101000a900460ff16600654600760009054906101000a9004600160a060020a0316878054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105a55780601f1061057a576101008083540402835291602001916105a5565b820191906000526020600020905b81548152906001019060200180831161058857829003601f168201915b50505050509750858054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106415780601f1061061657610100808354040283529160200191610641565b820191906000526020600020905b81548152906001019060200180831161062457829003601f168201915b50505050509550838054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106dd5780601f106106b2576101008083540402835291602001916106dd565b820191906000526020600020905b8154815290600101906020018083116106c057829003601f168201915b50505050509350975097509750975097509750975097509091929394959697565b6000600654346003540111151561071f575060038054340190556000610723565b5060015b90565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061076757805160ff1916838001178555610794565b82800160010185558215610794579182015b82811115610794578251825591602001919060010190610779565b506107a09291506107b6565b5090565b60206040519081016040526000815290565b61072391905b808211156107a057600081556001016107bc5600a165627a7a72305820f17f54d974a1f0a07c693ee056c86acb099923d6ae43cf6caff0dd0d264aa2e80029';
var listingData = '0x6060604052604051610a0f380380610a0f8339810160405280805182019190602001805182019190602001805182019190602001805182019190602001805182019190602001805160068054600160a060020a03191633600160a060020a0316179055915060009050868051610079929160200190610102565b50600185805161008d929160200190610102565b5060028480516100a1929160200190610102565b5060038380516100b5929160200190610102565b506004805460ff1916600117905560058280516100d6929160200190610102565b5060078054600160a060020a031916600160a060020a03929092169190911790555061019d9350505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061014357805160ff1916838001178555610170565b82800160010185558215610170579182015b82811115610170578251825591602001919060010190610155565b5061017c929150610180565b5090565b61019a91905b8082111561017c5760008155600101610186565b90565b610863806101ac6000396000f300606060405263ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416632dbe07c7811461005d5780633cbc75a4146100b05780634e24258d14610305578063f72e16b91461035657600080fd5b341561006857600080fd5b6100ae60046024813581810190830135806020601f8201819004810201604051908101604052818152929190602084018383808284375094965061036e95505050505050565b005b34156100bb57600080fd5b6100c361039d565b6040518415156080820152600160a060020a0380841660c0830152821660e0820152610100808252819060208201906040830190606084019060a085019085018e818151815260200191508051906020019080838360005b8381101561013357808201518382015260200161011b565b50505050905090810190601f1680156101605780820380516001836020036101000a031916815260200191505b5086810385528d818151815260200191508051906020019080838360005b8381101561019657808201518382015260200161017e565b50505050905090810190601f1680156101c35780820380516001836020036101000a031916815260200191505b5086810384528c818151815260200191508051906020019080838360005b838110156101f95780820151838201526020016101e1565b50505050905090810190601f1680156102265780820380516001836020036101000a031916815260200191505b5086810383528b818151815260200191508051906020019080838360005b8381101561025c578082015183820152602001610244565b50505050905090810190601f1680156102895780820380516001836020036101000a031916815260200191505b50868103825289818151815260200191508051906020019080838360005b838110156102bf5780820151838201526020016102a7565b50505050905090810190601f1680156102ec5780820380516001836020036101000a031916815260200191505b509d505050505050505050505050505060405180910390f35b341561031057600080fd5b6100ae60046024813581810190830135806020601f8201819004810201604051908101604052818152929190602084018383808284375094965061073695505050505050565b341561036157600080fd5b6100ae6004351515610760565b60065433600160a060020a039081169116141561039a57600181805161039892916020019061078a565b505b50565b6103a5610808565b6103ad610808565b6103b5610808565b6103bd610808565b60006103c7610808565b600654600090819033600160a060020a039081169116141561072c5760045460065460075460008054909360019360029360039360ff90931692600592600160a060020a039081169216908890600019818a16156101000201168790046020601f820181900481020160405190810160405280929190818152602001828054600181600116156101000203166002900480156104a45780601f10610479576101008083540402835291602001916104a4565b820191906000526020600020905b81548152906001019060200180831161048757829003601f168201915b50505050509750868054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105405780601f1061051557610100808354040283529160200191610540565b820191906000526020600020905b81548152906001019060200180831161052357829003601f168201915b50505050509650858054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105dc5780601f106105b1576101008083540402835291602001916105dc565b820191906000526020600020905b8154815290600101906020018083116105bf57829003601f168201915b50505050509550848054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106785780601f1061064d57610100808354040283529160200191610678565b820191906000526020600020905b81548152906001019060200180831161065b57829003601f168201915b50505050509450828054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107145780601f106106e957610100808354040283529160200191610714565b820191906000526020600020905b8154815290600101906020018083116106f757829003601f168201915b50505050509250975097509750975097509750975097505b9091929394959697565b60065433600160a060020a039081169116141561039a57600581805161039892916020019061078a565b60065433600160a060020a039081169116141561039a576004805482151560ff1990911617905550565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106107cb57805160ff19168380011785556107f8565b828001600101855582156107f8579182015b828111156107f85782518255916020019190600101906107dd565b5061080492915061081a565b5090565b60206040519081016040526000815290565b61083491905b808211156108045760008155600101610820565b905600a165627a7a723058206e3ce8c15be4048bd223d57dfbed6b34d3ac33921d6ada1d135cd1b13fd788030029';


// Will create asset contract
exports.deployContracts = function deployContracts(asset, listing) {

  var assetContract = new web3.eth.Contract(assetAbi);

  assetContract.deploy({
    data: assetData,
    arguments: [asset.id, asset.term, asset.termType, asset.title, asset.costBreakdown[0].amount]
  }).send({
      from: account,
      gas: 4300000,
      gasPrice: 700000000000
  }, function(err, trxHash){
    if(err) {
      console.log(err)
    } else {
      console.log(trxHash)
    }
  })
  .then(function(newContractInstance) {
    console.log('Contract address: ',newContractInstance.options.address);
    listing.assetAddress = receipt.contractAddress;
    createListing(listing);
  });
  // .on('receipt', function(receipt){
  //   console.log(receipt.contractAddress);
  //   listing.assetAddress = receipt.contractAddress;
  //   createListing(listing);
  // })
}

// Will create listing contract
function createListing(listing) {

  var listingContract = new web3.eth.Contract(assetAbi);

  listingContract.deploy({
    data: listingData,
    arguments: [listing.id, listing.title, listing.listedByUserId, listing.dateListed, listing.expirationDate, listing.assetAddress]
  }).send({
      from: account,
      gas: 4300000,
      gasPrice: 700000000000
  }, function(err, trxHash){
    if(err) {
      console.log(err)
    } else {
      console.log(trxHash)
    }
  })
  .on('receipt', function(receipt){
    console.log(receipt.contractAddress)
    listing.assetAddress = receipt.contractAddress
    createListing(listing)
  })
}

// Will update tracker with addresses
function addToTracker() {
  console.log('now updating tracker contract')
}

exports.createWallet = function () {
  // static password for now. will need to tie in user's password later. if we do consider tying reset password or forgot password.
  return web3.eth.personal.newAccount('splytcore2017')
}

exports.getWalletBalance = function (address, cb) {
  web3.eth.getBalance(address, (err, balance) => {
    if(err) {
      cb(err, null)
    } else {
      cb(null, web3.utils.fromWei(balance, 'szabo'))
    }
  })
}

exports.createListing = createListing;
exports.addToTracker = addToTracker;