import React from "react";
import Skeleton from "react-loading-skeleton";
import { Spinner } from "react-bootstrap";
import "react-loading-skeleton/dist/skeleton.css";

/*Renders a skeleton component with a spinner overlay. Used to indicate loading state in various components.
Can be customized with a height prop to adjust the size of the skeleton.
*/
export default function SkeletonComponent({ height = 200 }) {
    return (
        <div style={{ height, position: "relative" }}>
            <Skeleton height="100%" />
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
            }}>
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        </div>
    );
}