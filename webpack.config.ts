import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCSSExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import { type Configuration } from "webpack";
import "webpack-dev-server";

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.resolve();

const getPlugins = (isProd: boolean): any[] => {
	const loaders = [];

	loaders.push(new HtmlWebpackPlugin({
		template: "./index.html",
	}));

	return loaders;
};

const cssLoaders = (extra?: string | any[], module = false, isProd = false) => {
	let loaders = [
		isProd ? MiniCSSExtractPlugin.loader : "style-loader",
		{
			loader: "css-loader",
			options: {
				sourceMap: !isProd,
				importLoaders: 2,
				modules: module ? {
					localIdentName: "[local]___[name]___[hash:base64:5]"
				} : false
			}
		}
	];

	// extra css
	if (extra) {
		if (typeof extra === "string") {
			loaders.push(extra);
		} else if (Array.isArray(extra)) {
			loaders = loaders.concat(extra);
		}
	}

	return loaders;
}

export default (env: { mode?: "development" | "production"; } = {}): Configuration => {
	const { mode = "development" } = env;
	const isProd = mode === "production";

	return {
		context: path.resolve(__dirname, "./src"),
		mode,
		devServer: {
			port: 4200,
			open: true,
			hot: true,
		},
		entry: "./index.tsx",
		resolve: {
			extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
		optimization: {
			minimize: false,
			splitChunks: {
				chunks: isProd ? "all" : "async",
			},
		},
		output: {
			filename: `[name]${isProd ? "" : ".[fullhash:8]"}.js`,
			path: path.resolve(__dirname, "build"),
			chunkFilename: `[id]${isProd ? "" : ".[fullhash:8]"}.js`,
			clean: true,
		},
		target: isProd ? "browserslist" : "web", // disable browserslist for development
		devtool: isProd ? undefined : "source-map",
		plugins: getPlugins(isProd),
		module: {
			rules: [
				{
					test: /\.[jt]sx?$/,
					exclude: /node_modules/,
					use: "ts-loader",
				},

				// CSS loaders
				{
					test: /\.(css)$/,
					use: cssLoaders()
				},

				// SCSS loaders
				// SCSS except modules
				{
					test: /\.(s[ca]ss)$/,
					exclude: /\.module\.s[ca]ss$/,
					use: cssLoaders("sass-loader", false)
				},
				// SCSS modules
				{
					test: /\.module\.s[ca]ss$/,
					use: cssLoaders("sass-loader", true)
				},
			],
		},
	};
};
