import { combineReducers } from "redux";
import alert from "./alert";
import auth from "./auth";
import profile from "./profile";
import user from "./user";
import product from "./product";

export default combineReducers({ alert, auth, profile, user, product });
