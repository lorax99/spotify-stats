import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Homepage } from "./display/Homepage";
import { Display } from "./display/Display";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/hello" element={<Display></Display>} />
        <Route path="/world" element={<>World</>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
