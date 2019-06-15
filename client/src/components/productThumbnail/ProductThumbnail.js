import React from "react";

const ProductThumbnail = props => (
  <li>
    <p>
      {props.name}: ${props.price}
    </p>
    <p>{props.description}</p>
    <button>Add to cart</button>
  </li>
);

export default ProductThumbnail;
