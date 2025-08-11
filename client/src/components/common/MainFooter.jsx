import React from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import * as externalLink from '../../constants/externalLinks'

// MainFooter component containing copyright information
export default function MainFooter() {
    return (
        <Navbar bg="body-tertiary" variant="light" className="mt-4">
            <Container fluid className="text-left">
                <span className="text-muted">
                  &copy; {new Date().getFullYear()} AudioBirder
                  <br />
                Powered by models provided by {' '}
                    <a href={`${externalLink.BIRDNET_URL}`} target="_blank" rel="noopener noreferrer">
                        BirdNET-Analyzer
                    </a>
                    {' '}under{' '}
                    <a href={`${externalLink.CC_BY_NC_4_0_URL}`} target="_blank" rel="noopener noreferrer"> 
                        {' '} CC BY-NC 4.0
                    </a>
                <br />
                All external media courtesy of {' '}
                    <a href={`${externalLink.EXTERNAL_MEDIA_URL}`} target="_blank" rel="noopener noreferrer">
                        {externalLink.EXTERNAL_MEDIA_NAME}
                    </a> 
                {' '} contributors under {' '}
                    <a href={`${externalLink.CC_BY_NC_4_0_URL}`} target="_blank" rel="noopener noreferrer">
                        {' '}CC BY-NC 4.0</a>
                .{' '} See tooltips for more information.
                </span>
            </Container>
        </Navbar>
  );
}