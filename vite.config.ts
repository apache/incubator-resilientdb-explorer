import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue(), vueJsx()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	css: {
		preprocessorOptions: {
			less: {
				modifyVars: {
					"primary-color": "#59B4A9",
					"link-color": "#54afa7",
					"border-radius-base": "0px",
				},
				javascriptEnabled: true,
			},
		},
	},
	server: {
		port: 8080,
	}
});
