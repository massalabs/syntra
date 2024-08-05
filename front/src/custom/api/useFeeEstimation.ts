import { useEffect, useState } from 'react';
import { useEstimateFeesPerGas } from 'wagmi';

const VITE_CLAIM_GAS_COST = import.meta.env.VITE_CLAIM_GAS_COST || '92261';
const VITE_LOCK_GAS_COST = import.meta.env.VITE_LOCK_GAS_COST || '73185';
const VITE_APPROVE_GAS_COST = import.meta.env.VITE_APPROVE_GAS_COST || '29823';

export function useFeeEstimation() {
  const { data, refetch } = useEstimateFeesPerGas();
  const [maxFeePerGas, setMaxFeePerGas] = useState(0n);

  useEffect(() => {
    setMaxFeePerGas(data?.maxFeePerGas || 0n);
    const intervalId = setInterval(() => {
      refetch().then((newData) => {
        setMaxFeePerGas(newData.data?.maxFeePerGas || 0n);
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [data, refetch]);

  const estimateClaimFees = () => BigInt(VITE_CLAIM_GAS_COST) * maxFeePerGas;

  const estimateLockFees = () => BigInt(VITE_LOCK_GAS_COST) * maxFeePerGas;

  const estimateApproveFees = () =>
    BigInt(VITE_APPROVE_GAS_COST) * maxFeePerGas;

  return { estimateClaimFees, estimateLockFees, estimateApproveFees };
}
