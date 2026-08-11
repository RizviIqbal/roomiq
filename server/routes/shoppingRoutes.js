const express = require("express");
const router  = express.Router();
const {
  addShoppingItem, getShoppingList, markItemBought, deleteShoppingItem, claimItem, checkoutItems, storeAlert,
  addInventoryItem, getInventory, updateInventory, getLowStockItems
} = require("../controllers/shoppingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/list",                        protect, addShoppingItem);
router.get("/list/:houseId",               protect, getShoppingList);
router.put("/list/:itemId/bought",         protect, markItemBought);
router.put("/list/:itemId/claim",          protect, claimItem);
router.delete("/list/:itemId",             protect, deleteShoppingItem);

router.post("/checkout",                   protect, checkoutItems);
router.post("/store-alert",                protect, storeAlert);

router.post("/inventory",                  protect, addInventoryItem);
router.get("/inventory/:houseId",          protect, getInventory);
router.get("/inventory/:houseId/low-stock",protect, getLowStockItems);
router.put("/inventory/:itemId",           protect, updateInventory);

module.exports = router;
