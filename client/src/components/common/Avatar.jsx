import React from "react";
import Image from "react-bootstrap/Image";

const AvatarImage = ({ src, alt, size = 48, className}) => (
    <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={className}
        roundedCircle
    />
);

export default AvatarImage;