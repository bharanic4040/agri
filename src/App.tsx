
import { Route, Routes } from 'react-router-dom';
import './App.css'
import CropType from './pages/CropType';
import Home from './pages/Home';

function App() {

  return (

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/crop-types" element={<CropType />} />
    </Routes>
  );

}

export default App
