<script>
import { useBlocksStore, useThemeStore } from "@/store/blocks";
import { computed, ref } from 'vue';
import HorizontalMenuBar from "@/views/menu/HorizontalMenuBar.vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

// Import your logo images
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo.png';

library.add(faSun, faMoon); // Add the sun and moon icons to the library

export default {
  name: "HeaderView",
  components: { HorizontalMenuBar, FontAwesomeIcon },
  setup() {
    const searchQuery = ref(''); // Initialize the search query state
    const blocksStore = useBlocksStore(); // Access the blocks store
    const themeStore = useThemeStore();

    // Function to update the search text in the blocks store
    const updateSearch = (query) => {
      blocksStore.setSearchText(query);
    };

    const toggleTheme = () => {
      themeStore.toggleTheme();
    };

    // Computed property to determine which icon to use
    const themeIcon = computed(() => themeStore.theme.value === 'light' ? 'sun' : 'moon');

    // Computed property to get the current theme
    const theme = computed(() => themeStore.theme.value);

    // Computed property for the logo source based on the theme
    const logoSrc = computed(() => (theme.value === 'dark' ? logoDark : logoLight));

    // Return everything that will be used in the template
    return { 
      searchQuery, 
      updateSearch,
      toggleTheme,
      themeIcon,
      theme,
      logoSrc,
    };
  }
};
</script>


<template>
  <div :class="['header', theme]">
    <div class="logo-and-search">
      <img :src="logoSrc" class="logo" alt="ResilientDB"/>
      <div class="search">
        <font-awesome-icon class="fa-icon" icon="search" />
        <input v-model="searchQuery" @input="updateSearch($event.target.value)" placeholder="Search" class="custom-search"/>
      </div>
      <button class="theme-toggle" @click="toggleTheme">
        <font-awesome-icon :icon="themeIcon" />
      </button>
    </div>
  </div>
</template>

  

<style scoped lang="scss">
@import "@/styles/variables.scss";

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #E4F3FC; /* Existing light theme background */
  padding: 10px;
}

/* Existing light theme styles remain unchanged */

/* Dark Theme Styles */
.header.dark {
  background: #06295d; /* Dark blue background */
}

.header.dark .search {
  background-color: #1F3B73; /* Slightly darker than #244a8c */
}

.header.dark .search:hover {
  background: #244a8c; /* Lighter shade for hover effect */
}

.header.dark .fa-icon,
.header.dark .theme-toggle {
  color: #90cdf4; /* Lighter blue for icons */
}

.header.dark .custom-search {
  color: #e0e0e0; /* Light grey text */
}

.header.dark .custom-search::placeholder {
  color: #e0e0e0;
}

/* Rest of your existing styles */
.logo-and-search {
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 10px; /* Adjust the gap between logo and search */
}

.logo {
  height: 50px;
  padding-left: 20px;
}

.search {
  display: flex;
  align-items: center;
  flex-grow: 1;
  background-color: #15527b0d; /* Existing light theme color */
  border-radius: 0.25rem;
  padding-left: 10px; /* Padding for icon */
}

.fa-icon {
  /* Adjust the spacing to the right of the icon */
  color: #3A6F91; /* Existing light theme color */
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
  color: #84A9C0; /* Existing light theme color */
}

.custom-search::placeholder {
  font-size: 16px; /* Adjust to your preference */
  vertical-align: middle;
  font-family: 'Red Hat Mono Variable', 'Red Hat Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  color: #84A9C0; /* Existing light theme color */
}

.search:hover {
  background: #CFE2EF; /* Existing light theme color */
}

.theme-toggle {
  color: #84A9C0; /* Existing light theme color */
  background: none;
  flex-shrink: 0;
  font-size: 24px; /* Consistent font size */
  padding: 8px; /* Consistent padding */
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;

  /* Ensure the icon maintains a consistent size */
  & > svg {
    width: 1.5em;
    height: 1.5em; /* Ensures both icons are the same size */
  }
}

/* Responsive Styles */
@media (max-width: 725px) {
  .header, .logo-and-search {
    flex-direction: column;
    align-items: center;
  }
  .custom-search {
    width: calc(100% - 20px); /* Adjust based on parent padding */
  }
  .theme-toggle {
    order: 3;
    width: 100%;
    margin-top: 10px;
  }
}
</style>


