import React from "react";
import Image from "react-bootstrap/Image";

// AvatarImage component displays a circular bird image with common name and contributor
export default function AvatarImage({ src, alt, commonName, contributor, size, className}) {
    return (
        <Image
            src={src || "/bird_avatar_placeholder.png"}
            alt={alt}
            title={`${commonName} by ${contributor}; ${import.meta.env.VITE_EXTERNAL_MEDIA_NAME}`}
            width={size}
        height={size}
        className={className}
        roundedCircle
        />
    );
}