"use client";
import { useEffect } from "react";
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

  // Auto redirect if user already logged in
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.userId) {
      router.push("/dashboard");
    }
  }, [router]);

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
        // Store user in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: data.user._id,
            name: data.user.fullName,
            email: data.user.email,
          })
        );

        Swal.fire({ icon: "success", title: "Logged in", text: "Welcome back!" }).then(() => {
          router.push("/dashboard");
        });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Unexpected error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-bg min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card auth-card bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Welcome Back</h2>

        <Formik initialValues={{ email: "", password: "" }} validationSchema={LoginSchema} onSubmit={handleLogin}>
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <Field name="email" type="email" className="input w-full border border-gray-300 rounded-lg px-3 py-2" />
                <div className="text-red-500 text-sm mt-1"><ErrorMessage name="email" /></div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Password</label>
                <Field name="password" type="password" className="input w-full border border-gray-300 rounded-lg px-3 py-2" />
                <div className="text-red-500 text-sm mt-1"><ErrorMessage name="password" /></div>
              </div>

              <button className="btn primary bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mt-2" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

              <div className="text-center text-gray-600 mt-4">
                Don't have an account? <Link href="/signup"><span className="text-blue-600 hover:underline">Sign up</span></Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
