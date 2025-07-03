import { Router } from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} from "../controllers/transaction.controller.js";
import { verifyTransactionJWT } from "../middlewares/transactionAuth.middleware.js";

const router = Router();

router.route("/createtransaction").post(verifyTransactionJWT, createTransaction);
router.route("/getalltransactions").get(verifyTransactionJWT, getAllTransactions);
router.route("/gettransaction/:id").get(verifyTransactionJWT, getTransactionById);
router.route("/updatetransaction/:id").patch(verifyTransactionJWT, updateTransaction);
router.route("/deletetransaction/:id").delete(verifyTransactionJWT, deleteTransaction);

export default router;
