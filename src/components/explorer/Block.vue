<script lang="ts">
	import { useBlocksStore } from "@/store/blocks";
	import { storeToRefs } from "pinia";
	import { DownOutlined, FireTwoTone } from "@ant-design/icons-vue";
	import { defineComponent } from "vue";
	import { useRoute } from "vue-router";
	const columns = [
		{
			title: "number",
			dataIndex: "number",
			key: "number",
		},
		{
			title: "hash",
			dataIndex: "hash",
			key: "hash",
		},
		{
			title: "size",
			dataIndex: "size",
			key: "size",
		},
		{
			title: "transactions",
			dataIndex: "transactions",
			key: "transactions",
		},
		{
			title: "commitSignatures",
			key: "commitSignatures",
			dataIndex: "commitSignatures",
		},
		// {
		// 	title: "Action",
		// 	key: "action",
		// },
	];

	export default defineComponent({
		components: {
			DownOutlined,
			FireTwoTone,
		},
		async setup() {
			const route = useRoute();
			const blocksStore = useBlocksStore();
			const { blocks } = storeToRefs(blocksStore);
			const { refreshBlocks } = blocksStore;
			await refreshBlocks();

			const block = blocks.value.filter(
				(b) => b.id === parseInt(route.query.id as string)
			);

			// Convert createdAt to relative time
			const relativeTime = (createdAt:string):string => {
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

		const relativeCreatedAt = (relativeTime(block[0]?.createdAt));

			return {
				data: block,
				columns,
				relativeCreatedAt,
			};
		},
	});

	

</script>
<template>
	<div class="container timeline">
		<div class="grid letOverflow">
			<a-descriptions
				title="Block Info"	
				bordered
				:column="{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }"
			>
				<a-descriptions-item label="Block #">
					{{ data[0].number }}</a-descriptions-item
				>
				<a-descriptions-item label="Size">{{
					data[0].size + " bytes"
				}}</a-descriptions-item>
				<a-descriptions-item label="Transactions">
					<a-tag color="cyan">
							<a :href="'/transactions?id=' + data[0].id">
								View {{ Object.keys(data[0].transactions).length }}
								{{ Object.keys(data[0].transactions).length > 1 ? 
								" transactions" : " transaction"}}
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
		</div>
	</div>
</template>

<style scoped>
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
	
</style>