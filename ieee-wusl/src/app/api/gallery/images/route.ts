import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { album_id, images } = body

    if (!album_id || !images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Missing album_id or images array' }, { status: 400 })
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createServiceClient()
      : await createClient()

    // Get current maximum display_order for this album
    const { data: existingImages } = await supabase
      .from('gallery_images')
      .select('display_order')
      .eq('album_id', album_id)
      .order('display_order', { ascending: false })
      .limit(1)

    const baseOrder = existingImages && existingImages[0]?.display_order ? existingImages[0].display_order + 1 : 0

    const rowsToInsert = images.map((item: { url: string; caption?: string; alt_text?: string; storage_path?: string }, index: number) => {
      const cleanUrl = String(item.url || '').trim()
      return {
        album_id,
        url: cleanUrl,
        storage_path: item.storage_path || cleanUrl,
        caption: item.caption?.trim() || null,
        alt_text: item.alt_text?.trim() || null,
        display_order: baseOrder + index,
      }
    }).filter(row => Boolean(row.url))

    if (rowsToInsert.length === 0) {
      return NextResponse.json({ error: 'No valid image URLs provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('gallery_images')
      .insert(rowsToInsert)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: data?.length ?? rowsToInsert.length, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add gallery images'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing image id' }, { status: 400 })
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createServiceClient()
      : await createClient()

    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete gallery image'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

