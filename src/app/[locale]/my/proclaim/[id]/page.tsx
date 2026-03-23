'use client'

import React, { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'

interface Proclamation {
  index: number
  title: string
  content: string
  updated_at: string
}

function ProclaimDetailContent() {
  const t = useTranslations('my')
  const params = useParams()
  const router = useRouter()
  const [proclamation, setProclamation] = useState<Proclamation | null>(null)
  const [loading, setLoading] = useState(true)
  const locale = useLocale();
  const id = params.id as string

  useEffect(() => {
    const fetchProclamation = async () => {
      try {
        const response = await fetch('/api/info/proclaims', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locale: locale
          })
        })
        const data = await response.json()
        if (data.proclamation) {
          const announcementId = Number(id)
          const selectedProc = data.proclamation.find((p: Proclamation) => p.index === announcementId)
          if (selectedProc) {
            setProclamation(selectedProc)
          }
        }
      } catch (error) {
        console.error('Error fetching proclamation:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProclamation()
  }, [locale, id])

  return (
    <div className="flex flex-col min-h-screen h-full bg-black text-white">
      <div className="flex-1 pb-16 pt-20 bg-black">
        <div className="p-4">
          {/* Header with back button */}
          <div className="mb-6">
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
            <h1 className="text-2xl font-semibold mb-2 flex items-center">
              <div className="w-1 h-10 bg-gradient-to-b from-[#0066CC] to-[#50C8FF] mr-2"></div>
              <span className="text-stroke-2">{t('proclaim_page.title')}</span>
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : proclamation ? (
            <div className="bg-gradient-to-r from-[#0066CC]/30 to-[#50C8FF]/30 rounded-lg p-4 shadow-lg backdrop-blur-sm border border-[#0066CC]/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{proclamation.title}</h2>
              </div>
              <div className="text-gray-300 whitespace-pre-wrap">
                {proclamation.content}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">{t('proclaim_page.announcement_not_found')}</p>
              <button 
                onClick={() => router.push(`/${locale}/my/proclaim`)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-[#0066CC] to-[#50C8FF] rounded-lg text-white"
              >
                {t('proclaim_page.back_to_announcements')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProclaimDetailPage() {
  return <ProclaimDetailContent />
}
