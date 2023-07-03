import { type FC } from "react";
import { Canvas } from "@/components/canvas/canvas";

export const App: FC = () => {
	return (
		<div>
			Mandelbrot fractal
			<Canvas />
		</div>
	);
};
