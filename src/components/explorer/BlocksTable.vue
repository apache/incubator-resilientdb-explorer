<script>
import { useBlocksStore} from "@/store/blocks";
import { useThemeStore } from "@/store/theme";
import { storeToRefs } from "pinia";
import { DownOutlined, FireTwoTone, SearchOutlined } from "@ant-design/icons-vue";
import { defineComponent, reactive, ref, toRefs, computed, onMounted, nextTick } from "vue";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faSearch);
library.add(faCircle);

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
    const themeStore = useThemeStore(); // Access the theme store
    const { blocks } = storeToRefs(blocksStore);
    const theme = computed(() => themeStore.theme.value); // Computed property for theme

    // Reactive state for search text
    const searchText = ref("");

    // Reactive state for filtered blocks with relativeCreatedAt included
    const filteredBlocks = computed(() => blocksStore.filteredBlocks);

    // Define the onSearch function
    const onSearch = (value) => {
      searchText.value = value;
    };

    onMounted(async () => {
      await blocksStore.refreshBlocks();
      await nextTick(); // Ensures DOM is updated after state changes
    });

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

    const columns = [
      {
        title: " Block #",
        dataIndex: "number",
        key: "number",
        width: 150,
        fixed: "left",
        sorter: {
          compare: (a, b) => a.id - b.id,
          multiple: 1,
        },
        defaultSortOrder: 'descend',
        slots: {
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
      data: filteredBlocks,
      columns,
      handleSearch,
      searchInput,
      handleReset,
      onSearch,
      theme, // Return the theme to use in the template
      ...toRefs(state),
    };
  },
});
</script>

<template>
  <div :class="['white-background-wrapper', theme]">
    <div class="container timeline" :class="[theme]">
      <div class="grid letOverflow" :class="[theme]">
        <a-table class="text-steel-dark" :columns="columns" :data-source="data" :class="[theme]">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'size'">
              <span>{{ record.size }} bytes</span>
            </template>
            <template v-if="column.key === 'cmd'">
              <span class="cmd">{{ record.transactions[0]?.cmd }}</span>
            </template>
            <template v-if="column.key === 'createdAt'">
              <span>{{ record.relativeCreatedAt }}</span>
            </template>
            <template v-else-if="column.key === 'gasUsed'">
              <div>
                <fire-two-tone two-tone-color="red" /> {{ record.gasUsed }}
              </div>
            </template>
          </template>
          <template #customRender="{ text, record, column }">
            <span v-if="searchText && searchedColumn === column.dataIndex">
              <template v-for="(fragment, i) in text.toString().split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))">
                <mark v-if="fragment.toLowerCase() === searchText.toLowerCase()" class="highlight" :key="i">
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
/* Light Theme Styles */
.light .white-background-wrapper {
	background-color: #FFFFFF; /* Light mode background */
}

.light .container {
	background-color: #ffffff; /* Light container background */
	color: #333; /* Dark text for readability */
}

.light .grid {
	background-color: #FFFFFF; /* Light grid background */
}

.light .ant-table {
	background-color: #ffffff;
	color: #333;
}

.light .block-num {
	color: #4299E1; /* Text color specific to light mode */
}

.light .cmd {
	background-color: #ffffff;
	color: #000000;
}

/* Dark Theme Styles */
.dark .white-background-wrapper {
	background-color: #022045; /* Dark mode background */
	color: #ffffff; /* Light text in dark mode */
}

.dark .container {
	background-color: #022045;
	color: #ffffff;
}

.dark .grid {
	background-color: #022045;
	color: #ffffff;
}

.dark .ant-table {
	background-color: #022045 !important; /* Dark mode table background */
	color: #ffffff !important; /* Light text for table rows */
}

.dark ::v-deep .ant-table-thead > tr > th {
	background-color: #022045 !important;
	color: #ffffff !important; /* Header text color */
	border-bottom: 1px solid #ffffff; /* Adjust borders */
}

.dark ::v-deep .ant-table-tbody > tr > td {
	background-color: #022045 !important; /* Dark mode table cells */
	color: #ffffff !important; /* Text color for contrast */
}

.dark ::v-deep .ant-table-tbody > tr:hover > td {
	background-color: #003366 !important; /* Slightly darker hover effect */
}

.dark .block-num {
	color: #ffffff !important; /* Adjust text color for dark mode */
}

.dark .cmd {
	background-color: #1a1a1a !important; /* Darker background for commands */
	color: #ffffff !important;
}

/* General Styles */
.container {
	width: 100%;
	align-self: center;
	margin: auto;
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

.latestBlocks {
	font-size: 18px;
	line-height: 1.13;
	font-weight: 600;
	color: rgb(17, 17, 17, 0.65);
	margin-left: -1rem;
	display: inline-block;
	position: relative;
}

.heading {
	display: flex;
	width: 100%;
	margin: 0 2rem;
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

.block-num {
	font-weight: 600;
	font-size: 14px;
	line-height: 1.13;
	font-family: Red Hat Mono Variable, Red Hat Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
}

.cmd {
	outline: none;
	outline-offset: 2px;
	border-width: 1px;
	background: none;
	border: none;
	font-family: Red Hat Mono Variable, Red Hat Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
	font-size: 12px;
	box-shadow: none;
}

.fa-circle {
	color: #90CDF4;
	font-size: 8px;
}

/* Additional deep styles for table */
::v-deep .ant-table {
	border-collapse: separate;
	border-spacing: 0;
}

::v-deep .ant-table-tbody > tr > td {
	border: none;
	height: 10px;
}

::v-deep .ant-table-thead > tr > th {
	border-top: 1px solid black;
	background-color: #ffffff; /* Light grey background for light mode */
	color: #2C5282;
	font-weight: bold;
	font-size: 12px;
	line-height: 1.13;
}

::v-deep .ant-table-tbody > tr > td:hover {
	background: #E1F3FF;
}

::v-deep .ant-table-tbody > tr:hover > td:hover {
	background: #E1F3FF;
}

::v-deep .ant-table-thead > tr > th {
	background: #FFFFFF;
	border: none !important;
	outline: none !important;
}

/* Light Theme Styles for Pagination */
.light ::v-deep .ant-pagination-item {
	background-color: #FFFFFF;
}

.light ::v-deep .ant-pagination-item-active {
	border-color: #4299E1; /* Highlight border in light mode */
}

.light ::v-deep .ant-pagination-item-active a {
	color: #2C5282;
	outline: #2C5282;
}

.light ::v-deep .ant-pagination-item a {
	color: #1890ff;
	border-color: #1890ff;
}

.light ::v-deep .ant-pagination-item:hover {
	color: #1890ff;
	border-color: #1890ff;
}

.light ::v-deep .ant-pagination-item a:hover {
	color: #1890ff;
}

.light ::v-deep .ant-pagination-prev .ant-pagination-item-link,
.light ::v-deep .ant-pagination-next .ant-pagination-item-link {
	color: #1890ff;
	border-color: #91d5ff;
}

/* Dark Theme Styles for Pagination */
.dark ::v-deep .ant-pagination-item {
	background-color: #022045 !important; /* Dark mode background */
	color: #ffffff !important; /* Light text */
}

.dark ::v-deep .ant-pagination-item-active {
	border-color: #90cdf4 !important; /* Highlight border in dark mode */
}

.dark ::v-deep .ant-pagination-item-active a {
	color: #ffffff !important; /* Light text */
	outline: #ffffff !important;
}

.dark ::v-deep .ant-pagination-item a {
	color: #ffffff !important;
	border-color: #ffffff !important;
}

.dark ::v-deep .ant-pagination-item:hover {
	color: #ffffff !important;
	border-color: #90cdf4 !important; /* Highlight on hover in dark mode */
}

.dark ::v-deep .ant-pagination-item a:hover {
	color: #ffffff !important;
}

/* Light Mode Styles for Pagination Previous and Next Links */
.light ::v-deep .ant-pagination-prev .ant-pagination-item-link,
.light ::v-deep .ant-pagination-next .ant-pagination-item-link {
	background-color: #FFFFFF; /* Light mode background */
	color: #1890ff; /* Light mode text color */
	border-color: #91d5ff; /* Light mode border color */
}

.light ::v-deep .ant-pagination-prev .ant-pagination-item-link:hover,
.light ::v-deep .ant-pagination-next .ant-pagination-item-link:hover {
	background-color: #FFFFFF; /* Maintain light background on hover */
	color: #1890ff; /* Light mode text color on hover */
	border-color: #91d5ff; /* Light mode border color on hover */
}

/* Dark Mode Styles for Pagination Previous and Next Links */
.dark ::v-deep .ant-pagination-prev .ant-pagination-item-link,
.dark ::v-deep .ant-pagination-next .ant-pagination-item-link {
	background-color: #022045 !important; /* Dark mode background */
	color: #ffffff !important; /* Light text color */
	border-color: #ffffff !important; /* Light border color */
}

.dark ::v-deep .ant-pagination-prev .ant-pagination-item-link:hover,
.dark ::v-deep .ant-pagination-next .ant-pagination-item-link:hover {
	background-color: #022045 !important; /* Maintain dark background on hover */
	color: #ffffff !important; /* Light text color on hover */
	border-color: #ffffff !important; /* Light border color on hover */
}

</style>