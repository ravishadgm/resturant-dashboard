import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "./authService";
import { entityService } from "../../services/entityService";

export default function CustomerRegister() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const change = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const account = authService.registerCustomer(values);
      await entityService.create("customers", {
        customer_id: account.customer_id,
        user_id: account.user_id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        status: "ACTIVE",
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <main className="simple-login-page">
      <section className="simple-login-card">
        <Link to="/login" className="register-back">
          <ArrowLeft /> Back to login
        </Link>
        <div className="simple-login-heading">
          <h1>Create customer account</h1>
          <p>Register to join today’s restaurant waiting queues.</p>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={submit}>
          <label className="login-field">
            <span>Full name</span>
            <div>
              <input
                name="name"
                value={values.name}
                onChange={change}
                required
              />
            </div>
          </label>
          <label className="login-field">
            <span>Email</span>
            <div>
              <input
                name="email"
                type="email"
                value={values.email}
                onChange={change}
                required
              />
            </div>
          </label>
          <label className="login-field">
            <span>Phone</span>
            <div>
              <input
                name="phone"
                value={values.phone}
                onChange={change}
                required
              />
            </div>
          </label>
          <label className="login-field">
            <span>Password</span>
            <div>
              <input
                name="password"
                type="password"
                minLength="8"
                value={values.password}
                onChange={change}
                required
              />
            </div>
          </label>
          <button className="login-submit">
            <UserPlus /> Create account
          </button>
        </form>
      </section>
    </main>
  );
}
