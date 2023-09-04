import { useRef, useEffect } from 'react';

export type fctResize = () => void
export type fctDraw = (context: CanvasRenderingContext2D, size: any) => void

const useCanvas = (size: any, draw: fctDraw, resize: fctResize) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const context = canvasRef.current?.getContext('2d')
		let anim: number;

		(function render() {
			if (context)
			{
				context.fillStyle = 'black';
    			context.fillRect(0, 0, size.w, size.h);
    			// Draw middle line
    			context.strokeStyle = 'white';
    			context.beginPath();
    			context.moveTo(size.w / 2, 0);
    			context.lineTo(size.w / 2, size.h);
    			context.stroke();
				draw(context, size);
			}
			anim = window.requestAnimationFrame(render)
		})();

		return () =>  window.cancelAnimationFrame(anim)
	}, [draw])

	useEffect(() => resize(), []);

	return {canvasRef};
}

export default useCanvas;