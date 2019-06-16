import axios from "axios";
import { ADD_TO_CART, CART_ERROR } from "./types";

// ADD PRODUCT TO CART //
export const addToCart = (productId, quantity) => async dispatch => {
  try {
    const url = `/api/carts/addProduct/${productId}/${quantity ? quantity : 1}`;

    const res = await axios.post(`${url}`);
    console.log(res);

    dispatch({
      type: ADD_TO_CART,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: CART_ERROR,
      payload: {
        msg: err.response.statusText,
        status: err.response.status
      }
    });
  }
};
