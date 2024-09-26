<script lang="ts">
	import { useBlocksStore } from "@/store/blocks";
	import { useThemeStore } from "@/store/theme"; 
	import { storeToRefs } from "pinia";
	import { DownOutlined, FireTwoTone } from "@ant-design/icons-vue";
	import { defineComponent, computed } from "vue";
	import { useRoute } from "vue-router";
	import Background from '@/assets/explorer_bg.svg';
	import Background_Dark from '@/assets/background-dark.svg';

	import { library } from '@fortawesome/fontawesome-svg-core';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
	import { faDatabase } from '@fortawesome/free-solid-svg-icons';

	library.add(faDatabase);

	export default defineComponent({
		components: {
			DownOutlined,
			FireTwoTone,
			'font-awesome-icon': FontAwesomeIcon,
		},
		async setup() {
			const route = useRoute();
			const blocksStore = useBlocksStore();
			const { blocks } = storeToRefs(blocksStore);
			const themeStore = useThemeStore();
			const { refreshBlocks } = blocksStore;
			await refreshBlocks();

			const block = blocks.value.filter(
				(b) => b.id === parseInt(route.query.id as string)
			);

			// Convert createdAt to relative time
			const relativeTime = (createdAt: string): string => {
				const now = new Date();
				const createdAtDate = new Date(createdAt);
				const diffInSeconds = Math.floor((now.getTime() - createdAtDate.getTime()) / 1000);
				const days = Math.floor(diffInSeconds / (3600 * 24));
				const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
				const minutes = Math.floor((diffInSeconds % 3600) / 60);
				const seconds = Math.floor(diffInSeconds % 60);

				let result = '';
				if (days > 0) result += `${days}d `;
				if (hours > 0) result += `${hours}h `;
				if (minutes > 0) result += `${minutes}m `;
				if (seconds > 0) result += `${seconds}s`;

				return result.trim();
			};

			// Access the theme store
			const theme = computed(() => themeStore.theme.value);

			const relativeCreatedAt = relativeTime(block[0]?.createdAt);

			const backgroundStyle = computed(() => {
				const backgroundImage = theme.value === 'dark' ? Background_Dark : Background;
				return {
					backgroundImage: `url(${backgroundImage})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				};
			});

			return {
				theme,
				backgroundStyle,
				data: block,
				relativeCreatedAt,
			};
		},
	});
</script>

<template>
	<div :class="['container', theme]" :style="backgroundStyle">
		<div :class="['card', theme]">
			<a-card :class="['custom-card', theme]">
				<template v-slot:title>
					<font-awesome-icon icon="database" class="fa-icon-custom" /> Block Info
				</template>
				<a-descriptions
					bordered
					:column="{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }"
					:class="['custom-descriptions', theme]"
				>
					<a-descriptions-item label="Block #">
						{{ data[0].number }}
					</a-descriptions-item>
					<a-descriptions-item label="Size">
						{{ data[0].size + " bytes" }}
					</a-descriptions-item>
					<a-descriptions-item label="Transactions">
						<a-tag color="cyan">
							<a :href="'/transactions?id=' + data[0].id">
								View {{ Object.keys(data[0].transactions).length }}
								{{ Object.keys(data[0].transactions).length > 1 ? " transactions" : " transaction" }}
							</a>
						</a-tag>
					</a-descriptions-item>
					<a-descriptions-item label="CMD">
						{{ data[0].transactions[0].cmd }}
					</a-descriptions-item>
					<a-descriptions-item label="Created At">
						{{ relativeCreatedAt }}
					</a-descriptions-item>
				</a-descriptions>
			</a-card>
		</div>
	</div>
</template>

<style scoped>
/* Light Theme Styles */
.light .container {
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

.light .fa-icon-custom {
	color: #244a8c; /* Original icon color in light theme */
}

.light ::v-deep .ant-descriptions-item-label {
	color: #244a8c;
}

.light ::v-deep .ant-descriptions-item-content {
	color: #566873;
}

.light ::v-deep .ant-descriptions-view {
	background-color: #ffffff;
}

/* Dark Theme Styles */
.dark .container {
	background-color: #2d2d2d; /* Dark background */
	color: #ffffff; /* Light text */
}

.dark .custom-card {
	background-color: #244a8c; /* Dark card background */
	color: #ffffff; /* Light text specific to dark theme */
}

.dark ::v-deep .ant-card-head {
	background-color: #1F3B73 !important; /* Slightly darker header background */
}

.dark .fa-icon-custom {
	color: #90cdf4; /* Lighter blue icon color for dark theme */
}

.dark ::v-deep .ant-descriptions-item-label {
	color: #90cdf4;
}

.dark ::v-deep .ant-descriptions-item-content {
	color: #ffffff;
}

.dark ::v-deep .ant-descriptions-view {
	background-color: #244a8c;
}

/* General Styles */
.container {
	width: 100%;
	align-self: center;
	margin: auto;
	padding: 30px;
	font-family: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, -apple-system,
		BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
		sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}

.card {
	display: flex;
}

.custom-card {
	flex: 1;
	border-radius: 1rem; /* Rounded borders */
	overflow: hidden; /* Ensure child elements respect border-radius */
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

/* Adjustments for Ant Design Components */
::v-deep .ant-descriptions-item-label {
	font-weight: bold;
}
</style>
