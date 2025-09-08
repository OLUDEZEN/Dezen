<!-- src/lib/Blog.svelte -->
<script lang="ts">
  export let title: string;
  export let description: string;
  export let contentHtml: string = '';
  export let tags: string[] = [];
  export let images: string[] = [];
  export let date: string = new Date().toISOString();
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<main class="min-h-screen bg-[#FFF8EE] text-slate-800 font-sans">
  <div class="max-w-4xl mx-auto px-6 py-12">
    <header class="mb-10 flex flex-col gap-2">
      <h1 class="text-3xl md:text-4xl font-serif font-semibold leading-tight text-slate-900">{title}</h1>
      {#if description}<p class="text-sm text-slate-500">{description}</p>{/if}
      {#if tags.length}<div class="mt-2 text-xs text-slate-400">{tags.join(' • ')}</div>{/if}
    </header>

    <article class="prose prose-slate max-w-none">
      {@html contentHtml}
    </article>

    {#if images.length}
      <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each images as img}
          <img src={img} alt={title} class="rounded-lg shadow" />
        {/each}
      </div>
    {/if}

    <footer class="mt-12 border-t border-slate-100 pt-6 flex items-center justify-between text-sm text-slate-500">
      <div><span>Written by <strong>Dezen Sherpa</strong></span><span class="mx-2">•</span><span>@Puspa_Kamal</span></div>
      <div><time datetime={date.split('T')[0]}>{new Date(date).toLocaleDateString()}</time></div>
    </footer>
  </div>
</main>

<style>
  :global(.prose) { line-height: 1.6; }
  :global(a:focus) { outline: 3px solid rgba(99,102,241,0.18); outline-offset: 3px; }
</style>
