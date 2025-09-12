import * as React from "react";

type LogoProps = {
    size?: number;
    variant?: "full" | "icon" | "wordmark";
};

export default function Logo({ variant = "full" }) {

    const icon = (
        <img
            src="https://via.placeholder.com/150?text=Icon"
            alt=""
            className={`h-full aspect-square border-2 border-custom-primary object-contain`}
        />
    );

    const wordmark = (
        <img
            src="https://via.placeholder.com/300x100?text=Headstart"
            alt="Headstart"
            className={`h-full w-45 border-2 border-custom-fg object-contain`}
        />
    );

    return (
        <>
            {/* ============= FULL LOGO ============= */}
            {variant === "full" && (
                <div className="flex gap-2">
                    {icon}
                    {wordmark}
                </div>
            )}

            {/* ============= ICON LOGO ============= */}
            {variant === "icon" && (
                icon
            )}

            {/* ============= WORDMARK LOGO ============= */}
            {variant === "wordmark" && (
                wordmark
            )}
        </>
    )
}