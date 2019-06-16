import { combineReducers } from "redux";
import alert from "./alert";
import auth from "./auth";
import profile from "./profile";
import user from "./user";
import product from "./product";
import cart from "./cart";

export default combineReducers({ alert, auth, profile, user, product, cart });
