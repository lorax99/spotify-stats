import { BrowserRouter } from "react-router-dom";
import { Homepage } from "./display/Homepage";

function App() {
  return (
    <BrowserRouter>
      <Homepage />
    </BrowserRouter>
  );
}

export default App;
