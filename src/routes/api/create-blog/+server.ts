import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function POST({ request }) {
  const { title, description, contentHtml, tags = [], images = [] } = await request.json();

  const slug = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

  const { data, error } = await supabase
    .from('blogs')
    .insert([
      {
        title,
        description,
        slug,
        content_html: contentHtml,
        tags,
        images
      }
    ])
    .select();

  if (error) {
    console.error(error);
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true, slug });
}
