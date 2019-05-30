import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: ""
  });

  const { name, email, password, password2 } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div>
      <h1>Register</h1>
      <form>
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
      </form>
    </div>
  );
};

export default Register;
