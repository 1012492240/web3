"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Proclamation {
  index: number;
  title: string;
  content: string;
  updated_at: string;
}

function ProclaimContent() {
  const t = useTranslations("my");
  const params = useParams();
  const router = useRouter();
  const [proclamations, setProclamations] = useState<Proclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Proclamation | null>(null);

  useEffect(() => {
    const fetchProclamations = async () => {
      try {
        const response = await fetch("/api/info/proclaims", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locale: locale,
          }),
        });
        const data = await response.json();
        if (data.proclamation) {
          setProclamations(data.proclamation);

          // No need to check URL ID here anymore as we have a separate page for that
        }
      } catch (error) {
        console.error("Error fetching proclamations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProclamations();
  }, [params.locale]);

  const handleAnnouncementClick = (announcement: Proclamation) => {
    // Navigate to the dynamic route with the announcement ID
    router.push(`/${locale}/my/proclaim/${announcement.index}`);
  };

  return (
    <div className="flex flex-col min-h-screen h-full bg-black text-white">
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
              <span className="text-white">{t("proclaim_page.title")}</span>
            </h1>
          </div>

          {/* Announcements list */}
          <div className="space-y-4">
            {proclamations.length > 0 ? (
              proclamations.map((proclamation) => (
                <div
                  key={proclamation.index}
                  className="bg-gray-800 rounded-lg p-4 border border-orange-500/30 hover:border-orange-500/50 transition-colors cursor-pointer"
                  onClick={() => handleAnnouncementClick(proclamation)}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-base font-semibold text-white mb-2">
                      {proclamation.title}
                    </h2>
                  </div>
                  <p className="text-gray-300 line-clamp-2 whitespace-pre-wrap text-sm">
                    {proclamation.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(proclamation.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">
                {t("proclaim_page.no_announcements")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* We no longer need the modal here as we're using a separate page */}
    </div>
  );
}

export default function ProclaimPage() {
  return <ProclaimContent />;
}
