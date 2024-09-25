import { defineStore } from "pinia";
import { getAvailableBlocks } from "@/api/blocks_endpoint";
import { useEndpointsStore } from "@/store/endpoints";

interface Block {
	id: number;
	number: string;
	transactions: {
		cmd: string;
		key?: string;
		value?: string;
		min_key?: string;
		max_key?: string;

	}[];
	size: number;
	createdAt: string;
}
interface BlocksState {
	blocks: Block[];
}

interface Ledger {
	replicaNum: number;
	clientNum: number;
	workerNum: number;
	clientBatchNum: number;
	maxProcessTxn: number;
	clientBatchWaitTime: number;
	inputWorkerNum: number;
	outputWorkerNum: number;
	clientTimeoutMs: number;
	minDataReceiveNum: number;
	maxMaliciousReplicaNum: number;
	checkpointWaterMark: number;
	transactionNum: number;
    blockNum: number;
    chainAge: number;
}

interface LedgerState {
	ledger: Ledger[];
}

interface State {
	blocks: Block[];
	searchText: string;
}

export const useBlocksStore = defineStore("blocks", {
	state: () => ({
	  blocks: [],
	  searchText: "", // Add searchText to the state
	}),
  
	getters: {
	  filteredBlocks: (state: State) => {
		const result = state.blocks.filter((block) => {
		  const blockIdMatch = block.id.toString().includes(state.searchText);
		  const transactionMatch = block.transactions.some((tx) => 
			tx && tx.key && tx.key.includes(state.searchText)
		  );
		  return blockIdMatch || transactionMatch;
		}).map((block) => ({
		  ...block,
		  relativeCreatedAt: relativeTime(block.createdAt),
		}));
		return result;
	  },
	},
  
	actions: {
	  async refreshBlocks() {
		const endpointsStore = useEndpointsStore();
		if (!endpointsStore.endpoints[0]) {
		  throw new Error("No Endpoints Found.");
		}
  
		this.blocks = await getAvailableBlocks(endpointsStore.endpoints[0]);
	  },
	  setSearchText(newSearchText: string) {
		this.searchText = newSearchText;
	  },
	},
  });
  
  function relativeTime(createdAt: string): string {
	const now = Date.now(); // Current time in milliseconds
	const createdAtDate = new Date(createdAt);
	const diffInSeconds = Math.floor((now - createdAtDate.getTime()) / 1000);
	const days = Math.floor(diffInSeconds / 86400);
	const hours = Math.floor((diffInSeconds % 86400) / 3600);
	const minutes = Math.floor((diffInSeconds % 3600) / 60);
	const seconds = diffInSeconds % 60;
  
	let timeString = "";
	if (days > 0) timeString += `${days}d `;
	if (hours > 0) timeString += `${hours}h `;
	if (minutes > 0) timeString += `${minutes}m `;
	if (seconds > 0) timeString += `${seconds}s`;
  
	return timeString.trim();
  }

export const useLedgerStore = defineStore("ledger", {
	state: () => {
		const state: LedgerState = {
			ledger: [],
		};
		return state;
	},

	actions: {
		async populateTable() {
			const endpointsStore = useEndpointsStore();
			if (!endpointsStore.endpoints[1]) {
				throw new Error("No Endpoints Found.");
			}
		
			this.ledger = await getAvailableBlocks(endpointsStore.endpoints[1]);
		},
	},
});


export const initialize = function () {
};