<script>
import { useBlocksStore, useThemeStore } from "@/store/blocks";
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo.png';

library.add(faSun, faMoon);

export default {
  name: "HeaderView",
  components: { FontAwesomeIcon },
  setup() {
    const searchQuery = ref('');
    const blocksStore = useBlocksStore();
    const themeStore = useThemeStore();

    const updateSearch = (query) => {
      blocksStore.setSearchText(query);
    };

    const toggleTheme = () => {
      themeStore.toggleTheme();
    };

    const themeIcon = computed(() => themeStore.theme.value === 'light' ? 'sun' : 'moon');
    const theme = computed(() => themeStore.theme.value);
    const logoSrc = computed(() => (theme.value === 'dark' ? logoDark : logoLight));

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
      <img :src="logoSrc" class="logo" alt="ResilientDB" />
      <div class="search">
        <font-awesome-icon class="fa-icon" icon="search" />
        <input
          v-model="searchQuery"
          @input="updateSearch($event.target.value)"
          placeholder="Search"
          class="custom-search"
        />
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

/* Dark Theme Styles */
.header.dark {
  background: #06295d; /* Dark blue background */
}

.header.dark .search {
  background-color: #1F3B73;
}

.header.dark .search:hover {
  background: #244a8c;
}

.header.dark .fa-icon,
.header.dark .theme-toggle {
  color: #90cdf4;
}

.header.dark .custom-search {
  color: #e0e0e0;
}

.header.dark .custom-search::placeholder {
  color: #e0e0e0;
}

.logo-and-search {
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 10px;
}

.logo {
  height: 50px;
  padding-left: 20px;
}

.search {
  display: flex;
  align-items: center;
  flex-grow: 1;
  background-color: #15527b0d;
  border-radius: 0.25rem;
  padding-left: 10px;
}

.fa-icon {
  color: #3A6F91;
  padding-top: 0.86rem;
  padding-bottom: 0.88rem;
  padding-left: 5px;
  padding-right: 5px;
  flex-shrink: 0;
  font-size: 18px;
}

.custom-search {
  flex-grow: 1;
  outline: none;
  border: none;
  background: none;
  box-shadow: none;
  border-radius: 0.25rem;
  font-size: 16px;
  font-family: 'Red Hat Mono Variable', 'Red Hat Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  color: #84A9C0;
}

.custom-search::placeholder {
  font-size: 16px;
  vertical-align: middle;
  font-family: 'Red Hat Mono Variable', 'Red Hat Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  color: #84A9C0;
}

.search:hover {
  background: #CFE2EF;
}

.theme-toggle {
  color: #84A9C0;
  background: none;
  flex-shrink: 0;
  font-size: 24px;
  padding: 8px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;

  & > svg {
    width: 1.5em;
    height: 1.5em;
  }
}

/* Responsive Styles */
@media (max-width: 725px) {
  .header {
    flex-direction: row; /* Maintain row direction on mobile */
    flex-wrap: wrap; /* Allow items to wrap within the row */
    gap: 10px;
  }

  .logo-and-search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo {
    flex-shrink: 0;
    height: 40px;
  }

  .search {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .custom-search {
    width: 100%;
    padding: 5px;
  }

  .theme-toggle {
    flex-shrink: 0;
    padding: 5px;
    margin-left: auto;
  }
}
</style>



