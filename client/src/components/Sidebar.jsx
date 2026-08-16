import { NavLink } from 'react-router-dom';

export default function Sidebar({ items }) {
  return (
    <div className="sidebar p-3 rounded">
      <ul className="nav nav-pills flex-column">
        {items.map((item) => (
          <li className="nav-item" key={item.to}>
            <NavLink to={item.to} end className="nav-link">{item.label}</NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
