import { ADD_TO_CART, CART_ERROR } from "../actions/types";

const initialState = {
  cart: [],
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case ADD_TO_CART:
      return {
        ...state,
        cart: payload,
        loading: false
      };
    case CART_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
