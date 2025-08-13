import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
	end: number;
	duration?: number;
	suffix?: string;
	className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
	end,
	duration = 2000,
	suffix = '',
	className = ''
}) => {
	const [count, setCount] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const counterRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !isVisible) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.5 }
		);

		const currentRef = counterRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [isVisible]);

	useEffect(() => {
		if (!isVisible) return;

		let startTime: number | null = null;
		let animationFrame: number;

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / duration, 1);

			// Easing function for smooth animation
			const easeOutQuart = 1 - Math.pow(1 - progress, 4);

			setCount(Math.floor(easeOutQuart * end));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);

		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, [isVisible, end, duration]);

	return (
		<div ref={counterRef} className={className}>
			{count.toLocaleString()}{suffix}
		</div>
	);
};

export default AnimatedCounter;
