"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import SweetAlert from "../../components/SweetAlert";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(isLogin ? "demo@gmail.com" : "");
  const [password, setPassword] = useState(isLogin ? "000000" : "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); //是否正在提交表單
  const router = useRouter();

  const matchErrMes = (err) => {
    if (err.message === "Firebase: Error (auth/invalid-credential).") {
      return "Your email or password might be incorrect.";
    } else if (err.message === "Firebase: Error (auth/email-already-in-use).") {
      return "This email is already in use.";
    } else {
      return err.message
        .replace("Firebase: ", "")
        .replace(/ *\([^)]*\) */g, "");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true); //利用是否正在提交表單狀態避免重複提交表單

    try {
      if (isLogin) {
        //若目前表單是登入表單，執行一般登入
        await signInWithEmailAndPassword(auth, email, password);
        SweetAlert({
          type: "toast",
          title: "Signed in successfully!",
          icon: "success",
        });
        router.push("/folder");
      } else {
        //若不是登入表單，執行註冊
        await createUserWithEmailAndPassword(auth, email, password);
        SweetAlert({
          type: "toast",
          title: "Signed up successfully!",
          icon: "success",
        });
        router.push("/folder");
      }
    } catch (err) {
      const errMessage = matchErrMes(err);
      setError(
        isLogin
          ? `Signed in failed：${errMessage}`
          : `Signed up failed：${errMessage}`
      );
      SweetAlert({
        type: "alert",
        title: isLogin ? "Signed in failed!" : "Signed up failed!",
        icon: "error",
        text: errMessage,
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsSubmitting(true);

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      SweetAlert({
        type: "toast",
        title: "Signed in with Google successfully!",
        icon: "success",
      });
      router.push("/folder");
    } catch (err) {
      const errMessage = matchErrMes(err);
      setError(`Signed in with Google failed：${errMessage}`);
      SweetAlert({
        type: "alert",
        title: "Signed in with Google failed!",
        icon: "error",
        text: errMessage,
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setIsLogin((prev) => {
      setEmail(!prev ? "demo@gmail.com" : "");
      setPassword(!prev ? "000000" : "");
      return !prev;
    });
    setError("");
  };

  return (
    <>
      <section
        className="bg-light/50 h-[calc(100vh-65px)] flex items-center justify-center px-8"
        style={{
          background: "url(/BG-01.jpg) center no-repeat",
        }}
      >
        <div className="flex justify-between items-center gap-8 max-w-6xl mx-auto w-full bg-white/80 shadow-xl rounded-xl px-10 py-20 mb-20">
          <div className="bg-white rounded-lg p-8 pb-6 shadow-2xl text-center w-3/4">
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-secondary text-white p-2 flex justify-center rounded-md text-white hover:bg-primary "
                disabled={isSubmitting}
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </button>

              <button
                onClick={handleGoogleLogin}
                className="w-full bg-secondary text-white p-2 flex justify-center items-center rounded-md text-white hover:bg-primary"
                disabled={isSubmitting}
              >
                Sign in with
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="24"
                  className="ml-2"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                </svg>
              </button>
              <div className="text-sm ">
                {isLogin ? (
                  <>
                    <span className="mr-2">Need an account?</span>
                    <span
                      onClick={toggleForm}
                      className="text-warning cursor-pointer"
                    >
                      Sign Up
                    </span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">Already have an account?</span>
                    <span
                      onClick={toggleForm}
                      className="text-warning cursor-pointer"
                    >
                      Sign In
                    </span>
                  </>
                )}
              </div>
            </form>
          </div>
          <div className="w-full text-secondary font-bold flex flex-col">
            <p className="text-5xl">Join us!</p>
            <p className="text-2xl mt-4">
              Start planting your
              <span className="text-2xl underline decoration-2 ml-1.5">
                Brain Forest.
              </span>
            </p>
            <div className="flex items-end mt-16 font-semibold">
              <p className="text-xl">
                Still considering? Click here to try it.
              </p>
              <button className="rounded-md px-3 py-2 font-bold text-white text-3xl bg-secondary hover:bg-primary ml-4 transition-all duration-100 hover:scale-125">
                <Link href="/workArea">Go</Link>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
