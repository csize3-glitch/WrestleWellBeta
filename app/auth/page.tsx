"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "athlete" | "coach" | "parent" | "ref";

const AuthPage: React.FC = () => {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("athlete");
  const [gradYear, setGradYear] = useState<string>("2027");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Load existing profile (if any) when page loads
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("wrestlewell_user");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.name) setName(data.name);
      if (data.email) setEmail(data.email);
      if (data.role) setRole(data.role as Role);
      if (data.gradYear) setGradYear(String(data.gradYear));
      if (data.profileImage) setProfileImage(data.profileImage as string);
    } catch (err) {
      console.error("Failed to load existing user", err);
    }
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        // Store as base64 data URL (can be large!)
        setProfileImage(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (typeof window === "undefined") return;

    if (mode === "login") {
      // -------- LOGIN FLOW --------
      const raw = window.localStorage.getItem("wrestlewell_user");
      if (!raw) {
        window.alert(
          "No WrestleWell profile is saved on this device yet. Switch to 'Create account' first."
        );
        return;
      }

      if (!email.trim()) {
        window.alert("Please enter your email to log in.");
        return;
      }

      try {
        const saved = JSON.parse(raw);
        const savedEmail = (saved.email || "").toLowerCase().trim();
        const inputEmail = email.toLowerCase().trim();

        if (savedEmail && savedEmail === inputEmail) {
          const updated = {
            ...saved,
            lastLogin: new Date().toISOString(),
          };
          try {
            window.localStorage.setItem(
              "wrestlewell_user",
              JSON.stringify(updated)
            );
          } catch (err) {
            console.error("Failed to update lastLogin:", err);
          }
          router.push("/");
        } else {
          window.alert(
            "That email doesn't match the profile saved on this device. Try another email or switch to 'Create account'."
          );
        }
      } catch (err) {
        console.error("Failed to parse saved user on login:", err);
        window.alert(
          "Something went wrong reading your saved profile. Try creating a new account."
        );
      }

      return;
    }

    // -------- REGISTER FLOW --------
    const user = {
      name: name.trim() || "Athlete",
      email: email.trim() || "",
      role,
      gradYear: role === "athlete" ? gradYear.trim() : null,
      profileImage, // base64 string or null
      lastLogin: new Date().toISOString(),
    };

    try {
      // Try to save full user (including image)
      window.localStorage.setItem("wrestlewell_user", JSON.stringify(user));
    } catch (err) {
      console.error("Failed to save user with image, falling back:", err);
      // If quota exceeded (usually because of image size), save without image
      const { profileImage: _ignored, ...userWithoutImage } = user;
      try {
        window.localStorage.setItem(
          "wrestlewell_user",
          JSON.stringify(userWithoutImage)
        );
        window.alert(
          "Your profile was saved, but the picture was too large for this device's storage. Try a smaller image if you want a photo."
        );
      } catch (err2) {
        console.error("Failed to save user even without image:", err2);
        window.alert(
          "We couldn't save your profile on this device. You can still use the app, but your details may not persist."
        );
      }
    }

    router.push("/");
  }

  const title =
    mode === "register"
      ? "Create your WrestleWell profile"
      : "Log in to WrestleWell";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-6 md:px-8 md:py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-50">
              Wrestle<span className="text-amber-400">Well</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Powered by WrestleIQ quizzes
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-amber-300"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="flex gap-2 mb-4 text-xs">
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-full border ${
              mode === "register"
                ? "border-amber-400 bg-amber-400/10 text-amber-200"
                : "border-slate-700 text-slate-300 hover:bg-slate-800/70"
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-full border ${
              mode === "login"
                ? "border-amber-400 bg-amber-400/10 text-amber-200"
                : "border-slate-700 text-slate-300 hover:bg-slate-800/70"
            }`}
          >
            Log in (this device)
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-1">{title}</h2>
        <p className="text-xs text-slate-400 mb-4">
          For now, this works only on this device using local storage. Later
          we&apos;ll add secure accounts so you can sync across devices and invite
          coaches / parents.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Profile picture (useful mainly in register mode) */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold overflow-hidden border border-slate-700">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{(name || "A").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Profile picture (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-slate-300"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                For now this is stored only on this device. Large images might
                not fit.
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Martinez"
              className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Email {mode === "login" ? "" : "(optional for now)"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
            />
            {mode === "login" && (
              <p className="mt-1 text-[11px] text-slate-500">
                We use this to match the profile saved on this device.
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              I am a…
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["athlete", "coach", "parent", "ref"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-2 rounded-xl border text-xs ${
                    role === r
                      ? "border-amber-400 bg-amber-400/10 text-amber-200"
                      : "border-slate-700 text-slate-200 hover:bg-slate-800/70"
                  }`}
                >
                  {r === "athlete" && "Athlete"}
                  {r === "coach" && "Coach"}
                  {r === "parent" && "Parent / Guardian"}
                  {r === "ref" && "Referee / Official"}
                </button>
              ))}
            </div>
          </div>

          {/* Grad year for athletes (mainly register mode, but we leave it visible) */}
          {role === "athlete" && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Grad year
              </label>
              <input
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                placeholder="2027"
                className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Used to personalize your recruiting tools.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition w-full mt-2"
          >
            {mode === "register" ? "Save and go to dashboard" : "Log in"}
          </button>
        </form>

        <div className="mt-4 text-[11px] text-slate-500">
          In the full version, this will become a secure login system with
          passwords or single-sign-on. Right now it’s just to personalize your
          WrestleWell experience on this device and track your daily logins.
        </div>
      </div>
    </div>
  );
};

export default AuthPage;