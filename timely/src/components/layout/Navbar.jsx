import { useEffect, useRef, useState } from "react";

import { ChevronDown, LogOut, Mail, User } from "lucide-react";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const profileRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        return;
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }

    // Fallback for individually stored login values
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (username) {
      setCurrentUser({
        username,
        email,
        role,
      });
    }
  }, []);

  // CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.clear();

    window.location.href = "/";
  };

  const username = currentUser?.username || "User";

  const email = currentUser?.email || "";

  const role = currentUser?.role || "";

  const profileInitial = username.charAt(0).toUpperCase();

  return (
    <header className="relative z-40 flex items-center justify-between h-16 px-4 border-b sm:px-6 border-[#2b3340] bg-[#0d1015] text-[#e5e7eb]">
      {/* LEFT */}

      <div>
        <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-[#e5e7eb]">
          Task Manager
        </h1>
      </div>

      {/* RIGHT */}

      <div ref={profileRef} className="relative">
        {/* PROFILE BUTTON */}

        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          className="
            flex
            items-center
            gap-3
            rounded-lg
            px-2
            py-1.5
            transition-colors
            hover:bg-white/5
          "
          aria-label="Open profile menu"
        >
          {/* USER DETAILS */}

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-[#e5e7eb]">{username}</p>

            <p className="text-xs text-[#aeb9c9]">
              {role === "admin"
                ? "Administrator"
                : role === "employee"
                  ? "Employee"
                  : "User"}
            </p>
          </div>

          {/* PROFILE AVATAR */}

          <div className="flex items-center justify-center text-sm font-semibold text-[#1f2937] bg-[#f7aa5b] rounded-full h-9 w-9 shrink-0">
            {profileInitial}
          </div>

          {/* ARROW */}

          <ChevronDown
            className={`hidden h-4 w-4 text-[#aeb9c9] transition-transform sm:block ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* PROFILE DROPDOWN */}

        {profileOpen && (
          <div
            className="
              absolute
              right-0
              top-full
              z-50
              mt-2
              w-72
              overflow-hidden
              rounded-xl
              border
              border-[#2b3340]
              bg-[#161b22]
              shadow-2xl
            "
          >
            {/* USER INFORMATION */}

            <div className="p-4 border-b border-[#2b3340]">
              <div className="flex items-center gap-3">
                {/* AVATAR */}

                <div className="flex items-center justify-center text-base font-semibold text-[#1f2937] bg-[#f7aa5b] rounded-full h-11 w-11 shrink-0">
                  {profileInitial}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#e5e7eb]">
                    {username}
                  </p>

                  <p className="mt-0.5 text-xs capitalize text-[#aeb9c9]">
                    {role || "User"}
                  </p>
                </div>
              </div>
            </div>

            {/* EMAIL */}

            {email && (
              <div className="px-4 py-3 border-b border-[#2b3340]">
                <div className="flex items-center gap-2 text-sm text-[#aeb9c9]">
                  <Mail className="w-4 h-4 shrink-0" />

                  <span className="truncate">{email}</span>
                </div>
              </div>
            )}

            {/* LOGOUT */}

            <div className="p-2">
              <button
                type="button"
                onClick={logout}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  text-[#e5e7eb]
                  transition-colors
                  hover:bg-red-500/10
                  hover:text-red-400
                "
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
