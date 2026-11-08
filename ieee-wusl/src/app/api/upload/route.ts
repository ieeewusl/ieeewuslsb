import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const rawExt = file.name.split('.').pop() || 'png'
    const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '')
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
    const storagePath = `${folder}/${safeName}`

    // 1. Try Supabase storage if available
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? await createServiceClient()
        : await createClient()

      // Automatically create 'media' bucket as public if it doesn't already exist
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          await supabase.storage.createBucket('media', { public: true })
        } catch {
          // Ignore if bucket already exists or cannot be created
        }
      }

      const bucketsToTry = ['media', 'public-assets', 'uploads']
      for (const bucketName of bucketsToTry) {
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(storagePath, buffer, {
              contentType: file.type,
              upsert: true,
            })

          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(storagePath)
            return NextResponse.json({ url: publicUrl, path: storagePath })
          }
        } catch {
          // Continue to next bucket if this one fails
        }
      }
    } catch {
      // Supabase storage unavailable or unconfigured, fallback to local/data URL
    }

    // 2. Try saving to public/uploads directory
    try {
      const targetDir = path.join(process.cwd(), 'public', 'uploads', folder)
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }
      const targetPath = path.join(targetDir, safeName)
      fs.writeFileSync(targetPath, buffer)
      const publicUrl = `/uploads/${folder}/${safeName}`
      return NextResponse.json({ url: publicUrl, path: publicUrl })
    } catch {
      // 3. Fallback to base64 Data URL if filesystem write is not allowed
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      return NextResponse.json({ url: dataUrl, path: storagePath })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

