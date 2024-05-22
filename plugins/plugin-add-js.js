export default function pluginAddJS(paths) {
    return {
        name: "pluginAddJS",
        buildStart() {
            paths.forEach(path => {
                this.emitFile({
                    type: 'chunk',
                    id: path,
                    fileName: path.replace("src/", ""),
                })
            });
            paths.forEach(path => {
                this.addWatchFile(path);
            });
        },
    }
}