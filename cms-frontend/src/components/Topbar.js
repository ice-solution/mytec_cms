import React from 'react';

function Topbar() {
  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      {/* Topbar Navbar */}
      <ul className="navbar-nav ml-auto">
        <li className="nav-item dropdown no-arrow">
          <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>
            <img className="img-profile rounded-circle" src="https://source.unsplash.com/QAB-WJcbgJk/60x60" alt="avatar" />
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Topbar; 