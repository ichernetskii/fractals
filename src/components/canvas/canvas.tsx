import {type FC} from "react";
import { useRef, useEffect } from "react";
import styles from "./canvas.module.scss";

interface Complex {
	Re: number;
	Im: number;
}

interface Screen {
	x: number;
	y: number;
}

const square: (z: Complex) => number = ({ Re, Im }) => Re ** 2 + Im ** 2;

const screenToComplex: (
	screen: Screen,
	screenSize: { width: number; height: number },
	min: Complex,
	max: Complex
) => Complex = ({ x, y }, { width, height }, min, max) => ({
	Re: min.Re + (x / width) * Math.abs(max.Re - min.Re),
	Im: min.Im + (y / height) * Math.abs(max.Im - min.Im)
});

function scaleCanvas(ctx: CanvasRenderingContext2D) {
	const { canvas } = ctx;
	const { width, height } = canvas.getBoundingClientRect();

	// assume the device pixel ratio is 1 if the browser doesn't specify it
	const devicePixelRatio = window.devicePixelRatio || 1;

	// set the 'real' canvas size to the higher width/height
	canvas.width = width * devicePixelRatio;
	canvas.height = height * devicePixelRatio;

	// ...then scale it back down with CSS
	canvas.style.width = width + "px";
	canvas.style.height = height + "px";

	// scale the drawing context so everything will work at the higher ratio
	ctx.scale(devicePixelRatio, devicePixelRatio);
}

const MAX_ITERATIONS_COUNT = 100;

function drawMandelbrot(ctx: CanvasRenderingContext2D) {
	if (!ctx) return;
	const width = parseFloat(ctx.canvas.style.width);
	const height = parseFloat(ctx.canvas.style.height);
	const canvasSize = { width, height };
	const min: Complex = { Re: -2, Im: -1.5 };
	const max: Complex = { Re: 1, Im: 1.5 };

	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			// 0 .. width -> minA .. maxA
			// 0 .. height -> minB .. maxB
			const { Re: a, Im: b } = screenToComplex({ x, y }, canvasSize, min, max);

			let z: Complex = { Re: 0, Im: 0 };
			let i = 0;

			while (i < MAX_ITERATIONS_COUNT && square(z) < 4) {
				z = {
					Re: z.Re ** 2 - z.Im ** 2 + a,
					Im: 2 * z.Re * z.Im + b
				};

				i++;
			}

			if (i === MAX_ITERATIONS_COUNT) {
				ctx.fillStyle = "black";
				ctx.fillRect(x, y, 1, 1);
			} else {
				const progress = i / MAX_ITERATIONS_COUNT; // 0 .. 1
				const h = (progress * 360) ** 1.5 % 360;
				// ctx.fillStyle = `hsl(${h} 50% ${100 * progress}%)`;
				ctx.fillStyle = `hsl(${progress * 360} 100% 50%)`;
				// ctx.fillStyle = `hsl(${progress * 360} 100% ${100 * progress}%)`;

				// const v = 1 - Math.cos(Math.PI * progress) ** 2;
				// const l = 75 - 75 * v;
				// const c = 28 + (75 - 75 * v);
				// const h = (360 * progress) ** 1.5 % 360;
				// ctx.fillStyle = `lch(${l}% ${c} ${h})`;
				ctx.fillRect(x, y, 1, 1);
			}
		}
	}
}

export const Canvas: FC = () => {
	const refCanvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const ctx = refCanvas.current?.getContext("2d");
		if (!ctx) return;
		scaleCanvas(ctx);
		drawMandelbrot(ctx);
	}, []);

	return (
		<canvas ref={refCanvas} className={styles.canvas} />
	);
};
