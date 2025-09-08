<script lang="ts">
  import Blog from '$lib/Blog.svelte';
  export let data;

  const { blog } = data;
</script>

<Blog
  title={blog.title}
  description={blog.description}
  contentHtml={blog.content_html}
  tags={blog.tags || []}
  images={blog.images || []}
/>
