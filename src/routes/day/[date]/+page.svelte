<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { writable, get } from 'svelte/store';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let Chart: any;
  let chartInstance: any;
  let canvas: HTMLCanvasElement;

  let date = '';
  $: date = $page.params.date || new Date().toISOString().split('T')[0];

  let showChart = false;

  let habitsList = writable<{id: string, title: string, description: string, color: string}[]>([]);
  const completedTimes = writable<(Date | null)[]>([]);

  onMount(() => {
    document.title = `${date} Habit Tracker`;
    loadHabits();
  });

  async function loadHabits() {
    const { data } = await supabase
      .from('habits')
      .select('*')
      .order('sequence', { ascending: false });
    habitsList.set(data || []);
    completedTimes.set(Array((data || []).length).fill(null));
    await loadLogs();
  }

  async function loadLogs() {
    const habits = get(habitsList);
    if (!habits.length) return;

    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('log_date', date)
      .single();

    if (!data) {
      completedTimes.set(Array(habits.length).fill(null));
      return;
    }

    const ids = data.habit_ids ? data.habit_ids.split(',') : [];
    const times = data.timestamps ? data.timestamps.split(',').map(t => new Date(t)) : [];

    const compTimes = habits.map(h => {
      const idx = ids.indexOf(h.id);
      return idx !== -1 ? times[idx] : null;
    });

    completedTimes.set(compTimes);
  }

  async function confirmAndLog(index: number) {
    const habit = get(habitsList)[index];
    if (!habit) return;
    const confirmed = window.confirm(`Completed the task: "${habit.title}"?`);
    if (!confirmed) return;
    await logHabit(index);
  }

  async function logHabit(index: number) {
    const habits = get(habitsList);
    if (!habits[index]) return;

    const timestamp = new Date();
    let { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('log_date', date)
      .single();

    if (!data) {
      await supabase.from('habit_logs').insert([{
        log_date: date,
        habit_ids: habits[index].id,
        timestamps: timestamp.toISOString()
      }]);
    } else {
      const ids = data.habit_ids ? data.habit_ids.split(',') : [];
      const times = data.timestamps ? data.timestamps.split(',') : [];

      if (!ids.includes(habits[index].id)) {
        ids.push(habits[index].id);
        times.push(timestamp.toISOString());
      }

      await supabase.from('habit_logs')
        .update({ habit_ids: ids.join(','), timestamps: times.join(',') })
        .eq('log_date', date);
    }

    await loadLogs();
  }

  function updateChart(times: (Date | null)[]) {
    if (!chartInstance) return;

    const habits = get(habitsList);
    const data: number[] = [];
    const labels: string[] = [];
    const colors: string[] = [];

    const completed = times.map((t, i) => ({ t, habit: habits[i] }))
                           .filter(x => x.t)
                           .sort((a, b) => a.t!.getTime() - b.t!.getTime());

    const startOfDay = new Date(`${date}T00:00:00Z`).getTime();
    const endOfDay = new Date(`${date}T23:59:59Z`).getTime();
    let prevTime = startOfDay;

    if (!completed.length) {
      data.push(24);
      labels.push('No habits completed');
      colors.push('#f9fafb'); // light pastel
    } else {
      completed.forEach(item => {
        const interval = (item.t!.getTime() - prevTime) / 3600000;
        data.push(interval || 0.01);
        labels.push(item.habit.title);
        colors.push(item.habit.color || '#ec4899'); // pastel pink fallback
        prevTime = item.t!.getTime();
      });
      const lastInterval = (endOfDay - prevTime) / 3600000;
      data.push(lastInterval || 0.01);
      labels.push('End of Day');
      colors.push('#f9fafb');
    }

    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.data.labels = labels;
    chartInstance.update();
  }

  async function showAnalysis() {
    await loadLogs();
    showChart = true;
  }

  function backToCalendar() {
    goto('/habit_tracker');
  }

  $: if (showChart && canvas && !chartInstance) {
    (async () => {
      const module = await import('chart.js/auto');
      Chart = module.default;

      chartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
        options: { 
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 14 } } },
            tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.raw.toFixed(2)} hr` } }
          }
        }
      });

      updateChart(get(completedTimes));
    })();
  }
</script>

<h1 class="text-3xl font-bold text-center my-6 text-pink-600"> {date} Habit Tracker </h1>

<div class="flex flex-col md:flex-row gap-6 p-4">

  <!-- Habit Tiles -->
  <div class="md:w-1/2 grid grid-cols-2 gap-4">
    {#each $habitsList as habit, i}
      <div
        class="cursor-pointer flex items-center justify-center p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300
               text-center font-semibold text-gray-800
               { $completedTimes[i] ? 'opacity-50 line-through bg-pink-100' : 'bg-white hover:bg-pink-50'}"
        on:click={() => confirmAndLog(i)}
        title={habit.description}
      >
        {habit.title}
      </div>
    {/each}

    <!-- Show Analysis Button -->
    <button 
      on:click={showAnalysis} 
      class="col-span-2 mt-4 p-3 bg-gradient-to-r from-pink-400 to-pink-600 text-white font-bold rounded-2xl shadow hover:shadow-lg transition"
    >
      Show Analysis
    </button>

    <!-- Back to Calendar Button -->
    <button
      on:click={backToCalendar}
      class="col-span-2 mt-2 p-3 bg-pink-100 text-pink-700 font-semibold rounded-2xl shadow hover:bg-pink-200 transition"
    >
      Back to Calendar
    </button>
  </div>

  <!-- Donut Chart -->
  {#if showChart}
    <div class="md:w-1/2 border rounded-2xl shadow-lg p-6 bg-white flex flex-col items-center justify-center">
        <h2 class="text-xl font-bold mb-4 text-pink-600">{date} Habit Analysis</h2>
        <canvas bind:this={canvas} class="w-full h-80"></canvas>
    </div>
  {/if}

</div>
