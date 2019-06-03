import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const { email, password } = formData;

  const onChange = async e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div>
      <h1>Login</h1>
      <form>
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
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
};

export default Login;
