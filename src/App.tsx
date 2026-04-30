import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Homepage } from "./display/Homepage";
import { Display } from "./display/Display";
export const CLIENT_ID = "490d03cd862842c388a9374a5ea66737";

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
