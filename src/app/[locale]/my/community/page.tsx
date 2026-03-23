"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAppKitAccount } from "@reown/appkit/react";

interface UpgradeCondition {
  address: string;
  process: number;
  presentLevel: number;
  targetLevel: number;
  conditions: {
    stakeAmount: {
      present: number;
      target: number;
      achieved: boolean;
    };
    referrals: {
      present: number;
      target: number;
      achieved: boolean;
    };
  };
}

export default function MyCommunityPage() {
  const t = useTranslations("my");
  const router = useRouter();
  const { address } = useAppKitAccount();
  const [upgradeData, setUpgradeData] = useState<UpgradeCondition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpgradeCondition = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/user/upgrade-condition", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: address,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch upgrade condition");
        }

        const result = await response.json();
        setUpgradeData(result.data);
      } catch (err) {
        console.error("Error fetching upgrade condition:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUpgradeCondition();
  }, [address]);

  // 计算进度百分比
  const progressPercentage = upgradeData
    ? Math.min(Math.round(upgradeData.process * 100), 100)
    : 0;

  // 格式化数字显示
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen h-full bg-black text-white">
        <div className="flex-1 pb-16 pt-20 bg-black flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen h-full bg-black text-white">
      {/* Main content area with bottom padding for nav and top padding for header */}
      <div className="flex-1 pb-16 pt-20 bg-black">
        <div className="p-4">
          {/* Header with back button */}
          <div className="mb-6 relative z-50">
            <button
              onClick={() => router.back()}
              className="mb-4 p-2"
              aria-label="Go back"
            >
              <Image
                src="/images/icons/arrow-left.svg"
                alt="Back"
                width={24}
                height={24}
              />
            </button>
            <h1 className="text-lg font-semibold mb-2 flex items-center pl-2">
              <div className="w-1 h-5 bg-[#3B82F6] mr-2"></div>
              <span className="text-white">{t("my_community")}</span>
            </h1>
          </div>

          {/* Community Badge */}
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-lg p-1 ">
              <Image
                src={`/images/badges/v${upgradeData?.presentLevel || 0}.svg`}
                alt="Community Badge"
                width={150}
                height={150}
              />
            </div>
            <h2 className="text-lg font-bold text-white">
              V{upgradeData?.presentLevel || 0} {t("community_page.community")}
            </h2>
          </div>

          {/* Upgrade Progress Card */}
          <div className="rounded-lg p-3 mb-6 border border-[#3B82F6]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white">
                {t("community_page.upgrade")}
              </span>
              <span className="text-sm text-white">
                V{upgradeData?.presentLevel || 0}-V
                {upgradeData?.targetLevel || 0} {t("community_page.progress")}:{" "}
                {progressPercentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-700 rounded-full mb-2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercentage}%`,
                  background:
                    "linear-gradient(270deg, #3B82F6 0%, #3B82F6 100%)",
                }}
              ></div>
            </div>

            {/* Requirements List */}
            <div className="space-y-4">
              {/* Stake Requirement */}
              {/* <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full ${
                    upgradeData?.conditions.stakeAmount.achieved
                      ? "bg-[#FFC355]"
                      : "bg-red-500"
                  } flex items-center justify-center mr-3`}
                >
                  {upgradeData?.conditions.stakeAmount.achieved ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-white text-lg">
                  {t("community_page.community_pledge")}{" "}
                  {formatNumber(
                    upgradeData?.conditions.stakeAmount.present || 0
                  )}
                  /
                  {formatNumber(
                    upgradeData?.conditions.stakeAmount.target || 0
                  )}{" "}
                  TXT
                </span>
              </div> */}

              {/* Referrals Requirement */}
              {/* <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full ${upgradeData?.conditions.referrals.achieved ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center mr-3`}>
                  {upgradeData?.conditions.referrals.achieved? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-white text-lg">
                  {t('community_page.cultivate')} V{upgradeData?.presentLevel} {t('community_page.friends')} {upgradeData?.conditions.referrals.present || 0}/{upgradeData?.conditions.referrals.target || 0}
                </span>
              </div> */}
            </div>

            {/* Upgrade Tip */}
            <div className="">
              <h3 className="text-sm font-semibold mb-2">
                {t("community_page.upgrade_tip")}:
              </h3>
              {upgradeData?.presentLevel === upgradeData?.targetLevel ? (
                <p className="text-white text-sm">
                  {t("community_page.max_level_reached")}
                </p>
              ) : (
                <p
                  className=" text-sm"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  {!upgradeData?.conditions.stakeAmount.achieved
                    ? `${t("community_page.need_more_stake")} ${formatNumber(
                        (upgradeData?.conditions.stakeAmount.target || 0) -
                          (upgradeData?.conditions.stakeAmount.present || 0)
                      )} TXT`
                    : `${t("community_page.ready_to_upgrade")}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
