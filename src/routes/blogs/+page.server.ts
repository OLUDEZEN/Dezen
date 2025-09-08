import { supabase } from '$lib/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw new Error(error.message);

  return { blogs };
};
