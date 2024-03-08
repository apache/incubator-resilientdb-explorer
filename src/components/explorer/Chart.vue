<template>
		<apexcharts
			height="300"
			type="line"
			:options="chartOptions"
			:series="series"
		></apexcharts>
	<!-- <button @click="updateChart">Update</button> -->
</template>

<script>
	import VueApexCharts from "vue3-apexcharts";
	import { useBlocksStore } from "@/store/blocks";
	import { storeToRefs } from "pinia";

	// TODO: Create function to avoid duplicate code for creating chart data
	export default {
		name: "Chart",
		components: {
			apexcharts: VueApexCharts,
		},
		props: ['blocks'], // Passed from MetaData
		data: function () {
			const arrayRange = (start, stop, step) =>
				Array.from(
				{ length: (stop - start) / step + 1 },
				(value, index) => start + index * step
			);

			const minuteInterval = 60*1000;
			const hourInterval = 60*60*1000;
			const dayInterval = 24*60*60*1000;
			let interval = 0;

			let timeStart = 0;
			let latestTime = 0;

			if (this.blocks.length > 0) {
				timeStart = Date.parse(this.blocks[0].createdAt);
				latestTime = Date.parse(this.blocks[this.blocks.length - 1].createdAt);
			}

			if (latestTime - timeStart <= hourInterval) {
				interval = minuteInterval;
			}
			else if (latestTime - timeStart <= dayInterval) {
				interval = hourInterval;
			}
			else {
				interval = dayInterval;
			}

			if (this.blocks.length > 0) {
				// Round down to nearest interval tick
				timeStart -= timeStart % interval;
				latestTime -= latestTime % interval;
			}
			let timeRange = arrayRange(timeStart, latestTime, interval);

			const getChartDateString = (time) => {
				let str = new Date(time).toUTCString().substring(4);

				// keep in UTC to be consistent with the BlocksTable
				if (interval == dayInterval) {
					// remove HH:MM:SS
					str = str.substring(0, str.indexOf(":") - 3);
				}
				return str;
			}

			const timeAxis = timeRange.map(timeRange => getChartDateString(timeRange));

			const transactionCount = Array(timeRange.length).fill(0);
			let timeIndex = 0;
			for (let i = 0; i < this.blocks.length; i++) {
				let timeVal = Date.parse(this.blocks[i].createdAt);

				// TODO: improve efficiency using binary search
				while (timeVal >= timeRange[timeIndex] + interval) {
					timeIndex++;
				}
				transactionCount[timeIndex] += this.blocks[i].transactions.length;
			}

			return {
				chartOptions: {
					chart: {
						id: "basic-line",
						type: 'area', // Change the chart type to area
						toolbar: {
						show: false,
						},
						zoom: {
						enabled: false, // Disabling zoom if not required
						},
					},
					xaxis: {
						categories: timeAxis,
					},
					yaxis: {
						min: 0,
					},
					grid: {
						show: true,
						borderColor: '#f1f1f1',
						strokeDashArray: 5, // To create dotted lines, set a dash array
						position: 'back', // Position grid lines to the back of the area fill
						xaxis: {
						lines: {
							show: true // Show vertical grid lines beneath the data points
						}
						},
						yaxis: {
						lines: {
							show: true // Show horizontal grid lines beneath the data points
						}
						},
						padding: {
						top: 0,
						right: 0,
						bottom: 0,
						left: 0
						},
					},
					stroke: {
						curve: 'smooth'
					},
					colors: ["#59b4a9"], // Line color
					fill: {
						type: "gradient", // Define the fill type as gradient
						gradient: {
						shadeIntensity: 1,
						opacityFrom: 0.7,
						opacityTo: 0.0,
						stops: [0, 90, 100],
						colorStops: [
							{
							offset: 0,
							color: "#59b4a9",
							opacity: 1
							},
							{
							offset: 90,
							color: "#59b4a9",
							opacity: 0.4
							},
							{
							offset: 100,
							color: "#59b4a9",
							opacity: 0.2
							},
						]
						}
					},
				markers: {
					size: 0 // Hide markers
				},
				// Add additional options as needed
					colors: ["#59b4a9"],
				},
				series: [
					{
						name: "transactions",
						data: transactionCount,
					},
				],
			};
		},
		methods: {
			async updateChart() {
				// blocks is kept up-to-date by BlocksTable
			
				const arrayRange = (start, stop, step) =>
					Array.from(
					{ length: (stop - start) / step + 1 },
					(value, index) => start + index * step
				);

				const minuteInterval = 60*1000;
				const hourInterval = 60*60*1000;
				const dayInterval = 24*60*60*1000;
				let interval = 0;

				let timeStart = 0;
				let latestTime = 0;

				if (this.blocks.length > 0) {
					timeStart = Date.parse(this.blocks[0].createdAt);
					latestTime = Date.parse(this.blocks[this.blocks.length - 1].createdAt);
				}

				if (latestTime - timeStart <= hourInterval) {
					interval = minuteInterval;
				}
				else if (latestTime - timeStart <= dayInterval) {
					interval = hourInterval;
				}
				else {
					interval = dayInterval;
				}

				if (this.blocks.length > 0) {
					// Round down to nearest interval tick
					timeStart -= timeStart % interval;
					latestTime -= latestTime % interval;
				}
				let timeRange = arrayRange(timeStart, latestTime, interval);

				const getChartDateString = (time) => {
					let str = new Date(time).toUTCString().substring(4);

					// keep in UTC to be consistent with the BlocksTable
					if (interval == dayInterval) {
						str = str.substring(0, str.indexOf(":") - 3);
					}
					return str;
				}

				const timeAxis = timeRange.map(timeRange => getChartDateString(timeRange));

				const transactionCount = Array(timeRange.length).fill(0);
				let timeIndex = 0;
				for (let i = 0; i < this.blocks.length; i++) {
					let timeVal = Date.parse(this.blocks[i].createdAt);

					// TODO: improve efficiency using binary search
					while (timeVal >= timeRange[timeIndex] + interval) {
						timeIndex++;
					}
					transactionCount[timeIndex] += this.blocks[i].transactions.length;
				}

				this.chartOptions = {
					xaxis: {
						categories: timeAxis,
					}
				};

				this.series = [{
					data: transactionCount,
				}]
			}
		},
	};
</script>