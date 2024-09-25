// src/store/theme.ts

import { defineStore } from "pinia";

interface ThemeValue {
  value?: string;
}

export const useThemeStore = defineStore('theme', {
  state: (): { theme: ThemeValue } => {
    // Retrieve the stored theme from localStorage, default to 'light' if not set
    const storedTheme = localStorage.getItem('theme');
    const theme: ThemeValue = {
      value: storedTheme ? storedTheme : 'light',
    };
    return { theme };
  },
  getters: {
    isDarkTheme(state): boolean {
      return state.theme.value === 'dark';
    },
  },
  actions: {
    toggleTheme() {
      // Toggle the theme value
      this.theme.value = this.theme.value === 'light' ? 'dark' : 'light';
      // Save the new theme value to localStorage
      localStorage.setItem('theme', this.theme.value!);
    },
  },
});
