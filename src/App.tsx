
import { Route, Routes } from 'react-router-dom';
import './App.css'
import CropType from './pages/CropType';
import Home from './pages/Home';
import LegalAdvice from './pages/LegalAdvice';

function App() {

  return (

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/crop-types" element={<CropType />} />
        <Route path="/law" element={<LegalAdvice />} />
    </Routes>
  );

}

export default App
