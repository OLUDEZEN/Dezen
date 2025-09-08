import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function POST({ request }) {
  const { slug } = await request.json();

  const { error } = await supabase.from('blogs').delete().eq('slug', slug);

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true });
}
