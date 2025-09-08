<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';

  let title = '';
  let description = '';
  let tags = ''; // comma-separated
  let editor: any;
  let blogs: any[] = [];

  // Auth (basic password)
  let passwordEntered = false;
  let password = '';
  const ADMIN_PASSWORD = 'olulovesdezen'; // ⚠️ change this

  function checkPassword() {
    if (password === ADMIN_PASSWORD) {
      passwordEntered = true;
      loadBlogs();
    } else {
      alert('❌ Incorrect password');
    }
  }

  // Load Quill only if authenticated
  $: if (passwordEntered) {
    setTimeout(async () => {
      if (!editor) {
        const Quill = (await import('quill')).default;
        editor = new Quill('#editor', {
          theme: 'snow',
          placeholder: 'Write your blog content...',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              [{ header: [1, 2, 3, false] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              ['clean']
            ]
          }
        });
      }
    }, 0);
  }

  async function savePost() {
    if (!title.trim() || !editor?.root.innerHTML.trim()) {
      alert('⚠️ Please enter a title and content.');
      return;
    }

    const tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean);

    const { error } = await supabase.from('blogs').insert([
      {
        title,
        description,
        slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''),
        content_html: editor.root.innerHTML,
        tags: tagsArray,
        images: [] // optional, if handling images separately
      }
    ]);

    if (error) {
      console.error(error);
      alert('❌ Failed to save blog.');
    } else {
      alert('✅ Blog saved!');
      title = '';
      description = '';
      tags = '';
      editor.root.innerHTML = '';
      loadBlogs();
    }
  }

  async function loadBlogs() {
    const { data, error } = await supabase
      .from('blogs')
      .select('id, title, slug, date')
      .order('date', { ascending: false });

    if (!error) blogs = data;
  }

  async function deleteBlog(slug: string) {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    const { error } = await supabase.from('blogs').delete().eq('slug', slug);

    if (error) {
      console.error(error);
      alert('❌ Failed to delete blog.');
    } else {
      alert('🗑️ Blog deleted.');
      loadBlogs();
    }
  }
</script>

<style>
  #editor {
    min-height: 400px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
</style>

{#if !passwordEntered}
  <!-- Login Screen -->
  <div class="w-full h-screen flex flex-col justify-center items-center bg-[#FFF8EE]">
    <div class="bg-white p-8 rounded shadow-lg w-96 text-center">
      <h1 class="text-xl font-semibold mb-4">Admin Login</h1>
      <input
        type="password"
        bind:value={password}
        placeholder="Enter Password"
        class="w-full p-3 border border-gray-300 rounded mb-4 focus:ring focus:ring-pink-300"
      />
      <button
        on:click={checkPassword}
        class="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        Enter
      </button>
    </div>
  </div>
{:else}
  <!-- Admin Dashboard -->
  <div class="min-h-screen bg-[#FFF2E6] flex flex-col">
    <!-- Header -->
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-8 text-pink-700">
       Admin Dashboard</h1>
      
  
    <div class="flex justify-end pr-8">
      <button
        on:click={savePost}
        class="bg-pink-500 hover:bg-pink-600 text-white px-10 py-2 rounded-lg text-l font-semibold transition"
      >
        Post
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 p-6 overflow-y-auto">
      <!-- New Blog -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Create New Blog</h2>
        <input
          type="text"
          bind:value={title}
          placeholder="Enter Blog Title"
          class="w-full p-4 text-xl mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-pink-300"
        />

        <input
          type="text"
          bind:value={description}
          placeholder="Enter Blog Description"
          class="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-pink-300"
        />

        <input
          type="text"
          bind:value={tags}
          placeholder="Enter Tags (comma separated)"
          class="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-pink-300"
        />

        <div id="editor" class="mb-6"></div>
      </section>

      <!-- Manage Blogs -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Manage Blogs</h2>
        {#if blogs.length > 0}
          <ul class="space-y-3">
            {#each blogs as blog}
              <li class="flex justify-between items-center bg-white p-4 rounded shadow">
                <span>
                  <strong>{blog.title}</strong>
                  <span class="text-gray-500 text-sm ml-2">
                    {new Date(blog.date).toLocaleDateString()}
                  </span>
                </span>
                <button
                  on:click={() => deleteBlog(blog.slug)}
                  class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                >
                  Delete
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-gray-500">No blogs yet.</p>
        {/if}
      </section>
    </div>
  </div>
{/if}
