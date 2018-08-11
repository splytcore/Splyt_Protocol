const AssetManager = artifacts.require("./AssetManager.sol");
const OrderManager = artifacts.require("./OrderManager.sol");
const ArbitrationManager = artifacts.require("./ArbitrationManager.sol");

const SplytManager = artifacts.require("./SplytManager.sol");
const SatToken = artifacts.require("./SatToken.sol");
const Asset = artifacts.require("./Asset.sol");
const Arbitration = artifacts.require("./Arbitration.sol");


contract('ArbitrationManagerTest general test cases.', function(accounts) {

  const defaultBuyer = accounts[0];
  const defaultSeller = accounts[1];
  const defaultMarketPlace = accounts[2];
  const defaultArbitrator = accounts[3];
  
  const defaultPrice = 1000;
  const defaultExpDate = (new Date().getTime() / 1000) + 60;
  const defaultAssetId = "0x31f2ae92057a7123ef0e490a";
  const defaultArbitrationId = "0x31f2ae92057a7123ef0e490a";

  const defaultInventoryCount = 2;


  let satTokenInstance;
  let assetManagerInstance;
  let orderManagerInstance;

  let splytManagerInstance;
  let assetInstance;
  let assetAddress;

  let arbitrationInstance;
  let arbitrationAddress;

  //Instantiate the contracts
  init();

  async function create_asset(_assetId = defaultAssetId, _term = 0, _seller = defaultSeller, _title = "MyTitle",
      _totalCost = defaultPrice, _expirationDate = defaultExpDate, _mpAddress = defaultMarketPlace, _mpAmount = 2, _inventoryCount = defaultInventoryCount) {

    await assetManagerInstance.createAsset(_assetId, _term, _seller, _title, _totalCost, _expirationDate, _mpAddress, _mpAmount, _inventoryCount);
    assetAddress = await assetManagerInstance.getAddressById(_assetId);
    assetInstance = await Asset.at(assetAddress);

  }

  async function create_arbitration(_assetAddress = assetAddress, _arbitrationId = "0x31f2ae92057a7123ef0e490a", _reason = 1) {

    await arbitrationManagerInstance.createArbitration(assetAddress, _arbitrationId, _reason, { from: defaultBuyer });
    arbitrationAddress = await arbitrationManagerInstance.getAddressById(_arbitrationId);
    arbitrationInstance = Arbitration.at(arbitrationAddress);

  }

  async function create_order(_assetAddress = assetAddress, _quantity = 1, _amount = defaultPrice) {

    await orderManagerInstance.createOrder(_assetAddress, _quantity, _amount, { from: defaultBuyer });
    // assetInstance = await Asset.at(assetAddress);

  }

  //Instantiate it only once
  async function init() {
    
    console.log('defaultBuyer wallet: ' + defaultBuyer);
    console.log('defaulSeller wallet: ' + defaultSeller);
    console.log('defaultMarketPlace wallet: ' + defaultMarketPlace);

    satTokenInstance = await SatToken.deployed()   
    arbitrationManagerInstance = await ArbitrationManager.deployed()
    assetManagerInstance = await AssetManager.deployed()
    splytManagerInstance = await SplytManager.deployed()
    ordertManagerInstance = await OrderManager.deployed()    
 
  }

  
  // This function gets ran before every test cases in this file.
  beforeEach('Default instances of contracts for each test', async function() {
    //reinitalize each account balance
    accounts.forEach(async function(acc) {
      await satTokenInstance.initUser(acc)
    })

    // let balance = await satTokenInstance.balanceOf(defaultBuyer)
    // console.log('defaultBuyer balance:' + balance)

    // balance = await satTokenInstance.balanceOf(defaultSeller)
    // console.log('defaultSeller balance:' + balance)

  })


  it('should be new arbitration manager contract successfully!', async function() {    
    let arbitrationManagerAddress = arbitrationManagerInstance.address;
    // console.log('orderManager address: ' + orderManagerAddress)
    // assert.equal(orderId, , 'No money should be transfered to seller\'s wallet!');
    assert.notEqual(arbitrationManagerAddress, 0x0, "Arbitration manager has not been deployed!");
  })

  it('should be 1 arbitration contract successfully!', async function() {
    
    await create_asset();
    await create_arbitration();

    let length = await arbitrationManagerInstance.getArbitrationsLength();
    console.log('number of arbitrations: ' + length);
    assert.equal(length, 1, "Number of arbitrations is not 1!");
  })


  it('should be status 2=IN_ARBITRATION after reporter creates an arbitration!', async function() {
    
    let status = await assetInstance.status();

    console.log('asset status after being reported:: ' + status);
    assert.equal(status, 2, "Status is not in IN_ARBITRATION!");
  })


  it('should not be able to purchase order a asset in status 2=IN_ARBITRATION!', async function() {

    try {
      await orderManagerInstance.createOrder();
      assert.isTrue(false, "Should have error out. Should have not created a order if status is 2=IN_ARBITRATION!");
    } catch (e) {
      // console.log(e)
      console.log('yes it errored out as expected since you cannot create a order in status IN_ARBITRATION')
      assert.isTrue(true, "should error. Expected outsome so no output!");
    }

  })


  it('should be able to assign arbitrator in the Arbitration contract!', async function() {

    await arbitrationManagerInstance.setArbitrator(arbitrationAddress, defaultArbitrator);
    console.log('assigning arbitrator: ' + defaultArbitrator);
    let arbitrator = await arbitrationManagerInstance.getArbitrator(arbitrationAddress);
    console.log('returned arbitrator: ' + arbitrator);
    assert.equal(defaultArbitrator, arbitrator,"Arbitrator did not get assigned!");

  })

  it('should arbitrator to set the winner to reporter!', async function() {

    console.log('arbitrator: ' + defaultArbitrator);
    await arbitrationManagerInstance.setWinner(arbitrationAddress, 1, { from: defaultArbitrator });
    // let winner = await arbitrationManagerInstance.getWinner(arbitrationAddress);
    // console.log('winner is ' + winner)
    // assert.equal(1, winner,"Winner is not reporter as expected!");

  })

  // it('should defaultBuyer balance be less than 1000 off original balance', async function() {
  //   await create_asset();

  //   let initBalance = await satTokenInstance.balanceOf(defaultBuyer);
  //   console.log('before purchase balance:' + initBalance);

  //   await create_order(assetAddress, 1, 1000);

  //   let updatedBalance = await satTokenInstance.balanceOf(defaultBuyer);
  //   console.log('after purchase balance:' + updatedBalance);

  //   // assert.equal(orderId, , 'No money should be transfered to seller\'s wallet!');
  //   assert.equal((initBalance - defaultPrice), updatedBalance, "Balance is not -1000 as expected!");
  // })

  // it('should deploy new purchase order contract making total of 3 successfully!', async function() {
  //   await create_order(assetAddress, 1, defaultPrice);
  //   let length = await orderManagerInstance.getOrdersLength();
  //   console.log('number of orders: ' + length);
  //   assert.equal(length, 3, "Number of orders is not 2!");
  // })

  // it('should current inventory at 0', async function() {

  //   let inventory = await assetInstance.inventoryCount();

  //   console.log('current inventory count: ' + inventory);

    // await create_asset();
    // assert.equal(orderId, , 'No money should be transfered to seller\'s wallet!');
    // let status = await assetInstance.status();
    // console.log('status: ' + status);
    // assert.equal(true, false, "Asset status is NOT 1=ACTIVE as expected!");
  // })

  // it('should status be 2=IN_ARBITRATION', async function() {
  //   await create_asset();

  //   // console.log('asset address: ' + assetAddress);
  //   await assetManagerInstance.setStatus(assetAddress, 2);
  //   let status = await assetInstance.status();
  //   // console.log('status: ' + status);
  //   assert.equal(status, 2, "Asset status is NOT 2=IN_ARBITRATION as expected!");
  // })


  // it('should status be 3=EXPIRED', async function() {
  //   await create_asset();

  //   // console.log('asset address: ' + assetAddress);
  //   await assetManagerInstance.setStatus(assetAddress, 3);
  //   let status = await assetInstance.status();
  //   // console.log('status: ' + status);
  //   assert.equal(status, 3, "Asset status is NOT 3=EXPIRED as expected!");
  // })

  // it('should status be 4=CLOSED', async function() {
  //   await create_asset();

  //   // console.log('asset address: ' + assetAddress);
  //   await assetManagerInstance.setStatus(assetAddress, 4);
  //   let status = await assetInstance.status();
  //   //  console.log('status: ' + status);
  //   assert.equal(status, 4, "Asset status is NOT 4=CLOSED as expected!");
  // })

  // it('should asset id 0x31f2ae92057a7123ef0e490a', async function() {
  //   await create_asset();

  //   // console.log('asset address: ' + assetAddress);
  //   let assetInfos = await assetManagerInstance.getAssetInfo(assetAddress);
  //   // console.log('asset id: ' + assetInfos[0]);
  //   // console.log('asset term: ' + assetInfos[1]);
  //   // console.log('assset inventory: ' + assetInfos[2]);
  //   assert.equal(assetInfos[0], "0x31f2ae92057a7123ef0e490a", "Asset id is different than expected!");
  // })

  // it('should return title MyTitle', async function() {
  //   await create_asset();

  //   // console.log('asset address: ' + assetAddress);
  //   let title = await assetInstance.title();
  //   // console.log('asset title: ' + title);
  //   assert.equal(title, "MyTitle", "Asset title is different than expected!");
  // })

  // it('should return inventory of 1', async function() {
  //   await create_asset();

  //   // console.log('asset address: ' + assetAddress);
  //   let count = await assetInstance.inventoryCount();
  //   // console.log('asset inventory: ' + count);
  //   assert.equal(count, 2, "Asset inventory is different than expected!");
  // })

  // it('should NOT release funds to seller if asset is NOT fully funded and the asset is expired .', async function() {
  //   var time = Date.now()/1000 | 0;
  //   await create_asset("0x31f2ae92057a7123ef0e490a", 1, accounts[1], "MyTitle", 1000, time+5, accounts[2], 2);
  //   await assetInstance.contribute(accounts[2], accounts[0], 100);
  //   await sleep(10*1000);
  //   await assetInstance.releaseFunds();
  //   var getBal0 = await splytTrackerInstance.getBalance.call(accounts[1]);
  //   assert.equal(getBal0.valueOf(), defaultTokenAmount, 'No money should be transfered to seller\'s wallet!');
  // })

  // it('should NOT release funds to seller if asset is fully funded && the asset is expired .', async function() {
  //   var time = Date.now()/1000 | 0;
  //   await create_asset("0x31f2ae92057a7123ef0e490a", 1, accounts[1], "MyTitle", 1000, time+1, accounts[2], 2);
  //   await assetInstance.contribute(accounts[2], accounts[0], 100);
  //   await sleep(5*1000);
  //   await assetInstance.releaseFunds();
  //   var getBal0 = await splytTrackerInstance.getBalance.call(accounts[1]);
  //   assert.equal(getBal0.valueOf(), defaultTokenAmount, 'No money should be transfered to seller\'s wallet!');
  // })

  // it('should release funds to seller if asset is fully funded and the asset is expired .', async function() {
  //   var time = Date.now()/1000 | 0;
  //   var kickbackAmount = 2;
  //   var sellerBefore = await splytTrackerInstance.getBalance.call(accounts[4]);
  //   await create_asset("0x31f2ae92057a7123ef0e490a", 1, accounts[4], "MyTitle", 1000, time+5, accounts[0], kickbackAmount);
  //   await assetInstance.contribute(accounts[0], accounts[2], 1000);
  //   await sleep(10*1000);
  //   await assetInstance.releaseFunds();
  //   var sellerAfter = await splytTrackerInstance.getBalance.call(accounts[4]);
  //   assert.equal(sellerAfter - sellerBefore, 1000 - kickbackAmount, 'Incorrect amount of money has been transfered to sellers wallet.');
  // })

  // it('should return that my contribution is zero if _assetId is \'0x0\'', async function() {
  //   await create_asset("0x0", 1, accounts[1], "MyTitle", 1000, 10001556712588, accounts[2], 2);
  //   await assetInstance.contribute.call(accounts[2], accounts[0], 100);
  //   var result = await assetInstance.getMyContributions(accounts[0]);
  //   assert.equal(result.valueOf(), 0, 'User shouldn\'t have any contributions - see \'internalContribute\' function in SplytTracker.sol contract.');
  // })

  // it('should return revert if mpGets = 0', async function() {
  //   await create_asset("0x31f2ae92057a7123ef0e490a", 0, accounts[1], "MyTitle", 1000, 10001556712588, accounts[2], 0);
  //   var error;
  //   try {
  //     await assetInstance.contribute.call(accounts[2], accounts[0], 100);
  //   } catch (err) {
  //     error = err;
  //   }
  //   assert.equal(error, 'Error: VM Exception while processing transaction: revert', 'Revert error has not happened!');
  //   var result = await assetInstance.getMyContributions(accounts[0]);
  //   assert.equal(result.valueOf(), 0, 'User shouldn\'t have any contributions - see \'internalContribute\' function in SplytTracker.sol contract.');
  // })




  // it('calcDistribution - calculate how much seller gets after kickbacks taken out.', async function() {
  //   var calc = await assetInstance.calcDistribution();
  //   assert.equal(calc[0].valueOf(), 2, 'Should be equal = _mpAmount / listOfMarketPlaces.length');
  //   assert.equal(calc[1].valueOf(), 998, 'Should be equal = totalCost - (_mpAmount / listOfMarketPlaces.length)');
  // })

  // if('should give correct kickback amounts to marketplaces', async () => {

  // })

  async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
})