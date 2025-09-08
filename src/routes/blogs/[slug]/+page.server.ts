import { supabase } from '$lib/supabase';

export async function load({ params }) {
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !blog) throw new Error('Blog not found');

  return { blog };
}
