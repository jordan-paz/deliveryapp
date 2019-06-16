import React, { useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getAllProducts } from "../../actions/product";
import ProductThumbnail from "../productThumbnail/ProductThumbnail";

const ProductList = ({ getAllProducts, products: { products, loading } }) => {
  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  const renderProductThumbnail = product => {
    const { name, price, description, imageUrls, _id } = product;
    return (
      <ProductThumbnail
        id={_id}
        key={_id}
        name={name}
        price={price}
        description={description}
        imageUrls={imageUrls}
      />
    );
  };

  return loading ? (
    <Fragment>Loading...</Fragment>
  ) : (
    <Fragment>
      <ul>{products.map(product => renderProductThumbnail(product))}</ul>
    </Fragment>
  );
};

ProductList.propTypes = {
  getAllProducts: PropTypes.func.isRequired,
  products: PropTypes.object.isRequired
};

const mapStateToProps = state => {
  return {
    products: state.product
  };
};

export default connect(
  mapStateToProps,
  { getAllProducts }
)(ProductList);
