<script>
	import BlocksTable from "../explorer/BlocksTable.vue";
	import MetaData from "../explorer/MetaData.vue";
	import Background from '@/assets/explorer_bg.svg';

	export default {
	name: "BlocksExplorer",
	components: { BlocksTable, MetaData },
	data() {
		return {
			backgroundStyle: {
				backgroundImage: `url(${Background})`,
				backgroundSize: 'cover', // Cover the entire container
				backgroundPosition: 'center', // Center the background image
				}
			};
		},
	};
</script>
<template>
	<div class="container timeline" :style="backgroundStyle">
		<meta-data />

		<blocks-table />
	</div>
</template>
<style scoped>
	.container {
		width: 100%;
		align-self: center;
		margin: auto;
		/*background: linear-gradient(176deg, #D2EBFA 51.68%, #D5F7EE 100%); /* Background gradient */
	}
</style>
