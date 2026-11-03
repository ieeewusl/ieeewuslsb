import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'MMMM d, yyyy'): string {
  return format(new Date(date), fmt)
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isEventPast(endAt: string | null, startAt: string): boolean {
  const compareDate = endAt ? new Date(endAt) : new Date(startAt)
  return isPast(compareDate)
}

export function isEventUpcoming(startAt: string): boolean {
  return isFuture(new Date(startAt))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    workshop: 'Workshop',
    seminar: 'Seminar',
    competition: 'Competition',
    social: 'Social',
    webinar: 'Webinar',
    conference: 'Conference',
    hackathon: 'Hackathon',
    other: 'Event',
  }
  return labels[category] ?? 'Event'
}

export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}${path}`
}
