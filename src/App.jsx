import "./App.css";
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { createHashRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import MasterLayout from "./modules/SharedModule/MasterLayout/MasterLayout";
import Home from "./modules/SharedModule/Home/Home.jsx";
import ViewProperties from "./modules/PropertiesModule/ViewProperties/ViewProperties.jsx";
import NotFound from "./modules/SharedModule/NotFound/NotFound.jsx";
import EditProperty from "./modules/PropertiesModule/EditProperty/EditProperty.jsx";
import DeleteProperty from "./modules/PropertiesModule/DeleteProperty/DeleteProperty.jsx";
import AuthContextProvider from "./modules/AuthModule/context/AuthContext.jsx";
import ProtectedRoute from "./modules/SharedModule/ProtectedRoute/ProtectedRoute.jsx";
import SideBarUser from "./modules/UsersModule/HomeSeekers/SideBarUser/SideBarUser.jsx";
import Overview from "./modules/UsersModule/RealEstateAgents/Overview/Overview.jsx";
import AgentPannel from "../src/modules/UsersModule/RealEstateAgents/AgentPannel/AgentPannel.jsx";
import Join from "./modules/AuthModule/Join/Join.jsx";
import PropertyLayout from "./modules/SharedModule/PropertyLayout/PropertyLayout.jsx";

import PropertyDetails from "./modules/PropertiesModule/PropertyDetails/PropertyDetails.jsx";
import HomeSeekerPannel from "./modules/UsersModule/HomeSeekers/HomeSeekerPannel/HomeSeekerPannel.jsx";
import VisitRequestUser from "./modules/UsersModule/HomeSeekers/VisitRequestUser/VisitRequestUser.jsx";
import HomeSeekerLayout from "./modules/SharedModule/HomeSeekerLayout/HomeSeekerLayout.jsx";
import AgentLayout from "./modules/SharedModule/AgentLayout/AgentLayout.jsx";
import PurchaseRequestsUser from "./modules/UsersModule/HomeSeekers/PurchaseRequestsUser/PurchaseRequestsUser.jsx";
import RentalRequestsUser from "./modules/UsersModule/HomeSeekers/RentalRequestsUser/RentalRequestsUser.jsx";
import RentRequestsAgent from "./modules/UsersModule/RealEstateAgents/RentRequestsAgent/RentRequestsAgent.jsx";
import Rents from "./modules/UsersModule/RealEstateAgents/Rents/Rents.jsx";
import AddRent from "./modules/UsersModule/RealEstateAgents/AddRent/AddRent.jsx";
import LogIn from '../src/modules/AuthModule/LogIn/LogIn.jsx';
import SignUpNormal from '../src/modules/AuthModule/Join/SignUpNormal/SignUpNormal.jsx';
import AgentSignUp from '../src/modules/AuthModule/Join/SignUpAgent/SignUpAgent.jsx';
import AgentRightPanel from "./modules/UsersModule/RealEstateAgents/AgentRightPannel/AgentRightPannel.jsx";
import AgentProperties from "./modules/UsersModule/RealEstateAgents/AgentProperties/AgentProperties.jsx";
import VisitRequests from "./modules/UsersModule/RealEstateAgents/VisitRequests/VisitRequests.jsx";
import PurchaseRequests from "./modules/UsersModule/RealEstateAgents/PurchaseRequests/PurchaseRequests.jsx";
import RentalRequests from "./modules/UsersModule/RealEstateAgents/RentalRequests/RentalRequests.jsx";
import AddProperty from "./modules/UsersModule/RealEstateAgents/AddProperty/AddProperty.jsx";

function App() {
  console.log('App component loaded');
  const routes = createHashRouter([
    // 1. مسارات المستخدم العادي (الموقع الرئيسي)
    {
      path: "/",
      element: <MasterLayout />,
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Home /> },
        { path: "home", element: <Home /> },
      ],
    },
    // 2. مسارات الـ Agent (مستقلة تماماً)
 {
  path: 'agentpannel',
  element: <AgentPannel />,
  children: [
    { index: true,                element: <Navigate to="overview" replace /> },
    { path: 'overview',           element: <Overview />          },
    { path: 'properties',         element: <AgentProperties />          },
    { path: 'visitrequests',      element: <VisitRequests />          },
    { path: 'purchaserequests',   element: <PurchaseRequests />          },
    { path: 'rentrequests',       element: <RentalRequests />          },
    { path: 'rents',              element: <Rents />          },
    { path: 'addproperty',              element: <AddProperty />          },
  ],
},
    // 3. مسارات الـ Home Seeker (مستقلة تماماً)
    {
      path: "/homeSeekerLayout",
      element: (
        <ProtectedRoute>
          <HomeSeekerLayout />
        </ProtectedRoute>
      ),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomeSeekerPannel /> },
        { path: "visitrequestuser", element: <VisitRequestUser /> },
        { path: "purchaserequestsuser", element: <PurchaseRequestsUser /> },
        { path: "rentalrequestsuser", element: <RentalRequestsUser /> },
        { path: "sidebaruser", element: <SideBarUser /> },
      ],
    },
    // 4. مسارات الـ Auth
   {
  path: "/auth",
  element: <Outlet />,
  errorElement: <NotFound />,
  children: [
    { index: true, element: <LogIn /> },
    { path: "login",                    element: <LogIn /> },
    { path: "join",                     element: <Join /> },
  
     { path: "join/signupnormal",       element: <SignUpNormal /> },
    { path: "join/signupagent",        element: <AgentSignUp /> },
    // { path: "join/signup/owner",        element: <OwnerSignUp /> },
    // { path: "join/signup/developer",    element: <DeveloperSignUp /> },
  ],
},
    // 5. مسارات الخصائص (Properties)
    {
      path: "/properties",
      element: <PropertyLayout />,
      errorElement: <NotFound />,
      children: [
        { index: true, element: <ViewProperties /> },
        { path: "viewproperties", element: <ViewProperties /> },
        { path: "property/:id", element: <PropertyDetails /> },

        { 
          path: "addproperty", 
          element: <AddProperty />,
        
        },
      ],
    },
    // مسار الـ 404 النهائي
    { path: "*", element: <NotFound /> }
  ]);

  return (
    <>
      <AuthContextProvider>
        <ToastContainer />
        {console.log('About to render RouterProvider')}
        <RouterProvider router={routes} />
      </AuthContextProvider>
    </>
  );
}

export default App;