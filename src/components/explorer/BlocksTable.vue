<script>
import { useBlocksStore } from "@/store/blocks";
import { storeToRefs } from "pinia";
import {
  DownOutlined,
  FireTwoTone,
  SearchOutlined,
} from "@ant-design/icons-vue";
import {
  defineComponent,
  reactive,
  ref,
  toRefs,
  computed,
  onMounted,
  nextTick,
} from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faSearch);
library.add(faCircle);

export default defineComponent({
  components: {
    DownOutlined,
    FireTwoTone,
    SearchOutlined,
    "font-awesome-icon": FontAwesomeIcon,
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

    // Function to escape regex special characters
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Computed property for escaped search text
    const escapedSearchText = computed(() => escapeRegExp(searchText.value));

    // Reactive state for filtered blocks
    const filteredBlocks = computed(() => blocksStore.filteredBlocks);

    // Define the onSearch function
    const onSearch = (value) => {
      searchText.value = value;
    };

    onMounted(async () => {
      await blocksStore.refreshBlocks();
      await nextTick(); // Ensures DOM is updated after state changes
    });

    const socket = new WebSocket(
      "wss://crow.resilientdb.com/blockupdatelistener"
    );
    socket.addEventListener("open", function (event) {
      console.log("Opened websocket for reading blocks");
    });

    socket.addEventListener("message", function (event) {
      console.log(event.data);

      function delay(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
      }
      delay(1000).then(() => blocksStore.refreshBlocks());
    });

    socket.addEventListener("close", function (event) {
      console.log("Websocket for reading blocks has been closed");
    });

    const columns = [
      {
        title: " Block # (search)",
        dataIndex: "number",
        key: "number",
        width: 150,
        fixed: "left",
        sorter: {
          compare: (a, b) => a.id - b.id,
          multiple: 1,
        },
        defaultSortOrder: "descend",
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
        width: 150,
        sorter: {
          compare: (a, b) => a.size - b.size,
          multiple: 1,
        },
      },
      {
        title: "CMD",
        dataIndex: "cmd",
        width: 150,
        key: "cmd",
      },
      {
        title: "created At",
        dataIndex: "relativeCreatedAt",
        width: 150,
        key: "createdAt",
      },
    ];

    return {
      searchText,
      escapedSearchText,
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
	<div class="white-background-wrapper">
	  <div class="container timeline">
		<div class="grid letOverflow">
		  <a-table class="text-steel-dark" :columns="columns" :data-source="data">
			<!-- Existing templates for body cells -->
			<!-- ... (rest of your template code) ... -->
  
			<!-- Search functionality within a block for Block # -->
			<template #customRender="{ text, record, column }">
			  <span v-if="searchText && searchedColumn === column.dataIndex">
				<template
				  v-for="(fragment, i) in text
					.toString()
					.split(new RegExp(`(${escapedSearchText})`, 'i'))"
				  :key="i"
				>
				  <mark
					v-if="fragment.toLowerCase() === searchText.toLowerCase()"
					class="highlight"
				  >
					<a :href="'/block?id=' + record.id">{{ fragment }}</a>
				  </mark>
				  <template v-else>
					<a :href="'/block?id=' + record.id">{{ fragment }}</a>
				  </template>
				</template>
			  </span>
  
			  <template v-else>
				<a class="block-num" :href="'/block?id=' + record.id">
				  <span>
					<font-awesome-icon class="fa-circle" icon="circle" />
					{{ record.number }}
				  </span>
				</a>
			  </template>
			</template>
		  </a-table>
		</div>
	  </div>
	</div>
  </template>
  
<style scoped>
	.white-background-wrapper {
		background-color: #FFFFFF; /* Set background color to white */
		width: 100%; /* Cover the full width */
		display: flex; /* Use flex layout */
		flex-direction: column; /* Stack children vertically */
		align-items: center; /* Center children horizontally */
		justify-content: flex-start; /* Align content to the start */
	}

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

	.block-num{
		color: #4299E1;
		font-weight: 600;
		font-size: 14px;
    	line-height: 1.13;
		font-family: Red Hat Mono Variable, Red Hat Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
	}

	.cmd{
		outline: none;
		outline-offset: 2px;
		border-width: 1px;
		background: none;
		border:none;
		font-family: Red Hat Mono Variable,Red Hat Mono,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;
		font-size: 12px;
		box-shadow: none;
	}

	.fa-circle{
		color: #90CDF4;
		font-size: 8px;
	}

	::v-deep .ant-table {
		border-collapse: separate;
		border-spacing: 0;
	}
	::v-deep .ant-table-tbody > tr > td {
		border: none; /* Remove all borders from cells */
		height: 10px;
	}
	::v-deep .ant-table-thead > tr > th {
		border-top: 1px solid black;
		background-color: #f0f0f0; /* Example: Light grey background */
		color: #333; /* Dark text color */
		font-weight: bold;
		height: 1.875rem;
		text-align: left;
		font-size: 12px;
		line-height: 1.13;
		font-weight: 600;
		text-transform: uppercase;
		color: #2C5282;
	}

	::v-deep .ant-table-tbody > tr > td {
    background: #FFFFFF; /* White background for table cells */
	}

	/* Set the background color for the entire row on hover */
	::v-deep .ant-table-tbody > tr:hover > td {
		background: #F3F6F8; /* Light grey background for table rows on hover */
	}

	/* Set the background color for a specific table cell on hover */
	::v-deep .ant-table-tbody > tr > td:hover {
		background: #E1F3FF; /* Light blue background for table cells on hover */
	}

	/* Ensure the hover background color change is visible only within the cell, 
	not affecting the entire row. This might require specific handling based on 
	the structure of your table and cells. The following is an additional rule 
	to ensure row hover doesn't override cell hover. */
	::v-deep .ant-table-tbody > tr:hover > td:hover {
		background: #E1F3FF; /* This ensures the cell hover color is correct */
	}

	/* Set the background color for table headings to white */
	::v-deep .ant-table-thead > tr > th {
		background: #FFFFFF; /* White background for table headings */
		border: none !important; /* Remove borders */
		outline: none !important; /* Remove outlines */
	}

	/* Changes the background color of the pagination buttons */
	::v-deep .ant-pagination-item {
	background-color: #FFFFFF;
	}

	::v-deep .ant-pagination-item-active{
		border-color: #4299E1;
	}

	::v-deep .ant-pagination-item-active a  {
		
		color: #2C5282;
		outline: #2C5282;
		
	}

	::v-deep .ant-pagination-item a  {
		color: #1890ff;
		border-color: #1890ff;
	}

	::v-deep .ant-pagination-item:hover  {
		color: #1890ff;
		border-color: #1890ff;
	}

	::v-deep .ant-pagination-item a:hover  {
		color: #1890ff;
	}
	/* Style changes for the previous and next buttons */
	::v-deep .ant-pagination-prev .ant-pagination-item-link, .ant-pagination-next .ant-pagination-item-link {
		color: #1890ff;
	border-color: #91d5ff;
	}

</style>