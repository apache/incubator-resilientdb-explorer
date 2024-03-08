<script>
	import BlocksTable from "../explorer/BlocksTable.vue";
	import MetaData from "../explorer/MetaData.vue";

	export default {
		name: "BlocksExplorer",
		components: { BlocksTable, MetaData },
	};
</script>
<template>
	<div class="container timeline">
		<meta-data />

		<blocks-table />
	</div>
</template>
<style scoped>
	.container {
		width: 100%;
		align-self: center;
		margin: auto;
		background: linear-gradient(176deg, #D2EBFA 51.68%, #D5F7EE 100%); /* Background gradient */
	}
</style>
