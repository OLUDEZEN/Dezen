<script>
  import { goto } from "$app/navigation";
  import { supabase } from "$lib/supabase";

  let navLinks = [
    { name: "Home", href: "/" },
    { name: "Blogs", href: "/blogs" },
    { name: "Admin", href: "/admin" },
    { name: "Music", href: "/music" }
  ];

  let searchQuery = "";
  let searchResults = [];
  let showResults = false;
  let mobileOpen = false;
  let debounceTimeout;

  function clickOutside(node) {
    const handle = (e) => {
      if (!node.contains(e.target)) showResults = false;
    };
    document.addEventListener("click", handle, true);
    return { destroy() { document.removeEventListener("click", handle, true); } };
  }

  // Debounced Supabase search
  function handleSearch() {
    clearTimeout(debounceTimeout);

    const q = searchQuery.trim();
    if (!q) {
      searchResults = [];
      showResults = false;
      return;
    }

    debounceTimeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("id, title, description, slug")
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(1);

      if (error) {
        console.error("Search error:", error.message);
        searchResults = [];
        showResults = false;
        return;
      }

      searchResults = data || [];
      showResults = searchResults.length > 0;
    }, 400);
  }

  function goTo(item) {
    const href = item?.href ?? `/blogs/${item.slug}`;
    if (href) {
      goto(href);
      searchQuery = "";
      searchResults = [];
      showResults = false;
      mobileOpen = false;
    }
  }

  function onKeydown(e) {
    if (e.key === "Enter" && searchResults.length > 0) {
      e.preventDefault();
      goTo(searchResults[0]);
    } else if (e.key === "Escape") {
      showResults = false;
    }
  }
</script>


<nav class="fixed top-0 left-0 w-full bg-[#FFFDF8]/90 backdrop-blur border-b border-gray-200 shadow-sm z-50">
  <div class="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
    
    <!-- Logo -->
    <h1 class="text-2xl font-bold font-handwritten text-pink-600 tracking-wide">
      Dezen Sherpa
    </h1>

    <!-- Desktop Nav -->
    <ul class="hidden md:flex gap-8 text-base font-medium text-gray-700">
      {#each navLinks as link}
        <li>
          <a href={link.href} class="hover:text-pink-600 hover:underline underline-offset-4 transition">
            {link.name}
          </a>
        </li>
      {/each}
    </ul>

    <!-- Search (desktop only) -->
    <div class="hidden md:block relative w-full max-w-md ml-6" use:clickOutside>
      <div class="flex items-center rounded-full border border-pink-200 bg-white px-4 py-2 shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-pink-300 transition">
        <svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="7" stroke-width="2"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2"></line>
        </svg>
        <input
          type="text"
          bind:value={searchQuery}
          on:input={handleSearch}
          on:keydown={onKeydown}
          placeholder="Search posts..."
          class="flex-1 bg-transparent border-none outline-none px-3 text-sm placeholder-gray-400"
        />
        <button
          on:click={handleSearch}
          class="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-1.5 text-sm text-white font-medium shadow hover:from-pink-600 hover:to-rose-600 active:scale-95 transition"
        >
          Go
        </button>
      </div>

      <!-- Dropdown -->
      {#if showResults && searchResults.length > 0}
        <ul class="absolute mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg z-50">
          {#each searchResults as result}
            <li
              class="px-4 py-3 hover:bg-pink-50 cursor-pointer"
              on:click={() => goTo(result)}
            >
              <div class="font-medium">{result.title}</div>
              {#if result.description}
                <div class="text-sm text-gray-500 line-clamp-1">{result.description}</div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Hamburger (mobile only) -->
    <button
      class="md:hidden text-gray-700 hover:text-pink-600 focus:outline-none"
      on:click={() => (mobileOpen = !mobileOpen)}
    >
      {#if mobileOpen}
        ✖
      {:else}
        ☰
      {/if}
    </button>
  </div>

  <!-- Mobile menu -->
  {#if mobileOpen}
    <div class="md:hidden border-t border-gray-200 bg-white shadow-inner px-6 py-4 space-y-4">
      <ul class="flex flex-col gap-4 text-base font-medium text-gray-700">
        {#each navLinks as link}
          <li>
            <a href={link.href} class="hover:text-pink-600 transition" on:click={() => (mobileOpen = false)}>
              {link.name}
            </a>
          </li>
        {/each}
      </ul>

      <!-- Mobile search -->
      <div class="relative w-full" use:clickOutside>
        <div class="flex items-center rounded-full border border-pink-200 bg-white px-4 py-2 shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-pink-300 transition">
          <svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="7" stroke-width="2"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2"></line>
          </svg>
          <input
            type="text"
            bind:value={searchQuery}
            on:input={handleSearch}
            on:keydown={onKeydown}
            placeholder="Search posts..."
            class="flex-1 bg-transparent border-none outline-none px-3 text-sm placeholder-gray-400"
          />
          <button
            on:click={handleSearch}
            class="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-1.5 text-sm text-white font-medium shadow hover:from-pink-600 hover:to-rose-600 active:scale-95 transition"
          >
            Go
          </button>
        </div>

        <!-- Dropdown -->
        {#if showResults && searchResults.length > 0}
          <ul class="absolute mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg z-50">
            {#each searchResults as result}
              <li
                class="px-4 py-3 hover:bg-pink-50 cursor-pointer"
                on:click={() => goTo(result)}
              >
                <div class="font-medium">{result.title}</div>
                {#if result.description}
                  <div class="text-sm text-gray-500 line-clamp-1">{result.description}</div>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  {/if}
</nav>
