// app/signup/page.js (client component)
"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignupSchema = Yup.object().shape({
  fullName: Yup.string().min(3, "Too short").max(100).required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Required"),
});

export default function SignupPage() {
  const router = useRouter();

  async function handleSignup(values, { setSubmitting, resetForm }) {
    try {
      const payload = { fullName: values.fullName, email: values.email, password: values.password };
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Signup failed", text: data.message || "Unable to sign up" });
      } else {
        Swal.fire({ icon: "success", title: "Registered", text: "You can now login" });
        resetForm();
        router.push("/");
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
        <h2 className="title">Create Account</h2>

        <Formik initialValues={{ fullName: "", email: "", password: "", confirmPassword: "" }} validationSchema={SignupSchema} onSubmit={handleSignup}>
          {({ isSubmitting }) => (
            <Form className="form">
              <label className="label">Full Name</label>
              <Field name="fullName" className="input" />
              <div className="error"><ErrorMessage name="fullName" /></div>

              <label className="label">Email</label>
              <Field name="email" type="email" className="input" />
              <div className="error"><ErrorMessage name="email" /></div>

              <label className="label">Password</label>
              <Field name="password" type="password" className="input" />
              <div className="error"><ErrorMessage name="password" /></div>

              <label className="label">Confirm Password</label>
              <Field name="confirmPassword" type="password" className="input" />
              <div className="error"><ErrorMessage name="confirmPassword" /></div>

              <button className="btn primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Sign up"}
              </button>

              <div style={{ marginTop: 12 }}>
                Already have account? <Link href="/"><span className="link">Login</span></Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
