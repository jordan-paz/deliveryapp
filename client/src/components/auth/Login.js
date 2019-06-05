import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { login } from "../../actions/auth";

const Login = ({ login, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const { email, password } = formData;

  const onChange = async e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Redirect to dashboard if logged in
  if (isAuthenticated) {
    return <Redirect to="dashboard" />;
  }

  const onSubmit = async e => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="email"
          name="email"
          value={email}
          onChange={e => onChange(e)}
          required
        />
        <input
          type="text"
          placeholder="password"
          name="password"
          value={password}
          onChange={e => onChange(e)}
          required
        />
        <input type="submit" className="btn btn-primary" value="Login" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(
  mapStateToProps,
  { login }
)(Login);
