const path = require('path');
const repo = require("./contextualListingRepoService").choose();
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const ethereum = require(path.resolve("./controllers/ethereum"));
const clr = require("./create/AjvCreateListingSchemaValidator");
const helpers = require("./../app/ResponseHelpers");
const send500 = helpers.send500,
      send200 = helpers.send200,
      send404Message = helpers.send404Message,
      sendValidationError = helpers.sendValidationError,
      sendUnauthorized = helpers.sendUnauthorized;
const ListingSearchParameters = require("./ListingSearchParameters");
const ListingConversion = require("./ListingConversion");
const toListingResponse = ListingConversion.toListingResponse();
const mapWithDistance = ListingConversion.mapWithDistance();
const SingleErrorResponse = require("./../app/SingleErrorResponse");

const Asset = require("./../models/Asset");
const Listing = require("./../models/Listing");
const ListingDeactivator = require("./deactivate/ListingDeactivator");

const statuses = require("./OwnershipStatuses").makeStatuses();
const inferMarketplaceWalletAddressFromRequest = require("./../marketplace/Auth").inferMarketplaceWalletAddressFromRequest;

function getUserFromContext(req) {
  /* Be sure you're authenticated, otherwise this won't be here */
  if(!req.user) throw 'req.user not found'
  return {
    id:req.user.id,
    name:req.user.name,
    walletAddress:req.user.walletAddress
  };
};

function send404ListingNotFound(res, id) {
  send404Message(res, `Listing '${id}' not found.`);
}

//get /listings/search?location&sort&order&limit
exports.search = function(req, res, next) {
  req.assert('latitude', 'latitude cannot be blank').notEmpty();
  req.assert('longitude', 'longitude cannot be blank').notEmpty();

  let results;
  let criteria;
  let from = {latitude:0, longitude:0}
  if(req.method == "GET") {
    send400(res, {
      message:"The GET version has been obsoleted, use POST."
  });
  } else {
    var criteria2 = Object.assign({}, req.body);
    const meta = Object.assign({}, criteria2.meta);
    delete criteria2.meta;
    // default to only showing active listings
    if(criteria2.match) {
      if(criteria2.match["isActive"] === undefined) {
        criteria2.match.isActive = true;
      }
    }
    from = {
      latitude: req.query.latitude,
      longitude:req.query.longitude
    };
    results = repo.searchByQuery(criteria2.match, meta);
  }

  function transformOneRecord(i) {
    const y = toListingResponse(i, null, req);
    const z = mapWithDistance(y, from);
    return z;
  }

  results.then((envelope)=> {
    if(!envelope.error) {
      const searchResults = envelope.data;
      const pagination = envelope.pagination;
      const items = searchResults
        .map(transformOneRecord);
      const output = {items, pagination};
      send200(res, output);
    } else {
      send500(res, envelope.error)
    }
  });
  results.catch((envelope)=>send500(res, envelope.error));
};
function handleCommonListingError(res, id, envelope) {
    const error = envelope.error;
    if(error.name == "CastError") {
      send404ListingNotFound(res, id);
    } else {
      send500(res, error);
    }
}
exports.getById = function(req, res, next) {
  req.assert('id', 'id cannot be blank').notEmpty();
  const id = req.params.id;
  const results = repo.findById(id);
  results.then((data)=> {
    if(!data.error && data.data) {
      const output = toListingResponse(data.data, null, req);
      send200(res, output);
    } else {
      send404ListingNotFound(res, id);
    }
  });
  results.catch((data)=>{
    handleCommonListingError(res, id, data);
  });
};

function persistAsset(listingRequest) {
  return new Promise((resolve, reject)=>{
    const document = Object.assign({}, listingRequest.asset);
    document.ownership = {};
    Asset.create(document, (error, object)=>{
      if(error) {
        reject({error: error});
      }
      else {
        resolve({data:object})
      }
    });
  });
}
exports.create = function(req, res, next) {
  const validator = new clr.AjvCreateListingSchemaValidator();
  const newListing = req.body;
  const validationSummary = validator.validate(newListing);

  if(validationSummary.length) {
    sendValidationError(res, validationSummary);
    return;
  }

  const listingUser = getUserFromContext(req);
  listingRequest = {
    listing:Object.assign({}, newListing),
    user:Object.assign({}, listingUser),
    asset: Object.assign({}, newListing.asset)
  };
  listingRequest.listing.title = newListing.asset.title;
  if(!listingRequest.listing.marketplace){
    listingRequest.listing.marketplace = {
      kickbackAmount:0
    }
  }
  listingRequest.listing.marketplace.walletAddress = inferMarketplaceWalletAddressFromRequest(req);
  delete listingRequest.listing.asset;

  function inlineAsset() {
    const results = persistAsset(listingRequest);
    results.then((data)=> {
      if(!data.error && data.data) {
        listingRequest.assetId = data.data._id;
        inlineListing(data.data);
      } else {
        send500(res, data.error);
      }
    });
    results.catch((data)=>send500(res, data.error));
  }

  function inlineListing(createdAsset) {
    const results = repo.addNew(listingRequest);
    results.then((data)=> {
      if(!data.error && data.data) {
        const output = toListingResponse(data.data, createdAsset, req);
        try {
          ethereum.deployContracts(createdAsset.toObject(), data.data.toObject());
        } catch(error) {
          return send500(res, {
            message:"Error deploying Ethereum contracts",
            error
          });
        }
        res.status(201).json(output);
      } else {
        send500(res, data.error);
      }
    });
    results.catch((data)=>send500(res, data.error));
  }

  inlineAsset();
};


exports.delete = (deactivator=ListingDeactivator, blockchain=ethereum) => function(req, res, next) {
  req.assert('id', 'id cannot be blank').notEmpty();
  // todo: validation
  // todo: require application/json
  // todo: Ensure that user deleting this actually owns the listing
  const onPromiseRejection = (error)=> {
    send500(res, error);
  };
  const id = req.params.id;
  const findDocuments = ()=>{
    return new Promise((resolve, reject)=>{
      Listing.findById(id).then((listingDocument) => {
        Asset.findById(listingDocument.assetId)
          .then((assetDocument) => {
            resolve({listing:listingDocument, asset:assetDocument})
          }, reject);
      }, reject);
    });
  }
  function triggerDeactivation(documents) {
    const results = deactivator
      .deactivateOnBlockchainAndStore(blockchain, Listing)(documents);

    results.then((data)=> {
      const output = toListingResponse(data.documents.listing, data.documents.asset, req);
      send200(res, output);
    }, onPromiseRejection);
  }
  findDocuments()
    .then(triggerDeactivation, onPromiseRejection);
};

function handleMine(req, res, next, withCriteria) {
  const userId = req.user.id;
  const criteria = {
    "listedByUserId": new mongoose.Types.ObjectId(userId)
  };
  if(withCriteria) {
    withCriteria(criteria);
  }
  const results = repo.searchByQuery(criteria);
  results.then((envelope)=> {
    if(!envelope.error) {
      const searchResults = envelope.data;
      const output = {
        items:searchResults
          .map((i)=>toListingResponse(i, null, req))
        };
      send200(res, output);
    } else {
      send500(res, envelope.error)
    }
  });
  results.catch((envelope)=>send500(res, envelope.error));
}

exports.mine = function(req, res, next) {
  handleMine(req, res, next);
};
exports.mineFunded = function(req, res, next) {
  handleMine(req, res, next, (criteria)=> {
    criteria["asset.ownership.status"] = statuses.funded;
  });
};

exports.editListing = (editor) => function(req, res) {
  const target = req.body;
  const listingId = req.params.id;
  target.id = listingId;
  if(target.marketplace) {
    // Don't overwrite originating marketplace
    delete target.marketplace.walletAddress;
  }
  const userId = req.user.id;
  const results = editor.edit(target, userId);

  function onFulfilled(data) {
    send200(res, toListingResponse(data.listing, data.asset));
    return;
  };
  function onRejected(reason) {
    const errors = reason.errors || reason;
    let sender = sendValidationError;
    if(errors.find(i=>i.code==SingleErrorResponse.codes.unauthorized)) {
      sender = sendUnauthorized;
    }
    sender(res, errors);
    return;
  }
  results.then(onFulfilled, onRejected);
};

exports.makeExpirerController = (expirer) => (req, res, next) => {
  expirer.findActiveExpiredListingsInStore()
    .then(onFound, onError);
  function onFound(searchResults) {
    if(!searchResults || !searchResults.length) {
      return send200(res, {
        message:"No expired records to process"
      });
    }

    const mapped = searchResults;
    expirer.markExpired(mapped)
      .then(onSuccessfulExpiration, onFailedExpiration);
  }
  function onError(error) {
    send500(res, error);
  }
  function onSuccessfulExpiration(successes) {
    if(successes==null) successes=[];
    const getid=(i)=>{
      const listing = i.documents.listing;
      if(listing.id) return listing.id;
      if(listing._id) return listing._id;
      return "???";
    }
    const out = {
      success:true,
      succeeded:successes.map(getid),
      failed:[]
    };
    console.log("Expire job successful result", out);
    send200(res, out);
  }
  function onFailedExpiration(results) {
    console.warn("Expire job failed result", results);
    send500(res, results);
  }
};