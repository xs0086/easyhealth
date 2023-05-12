import { Link } from "react-router-dom";
import { Options } from "../components/Options";
import Lab from "./Lab";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
  return (
    <>
      {/* <h1>Home</h1> */}

      <ul className="home-menu">
        {Options.map((item, index) => {
          return (
            <li className="li-home" key={index}>
              <Link to={item.url}>
                <button className="btn-home">{item.title}</button>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
export default Home;
