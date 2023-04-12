import {
  Link,
  Outlet
} from "react-router-dom";

import './home.css';

function Home() {
  return (
    <div class="home">
      <header>
        <Link to="/">Echo Logo</Link>. The world we remember. <Link to="about">Learn more</Link>.
      </header>
      <div id="body">
        <Outlet />
      </div>
    </div>
  );
}

export default Home;
