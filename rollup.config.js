import serve from "rollup-plugin-serve";
import terser from '@rollup/plugin-terser';
import fs from 'fs';

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

export default entryFiles.map((entryFile, index) => ({
    input: entryFile,
    output: {
        dir: 'build',
        format: 'cjs'
    },
    plugins: [
        IS_PRODUCTION && terser({}),
        index === 0 && !IS_PRODUCTION && serve({
            port: 5500,
            contentBase: 'build',
        })
    ]
}));
