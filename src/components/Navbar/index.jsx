import React from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";

const Navbar = () => {
    return (
        <>
            <Nav>
                <NavMenu>
                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? "active" : undefined}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/ArchivePage"
                        className={({ isActive }) => isActive ? "active" : undefined}
                    >
                        Archive
                    </NavLink>
                    <NavLink
                        to="/HabitTrackerPage"
                        className={({ isActive }) => isActive ? "active" : undefined}
                    >
                        Habits
                    </NavLink>
                </NavMenu>
            </Nav>
        </>
    );
};

export default Navbar;