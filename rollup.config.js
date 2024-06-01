import serve from "rollup-plugin-serve";
import terser from '@rollup/plugin-terser';
import fs from 'fs';
import copy from "rollup-plugin-copy";

// Import custom plugins
import pluginRenderEJS from "./plugins/plugin-render-ejs";
import pluginAddJS from "./plugins/plugin-add-js";

const IS_PRODUCTION = !process.env.ROLLUP_WATCH;

// Clear the build folder if it exists
if(fs.existsSync("build/")) {
    fs.rmSync("build/", {
        recursive: true
    })
} else {
    fs.mkdirSync("build/");
    fs.mkdirSync("build/assets/");
}

// Copy static assets directly
fs.cpSync("src/assets/", "build/assets/", { recursive: true });

const EJS_GLOBAL_DATA = {
    IS_PRODUCTION: IS_PRODUCTION,
    IS_DEV: !IS_PRODUCTION,
};

export default {
    input: "src/index.js",
    output: {
        dir: 'build',
        format: 'cjs'
    },
    plugins: [
        // Watch some root directory files
        {
            buildStart: function() {
                ["src/root/index.css"].forEach(filename => {
                    this.addWatchFile(filename);
                });
            }
        },
        copy({
            targets: [{ src: "src/root/*", dest: "build/" }]
        }),
        // Add service worker
        pluginAddJS(["src/service-worker.js"]),
        // Generate index.html
        pluginRenderEJS({ ...EJS_GLOBAL_DATA }, [
            "src/index.ejs",
        ]),
        // Minify JS in production
        IS_PRODUCTION && terser({}),
        // Locally serve content in development
        !IS_PRODUCTION && serve({
            port: 5500,
            contentBase: 'build',
        }),
    ]
};
