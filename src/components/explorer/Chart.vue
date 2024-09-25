<template>
	<apexcharts
	  :key="chartKey"
	  height="300"
	  type="area"
	  :options="chartOptions"
	  :series="series"
	></apexcharts>
  </template>
  
  <script>
  import VueApexCharts from "vue3-apexcharts";
  import { useThemeStore } from "@/store/theme";
  import { ref, watch, reactive, computed } from "vue";
  
  export default {
	name: "Chart",
	components: {
	  apexcharts: VueApexCharts,
	},
	props: ['blocks'],
	setup(props) {
	  const themeStore = useThemeStore();
	  console.log("Initial theme value:", themeStore.theme.value);
  
	  const isDarkMode = computed(() => themeStore.theme.value);
	  const chartKey = ref(0);
  
	  const arrayRange = (start, stop, step) =>
		Array.from({ length: Math.floor((stop - start) / step) + 1 }, (value, index) => start + index * step);
  
	  const chartOptions = reactive({
		chart: {
		  id: "basic-line",
		  type: 'area',
		  toolbar: {
			show: false,
		  },
		  zoom: {
			enabled: false,
		  },
		},
		dataLabels: {
		  enabled: false,
		},
		xaxis: {
		  categories: [],
		  tickAmount: 10,
		  labels: {
			show: true,
			style: {
			  colors: '#000000', // Default color for light mode
			  fontFamily: 'Inter Variable,Inter,ui-sans-serif',
			  fontWeight: 400,
			  fontSize: '10px',
			},
		  },
		},
		yaxis: {
		  min: 0,
		  tickAmount: 7,
		  labels: {
			style: {
			  colors: '#000000', // Default color for light mode
			  fontFamily: 'Inter Variable,Inter,ui-sans-serif',
			  fontWeight: 400,
			  fontSize: '10px',
			},
		  },
		},
		grid: {
		  position: 'back',
		  xaxis: {
			lines: {
			  show: false,
			},
		  },
		  yaxis: {
			lines: {
			  show: false,
			},
		  },
		},
		stroke: {
		  curve: 'smooth',
		},
		fill: {
		  colors: "#4299E1",
		  type: "gradient",
		  gradient: {
			type: 'horizontal',
			shadeIntensity: 1,
			opacityFrom: 0.3,
			opacityTo: 0.2,
			stops: [0, 90, 100],
			colorStops: [
			  {
				offset: 0,
				color: "#4299E1",
				opacity: 0.3,
			  },
			  {
				offset: 90,
				color: "#4299E1",
				opacity: 0.2,
			  },
			  {
				offset: 100,
				color: "#4299E1",
				opacity: 0.15,
			  },
			],
		  },
		},
		markers: {
		  size: 0,
		},
		colors: ["#4299E1"],
		legend: {
		  labels: {
			colors: '#000000', // Default color for light mode
		  },
		},
	  });
  
	  function initializeChartData(blocks) {
		const minuteInterval = 60 * 1000;
		const hourInterval = 60 * 60 * 1000;
		const dayInterval = 24 * 60 * 60 * 1000;
		let interval = 0;
		let timeStart = 0;
		let latestTime = 0;
  
		if (blocks.length > 0) {
		  timeStart = Date.parse(blocks[0].createdAt);
		  latestTime = Date.parse(blocks[blocks.length - 1].createdAt);
		}
  
		if (latestTime - timeStart <= hourInterval) {
		  interval = minuteInterval;
		} else if (latestTime - timeStart <= dayInterval) {
		  interval = hourInterval;
		} else {
		  interval = dayInterval;
		}
  
		if (blocks.length > 0) {
		  timeStart -= timeStart % interval;
		  latestTime -= latestTime % interval;
		}
  
		const timeRange = arrayRange(timeStart, latestTime, interval);
  
		const getChartDateString = (time) => {
		  let date = new Date(time);
		  let day = ('0' + date.getUTCDate()).slice(-2);
		  let month = date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
		  return `${month} ${day}`;
		};
  
		const timeAxis = timeRange.map((time) => getChartDateString(time));
		chartOptions.xaxis.categories = timeAxis;
  
		const transactionCount = Array(timeRange.length).fill(0);
		let timeIndex = 0;
		for (let i = 0; i < blocks.length; i++) {
		  let timeVal = Date.parse(blocks[i].createdAt);
  
		  while (timeIndex < timeRange.length - 1 && timeVal >= timeRange[timeIndex] + interval) {
			timeIndex++;
		  }
		  transactionCount[timeIndex] += blocks[i].transactions.length;
		}
  
		return transactionCount;
	  }
  
	  const series = ref([
		{
		  name: "transactions",
		  data: initializeChartData(props.blocks),
		},
	  ]);
  
	  const updateFontColors = (theme) => {
		const isDark = theme === 'dark'; // Check if theme is specifically 'dark'
		const color = isDark ? '#FAF9F6' : '#000000';
		console.log("Theme mode isDark:", isDark);
		console.log("Updating colors to:", color);
		chartOptions.xaxis.labels.style.colors = color;
		chartOptions.yaxis.labels.style.colors = color;
		chartOptions.legend.labels.colors = color;
		chartKey.value++; // Force re-render to apply changes
	  };
  
	  watch(isDarkMode, (newVal) => {
		console.log("Detected theme change:", newVal);
		updateFontColors(newVal);
	  }, { immediate: true });
  
	  return {
		chartKey,
		chartOptions,
		series,
	  };
	},
  };
  </script>
  