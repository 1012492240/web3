'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import globeIcon from '@/public/images/globe-icon.svg'

// Flag images
import enFlag from '@/public/images/flags/en.svg'
import zhFlag from '@/public/images/flags/zh.svg'
import ptFlag from '@/public/images/flags/pt.svg'
import jaFlag from '@/public/images/flags/ja.svg'
import koFlag from '@/public/images/flags/ko.svg'
import zhHantFlag from '@/public/images/flags/zh-Hant.svg'
import esFlag from '@/public/images/flags/es.svg'
import frFlag from '@/public/images/flags/fr.svg'
import deFlag from '@/public/images/flags/de.svg'
import ruFlag from '@/public/images/flags/ru.svg'
import viFlag from '@/public/images/flags/vi.svg'

// Define locale type based on available locales
type Locale = (typeof routing.locales)[number];

// Language name mapping
const languageMap: Record<Locale, { name: string; flag: any }> = {
  en: {
    name: 'English',
    flag: enFlag
  },
  // pt: {
  //   name: 'Latina',
  //   flag: ptFlag
  // },
  ja: {
    name: '日本語',
    flag: jaFlag
  },
  ko: {
    name: '한국어',
    flag: koFlag
  },
  'zh-Hant': {
    name: '繁體中文',
    flag: zhHantFlag
  },
  zh: {
    name: '简体中文',
    flag: zhFlag
  },
  vi: {
    name: 'Tiếng Việt',
    flag: viFlag
  }
  // es: {
  //   name: 'Español',
  //   flag: esFlag
  // },
  // fr: {
  //   name: 'Français',
  //   flag: frFlag
  // },
  // de: {
  //   name: 'Deutsch',
  //   flag: deFlag
  // },
  // ru: {
  //   name: 'Русский',
  //   flag: ruFlag
  // }
}

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentLocale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Switch language while maintaining the current page
  const switchLanguage = (locale: Locale) => {
    // Don't do anything if we're already on this locale
    if (locale === currentLocale) {
      setIsOpen(false)
      return
    }
    
    console.log('Switching language from', currentLocale, 'to', locale);
    console.log('Current pathname:', pathname);
    
    // With next-intl, the pathname from usePathname() doesn't include the locale
    // We can use router.push with the same pathname to change only the locale
    router.push(pathname, { locale });
    
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="w-6 h-6 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image 
          src={globeIcon} 
          alt="Language" 
          width={20} 
          height={20}
        />
      </div>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-black border border-gray-700 z-50">
          <div className="py-1">
            {routing.locales.map((locale) => (
              <button
                key={locale}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  locale === currentLocale ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => switchLanguage(locale)}
              >
                <Image 
                  src={languageMap[locale].flag} 
                  alt={locale} 
                  width={20} 
                  height={20} 
                  className="mr-2"
                />
                {languageMap[locale].name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
