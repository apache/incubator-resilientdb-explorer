
<script lang="ts">
	import { defineComponent } from "vue";
	import Chart from "../explorer/Chart.vue";
	import { useBlocksStore, useLedgerStore } from "@/store/blocks";
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
	import { faDatabase, faLink , faLayerGroup, faHourglass} from '@fortawesome/free-solid-svg-icons';
	import { storeToRefs } from "pinia";

	library.add(faDatabase);
	library.add(faLink);
	library.add(faLayerGroup);
	library.add(faHourglass);
	
	export default defineComponent({
		name: "MetaData",
		components: { 
			Chart,
			'font-awesome-icon': FontAwesomeIcon,
		},
		props: {
			value: {
				type: Int8Array,
				required: true,
			},
			name: {
				type: String,
				required: true,
			},
			data: Array,
		},
		computed: {
			progressBarWidth() {
			const maxAge = 20000000;
			const currentAge = this.data[0].chainAge;
			const percentage = Math.min(currentAge / maxAge * 100, 100); // Ensure the percentage does not exceed 100
			return `${percentage}%`;
			},
			formattedChainAge() {
			const value = this.data[0].chainAge;

			// Constants for time conversion
			const minute = 60;
			const hour = minute * 60;
			const day = hour * 24;
			const month = day * 30.44; // average month length
			const year = day * 365.25; // average year length, accounting for leap year

			// Calculate each component
			const years = Math.floor(value / year);
			const months = Math.floor((value % year) / month);
			const days = Math.floor((value % month) / day);
			const hours = Math.floor((value % day) / hour);
			const minutes = Math.floor((value % hour) / minute);
			const seconds = value % 60;

			// Create an array to hold the formatted components that are not zero
			const parts = [];
			if (years) parts.push(`${years}y`);
			if (months) parts.push(`${months}mo`);
			if (days) parts.push(`${days}d`);
			if (hours) parts.push(`${hours}h`);
			if (minutes) parts.push(`${minutes}m`);
			if (seconds || !parts.length) parts.push(`${seconds}s`);

			// Combine the parts into a single string
			const formattedAge = parts.join(' ');

			// Format the number with commas for the total seconds
			const formattedTotalSeconds = value.toLocaleString();

			return `${formattedAge} (${formattedTotalSeconds} seconds)`;
			}
		},
		async setup() {
			const ledgerStore = useLedgerStore();
			const { ledger } = storeToRefs(ledgerStore);
			const { populateTable } = ledgerStore;
			await populateTable();

			const blocksStore = useBlocksStore();
			const { blocks } = storeToRefs(blocksStore);
			const { refreshBlocks } = blocksStore;
			await refreshBlocks();

			return {
				data: ledger,
				blocks: blocks,
			};
		}
	});
</script>

<template>
	<div class="grid-container">
	  <div class="card">
		<a-card class="custom-card">
			<template v-slot:title>
				<font-awesome-icon icon="database" class="fa-icon-custom"/> ResilientDB Data
			</template>
			<div class="statistics-grid">
				<a-statistic title="Active Replicas" :value="data[0].replicaNum" />
				<a-statistic title="Workers" :value="data[0].workerNum" />
				<a-statistic title="Input Workers" :value="data[0].inputWorkerNum" />
				<a-statistic title="Output Workers" :value="data[0].outputWorkerNum" />
				<a-statistic title="Max Malicious Replicas" :value="data[0].maxMaliciousReplicaNum" />
				<a-statistic title="Minimum Data Received" :value="data[0].minDataReceiveNum" />
			</div>
		</a-card>
	  </div>
	  <div class="card">
		<a-card class="custom-card">
			<template v-slot:title>
				<font-awesome-icon icon="link" class="fa-icon-custom"/> Chain Information
			</template>
			<div class="stats-row">
			<a-statistic title="Blocks" :value="data[0].blockNum" />
			<a-statistic title="Transactions Committed" :value="data[0].transactionNum" />
			</div>
			<div class="progress-bar-container">
				<div class="progress-bar" :style="{ '--progress-bar-width': progressBarWidth }">
					<div class="shiny-effect"></div>
				</div>
				<div class="chain-age-label">Chain Age: {{ formattedChainAge }}</div>
			</div>
		</a-card>
	  </div>
	  <div class="card">
		<a-card class="custom-card">
			<template v-slot:title>
				<font-awesome-icon icon="layer-group" class="fa-icon-custom"/> Other data
			</template>
			<div class="statistics-grid">
				<a-statistic title="Client Batch Size" :value="data[0].clientBatchNum" />
				<a-statistic title="Client Batch Wait Time (MS)" :value="data[0].clientBatchWaitTime" />
				<a-statistic title="Client Timeout (MS)" :value="data[0].clientTimeoutMs" />
				<a-statistic title="Checkpoint Water Mark" :value="data[0].checkpointWaterMark" />
				<a-statistic title="Maximum TXN Process" :value="data[0].maxProcessTxn" />
			</div>
		</a-card>
	  </div>
	  <div class="card">
		<a-card class="custom-card">
			<template v-slot:title>
				<font-awesome-icon icon="hourglass" class="fa-icon-custom"/> Resilient Transaction History
			</template>
		  <Chart :blocks="blocks"/>
		</a-card>
	  </div>
	</div>
</template>


<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem; /* Adjust the gap between cards */
  padding: 30px;
}

.card {
  display: flex;
}

.custom-card {
  flex: 1;
  border-radius: 1rem; /* Rounded borders */
  font-family: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  color: #566873; /* Font color */
  font-size: 18px; /* Font size */
  height: 100%; /* Equal height */
}

/* Optional: If you want the cards to have the same height regardless of content */
.grid-container {
  align-items: stretch; /* Stretch to fill the container */
}

/* Media query for responsive design */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr; /* One column on smaller screens */
  }
}

.custom-card .statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Create three columns */
  grid-gap: 1rem; /* Spacing between grid items */
  align-items: center; /* Align items vertically */
  justify-content: center; /* Center items horizontally */
}

@media (max-width: 768px) {
  .custom-card .statistics-grid {
    grid-template-columns: 1fr; /* One column on smaller screens */
  }

  .chain-age-label {
  position: relative;
  left: 0;
  bottom: -10px; /* Adjust as needed */
  font-size: 0.8em; /* Smaller font size */
  color: #566873; /* Font color */
}
}

.stats-container {
  display: flex;
  flex-direction: column;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-row.full-width {
  justify-content: space-between; /* Adjust if you want different alignment */
}

.stat-item {
  display: flex;
  justify-content: space-between;
  flex-basis: 49%; /* Adjust the width of each stat item in the first row */
}

.a-divider {
  margin: 1rem 0; /* Adjust as needed */
}

/* Adjust span styles for proper alignment and display */
.stats-row span:first-child {
  flex: 1;
}

.stats-row span:last-child {
  flex: 0;
  text-align: right;
}

.progress-bar-container {
  position: relative;
  margin-top: 1rem;
}

.chain-age-label {
  position: relative;
  left: 0;
  font-size: 0.8em; /* Smaller font size */
  color: #566873; /* Font color */
}

.progress-bar {
  --progress-bar-width: 0; /* Default width to 0 */
  height: 10px;
  background-color: #BEE3F8; /* Background for the incomplete part */
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: var(--progress-bar-width); /* Use CSS variable for width */
  height: 100%;
  background-color: #4299E1; /* Background for the completed part */
  border-radius: 10px;
}

.shiny-effect {
  width: 50px; /* Set a fixed width for the shine effect */
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0) 100%);
  position: absolute;
  top: 0;
  left: -50px; /* Start from the left, offset by the width of the effect */
  animation: moveShine 4s linear infinite;
}

@keyframes moveShine {
  from {
    left: -50px;
  }
  to {
    left: calc(var(--progress-bar-width) - 50px); /* Move to the end of the completed width */
  }
}

.statistics-row {
  display: flex;
  justify-content: space-between; /* Distributes space between items */
}

.flex-item {
  flex: 1; /* Allows each item to expand equally */
  padding-right: 1rem; /* Adds spacing between items */
}

.statistics-full-row {
  width: 100%; /* Full width for single items */
  display: flex;
  justify-content: space-between; /* Aligns title and value on opposite ends */
  padding: 0 1rem; /* Optional padding for alignment */
}

.a-divider {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.fa-icon-custom {
	color: #BEE3F8;
  	margin-right: 8px
}

</style>