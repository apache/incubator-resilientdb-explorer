<script>
import { computed } from 'vue';
import BlocksTable from "../explorer/BlocksTable.vue";
import MetaData from "../explorer/MetaData.vue";
import { useThemeStore } from "@/store/theme";
import Background from '@/assets/explorer_bg.svg';
import Background_Dark from '@/assets/background-dark.svg';

export default {
  name: "BlocksExplorer",
  components: { BlocksTable, MetaData },
  setup() {
    const themeStore = useThemeStore();
    const theme = computed(() => themeStore.theme.value);

    const backgroundStyle = computed(() => {
      const backgroundImage = theme.value === 'dark' ? Background_Dark : Background;
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    });

    return {
      backgroundStyle,
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
}
</style>
