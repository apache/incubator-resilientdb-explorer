<script>
	import { useBlocksStore } from "@/store/blocks";
	import { storeToRefs } from "pinia";
	import {
		DownOutlined,
		FireTwoTone,
		SearchOutlined,
	} from "@ant-design/icons-vue";
	import { defineComponent, reactive, ref, toRefs, computed } from "vue";
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faSearch } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	library.add(faSearch);

	const columns = [
		{
			title: "Block # (sort)",
			dataIndex: "id",
			key: "id",
			fixed: "left",
			width: 120,
			sorter: {
				compare: (a, b) => a.id - b.id,
				multiple: 1,
			},
			defaultSortOrder: 'descend',
		},
		{
			title: " Block # (search)",
			dataIndex: "number",
			key: "number",
			width: 120,
			fixed: "left",
			slots: {
				filterDropdown: "filterDropdown",
				filterIcon: "filterIcon",
				customRender: "customRender",
			},
			onFilter: (value, record) =>
				record.number.toString().toLowerCase().includes(value.toLowerCase()),
			onFilterDropdownVisibleChange: (visible) => {
				if (visible) {
					setTimeout(() => {
						console.log(searchInput.value);
						searchInput.value.focus();
					}, 100);
				}
			},
		},
		{
			title: "Size",
			dataIndex: "size",
			key: "size",
			sorter: {
				compare: (a, b) => a.size - b.size,
				multiple: 1,
			},
		},
		{
			title: "CMD",
			dataIndex: "cmd",
			key: "cmd",
		},
		{
			title: "Transactions",
			dataIndex: "transactions",
			key: "transactions",
		},
		{
			title: "Created At",
			key: "createdAt",
			dataIndex: "createdAt",
			fixed: "right",
			width: 130,
		},
	];

	// const transactions = [];
	// for (var i = 0; i < data.length; i++) {
	// 	var obj = data[i].transactions;
	// 	for (var key in obj) {
	// 		var val = obj[key];
	// 		transactions.push(val);
	// 	}
	// }

	// console.log(transactions[0].txnHash);

	export default defineComponent({
		components: {
			DownOutlined,
			FireTwoTone,
			SearchOutlined,
			'font-awesome-icon': FontAwesomeIcon,
		},
		setup() {
			const state = reactive({
				searchText: "",
				searchedColumn: "",
			});

			const handleSearch = (selectedKeys, confirm, dataIndex) => {
				confirm();
				state.searchText = selectedKeys[0];
				state.searchedColumn = dataIndex;
			};

			const handleReset = (clearFilters) => {
				clearFilters();
				state.searchText = "";
			};

			const searchInput = ref();
			const blocksStore = useBlocksStore();
			const { blocks } = storeToRefs(blocksStore);

			// Reactive state for search text
			const searchText = ref("");

			// Reactive state for filtered blocks
			const filteredBlocks = computed(() => {
				return blocks.value.filter((block) => {
					// Check if block ID matches the search text
					const blockIdMatch = block.id.toString().includes(searchText.value);
					
					// Check if any transaction matches the search text (if cmd is "SET")
					const transactionMatch = block.transactions.some((tx) => {
						return tx && tx.key && tx.key.includes(searchText.value);
					});

					return blockIdMatch || transactionMatch;
				});
			});

			console.log(blocks);

			// Define the onSearch function
			const onSearch = (value) => {
				searchText.value = value;
			};

			const { refreshBlocks } = blocksStore;
			refreshBlocks(); // Populate table on initial load

			const socket = new WebSocket('wss://crow.resilientdb.com/blockupdatelistener'); 
			socket.addEventListener('open', function (event) { 
				console.log('Opened websocket for reading blocks'); 
			}); 

			socket.addEventListener('message', function (event) { 
				console.log(event.data);

				function delay(time) {
					return new Promise(resolve => setTimeout(resolve, time));
				}
				delay(1000).then(() => refreshBlocks());
			});

			socket.addEventListener('close', function (event) { 
				console.log('Websocket for reading blocks has been closed'); 
			});

			return {
				searchText,
				data: filteredBlocks,
				columns,
				handleSearch,
				searchInput,
				handleReset,
            	onSearch,
				...toRefs(state),
			};
		},
	});
</script>

<template>
	<div class="container timeline">
		<div class="searchParent">
			<div class="search">
			<font-awesome-icon class="fa-icon" icon="search" />
			<a-input-search
				v-model:value="searchText"
				placeholder="Search by Block ID / Txn Hash "
				enter-button
				@search="onSearch"
			>
			</a-input-search>
			
		</div>

		</div>
		
		<div class="grid letOverflow">
			<a-table class="text-steel-dark" :columns="columns" :data-source="data">
				<!-- <template #headerCell="{ column }">
					<template v-if="column.key === 'name'">
						<span>
							<smile-outlined />
							Name
						</span>
					</template>
				</template> -->

				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'size'">
						<span>
							{{ record.size }}
							bytes
						</span>
					</template>
					<template v-if="column.key === 'cmd'">
						<span class="cmd">{{ record.transactions[0]?.cmd }}</span>
					</template>
					<template v-if="column.key === 'transactions'">
						<a-tag color="cyan">
							<a :href="'/transactions?id=' + record.id">
								View transaction
							</a>
						</a-tag>
					</template>
					<template v-else-if="column.key === 'gasUsed'">
						<div>
							<fire-two-tone two-tone-color="red" /> {{ record.gasUsed }}
						</div>
					</template>
				</template>
				
				<template #title>
					<span class="latestBlocks">Latest Blocks</span>
				</template>

				<template
					#filterDropdown="{
						setSelectedKeys,
						selectedKeys,
						confirm,
						clearFilters,
						column,
					}"
				>
					<div style="padding: 8px">
						<a-input
							ref="searchInput"
							:placeholder="`Search ${column.dataIndex}`"
							:value="selectedKeys[0]"
							style="width: 188px; margin-bottom: 8px; display: block"
							@change="
								(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
							"
							@pressEnter="
								handleSearch(selectedKeys, confirm, column.dataIndex)
							"
						/>
						<a-button
							type="primary"
							size="small"
							style="width: 90px; margin-right: 8px"
							@click="handleSearch(selectedKeys, confirm, column.dataIndex)"
						>
							<template #icon><SearchOutlined /></template>
							Search
						</a-button>
						<a-button
							size="small"
							style="width: 90px"
							@click="handleReset(clearFilters)"
						>
							Reset
						</a-button>
					</div>
				</template>
				<template #filterIcon="filtered">
					<search-outlined
						:style="{ color: filtered ? '#108ee9' : undefined }"
					/>
				</template>
				<template #customRender="{ text, record, column }">
					<span v-if="searchText && searchedColumn === column.dataIndex">
						<template
							v-for="(fragment, i) in text
								.toString()
								.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
						>
							<mark
								v-if="fragment.toLowerCase() === searchText.toLowerCase()"
								class="highlight"
								:key="i"
							>
								<a :href="'/block?id=' + record.id">{{ fragment }}</a>
							</mark>
							<template v-else>
								<a :href="'/block?id=' + record.id">{{ fragment }}</a></template
							>
						</template>
					</span>
					<template v-else>
						<a :href="'/block?id=' + record.id">
							{{ record.number }}
						</a>
					</template>
				</template>
			</a-table>
		</div>
	</div>
</template>
<style scoped>
	.latestBlocks{
		font-size: 18px;
    	line-height: 1.13;
		font-weight: 600;
		color: rgb(17,17,17,0.65);
		margin-left: -1rem;
		display: inline-block; /* This is needed to position the pseudo-elements */
		position: relative;
		
	}

	.container {
		width: 100%;
		align-self: center;
		margin: auto;
	}
	.heading {
		display: flex;
		width: 100%;
		margin: 0 2rem;
	}
	.grid {
		margin: 0 1rem;
		padding: 0 1rem;
	}

	.blockDisplay {
		margin: 0 auto;
	}

	.letOverflow {
		overflow: scroll;
		flex-wrap: nowrap !important;
		overflow-x: scroll;
		overflow-y: none;
	}

	::-webkit-scrollbar {
		display: none;
	}

	#dash {
		margin-bottom: 1%;
	}

	.timeline:before {
		visibility: hidden !important;
	}
	.highlight {
		background-color: rgb(255, 192, 105);
		padding: 0px;
	}

	.searchParent{
		margin: 0 1rem;
    	padding: 0 1rem;
	}
	.search {
		display: flex; /* Aligns children inline */
		align-items: center; /* Centers children vertically */
		margin-top: 3rem;
		border-radius: 0.25rem;
	}

	.search:hover{
		background-color: #15527b0d;
		outline: none;
		box-shadow: none;
		border: none;
	}
	.cmd{
		background: #D3D3D3;
		display: inline-block;
		margin: 0 -8px;
		padding: 0 8px;
		border: 1px solid gray;
		border-radius: 10px;
		width: 120px;
		font-size: 12px;
		text-align:center;
	}

	::v-deep .ant-table {
		border-collapse: separate;
		border-spacing: 0;
	}

	::v-deep .ant-table-thead > tr > th{
		border-top: 1px solid black;
	}
	::v-deep .ant-table-tbody > tr > td {
		border: none; /* Remove all borders from cells */
	}
	::v-deep .ant-table-thead > tr > th {
		background-color: #f0f0f0; /* Example: Light grey background */
		color: #333; /* Dark text color */
		font-weight: bold;
		height: 1.875rem;
		text-align: left;
		font-size: 12px;
		line-height: 1.13;
		font-weight: 600;
		text-transform: uppercase;
		color: rgb(117,143,158,1);
	}

	::v-deep .ant-input {
		outline: none;
		outline-offset: 2px;
		border-width: 1px;
		background: none;
		border:none;
		font-family: Red Hat Mono Variable,Red Hat Mono,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;
		font-size: 12px;
		box-shadow: none;
	}

	::v-deep .ant-input:hover{
		outline: none;
		box-shadow: none;
		border: none;
		background: none;
	}

	/* Style for the input within the wrapper */
	::v-deep .ant-input-search > .ant-input-affix-wrapper > .ant-input {
		border: none !important; /* Remove border inside the wrapper if present */
		box-shadow: none !important; /* Remove inner shadow if present */
	}

	/* Optionally, style the placeholder text */
		::v-deep .ant-input::placeholder {
		color: grey !important; /* Change the placeholder text color */
	}

	/* Hide the search button if it is styled as a primary button */
	::v-deep .ant-input-search-button {
		display: none !important;
	}

	/* Style the search icon */
	.fa-icon {
		 /* Adjust the spacing to the right of the icon */
		color: #ccc; /* Adjust the color as needed */
		padding-top: 0.86rem;
		padding-bottom: 0.88rem;
		padding-left: 20px;
		flex-shrink: 0; /* Prevents the icon from shrinking */
}
	

</style>
