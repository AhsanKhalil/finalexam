"use client";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // Eye icons

const SignupSchema = Yup.object().shape({
  fullName: Yup.string().min(3, "Too short").max(100).required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Required"),
});

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="page-bg min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card auth-card bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Create Account</h2>

        <Formik
          initialValues={{ fullName: "", email: "", password: "", confirmPassword: "" }}
          validationSchema={SignupSchema}
          onSubmit={handleSignup}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Full Name</label>
                <Field name="fullName" className="input w-full border border-gray-300 rounded-lg px-3 py-2" />
                <div className="text-red-500 text-sm mt-1"><ErrorMessage name="fullName" /></div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <Field name="email" type="email" className="input w-full border border-gray-300 rounded-lg px-3 py-2" />
                <div className="text-red-500 text-sm mt-1"><ErrorMessage name="email" /></div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="block mb-1 font-medium text-gray-700">Password</label>
                <Field
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="input w-full border border-gray-300 rounded-lg px-3 py-2 pr-10"
                />
                <div
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                <div className="text-red-500 text-sm mt-1"><ErrorMessage name="password" /></div>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
                <Field
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="input w-full border border-gray-300 rounded-lg px-3 py-2 pr-10"
                />
                <div
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                <div className="text-red-500 text-sm mt-1"><ErrorMessage name="confirmPassword" /></div>
              </div>

              <button className="btn primary bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mt-2" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Sign up"}
              </button>

              <div className="text-center text-gray-600 mt-4">
                Already have account? <Link href="/"><span className="text-blue-600 hover:underline">Login</span></Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
