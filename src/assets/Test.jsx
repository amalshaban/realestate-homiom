

import React, { useEffect } from "react";

import axios from "axios"; 
import { Authorization, AuthorizedToken } from "../constants/Validations";
export default function test() {


    const getmydata = async () => {
        try {
            let response = await axios.get("https://realstate.niledevelopers.com/Agent/Profile",AuthorizedToken);
            console.log(response.data);
        
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
        }
    }

    useEffect(() => {
        getmydata();
    }, []);

    return(

        <>xxx</>
    )
}
 