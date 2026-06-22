import "./App.css";
import React, { lazy, Suspense } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createHashRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import AuthContextProvider from "./modules/AuthModule/context/AuthContext.jsx";




// ─── Eager Imports (محتاجين يتحملوا فوراً) ───────────────────────────────────
import MasterLayout      from "./modules/SharedModule/MasterLayout/MasterLayout";
import PropertyLayout    from "./modules/SharedModule/PropertyLayout/PropertyLayout.jsx";
import HomeSeekerLayout  from "./modules/SharedModule/HomeSeekerLayout/HomeSeekerLayout.jsx";
import ProtectedRoute    from "./modules/SharedModule/ProtectedRoute/ProtectedRoute.jsx";
import NotFound          from "./modules/SharedModule/NotFound/NotFound.jsx";
import AgentProfile from "./modules/UsersModule/RealEstateAgents/AgentProfile/AgentProfile.jsx";


// ─── Lazy Imports ─────────────────────────────────────────────────────────────
const Home               = lazy(() => import("./modules/SharedModule/Home/Home.jsx"));
const ViewProperties     = lazy(() => import("./modules/PropertiesModule/ViewProperties/ViewProperties.jsx"));
const PropertyDetails    = lazy(() => import("./modules/PropertiesModule/PropertyDetails/PropertyDetails.jsx"));
const AddProperty        = lazy(() => import("./modules/UsersModule/RealEstateAgents/AddProperty/AddProperty.jsx"));
const LogIn              = lazy(() => import("./modules/AuthModule/LogIn/LogIn.jsx"));
const Join               = lazy(() => import("./modules/AuthModule/Join/Join.jsx"));
const SignUpNormal        = lazy(() => import("./modules/AuthModule/Join/SignUpNormal/SignUpNormal.jsx"));
const AgentSignUp        = lazy(() => import("./modules/AuthModule/Join/SignUpAgent/SignUpAgent.jsx"));
const AgentPannel        = lazy(() => import("./modules/UsersModule/RealEstateAgents/AgentPannel/AgentPannel.jsx"));
const Overview           = lazy(() => import("./modules/UsersModule/RealEstateAgents/Overview/Overview.jsx"));
const AgentProperties    = lazy(() => import("./modules/UsersModule/RealEstateAgents/AgentProperties/AgentProperties.jsx"));
const VisitRequests      = lazy(() => import("./modules/UsersModule/RealEstateAgents/VisitRequests/VisitRequests.jsx"));
const PurchaseRequests   = lazy(() => import("./modules/UsersModule/RealEstateAgents/PurchaseRequests/PurchaseRequests.jsx"));
const RentalRequests     = lazy(() => import("./modules/UsersModule/RealEstateAgents/RentalRequests/RentalRequests.jsx"));
const Rents              = lazy(() => import("./modules/UsersModule/RealEstateAgents/Rents/Rents.jsx"));
const HomeSeekerPannel   = lazy(() => import("./modules/UsersModule/HomeSeekers/HomeSeekerPannel/HomeSeekerPannel.jsx"));
const VisitRequestUser   = lazy(() => import("./modules/UsersModule/HomeSeekers/VisitRequestUser/VisitRequestUser.jsx"));
const PurchaseRequestsUser = lazy(() => import("./modules/UsersModule/HomeSeekers/PurchaseRequestsUser/PurchaseRequestsUser.jsx"));
const RentalRequestsUser = lazy(() => import("./modules/UsersModule/HomeSeekers/RentalRequestsUser/RentalRequestsUser.jsx"));
const SideBarUser        = lazy(() => import("./modules/UsersModule/HomeSeekers/SideBarUser/SideBarUser.jsx"));

const SearchResults = lazy(() => import("./modules/SharedModule/SearchResults/SearchResults.jsx"));
const EditProperty = lazy(() => import("./modules/PropertiesModule/EditProperty/EditProperty.jsx"));



// ─── Page Loader ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb',
  }}>
    <div className="spinner-border text-primary" role="status" />
  </div>
);

// ─── Router ───────────────────────────────────────────────────────────────────
const routes = createHashRouter([

  // 1. Main Layout
  {
    path: '/',
    element: <MasterLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true,   element: <Home /> },
      { path: 'home',  element: <Home /> },
      { path: 'search', element: <SearchResults /> },
    ],
  },

  // 2. Agent Panel
  {
    path: 'agentpannel',
    element: <AgentPannel />,
    children: [
      { index: true,                element: <Navigate to="overview" replace /> },
      { path: 'overview',           element: <Overview />          },
      { path: 'properties',         element: <AgentProperties />   },
      { path: 'visitrequests',      element: <VisitRequests />     },
      { path: 'purchaserequests',   element: <PurchaseRequests />  },
      { path: 'rentrequests',       element: <RentalRequests />    },
      { path: 'rents',              element: <Rents />             },
      { path: 'addproperty',        element: <AddProperty />       },
      { path: 'profile', element: <AgentProfile /> },
      { path: 'editproperty/:id', element: <EditProperty /> },
    ],
  },

  // 3. Home Seeker
  {
    path: '/homeSeekerLayout',
    element: (
      <ProtectedRoute>
        <HomeSeekerLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true,                    element: <HomeSeekerPannel />      },
      { path: 'visitrequestuser',       element: <VisitRequestUser />      },
      { path: 'purchaserequestsuser',   element: <PurchaseRequestsUser />  },
      { path: 'rentalrequestsuser',     element: <RentalRequestsUser />    },
      { path: 'sidebaruser',            element: <SideBarUser />           },
    ],
  },

  // 4. Auth
  // ── Auth ──
{
  path: '/auth',
  element: <Outlet />,
  errorElement: <NotFound />,
  children: [
    { index: true,               element: <LogIn />        },
    { path: 'login',             element: <LogIn />        },
    { path: 'join',              element: <Join />         },
    { path: 'join/signupnormal', element: <SignUpNormal /> },
    { path: 'join/signupagent',  element: <AgentSignUp />  },
  ],
},

  // 5. Properties
  // ── import ──

// ── route ──
{
  path: '/properties',
  element: <PropertyLayout />,
  children: [
    { index: true,            element: <ViewProperties />  },
    { path: 'viewproperties', element: <ViewProperties />  },
    { path: 'property/:id',   element: <PropertyDetails /> },
    { path: 'search',         element: <SearchResults />   }, // ← موجود؟
    { path: 'addproperty',    element: <AddProperty />     },
  ],
},

  // 404
  { path: '*', element: <NotFound /> },
]);

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthContextProvider>
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={routes} />
      </Suspense>
    </AuthContextProvider>
  );
}