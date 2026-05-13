import React, {   useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Search from '../../SharedModule/Search/Search.jsx';
// import cardimg from "../../../assets/imgs/7da51552e8fc95cb3bd8bf2bf2d6ce580258031a.jpg";
import UserLocation from "../../../../public/userLocation/UserLocation.jsx";
import Services from "../Services/Services.jsx";
import Footer from "../Footer/Footer.jsx";
// import { Card, CardMedia, IconButton, Box } from '@mui/material';
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import ShareIcon from '@mui/icons-material/Share';
// import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { LOCATIONS_URLs, USERS_URLs } from "../../../constants/EndPoints.js";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute.jsx";
import { AuthorizedToken } from "../../../constants/Validations.js";
import { Container, Row, Col, Form, Button, InputGroup, Nav } from 'react-bootstrap';
import ViewProperties from "../../PropertiesModule/ViewProperties/ViewProperties.jsx";
import Test from "../../../assets/Test.jsx"

// import { useTranslation } from 'react-i18next';



export default function Home() {

  
  // Check auth
  const token = sessionStorage.getItem("token");
  console.log('Home - Token exists:', !!token);

  return (
    <>
{/*     
    <Test/> */}
    {/* <div>
      <button className="" onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('ar')}>العربية</button>
      <p>{t('home')}</p>
    </div> */}

{/* <UserLocation/> */}
   
   
{/* slider section */}
      <div className="container-fluid p-0">
      
          <div className="col-md-12">
        <div className="slidersection text-center text-white d-flex flex-wrap align-items-center">
        
  <div className="row">
    <div className="col-md-12">
         <div className="slidertext">
           <h1 className="hero-title fw-bold mb-3">Find Your Dream Home in Saudi Arabia</h1>
           <p className="hero-subtitle ">The Kingdom's Leading Real Estate Platform</p>
          </div>
     <Search />
  </div>
    </div>  

      



{/* 
          <div className="col-md-4 overlap-img">
            <img className="h-100 w-100" src={slider} />
          </div> */}
        </div>
      </div>
      </div>

    
    
    <ViewProperties/>
    
    
{/*     
    <Services/>
    
    
    
    
      <div className="container-fluid-no-padding">
      <div className="newproperties">
        <div className="row">
          <div className="col-md-6">
          <h3 className="headertxtstyle">New Properties</h3>
          </div>
          <div className=" col-md-6 text-end">  
            <Link to="/properties/viewproperties" className="">
            See All
          </Link>
          </div>
        </div>
        <div className="">
          <p className="">
          Find your perfect home from thousands of wonderful options
          </p>
        </div>
     

          <div className="row">
               

    
          </div>

          
      </div>
        
        </div>
 
  
 */}

    <Footer/>

    <>
    
    </>

    </>
  );
  }