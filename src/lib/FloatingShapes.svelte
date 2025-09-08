<script lang="ts">
  import { SVGS } from "$lib/svg";

  const shapes = Object.values(SVGS);
  const numShapes = shapes.length;

  // Generate random positions, sizes, and animation speeds for each shape
  const floatingShapes = shapes.map(shape => ({
    svg: shape,
    top: Math.random() * 90 + "%",        // random top
    left: Math.random() * 90 + "%",       // random left
    size: Math.random() * 60 + 30 + "px", // width/height between 30px-90px
    duration: Math.random() * 8 + 4 + "s" // float duration 4s-12s
  }));
</script>

<style>
  .floating-shape {
    position: absolute;
    pointer-events: none;
    opacity: 0.6;
    animation-name: float;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  @keyframes float {
    0%   { transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
    50%  { transform: translateY(-20px) translateX(15px) rotate(15deg) scale(1.1); }
    100% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
  }
</style>

{#each floatingShapes as shape (shape.svg)}
  <div
    class="floating-shape"
    style="top:{shape.top}; left:{shape.left}; width:{shape.size}; height:{shape.size}; animation-duration:{shape.duration};"
  >
    {@html shape.svg}
  </div>
{/each}
