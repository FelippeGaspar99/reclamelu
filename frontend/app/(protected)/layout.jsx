"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { getToken, getUser } from "../../lib/api";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    const usr = getUser();
    if (!token || !usr) {
      router.push("/login");
      return;
    }
    setUser(usr);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 lg:px-8 relative">
      <div className="brand-watermark" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto flex gap-6">
        <Sidebar user={user} />
        <main className="flex-1 space-y-4">
          <Header />
          {children}
        </main>
      </div>
    </div>
  );
}
