import axios from "axios";
import { GET_ALL_PRODUCTS, PRODUCT_ERROR } from "./types";

// GET ALL PRODUCTS //
export const getAllProducts = () => async dispatch => {
  try {
    const res = await axios.get("/api/products");

    dispatch({
      type: GET_ALL_PRODUCTS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: PRODUCT_ERROR,
      payload: {
        msg: err.response.statusText,
        status: err.response.status
      }
    });
  }
};
