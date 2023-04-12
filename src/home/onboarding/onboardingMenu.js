import { useContext } from 'react';
import { Link } from "react-router-dom";

function OnboardingMenu({ onOpen }) {
  return (
  	<div class="menu">
      <div>
        <p>We've found ## Echos around your Location!</p>
        <button onClick={onOpen}>Open Echo Window</button>
      </div>
      <div>
        <p>Add an Echo in your Location!</p>
        <Link to="/create">
          <button>Create Echo</button>
        </Link>
      </div>
    </div>
  );
}

export default OnboardingMenu;
