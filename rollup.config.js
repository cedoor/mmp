import typescript from "rollup-plugin-typescript2";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import json from "rollup-plugin-json";

const pkg = require("./package.json");

let config = {
    input: "src/index.ts",
    output: {
        name: pkg.name,
        format: "umd",
        file: "build/" + pkg.name + ".js",
        globals: {
            d3: "d3"
        }
    },
    external: ["d3"],
    plugins: [
        json(),
        typescript()
    ]
};

if (process.env.BUILD === "production") {
    config.output.banner = `/**
 * @module ${pkg.name}
 * @version ${pkg.version}
 * @file ${pkg.description}
 * @copyright ${pkg.author.name} ${new Date().getFullYear()}
 * @license ${pkg.license}
 * @see {@link ${pkg.homepage}|GitHub}
*/`;
} else {
    config.plugins = config.plugins.concat([
        serve({
            open: true,
            contentBase: ""
        }),
        livereload()
    ]);
}

export default config;
