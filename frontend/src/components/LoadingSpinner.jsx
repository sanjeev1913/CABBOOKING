const LoadingSpinner = ({ size = 'md', text = '' }) => {
    const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizes[size]} border-2 border-primary-500 border-t-transparent rounded-full spinner`} />
            {text && <p className="text-sm text-dark-400">{text}</p>}
        </div>
    );
};

export const PageLoader = ({ text = 'Loading...' }) => (
    <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text={text} />
    </div>
);

export default LoadingSpinner;
