import React from 'react';
import BloodDropIcon from '@/components/BloodDropIcon';
import { cn } from '@/lib/utils';

interface BloodLoadingProps {
	message?: string;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const BloodLoading = ({
	message = 'Loading...',
	size = 'md',
	className
}: BloodLoadingProps) => {
	const sizeClasses = {
		sm: {
			container: 'h-32',
			icon: 'lg' as const,
			text: 'text-xs',
			dots: 'w-0.5 h-0.5'
		},
		md: {
			container: 'h-64',
			icon: 'xl' as const,
			text: 'text-sm',
			dots: 'w-1 h-1'
		},
		lg: {
			container: 'h-96',
			icon: 'xl' as const,
			text: 'text-base',
			dots: 'w-1.5 h-1.5'
		}
	};

	const currentSize = sizeClasses[size];

	return (
		<div className={cn(
			"flex flex-col items-center justify-center space-y-4",
			currentSize.container,
			className
		)}>
			<div className="relative">
				{/* Animated blood drop */}
				<div className="relative">
					<BloodDropIcon
						size={currentSize.icon}
						className="text-red-500 animate-bounce"
					/>
					<div className="absolute -top-1 -left-1">
						<BloodDropIcon
							size={currentSize.icon}
							className="text-red-300 animate-ping opacity-75"
						/>
					</div>
				</div>
			</div>
			<div className="flex items-center space-x-2">
				<span className={cn(
					"text-muted-foreground animate-pulse",
					currentSize.text
				)}>
					{message}
				</span>
				<div className="flex space-x-1">
					<div
						className={cn(
							"bg-red-400 rounded-full animate-bounce",
							currentSize.dots
						)}
						style={{ animationDelay: '0ms' }}
					/>
					<div
						className={cn(
							"bg-red-400 rounded-full animate-bounce",
							currentSize.dots
						)}
						style={{ animationDelay: '150ms' }}
					/>
					<div
						className={cn(
							"bg-red-400 rounded-full animate-bounce",
							currentSize.dots
						)}
						style={{ animationDelay: '300ms' }}
					/>
				</div>
			</div>
		</div>
	);
};

export default BloodLoading;
