import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS, ROLES } from "../../utils/constants";
import { PORTAL_LABEL } from "../../utils/portal";
import Avatar from "../common/Avatar";
export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef();
  useEffect(() => setMobile(false), [location.pathname]);
  useEffect(() => {
    const close = (e) => !menuRef.current?.contains(e.target) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    const closeOnEscape = (e) => e.key === "Escape" && setMobile(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobile]);
  const roleLinks = {
    [ROLES.SUPER_ADMIN]: [
      [LayoutDashboard, "Overview", "/dashboard"],
      [Store, "Restaurants", "/restaurants"],
      [Building2, "Branches", "/branches"],
      [Users, "Managers", "/managers"],
      [UserRound, "Customers", "/customers"],
      [Bell, "Notifications", "/notifications"],
    ],
    [ROLES.RESTAURANT]: [
      [UserRound, "My Profile", "/my-profile"],
      [LayoutDashboard, "Overview", "/dashboard"],
      [Building2, "Branches", "/branches"],
      [Users, "Managers", "/managers"],
    ],
    [ROLES.MANAGER]: [
      [LayoutDashboard, "Overview", "/dashboard"],
      [UserRound, "Customers", "/customers"],
    ],
    [ROLES.CUSTOMER]: [
      [LayoutDashboard, "Overview", "/dashboard"],
      [MapPin, "Nearby restaurants", "/nearby"],
    ],
  };
  const links = roleLinks[user.role] || roleLinks[ROLES.CUSTOMER];
  const signOut = async () => {
    try {
      await logout();
    } catch {
      // The local session is cleared even if the server cannot be reached.
    } finally {
      nav("/login");
    }
  };
  return (
    <div className="app-shell">
      <aside
        id="mobile-sidebar"
        className={`sidebar ${mobile ? "open" : ""}`}
        aria-hidden={!mobile && window.innerWidth <= 960}
      >
        <div className="brand">
          <span>
            <ShieldCheck />
          </span>
          <div>
            <strong>RestroDesk</strong>
            <small>{PORTAL_LABEL}</small>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <nav>
          <p>WORKSPACE</p>
          {links.map(([Icon, label, to]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <Avatar name={user.name} image={user.image} />
          <div>
            <strong>{user.name}</strong>
            <small>{ROLE_LABELS[user.role]}</small>
          </div>
          <button
            className="sidebar-logout"
            onClick={signOut}
            aria-label="Sign out"
          >
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-overlay"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="app-main">
        <header className="topbar">
          <button
            className="menu-trigger"
            onClick={() => setMobile((value) => !value)}
            aria-label="Open navigation"
            aria-expanded={mobile}
            aria-controls="mobile-sidebar"
          >
            <Menu />
          </button>
          <div className="topbar-title">
            <span>{location.pathname.split("/")[1] || "dashboard"}</span>
            <strong>
              {location.pathname === "/dashboard"
                ? "Dashboard overview"
                : location.pathname === "/notifications" ? "Announcements & notifications" : "Restaurant workspace"}
            </strong>
          </div>
          <div className="topbar-actions">
            <div className="profile-menu" ref={menuRef}>
              <button onClick={() => setMenu(!menu)}>
                <Avatar name={user.name} image={user.image} size={36} />
                <span>
                  <strong>{user.name}</strong>
                  <small>{ROLE_LABELS[user.role]}</small>
                </span>
                <ChevronDown size={16} />
              </button>
              {menu && (
                <div className="profile-dropdown">
                  {user.role === ROLES.RESTAURANT && <button onClick={() => { setMenu(false); nav('/my-profile'); }}><UserRound size={17} /> My Profile</button>}
                  <button onClick={signOut} className="danger">
                    <LogOut size={17} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
