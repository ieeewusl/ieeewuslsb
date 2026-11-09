'use client'

import { WhatsAppIcon } from '@/components/ui/SocialIcons'

interface WhatsAppFloatingButtonProps {
  channelUrl?: string
}

export default function WhatsAppFloatingButton({
  channelUrl = 'https://whatsapp.com/channel/',
}: WhatsAppFloatingButtonProps) {
  const url = channelUrl && channelUrl.trim().length > 0 ? channelUrl : 'https://whatsapp.com/channel/'

  return (
    <aside aria-label="Official WhatsApp Channel Link" className="fixed bottom-20 right-6 z-40">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our official WhatsApp Channel"
        className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-[#1DA851] via-[#25D366] to-[#2BE873] text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/45 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
      >
        {/* Subtle live indicator badge */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white border border-emerald-500" />
        </span>

        {/* Modern WhatsApp Icon */}
        <WhatsAppIcon size={22} className="text-white drop-shadow-xs" />

        {/* Modern floating tooltip label */}
        <div className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#071A2B]/95 text-white text-xs font-semibold shadow-xl border border-white/10 backdrop-blur-md opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block animate-pulse" />
          <span>Join WhatsApp Channel</span>
          <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#071A2B]/95" />
        </div>
      </a>
    </aside>
  )
}
