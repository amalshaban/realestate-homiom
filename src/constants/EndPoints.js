export const BASE_URL = "https://homiom.niledevelopers.com/api/";

const baseURL = BASE_URL; 

export const USERS_URLs = {
  Login:         `${BASE_URL}/Account/Login`,
  Register:      `${BASE_URL}/Account/Register`,
  Update:        `${BASE_URL}/Account/UpdateProfilePhoto`,
  AgentRegister: `${BASE_URL}/Agent/Register`,
  Profile:       `${BASE_URL}/Agent/Profile`,
  AddWatch:      `${BASE_URL}/User/add-new-watch`,
   VisitRequest:     `${BASE_URL}/User/request-visit`,      
  PurchaseRequests: `${BASE_URL}/User/PurchaseRequests`,   
  RentalRequests:   `${BASE_URL}/User/RentalRequests`,    
};

export const PROPERTIES_URLS = {
  addProperty:      `${BASE_URL}/agent/property/add`,
  allProperties:    `${BASE_URL}/Agent/properties`,
  propertySearch:   `${BASE_URL}/properties/search`,
  activeProperties: `${BASE_URL}/properties/active`,
  propertyDetails:  `${BASE_URL}/properties`,
};

export const LOCATIONS_URLs = {
  Countries: `${BASE_URL}/Locations/Countries`,
  Cities:    `${BASE_URL}/Locations/Cities?id=`,
  Districts: `${BASE_URL}/Locations/Districts?id=`,
};

export const AGENT_URLs = {
  Profile:          `${BASE_URL}/Agent/Profile`,
  ProfileUpdate:    `${BASE_URL}/agent/group/update`,
  Properties:       `${BASE_URL}/agent/properties`,
  Stats:            `${BASE_URL}/Agent/Dashboard/Stats`,
  AddProperty:      `${BASE_URL}/Agent/Property/Add`,
  PurchaseRequests: `${BASE_URL}/Agent/PurchaseRequests`,
  PurchaseAccept:   `${BASE_URL}/Agent/PurchaseRequests/Accept`,
  RentalRequests:   `${BASE_URL}/Agent/RentalRequests`,
  RentalAccept:     `${BASE_URL}/Agent/RentalRequests/Accept`,
  RentCreate:       `${BASE_URL}/Agent/Rent/Create`,
  Rents:            `${BASE_URL}/Agent/Rents`,
  VisitRequests:    `${BASE_URL}/Agent/VisitRequests`,
  SuggestedDates:         `${BASE_URL}/Agent/VisitRequests/SuggestedDates`,
  SuggestedDatesList:     `${BASE_URL}/Agent/VisitRequests/SuggestedDates/List`,
  SuggestedDatesDelete:   `${BASE_URL}/Agent/VisitRequests/SuggestedDates/Delete`,
};

export const GENERAL_URLs = {
  RealStateTypes: `${BASE_URL}/General/RealStateTypes`,
  PurposeTypes:   `${BASE_URL}/General/PurposeTypes`,
  RentTypes:      `${BASE_URL}/General/RentTypes`,
};