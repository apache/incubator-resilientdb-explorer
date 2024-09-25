
<script lang="ts">
	import { defineComponent, computed } from "vue";
	import Chart from "../explorer/Chart.vue";
	import { useBlocksStore, useLedgerStore } from "@/store/blocks";
	import { useThemeStore } from "@/store/blocks"; 
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
			const maxAge = 200000000;
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
			const themeStore = useThemeStore();
			await populateTable();

			const blocksStore = useBlocksStore();
			const { blocks } = storeToRefs(blocksStore);
			const { refreshBlocks } = blocksStore;
			await refreshBlocks();

			// Access the theme store
			const theme = computed(() => themeStore.theme.value);

			return {
				data: ledger,
				blocks: blocks,
				theme, // Return the theme for use in the template
			};
		}
	});
</script>

<template>
	<div :class="['grid-container', theme]">
	  <div :class="['card', theme]">
		<a-card :class="['custom-card', theme]">
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
	  <div :class="['card', theme]">
		<a-card :class="['custom-card', theme]">
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
	  <div :class="['card', theme]">
		<a-card :class="['custom-card', theme]">
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
	  <div :class="['card', theme]">
		<a-card :class="['custom-card', theme]">
			<template v-slot:title>
				<font-awesome-icon icon="hourglass" class="fa-icon-custom"/> Resilient Transaction History
			</template>
		  <Chart :blocks="blocks"/>
		</a-card>
	  </div>
	</div>
</template>

<style scoped>
/* Light Theme Styles */
.light .grid-container {
  background-color: #ffffff; /* Light background */
  color: #000000; /* Dark text */
}

.light .custom-card {
  background-color: #ffffff; /* Light card background */
  color: #566873; /* Dark grey text specific to light theme */
}

.light ::v-deep .ant-card-head {
  background-color: #ffffff;
}

.light .chain-age-label {
  color: #566873; /* Dark grey text */
}

.light .fa-icon-custom {
  color: #244a8c; /* Original icon color in light theme */
}

/* Dark Theme Styles */
.dark .grid-container {
  background-color: #2d2d2d; /* Dark background */
  color: #ffffff; /* Light text */
}

.dark .custom-card {
  background-color: #244a8c; /* Dark card background */
  color: #ffffff; /* Light text specific to dark theme */
}

.dark ::v-deep .ant-card-head {
  background-color: #244a8c;
}

.dark .chain-age-label {
  color: #e0e0e0; /* Light grey text */
}

.dark .fa-icon-custom {
  color: #90cdf4; /* Lighter blue icon color for dark theme */
}

/* General Styles */
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 30px;
  align-items: stretch;
}

.card {
  display: flex;
}

.custom-card {
  flex: 1;
  border-radius: 1rem; /* Rounded borders */
  overflow: hidden; /* Ensure child elements respect border-radius */
  font-family: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-size: 18px;
  height: 100%;
  color: inherit;
  background-color: inherit;
}

/* Apply border-radius to the card header */
.custom-card ::v-deep .ant-card-head {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}

.custom-card .statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1rem;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .custom-card .statistics-grid {
    grid-template-columns: 1fr;
  }
}

.chain-age-label {
  position: relative;
  left: 0;
  bottom: -10px;
  font-size: 0.8em;
  color: inherit !important;
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
  justify-content: space-between;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  flex-basis: 49%;
}

.a-divider {
  margin: 1rem 0;
}

.progress-bar-container {
  position: relative;
  margin-top: 1rem;
}

.progress-bar {
  --progress-bar-width: 0;
  height: 10px;
  background-color: #BEE3F8;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: var(--progress-bar-width);
  height: 100%;
  background-color: #4299E1;
  border-radius: 10px;
}

.shiny-effect {
  width: 50px;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0) 100%);
  position: absolute;
  top: 0;
  left: -50px;
  animation: moveShine 4s linear infinite;
}

@keyframes moveShine {
  from {
    left: -50px;
  }
  to {
    left: calc(var(--progress-bar-width) - 50px);
  }
}

.statistics-row {
  display: flex;
  justify-content: space-between;
}

.flex-item {
  flex: 1;
  padding-right: 1rem;
}

.statistics-full-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
}

.a-divider {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

/* Adjustments for Ant Design Components in Dark Theme */
.dark ::v-deep .ant-statistic-title,
.dark ::v-deep .ant-statistic-content,
.dark ::v-deep .ant-statistic-value,
.dark ::v-deep .ant-statistic {
  color: #ffffff; /* Light text */
}

.dark ::v-deep .ant-card-head-title {
  color: #ffffff !important; /* Light text for card headers */
}

.dark ::v-deep .ant-card-head {
  background-color: #1F3B73 !important; /* Slightly darker header background */
}

/* Adjust Progress Bar for Dark Theme */
.dark .progress-bar {
  background-color: #1F3B73 !important; /* Darker background */
}

.dark .progress-bar::before {
  background-color: #90cdf4 !important; /* Lighter blue fill */
}

.dark .shiny-effect {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%);
}

/* Ensure All Text Inside Cards Is Light in Dark Mode */
.dark .custom-card,
.dark .stat-item,
.dark .stats-row,
.dark .statistics-grid a-statistic,
.dark .statistics-grid a-statistic .ant-statistic-title {
  color: #ffffff !important;
}

/* Adjust Chart Component Text in Dark Theme */
.dark .chart-container {
  color: #ffffff !important;
}
</style>



