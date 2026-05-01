import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Homepage } from "./homepage/Homepage";
import { Display } from "./display/Display";

// Const
export const CLIENT_ID = "490d03cd862842c388a9374a5ea66737";
export const REDIRECT_URI = "http://127.0.0.1:5173/hello";
export const ACC_ENDPOINT = "https://accounts.spotify.com";
export const API_ENDPOINT = "https://api.spotify.com";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/hello" element={<Display />} />
        <Route path="/world" element={<>World</>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
