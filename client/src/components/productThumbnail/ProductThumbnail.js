import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { addToCart } from "../../actions/cart";
import { setAlert } from "../../actions/alert";

const ProductThumbnail = props => {
  return (
    <li>
      <p>
        {props.name}: ${props.price}
      </p>
      <p>{props.description}</p>
      <p>{props._id}</p>
      <button onClick={() => props.addToCart(props.id)}>Add to cart</button>
    </li>
  );
};

ProductThumbnail.propTypes = {
  addToCart: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired
};

export default connect(
  null,
  { addToCart, setAlert }
)(ProductThumbnail);
