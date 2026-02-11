import Button from "./Button";

interface FeatureSectionProps {
    title: string;
    items?: string[];
    numbered?: boolean;
    plain?: boolean;
    className?: string;
    titleAlign?: "left" | "right" | "center";
    Button?: React.ReactNode;
}

export default function FeatureSection({
    title,
    items = [],
    numbered = false,
    plain = false,
    className = "",
    titleAlign = "left",
    Button = null,
}: FeatureSectionProps) {
    return (
        <section className={`py-8 ${className}`}>
            <div className="max-w-[600px] mx-auto px-8 flex flex-col justify-around h-64">
                <h2 className={`text-2xl font-bold ${titleAlign === "right" ? "text-right" : titleAlign === "center" ? "text-center" : ""}`}>
                    {title}
                </h2>
                <div className="flex flex-col font-bold gap-4">
                    {items.map((item, i) => (
                        <p key={i}>{numbered ? `${i + 1}. ` : plain ? "" : "- "}{item}</p>
                    ))}
                </div>
                {Button && <div className="mt-4 text-center">{Button}</div>}
            </div>
        </section>
    );
}