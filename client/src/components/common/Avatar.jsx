import React from "react";
import Image from "react-bootstrap/Image";
import * as externalLink from '../../constants/external-links';

// AvatarImage component displays a circular bird image with common name and copyright information
export default function AvatarImage({ src, alt, commonName, contributor, size, className}) {
    return (
        <Image
            src={src || "/bird_avatar_placeholder.png"}
            alt={alt}
            title={`${commonName} by ${contributor}; ${externalLink.EXTERNAL_MEDIA_NAME}`}
            width={size}
        height={size}
        className={className}
        roundedCircle
        />
    );
}