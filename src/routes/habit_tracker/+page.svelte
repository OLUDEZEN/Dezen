<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';

  let today = new Date();
  let month = today.getMonth();
  let year = today.getFullYear();
  let days: number[] = [];

  let Chart: any;
  let chartInstance: any;
  let chartCanvas: HTMLCanvasElement;

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let monthLogs: Record<string, number> = {};

  let password = '';
  let authorized = false;
  const correctPassword = 'olulovesdezen';

  // --- Calendar & Chart Functions ---
  onMount(async () => {
    // Wait for password authorization
  });

  function checkPassword() {
    if(password === correctPassword){
      authorized = true;
      generateCalendar(month, year);
      loadMonthLogs(year, month).then(createChart);
    } else {
      alert('Incorrect password!');
      password = '';
    }
  }

  function generateCalendar(m: number, y: number) {
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  function prevMonth() { 
    month--; 
    if(month < 0){ month=11; year--; } 
    generateCalendar(month, year);
    loadMonthLogs(year, month).then(updateChart);
  }

  function nextMonth() { 
    month++; 
    if(month>11){ month=0; year++; } 
    generateCalendar(month, year);
    loadMonthLogs(year, month).then(updateChart);
  }

  function formatDate(y: number, m: number, d: number) {
    const mm = (m + 1).toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  function selectDate(day: number) {
    const formatted = formatDate(year, month, day);
    goto(`/day/${formatted}`);
  }

  function goToToday() {
    const formatted = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
    goto(`/day/${formatted}`);
  }

  async function loadMonthLogs(y: number, m: number) {
    monthLogs = {};
    const start = formatDate(y, m, 1);
    const end = formatDate(y, m, new Date(y, m + 1, 0).getDate());

    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('log_date', start)
      .lte('log_date', end);

    if (!data) return;

    data.forEach(log => {
      const count = log.habit_ids ? log.habit_ids.split(',').length : 0;
      monthLogs[log.log_date] = count;
    });
  }

  function createChart() {
    if (!chartCanvas) return;
    import('chart.js/auto').then((module) => {
      const ChartJS = module.default;
      chartInstance = new ChartJS(chartCanvas, {
        type: 'bar',
        data: {
          labels: days.map(d => d.toString()),
          datasets: [{
            label: 'Habits Completed',
            data: days.map(d => monthLogs[formatDate(year, month, d)] || 0),
            backgroundColor: 'rgba(236, 72, 153, 0.6)',
            borderColor: 'rgba(236, 72, 153, 1)',
            borderWidth: 1,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: any) => `${ctx.raw} habits` } }
          },
          scales: {
            y: { beginAtZero: true, precision: 0 },
            x: { title: { display: true, text: 'Day of Month' } }
          }
        }
      });
    });
  }

  function updateChart() {
    if (!chartInstance) return;
    chartInstance.data.datasets[0].data = days.map(d => monthLogs[formatDate(year, month, d)] || 0);
    chartInstance.data.labels = days.map(d => d.toString());
    chartInstance.update();
  }
</script>

{#if !authorized}
  <!-- Password Input -->
  <div class="flex flex-col items-center justify-center h-screen bg-pink-50">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-80 text-center">
      <h1 class="text-2xl font-bold text-pink-600 mb-4">Enter Password </h1>
      <input
        type="password"
        bind:value={password}
        placeholder="Password"
        class="w-full p-3 border border-pink-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-300"
      />
      <button
        on:click={checkPassword}
        class="w-full py-2 bg-pink-400 text-white font-bold rounded-xl hover:bg-pink-500 transition shadow"
      >
        Submit
      </button>
    </div>
  </div>
{:else}
  <!-- Calendar + Chart (existing code) -->
  <div class="max-w-md mx-auto p-6 bg-pink-50 border border-pink-200 rounded-2xl shadow-lg space-y-6">

    <!-- Calendar Header -->
    <div class="flex justify-between items-center mb-3">
      <button class="px-3 py-1 bg-pink-200 rounded-lg hover:bg-pink-300 transition" on:click={prevMonth}>Prev</button>
      <h2 class="text-xl font-bold text-pink-600">{monthNames[month]} {year}</h2>
      <button class="px-3 py-1 bg-pink-200 rounded-lg hover:bg-pink-300 transition" on:click={nextMonth}>Next</button>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-1 text-center">
      {#each ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as d}
        <div class="font-semibold text-pink-700">{d}</div>
      {/each}

      {#each Array(new Date(year, month, 1).getDay()) as _}
        <div></div>
      {/each}

      {#each days as day}
        <button
          class="p-2 border rounded-xl hover:bg-pink-100 transition relative flex justify-center items-center text-pink-700 font-semibold"
          on:click={() => selectDate(day)}
        >
          {day}
          {#if monthLogs[formatDate(year, month, day)]}
            <span class="absolute top-0 right-0 text-xs bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              {monthLogs[formatDate(year, month, day)]}
            </span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Go to Today's Habit Tracker -->
    <button 
      class="w-full py-2 bg-pink-400 text-white font-bold rounded-xl hover:bg-pink-500 transition shadow"
      on:click={goToToday}
    >
      Go to Today's Habit Tracker
    </button>

    <!-- Monthly Habit Analysis Chart -->
    <div class="mt-4 p-4 border border-pink-200 rounded-xl shadow bg-white">
      <h3 class="text-lg font-bold text-pink-600 mb-2">Monthly Habit Analysis</h3>
      <canvas bind:this={chartCanvas} class="w-full h-64"></canvas>
    </div>

  </div>
{/if}
