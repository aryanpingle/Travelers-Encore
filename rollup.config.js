import serve from "rollup-plugin-serve";
import terser from '@rollup/plugin-terser';
import fs from 'fs';

// Import custom plugins
import pluginRenderEJS from "./plugins/plugin-render-ejs";

const IS_PRODUCTION = !process.env.ROLLUP_WATCH;

// Clear the build folder if it exists
if(fs.existsSync("build/")) {
    fs.rmSync("build/", {
        recursive: true
    })
} else {
    fs.mkdirSync("build/");
}

// Copy root level stuff directly
fs.cpSync("src/root", "build", { recursive: true });

const entryFiles = ["src/index.js", "src/service-worker.js"];

const EJS_GLOBAL_DATA = {
    IS_PRODUCTION: IS_PRODUCTION,
};

export default entryFiles.map((entryFile, index) => ({
    input: entryFile,
    output: {
        dir: 'build',
        format: 'cjs'
    },
    plugins: [
        // Generate index.html
        index === 0 && pluginRenderEJS({ ...EJS_GLOBAL_DATA }, [
            "src/index.ejs",
        ]),
        // Minify JS in production
        IS_PRODUCTION && terser({}),
        // Locally serve content in development
        index === 0 && !IS_PRODUCTION && serve({
            port: 5500,
            contentBase: 'build',
        }),
    ]
}));
