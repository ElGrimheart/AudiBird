import React from "react";
import Image from "react-bootstrap/Image";

// AvatarImage component to display a circular bird image with common name and contributor
const AvatarImage = ({ src, alt, commonName, contributor, size, className}) => (
    <Image
        src={src || "../../../public/bird_avatar_placeholder.png"}
        alt={alt}
        title={`${commonName} by ${contributor}; ${import.meta.env.VITE_EXTERNAL_MEDIA_NAME}`}
        width={size}
        height={size}
        className={className}
        roundedCircle
    />
);

export default AvatarImage;