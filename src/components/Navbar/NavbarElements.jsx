import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Nav = styled.nav`
  background: #008cff;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const NavMenu = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

export const NavLink = styled(Link)`
  color: #fff;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  cursor: pointer;
  font-weight: 500;
  &.active {
    color: #ffd700;
  }
  &:hover {
    color: #ffd700;
    transition: 0.2s ease-in-out;
  }
`;
