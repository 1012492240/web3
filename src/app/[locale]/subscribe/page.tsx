import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import EarlyConsensusSubscribe from "@/components/subscribe/early-consensus-subscribe";

export default function SubscribePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EarlyConsensusSubscribe />
    </Suspense>
  );
}
