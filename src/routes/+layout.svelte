<script>
  import "../app.css";
  import Navbar from '$lib/Navbaar.svelte';
  import Footer from '$lib/Footer.svelte';
</script>

<div class="min-h-screen bg-[#F5F1E7] text-gray-800 font-sans">
  <Navbar />
  <main class="pt-24 px-4 md:px-6">
    <slot />
  </main>
  <Footer />
</div>
