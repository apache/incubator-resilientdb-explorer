
<script lang="ts">
	import { defineComponent } from "vue";
	import Chart from "../explorer/Chart.vue";
	import { useBlocksStore, useLedgerStore } from "@/store/blocks";
	import { storeToRefs } from "pinia";
	
	export default defineComponent({
		name: "MetaData",
		components: { Chart },
		props: {
			value: {
				type: Int8Array,
				required: true,
			},
			name: {
				type: String,
				required: true,
			},
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
		},
	});
</script>

<template>
	<div class="flex-container">
		<div class="half-width">
			<a-card title="ResilientDB BlockChain Data">
				<div>
					<a-statistic title="Active Replicas" :value="data[0].replicaNum"/>
						<a-divider />
						<a-statistic title="Workers" :value="data[0].workerNum" />
						<a-divider />
						<a-statistic title="Input Workers" :value="data[0].inputWorkerNum" />
						<a-divider />
						<a-statistic title="Output Workers" :value="data[0].outputWorkerNum" />
						<a-divider />
				</div>
				<div>
					<a-statistic title="Minimum Data Received" :value="data[0].minDataReceiveNum" />
						<a-divider />
						<a-statistic title="Blocks" :value="data[0].blockNum" />
						<a-divider/>
						<a-statistic title="Max Malicious Replicas" :value="data[0].maxMaliciousReplicaNum" />
						<a-divider />
						<a-statistic title="Chain Age (s)" :value="data[0].chainAge" />
				</div>
				<a-row style="margin: 1.5rem">
					<a-col :xs="12" :sm="12" :md="6">
						
						
					</a-col>
					<a-col :xs="12" :sm="12" :md="6">
						
					</a-col>
					<a-col :xs="12" :sm="12" :md="6">
						<a-statistic title="Client Batch Size" :value="data[0].clientBatchNum"/>
						<a-divider />
						<a-statistic title="Client Batch Wait Time (MS)" :value="data[0].clientBatchWaitTime" />
						<a-divider />
						<a-statistic title="Checkpoint Water Mark" :value="data[0].checkpointWaterMark" />
					</a-col>
				</a-row>
				
				
			</a-card>
		</div>
		<div class="half-width">
			<div>
				<a-statistic title="Maximum TXN Process" :value="data[0].maxProcessTxn" />
				<a-divider />
				<a-statistic title="Client Timeout (MS)" :value="data[0].clientTimeoutMs" />
				<a-divider />
				<a-statistic title="Transactions Committed" :value="data[0].transactionNum" />
			</div>
			<Chart :blocks="blocks"/>
		</div>
	</div>
</template>

<style scoped>
	.heading {
		display: flex;
		width: 100%;
		margin: 0 2rem;
	}
	.flex-container {
    display: flex;
    flex-wrap: nowrap; /* Prevent items from wrapping */
    width: 100%;
    box-sizing: border-box; /* Include padding and border in the element's size */
}

.half-width {
    flex: 1; /* Ensures equal distribution */
    box-sizing: border-box; /* Include padding and border in the element's size */
    padding: 10px; /* Example padding; adjust as needed */
    max-width: 50%; /* Explicitly set width to 50% */
    /* If you have margins, ensure they are accounted for in the total width */
}

/* Optional: Adjust padding or margin if needed to fit */
@media (max-width: 768px) {
    .flex-container {
        flex-direction: column;
    }

    .half-width {
        width: 100%; /* Full width on smaller screens */
        padding: 10px 0; /* Adjust padding for vertical stacking */
    }
}
</style>