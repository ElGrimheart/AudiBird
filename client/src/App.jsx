import { Routes, Route } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import MainNavbar from './components/common/MainNavbar';
import Dashboard from './pages/Dashboard';
import Detections from './pages/Detections';
import PageNotFound from './pages/404';

const App = () => (
  <Container fluid className="p-2">
    <MainNavbar />
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/detections" element={<Detections />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  </Container>
);

export default App;
