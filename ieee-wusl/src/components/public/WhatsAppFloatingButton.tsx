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
    <aside aria-label="Official WhatsApp Channel Link" className="fixed bottom-6 left-6 z-40">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our official WhatsApp Channel"
        className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-full bg-[#25D366] text-white shadow-xl hover:shadow-2xl hover:bg-[#20ba5a] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-white/25 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        {/* Pulsing online badge */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
        </span>

        {/* WhatsApp Icon */}
        <div className="flex items-center justify-center shrink-0">
          <WhatsAppIcon size={22} className="text-white drop-shadow-xs" />
        </div>

        {/* Text */}
        <div className="flex flex-col text-left leading-none">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-950/70 hidden sm:block">
            Official Channel
          </span>
          <span className="text-xs sm:text-[13px] font-extrabold tracking-tight text-white drop-shadow-xs">
            Join WhatsApp Channel
          </span>
        </div>
      </a>
    </aside>
  )
}

