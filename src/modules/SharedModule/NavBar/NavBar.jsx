import React, { useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthModule/context/AuthContext';
import profileimg from '../../../assets/imgs/profile.png';
import {
  Navbar, Nav, NavDropdown,
  Container, Button, Row, Col, Image, Dropdown
} from 'react-bootstrap';
import { BASE_URL } from '../../../constants/EndPoints.js';



// ─── Constants ────────────────────────────────────────────────────────────────
const MENU_DATA = {
  Buy: [
    { title: 'Homes for sale',           desc: 'Browse available properties' },
    { title: 'New construction',         desc: 'Explore new builds'          },
    { title: 'Coming soon',              desc: 'Pre-market listings'         },
    { title: 'For sale by owner',        desc: 'Direct from owners'          },
    { title: 'Recent home sales',        desc: 'View sold properties'        },
    { title: 'All homes',                desc: 'Complete catalog'            },
  ],
  Rent: [
    { title: 'Apartments for rent',      desc: 'Find your apartment'         },
    { title: 'Homes for rent',           desc: 'Rent a house'                },
    { title: 'Commercial for rent',      desc: 'Business spaces'             },
    { title: 'All listings for rent',    desc: 'View all rentals'            },
  ],
  Sell: [
    { title: 'Explore options',          desc: 'Discover selling strategies' },
    { title: 'Estimating service',       desc: 'Get your home value'         },
    { title: 'Read blogs',               desc: 'Tips and guides'             },
  ],
  Agents: [
    { title: 'Property Agents',          desc: 'Licensed professionals',   label: 'LOOKING FOR PRO' },
    { title: 'Home Builder',             desc: 'Construction experts'       },
    { title: 'Real Estate Photographer', desc: 'Professional photos'        },
    { title: 'Property Manager',         desc: 'Management services'        },
    { title: 'Facility Management',      desc: 'Maintenance solutions'      },
  ],
};

// ─── Sub Components ───────────────────────────────────────────────────────────
const MegaMenu = ({ items }) => {
  const label   = items[0]?.label;
  const colSize = items.length <= 3 ? 4 : items.length === 4 ? 3 : 4;

  return (
    <div className="mega-menu-dropdown">
      <Container className="p-4">
        {label && <p className="mega-menu-label">{label}</p>}
        <Row>
          {items.map((item, idx) => (
            <Col md={colSize} className={idx >= (12 / colSize) ? 'mt-3' : ''} key={item.title}>
              <div className="mega-menu-item" role="button" tabIndex={0}>
                <h6 className="mb-1 fw-semibold">{item.title}</h6>
                <p className="mb-0 text-muted small">{item.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NavBar() {

  const { loginData, logOut } = useContext(AuthContext);
  const { t, i18n }           = useTranslation();
  const navigate               = useNavigate();

  // ── Derived user info ──
  const name      = loginData?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Guest';
  const photo     = loginData?.Photo || '';
  const role      = loginData?.role  || 'anonymous';
  
const photoLink = photo ? `${BASE_URL}/images/${photo}` : profileimg;

  // ── Handlers ──
  const handleLogout = useCallback(() => {
    logOut();
    navigate('/home');
  }, [logOut, navigate]);

  const handleDashboard = useCallback(() => {
    if (role === 'Normal') navigate('/homeSeekerLayout');
    else if (role === 'Agent') navigate('/agentpannel');
  }, [role, navigate]);

  const handleLanguageChange = useCallback((lng) => {
    i18n.changeLanguage(lng);
  }, [i18n]);

  return (
    <Navbar
      collapseOnSelect
      expand="xl"
      bg="white"
      variant="light"
      className="py-3 px-lg-4 shadow-sm"
      style={{ borderBottom: '1px solid #f0f0f0' }}
    >
      <Container fluid>

        {/* ── Brand ── */}
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <i className="fa-solid fa-house text-primary me-2" />
          <span style={{ fontWeight: 700, fontSize: '22px', color: '#000' }}>Homiom</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />

        <Navbar.Collapse id="responsive-navbar-nav">

          {/* ── Center Nav ── */}
          <Nav className="mx-auto">
            {Object.entries(MENU_DATA).map(([label, items]) => (
              <NavDropdown
                key={label}
                title={t(label.toLowerCase())}
                id={`${label.toLowerCase()}-dropdown`}
                className="px-1 mega-dropdown"
              >
                <MegaMenu items={items} />
              </NavDropdown>
            ))}
            <Nav.Link href="#manage"    className="px-2">{t('manage_rents')}</Nav.Link>
            <Nav.Link href="#advertise" className="px-2">{t('advertise')}</Nav.Link>
            <Nav.Link href="#help"      className="px-2">{t('get_help')}</Nav.Link>
          </Nav>

          {/* ── Right Side ── */}
          <Nav className="align-items-center gap-2">

            {/* ── Language Switcher ── */}
            <NavDropdown
              title={i18n.language === 'ar' ? 'اللغه' : 'Language'}
              id="language-dropdown"
              className="px-2"
            >
              <NavDropdown.Item onClick={() => handleLanguageChange('en')}>
                English
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => handleLanguageChange('ar')}>
                العربية
              </NavDropdown.Item>
            </NavDropdown>

            {/* ── Guest ── */}
            {role === 'anonymous' && <>
              <Nav.Link
                onClick={() => navigate('/auth/login')}
                className="fw-bold text-dark me-3"
              >
                {t('login')}
              </Nav.Link>
              <Button
                onClick={() => navigate('/auth/join')}
                style={{
                  backgroundColor: '#0b0d2a',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 25px',
                  fontWeight: '600',
                }}
              >
                {t('signup')}
              </Button>
            </>}

            {/* ── Logged in ── */}
            {role !== 'anonymous' &&
              <Dropdown align="end">
                <Dropdown.Toggle as="div" className="user-toggle" id="user-dropdown">
                  <Image
                    src={photoLink}
                    roundedCircle
                    width={34}
                    height={34}
                    style={{ objectFit: 'cover', border: '2px solid #e0e0e0' }}
                    alt={name}
                  />
                  <span className="fw-semibold small">{name}</span>
                  <i className="fa-solid fa-chevron-down user-chevron" />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleDashboard}>
                    {role === 'Agent' ? t('dashboard') : t('home')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate('/agentpannel/profile')}>
                    {t('profile_settings')}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    {t('logout')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            }

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}