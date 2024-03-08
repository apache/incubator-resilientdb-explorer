<script>
	import { useBlocksStore } from "@/store/blocks";
	import { ref } from 'vue';
	import HorizontalMenuBar from "@/views/menu/HorizontalMenuBar.vue";
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faSearch } from '@fortawesome/free-solid-svg-icons';

	export default {
	name: "HeaderView",
	components: { HorizontalMenuBar, FontAwesomeIcon },
	setup() {
		const searchQuery = ref(''); // Initialize the search query state
		const blocksStore = useBlocksStore(); // Access the blocks store

		// Function to update the search text in the blocks store
		const updateSearch = (query) => {
		blocksStore.setSearchText(query);
		};

		// Make sure to return everything that will be used in the template
		return { 
		searchQuery, 
		updateSearch,
		};
	}
  };
</script>

<template>
	<div class="header">
		<div class="logo-and-search">
			<img src="@/assets/logo.png" class="logo" alt="ResilientDB"/>
			<div class="search">
				<font-awesome-icon class="fa-icon" icon="search" />
				<input v-model="searchQuery" @input="updateSearch($event.target.value)" placeholder="Search" class="custom-search"/>
			</div>
		</div>
	</div>
</template>


<style scoped lang="scss">
@import "@/styles/variables.scss";

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #E4F3FC;
	padding: 10px;
}

.logo-and-search {
	display: flex;
	align-items: center;
	flex-grow: 1;
	gap: 10px; /* Adjust the gap between logo and search */
}

.logo {
	height: 50px;
}

.search {
	display: flex;
	align-items: center;
	flex-grow: 1;
	background-color: #15527b0d;
	border-radius: 0.25rem;
	padding-left: 10px; /* Padding for icon */
}

.fa-icon {
	/* Adjust the spacing to the right of the icon */
	color: #3A6F91; /* Adjust the color as needed */
	padding-top: 0.86rem;
	padding-bottom: 0.88rem;
	padding-left: 5px;
	padding-right: 5px;
	flex-shrink: 0; /* Prevents the icon from shrinking */
	font-size: 18px;
}

.custom-search {
	flex-grow: 1;
	outline: none;
	border: none;
	background: none;
	box-shadow: none;
	border-radius: 0.25rem;
	/* Typing text styles */
	font-size: 16px;
	font-family: 'Red Hat Mono Variable', 'Red Hat Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
	color: #84A9C0; /* Color of the text the user types */
}

.custom-search::placeholder {
  font-size: 16px; /* Adjust to your preference */
  vertical-align: middle;
  font-family: Red Hat Mono Variable, Red Hat Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  color: #84A9C0;
}

.search:hover {
	background: #CFE2EF;
}

@media (max-width: 725px) {
	.header, .logo-and-search {
		flex-direction: column;
		align-items: center;
	}
	.custom-search {
		width: calc(100% - 20px); /* Adjust based on parent padding */
	}
}
</style>
