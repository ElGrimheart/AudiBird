import React from 'react';
import { Container, Row, Tabs, Tab } from 'react-bootstrap';
import SpeciesCard from './SpeciesCard';
import TrendsCard from './TrendsCard';
import HourlyTotalsCard from './HourlyTotalsCard';
import DailyTotalsCard from './DailyTotalsCard';
import CompositionCard from './CompositionCard';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip, Legend, BarElement, Title, Filler } from 'chart.js';
ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip, Legend, BarElement, Title, Filler);

/*
Main container for the analytics section. Includes tabs for different analytics views
Each chart and filter state is independent and managed separately by their respective components
*/
export default function AnalyticsContainer() {

    return (
        <Container className="p-4 ">
            <Row className="mt-4">
                <Tabs defaultActiveKey="species" id="analytics-tabs" className="mx-2" fill>
                    <Tab eventKey="species" title="Species Summary">
                        <SpeciesCard/>
                    </Tab>
                    <Tab eventKey="trends" title="Trends">
                        <TrendsCard/>
                    </Tab>
                    <Tab eventKey="hourly" title="Hourly Activity">
                        <HourlyTotalsCard/>
                    </Tab>
                    <Tab eventKey="daily" title="Daily Activity">
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