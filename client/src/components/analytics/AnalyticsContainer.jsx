import React from 'react';
import { Container, Row, Tabs, Tab } from 'react-bootstrap';
import SpeciesCard from './SpeciesCard';
import TrendsCard from './TrendsCard';
import HourlyTotalsCard from './HourlyTotalsCard';
import DailyTotalsCard from './DailyTotalsCard';
import CompositionCard from './CompositionCard';

// Main container for the analytics section, which includes tabs for different analytics views
export default function AnalyticsContainer() {
    return (
        <Container className="p-4">
            <Row className="mt-4">
                <Tabs defaultActiveKey="species" id="analytics-tabs" className="mb-3" fill>
                    <Tab eventKey="species" title="Species Summary">
                        <SpeciesCard/>
                    </Tab>
                    <Tab eventKey="trends" title="Species Trends">
                        <TrendsCard/>
                    </Tab>
                    <Tab eventKey="hourly" title="Hourly Species Activity">
                        <HourlyTotalsCard/>
                    </Tab>
                    <Tab eventKey="daily" title="Daily Species Activity">
                        <DailyTotalsCard/>
                    </Tab>
                    <Tab eventKey="composition" title="Daily Species Composition">
                        <CompositionCard/>
                    </Tab>
                </Tabs>
            </Row>  
        </Container>
    );
}