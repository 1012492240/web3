'use client'

import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface EditMenuProps {
  align?: 'left' | 'right'
  className?: string
}

export default function EditMenu({
  align = 'right',
  className = '',
}: EditMenuProps) {
  return (
    <Menu as="div" className={`relative inline-flex ${className}`}>
      <Menu.Button className="rounded-full">
        <span className="sr-only">Menu</span>
        <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="2" />
          <circle cx="10" cy="16" r="2" />
          <circle cx="22" cy="16" r="2" />
        </svg>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={`origin-top-right z-10 absolute top-full min-w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex py-1 px-3 w-full ${active ? 'bg-gray-50 dark:bg-gray-700/20' : ''}`}
              >
                Option 1
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex py-1 px-3 w-full ${active ? 'bg-gray-50 dark:bg-gray-700/20' : ''}`}
              >
                Option 2
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`font-medium text-sm text-red-500 hover:text-red-600 flex py-1 px-3 w-full ${active ? 'bg-gray-50 dark:bg-gray-700/20' : ''}`}
              >
                Remove
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}