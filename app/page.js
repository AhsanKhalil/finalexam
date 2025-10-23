// app/page.js (client component)
"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(values, { setSubmitting }) {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Login failed", text: data.message || "Invalid credentials" });
      } else {
        Swal.fire({ icon: "success", title: "Logged in", text: "Welcome back!" });
        router.push("/dashboard");
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Unexpected error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-bg">
      <div className="card auth-card">
        <h2 className="title">Welcome Back</h2>

        <Formik initialValues={{ email: "", password: "" }} validationSchema={LoginSchema} onSubmit={handleLogin}>
          {({ isSubmitting }) => (
            <Form className="form">
              <label className="label">Email</label>
              <Field name="email" type="email" className="input" />
              <div className="error"><ErrorMessage name="email" /></div>

              <label className="label">Password</label>
              <Field name="password" type="password" className="input" />
              <div className="error"><ErrorMessage name="password" /></div>

              <button className="btn primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

              <div style={{ marginTop: 12 }}>
                Don't have an account? <Link href="/signup"><span className="link">Sign up</span></Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
