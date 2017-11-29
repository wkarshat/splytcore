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

const splytTrackerAbi = [{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_listingId","type":"string"},{"name":"_listingAddressS","type":"address"}],"name":"addToTracker","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_listingId","type":"string"}],"name":"getAddressById","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ownedBy","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_contractAddr","type":"address"}],"name":"getIdByAddress","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_version","type":"uint256"},{"name":"_ownedBy","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
const listingAbi = [{"constant":false,"inputs":[{"name":"_title","type":"string"}],"name":"changeTitle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getListingConfig","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"bool"},{"name":"","type":"string"},{"name":"","type":"address"},{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_expirationDate","type":"string"}],"name":"changeExpirationDate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_isActive","type":"bool"}],"name":"changeActiveInactive","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_listingId","type":"string"},{"name":"_title","type":"string"},{"name":"_listedByUserId","type":"string"},{"name":"_dateListed","type":"string"},{"name":"_expirationDate","type":"string"},{"name":"_assetAddress","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
const assetAbi = [{"constant":false,"inputs":[{"name":"_title","type":"string"}],"name":"changeTitle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_userId","type":"string"}],"name":"contribute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_userId","type":"string"}],"name":"getMyContributions","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getAssetConfig","outputs":[{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"bool"},{"name":"","type":"uint256"},{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_assetId","type":"string"},{"name":"_term","type":"uint256"},{"name":"_termType","type":"string"},{"name":"_title","type":"string"},{"name":"_totalCost","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}];
const splytTokenAbi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"_user","type":"address"}],"name":"initUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalMinted","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_description","type":"string"},{"name":"_version","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"TransferEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"ApprovalEvent","type":"event"}];

const splytTrackerAddress = '0x1b7264fefA6a7A0858ec34B0D2E0c394c2d03122'
const splytTokenAddress = '0xe2dcfca20ee270b1adbd4e69bee18236a75505e5'

const assetData = '0x6060604052604051610941380380610941833981016040528080518201919060200180519190602001805182019190602001805182019190602001805191506000905085805161005392916020019061009b565b506001849055600283805161006c92916020019061009b565b506005805460ff19166001179055600482805161008d92916020019061009b565b506006555061013692505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106100dc57805160ff1916838001178555610109565b82800160010185558215610109579182015b828111156101095782518255916020019190600101906100ee565b50610115929150610119565b5090565b61013391905b80821115610115576000815560010161011f565b90565b6107fc806101456000396000f3006060604052361561005f5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416632dbe07c781146100935780635c43217b146100e45780638672aeff1461012a578063994dfab51461018d575b600160a060020a0333163480156108fc0290604051600060405180830381858888f19350505050151561009157600080fd5b005b341561009e57600080fd5b61009160046024813581810190830135806020601f8201819004810201604051908101604052818152929190602084018383808284375094965061032395505050505050565b61009160046024813581810190830135806020601f8201819004810201604051908101604052818152929190602084018383808284375094965061035295505050505050565b341561013557600080fd5b61017b60046024813581810190830135806020601f8201819004810201604051908101604052818152929190602084018383808284375094965061044c95505050505050565b60405190815260200160405180910390f35b341561019857600080fd5b6101a06104bb565b604051808060200189815260200180602001888152602001806020018715151515815260200186815260200185600160a060020a0316600160a060020a0316815260200184810384528c818151815260200191508051906020019080838360005b83811015610219578082015183820152602001610201565b50505050905090810190601f1680156102465780820380516001836020036101000a031916815260200191505b5084810383528a818151815260200191508051906020019080838360005b8381101561027c578082015183820152602001610264565b50505050905090810190601f1680156102a95780820380516001836020036101000a031916815260200191505b50848103825288818151815260200191508051906020019080838360005b838110156102df5780820151838201526020016102c7565b50505050905090810190601f16801561030c5780820380516001836020036101000a031916815260200191505b509b50505050505050505050505060405180910390f35b60075433600160a060020a039081169116141561034f57600481805161034d929160200190610726565b505b50565b60055460009060ff16151561039857600160a060020a0333163480156108fc0290604051600060405180830381858888f19350505050151561039357600080fd5b600080fd5b6103a06106fe565b905080156103da57600160a060020a0333163480156108fc0290604051600060405180830381858888f1935050505015156103da57600080fd5b346008836040518082805190602001908083835b6020831061040d5780518252601f1990920191602091820191016103ee565b6001836020036101000a038019825116818451168082178552505050505050905001915050908152602001604051908190039020805490910190555050565b60006008826040518082805190602001908083835b602083106104805780518252601f199092019160209182019101610461565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020549050919050565b6104c36107a4565b60006104cd6107a4565b60006104d76107a4565b60008060008060015460026003546004600560009054906101000a900460ff16600654600760009054906101000a9004600160a060020a0316878054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105a55780601f1061057a576101008083540402835291602001916105a5565b820191906000526020600020905b81548152906001019060200180831161058857829003601f168201915b50505050509750858054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106415780601f1061061657610100808354040283529160200191610641565b820191906000526020600020905b81548152906001019060200180831161062457829003601f168201915b50505050509550838054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106dd5780601f106106b2576101008083540402835291602001916106dd565b820191906000526020600020905b8154815290600101906020018083116106c057829003601f168201915b50505050509350975097509750975097509750975097509091929394959697565b6000600654346003540111151561071f575060038054340190556000610723565b5060015b90565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061076757805160ff1916838001178555610794565b82800160010185558215610794579182015b82811115610794578251825591602001919060010190610779565b506107a09291506107b6565b5090565b60206040519081016040526000815290565b61072391905b808211156107a057600081556001016107bc5600a165627a7a72305820f17f54d974a1f0a07c693ee056c86acb099923d6ae43cf6caff0dd0d264aa2e80029';
const listingData = '0x6060604052341561000f57600080fd5b604051610c64380380610c648339810160405280805182019190602001805182019190602001805182019190602001805182019190602001805182019190602001805190602001909190505033600660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555085600090805190602001906100b2929190610176565b5084600190805190602001906100c9929190610176565b5083600290805190602001906100e0929190610176565b5082600390805190602001906100f7929190610176565b506001600460006101000a81548160ff0219169083151502179055508160059080519060200190610129929190610176565b5080600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050505050505061021b565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106101b757805160ff19168380011785556101e5565b828001600101855582156101e5579182015b828111156101e45782518255916020019190600101906101c9565b5b5090506101f291906101f6565b5090565b61021891905b808211156102145760008160009055506001016101fc565b5090565b90565b610a3a8061022a6000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632dbe07c7146100675780633cbc75a4146100c45780634e24258d14610373578063f72e16b9146103d0575b600080fd5b341561007257600080fd5b6100c2600480803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506103f5565b005b34156100cf57600080fd5b6100d7610466565b604051808060200180602001806020018060200189151515158152602001806020018873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200186810386528e818151815260200191508051906020019080838360005b8381101561019557808201518184015260208101905061017a565b50505050905090810190601f1680156101c25780820380516001836020036101000a031916815260200191505b5086810385528d818151815260200191508051906020019080838360005b838110156101fb5780820151818401526020810190506101e0565b50505050905090810190601f1680156102285780820380516001836020036101000a031916815260200191505b5086810384528c818151815260200191508051906020019080838360005b83811015610261578082015181840152602081019050610246565b50505050905090810190601f16801561028e5780820380516001836020036101000a031916815260200191505b5086810383528b818151815260200191508051906020019080838360005b838110156102c75780820151818401526020810190506102ac565b50505050905090810190601f1680156102f45780820380516001836020036101000a031916815260200191505b50868103825289818151815260200191508051906020019080838360005b8381101561032d578082015181840152602081019050610312565b50505050905090810190601f16801561035a5780820380516001836020036101000a031916815260200191505b509d505050505050505050505050505060405180910390f35b341561037e57600080fd5b6103ce600480803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050610870565b005b34156103db57600080fd5b6103f3600480803515159060200190919050506108e1565b005b600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415610463578060019080519060200190610461929190610955565b505b50565b61046e6109d5565b6104766109d5565b61047e6109d5565b6104866109d5565b60006104906109d5565b600080600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415610866576000600160026003600460009054906101000a900460ff166005600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16878054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105de5780601f106105b3576101008083540402835291602001916105de565b820191906000526020600020905b8154815290600101906020018083116105c157829003601f168201915b50505050509750868054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561067a5780601f1061064f5761010080835404028352916020019161067a565b820191906000526020600020905b81548152906001019060200180831161065d57829003601f168201915b50505050509650858054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107165780601f106106eb57610100808354040283529160200191610716565b820191906000526020600020905b8154815290600101906020018083116106f957829003601f168201915b50505050509550848054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107b25780601f10610787576101008083540402835291602001916107b2565b820191906000526020600020905b81548152906001019060200180831161079557829003601f168201915b50505050509450828054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561084e5780601f106108235761010080835404028352916020019161084e565b820191906000526020600020905b81548152906001019060200180831161083157829003601f168201915b50505050509250975097509750975097509750975097505b9091929394959697565b600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156108de5780600590805190602001906108dc929190610955565b505b50565b600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156109525780600460006101000a81548160ff0219169083151502179055505b50565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061099657805160ff19168380011785556109c4565b828001600101855582156109c4579182015b828111156109c35782518255916020019190600101906109a8565b5b5090506109d191906109e9565b5090565b602060405190810160405280600081525090565b610a0b91905b80821115610a075760008160009055506001016109ef565b5090565b905600a165627a7a72305820f81f6fe1b8b78e4f24b47361a904c1849b8dd453427ad150affeefb8f983640d0029';

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
  },
  (err, trxHash) => {
    if(err) {
      console.log(err)
    } else {
      console.log(trxHash)
    }
  })
  .then(newContractInstance => {
    const contractAddress = newContractInstance.options.address;
    listing.assetAddress = contractAddress;
    createListing(listing);
  })
  .error(err => {
    console.log('deploy asset contract on error triggered')
    console.log(err)
  })
}

// Will create listing contract
function createListing(listing) {
  var listingContract = new web3.eth.Contract(listingAbi);
  //listing.marketplace may be null for old listings
  //also applies to editing
  //listing.marketplace.walletAddress
  //listing.marketplace.kickbackAmount
  listingContract.deploy({
    data: listingData,
    arguments: [listing._id, listing.title, listing.listedByUserId, listing.dateListed, listing.expirationDate, listing.assetAddress]
  })
  .send({
      from: account,
      gas: 4300000,
      gasPrice: 700000000000
  },
  (err, trxHash) => {
    if(err) {
      console.log(err)
    } else {
      console.log(trxHash)
    }
  })
  .then(newContractInstance => {
    const contractAddress = newContractInstance.options.address;
    listing.address = contractAddress;
    addToTracker(listing);
  })
  .error(err => {
    console.log('create listing error triggered')
    console.log(err)
  })
}

// Will update tracker with addresses
function addToTracker(listing) {
  var splytTracker = new web3.eth.Contract(splytTrackerAbi, splytTrackerAddress);

  splytTracker.methods.addToTracker(listing._id, listing.address).send({
    from: account,
    gas: 4300000,
    gasPrice: 700000000000
  },
  (err, trxHash) => {
    if(err) {
      console.log(err)
    } else {
      console.log(trxHash)
    }
  })
  .then(newContractInstance => {
    console.log('all done!')
  })
  .error(err => {
    console.log('add to tracker error triggered')
    console.log(err)
  })
}

exports.createWallet = () => {
  // static password for now. will need to tie in user's password later. if we do consider tying reset password or forgot password.
  return web3.eth.personal.newAccount('splytcore2017')
}

exports.getWalletBalance = function (address, cb) {
  var splytToken = new web3.eth.Contract(splytTokenAbi, splytTokenAddress);
  
  splytToken.methods.balanceOf(address).call({from:account}, function (err, balance) {
    console.log(err)
    console.log(balance)
    cb(err, balance)
  })
  // web3.eth.getBalance(address, (err, balance) => {
  //   if(err) {
  //     cb(err, null)
  //   } else {
  //     cb(null, web3.utils.fromWei(balance, 'szabo'))
  //   }
  // })
}

function deactivate({listing, asset}) {
  return new Promise((resolve, reject)=>{
    console.log("ethereum deactivate:", arguments);
    const results = {};
    // todo: do something
    resolve(results);
  });
}

exports.giveOutTokens = (address, cb) => {
  var splytToken = new web3.eth.Contract(splytTokenAbi, splytTokenAddress);
  
  splytToken.methods.initUser(address).send({
    from: account,
    gas: 4300000,
    gasPrice: 700000000000
  },
  (err, trxHash) => {
    if(err) {
      console.log(err)
    } else {
      console.log(trxHash)
    }
  })
  .then(newContractInstance => {
    console.log('Cool!. User has some tokens now!')
    cb(null, null)
  })
  .error(err => {
    console.log('Could not sent transaction to iniUser()')
    console.log(err)
    cb(null, null)
  })
}

exports.contribute = ({amount, userId, userWalletAddress, asset, listing, contributingMarketplaceWalletAddress}) => {
  /* Checking the wallet and withdrawing the money to wherever 
  is presumably an atomic event. If there aren't enough funds
  use the error below so we can handle it specifically. If it's 
  some other error, just bubble it up. 
  It'd be great to get the wallet's new balance as well just so
  we keep the database consistent with the source of truth. */
  return new Promise((resolve, reject)=>{
    let insufficientFunds = false;
    let newWalletBalance = 0;
    if(insufficientFunds) {
      let actualWalletBalance = 0;
      const error = new Error("Insufficient funds");
      error.insufficientFunds = true;
      error.walletBalance = actualWalletBalance;
      return reject(error);
    }
    let ethError = null;
    // if some other error
    if(ethError) {
      return reject(ethError);
    }
    // if successful 
    resolve({
      newWalletBalance 
      /* Add whatever else you need here */
    })
  });
}

exports.createListing = createListing;
exports.addToTracker = addToTracker;
exports.deactivate = deactivate;