<script lang="ts">
  export let data;
  const { blogs } = data;
</script>

<svelte:head>
  <title>Dezen's World | Blogs</title>
  <meta name="description" content="Read inspiring blogs by Dezen Sherpa on art, poetry, travel, and more." />
</svelte:head>

<main class="min-h-screen  py-16">
  <div class="max-w-5xl mx-auto px-6">
    <!-- Page Title -->
    <header class="text-center mb-12">
      <h1 class="text-5xl font-extrabold text-pink-700 mb-4">Canvas of Thought</h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Thoughts, art, poetry, and travel experiences from my world to yours.
      </p>
    </header>

    <!-- Blog Grid -->
    {#if blogs.length > 0}
      <div class="grid md:grid-cols-2 gap-8">
        {#each blogs as blog}
          <a href={`/blogs/${blog.slug}`} class="block bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            {#if blog.image?.[0]}
              <img src={blog.image} alt={blog.title} class="w-full h-56 object-cover" />
            {/if}
            <div class="p-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-2">{blog.title}</h2>
              <p class="text-gray-500 mb-3 line-clamp-2">{blog.subtitle}</p>
              <p class="text-sm text-gray-400">{new Date(blog.date).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}</p>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <p class="text-center text-gray-500 text-lg">No blogs yet. Stay tuned!</p>
    {/if}
  </div>
</main>
