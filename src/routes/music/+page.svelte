<script lang="ts">
    import { onMount } from 'svelte';
    import { clickOutside } from '$lib/actions';

    let searchQuery = '';
    let results: any = null;
    let loading = false;
    let favorites: any[] = [];

    async function handleSearch() {
        if (!searchQuery.trim()) return;
        loading = true;
        const res = await fetch(`/api/search?query=${searchQuery}`);
        results = await res.json();
        loading = false;
    }

    

  

    function onKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') handleSearch();
    }
</script>

<div class="min-h-screen  text-gray-800 px-4 sm:px-6 lg:px-12 py-8">
    <!-- Title -->
    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-8 text-pink-700">
        IN-Tunes
    </h1>
    <!-- Search Bar -->
    <div class="flex justify-center mb-10">
        <div class="relative w-full max-w-lg" use:clickOutside>
            <div class="flex items-center bg-white rounded-full shadow-md border border-gray-200 px-4 py-2 focus-within:ring-2 focus-within:ring-pink-300 transition">
                <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" stroke-width="2"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2"/>
                </svg>
                <input
                    type="text"
                    bind:value={searchQuery}
                    on:input={handleSearch}
                    on:keydown={onKeydown}
                    placeholder="Search songs, artists..."
                    class="flex-1 bg-transparent border-none outline-none px-3 text-sm sm:text-base placeholder-gray-400"
                />
                <button
                    on:click={handleSearch}
                    class="ml-2 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-full shadow hover:from-pink-600 hover:to-rose-600 active:scale-95 transition"
                >
                    Go
                </button>
            </div>
        </div>
    </div>

    <!-- Loading -->
    {#if loading}
        <p class="text-center text-gray-600 text-base sm:text-lg animate-pulse mb-8">Searching for your songs...</p>
    {/if}

    <!-- Results -->
    {#if results}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Spotify -->
            <div>
                
                <h2 class="text-2xl sm:text-3xl font-bold mb-6 text-gray-600 flex items-center gap-2">
                    
                    Spotify
                </h2>
                <div class="space-y-4">
                    {#each results.spotify?.tracks?.items as track}
                        <div class="bg-white rounded-xl shadow hover:shadow-xl transition p-5 flex flex-col gap-5">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                                <div>
                                    <p class="text-lg items-centre font-semibold">{track.name}</p>
                                    <p class="text-sm items-centre text-gray-500">{track.artists[0].name}</p>
                                </div>
                                
                            </div>
                            <iframe
                                src={`https://open.spotify.com/embed/track/${track.id}`}
                                width="100%"
                                height="300"
                                frameborder="0"
                                allow="encrypted-media"
                                class="rounded-lg"
                            ></iframe>
                            
                        </div>
                    {/each}
                </div>
            </div>

            <!-- YouTube -->
            <div>
                <h2 class="text-2xl sm:text-3xl font-bold mb-6 text-gray-600 flex items-center gap-2">
                    
                    YouTube
                </h2>
                <div class="space-y-4">
                    {#each results.youtube?.items as video}
                        <div class="bg-white rounded-xl shadow hover:shadow-xl transition p-5 flex flex-col gap-3">
                            <p class="text-lg font-semibold">{video.snippet.title}</p>
                            <iframe
                                width="100%"
                                height="400"
                                class="rounded-lg"
                                src={`https://www.youtube.com/embed/${video.id.videoId}`}
                                frameborder="0"
                                allow="autoplay; encrypted-media"
                                allowfullscreen
                            ></iframe>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {:else}
        <p class="text-center text-gray-600 text-base sm:text-lg">Search for songs or artists to see results.</p>
    {/if}

    
</div>
