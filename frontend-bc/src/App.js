import logo from "./logo.svg";
import "./App.css";
import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Patient from "./pages/Patient";
import Lab from "./pages/Lab";

function App() {
  return (
    <div className="App">
      {/* <Routes> */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/patient" element={<Patient />} />
        <Route path="/lab" element={<Lab />} />
      </Routes>
      {/* Home necemo pozivati nego cemo samo na pocetku imati opciju da biramo izmedju lab i patient */}
      {/* <Home /> */}
      {/* </Routes> */}
    </div>
  );
  //ovo zapamti da moze ovako
  /*ja cu samostalno pisati kod u drugim .js fajlovima i samo zvati te komponente u App.js */
  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <p>
  //         Edit <code>src/App.js</code> and save to reload.
  //       </p>
  //       <a
  //         className="App-link"
  //         href="https://reactjs.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Learn React
  //       </a>
  //     </header>
  //   </div>
  // );
}

export default App;
