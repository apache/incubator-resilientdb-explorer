<script setup lang="ts">
	import { RouterView } from "vue-router";
	import HeaderView from "@/views/HeaderView.vue";
</script>

<template>
	<div style="width: 100%; display: flex; flex-direction: column; flex: 1">
		<header-view />
		<Suspense>
			<RouterView style="flex: 1;" />
		</Suspense>
	</div>
</template>

<style lang="scss">
	@import "@/styles/variables.scss";
	@import "@/styles/base.css";
	#app {
		width: 100%;
		height: 100%;
		display: flex;
		font-weight: normal;
		color: $secondary-color-dark;
	}
</style>
