import Link from 'next/link';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    href?: string;
    onClick?: () => void;
    className?: string;
}

export default function Button({
    children,
    variant = "primary",
    href,
    onClick,
    className: extraClassName = "",
}: ButtonProps) {
    const baseStyles = "px-4 py-2 rounded font-medium transition-colors";

    const variants = {
        primary: "bg-white text-orange-500 border border-orange-600 hover:bg-orange-600 hover:text-white",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    };

    const className = `${baseStyles} ${variants[variant]} ${extraClassName}`;

    // Render as Link if href provided, otherwise as button
    if (href) {
        return (
            <Link href={href} className={className}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={className}>
            {children}
        </button>
    );
}
