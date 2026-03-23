import { TokenType, transaction, TxFlowStatus, TxFlowType } from "@prisma/client";
import { isTransactionFinalized } from "@/utils/chain";
import prisma from "@/lib/prisma";
import { cleanUserMiningLevelPerformanceCache, updateSuperiorNodeReward } from "@/lib/user";
import { processBalanceUpdate } from "@/lib/balance";

export async function processLockTx(tx: transaction) {
  if (!tx || tx.status !== TxFlowStatus.PENDING || tx.type !== TxFlowType.LOCK || !tx.tx_hash) {
    return;
  }

  const { status, fee, error } = await isTransactionFinalized(tx.tx_hash, tx.created_at.getTime());

  console.debug('Processing lock transaction:', tx.tx_hash, { status, fee, error });
  if (status === TxFlowStatus.PENDING) {
    return;
  }

  const user = await prisma.user_info.findUnique({
    where: {
      address: tx.from_address
    },
    select: {
      superior: true,
      type: true,
      path: true
    }
  });


  if (!user) {
    console.error('User not found:', tx.from_address);
    return;
  }

  await prisma.$transaction(async (prisma) => {



    if (status === TxFlowStatus.FAILED) {

      // Update tx_flow status to confirmed
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: status,
          tx_fee: fee,
          description: JSON.stringify({ "error": error })
        }
      });
      await prisma.user_info.update({
        where: {
          address: tx.from_address.toLowerCase()
        },
        data: {
          type: null
        }
      });
      return
    } else if (status === TxFlowStatus.CONFIRMED && user.superior && user.type) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: status,
          tx_fee: fee,
          description: JSON.stringify({ "rewarded": true })
        }
      });
      
      await updateSuperiorNodeReward({
        walletAddress: tx.from_address.toLowerCase(),
        superiorAddress: user.superior,
        type: user.type,
        tx: prisma
      });
    } else if (status === TxFlowStatus.CONFIRMED) {
      // await processBalanceUpdate({
      //   address: tx.from_address,
      //   amount: tx.amount,
      //   type: TxFlowType.STAKE,
      //   tokenType: TokenType.TXT,
      // }, prisma);
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: status,
          tx_fee: fee,
        }
      });
    }
  });
  //await cleanUserMiningLevelPerformanceCache(tx.from_address)
}