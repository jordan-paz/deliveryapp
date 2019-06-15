import { GET_ALL_PRODUCTS, PRODUCT_ERROR } from "../actions/types";

const initialState = {
  products: [],
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_ALL_PRODUCTS:
      return {
        ...state,
        products: payload,
        loading: false
      };
    case PRODUCT_ERROR:
      return {
        ...state,
        loading: false
      };
    default:
      return state;
  }
}
