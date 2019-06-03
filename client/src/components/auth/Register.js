import React, { useState } from "react";
import { Link } from "react-router-dom";
import { setAlert } from "../../actions/alert";
import { register } from "../../actions/auth";
import PropTypes from "prop-types";
import { connect } from "react-redux";

const Register = ({ setAlert, register }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: ""
  });

  const { name, email, password, password2 } = formData;

  const onChange = async e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setAlert("Passwords do not match");
    } else {
      register({ name, email, password });
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="name"
          name="name"
          value={name}
          onChange={e => onChange(e)}
          required
        />
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
        <input
          type="text"
          placeholder="password2"
          name="password2"
          value={password2}
          onChange={e => onChange(e)}
          required
        />
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired
};

export default connect(
  null,
  { setAlert, register }
)(Register);
