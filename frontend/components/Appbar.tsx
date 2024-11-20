"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./connect-wallet";
import { useAccount } from "wagmi";
import { Menu, X } from "lucide-react";

export function Appbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { label: "Explore", href: "/explore", requireConnection: false },
    { label: "Request", href: "/request", requireConnection: false },
    {
      label: "Dashboard",
      href: `/account/${address}`,
      requireConnection: true,
    },
  ];

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return `
      relative pb-1 
      transition-colors duration-300
      after:absolute after:bottom-0 after:left-0 after:w-full 
      after:h-[2px] after:bg-blue-600 
      ${isActive ? "after:scale-x-100" : "after:scale-x-0"}
      hover:after:scale-x-100
      after:transition-transform after:duration-300
    `;
  };

  return (
    <header
      className="flex justify-between items-center align-baseline px-4 sm:px-8 shadow-lg 
     dark:bg-gray-900 border-b mb-4 p-2 dark:border-slate-800"
    >
      <Link href={"/"} className="font-bold text-2xl">
        PeerFund
      </Link>

      <button
        className="sm:hidden z-50 relative"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="hidden sm:flex items-center justify-center gap-12 text-sm">
        {navigationItems.map(
          (item) =>
            (!item.requireConnection || isConnected) && (
              <Link
                key={item.href}
                href={item.href}
                className={getLinkClasses(item.href)}
              >
                {item.label}
              </Link>
            )
        )}
        <WalletButton />
      </div>

      <div
        className={`
          fixed inset-0 bg-white dark:bg-gray-900 z-40 
          flex flex-col items-center justify-center
          transition-all duration-300 ease-in-out
          ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
          sm:hidden
        `}
      >
        <nav className="flex flex-col items-center space-y-8 p-8">
          {navigationItems.map(
            (item) =>
              (!item.requireConnection || isConnected) && (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-2xl ${getLinkClasses(item.href)}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
          )}
          <div className="mt-8">
            <WalletButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
 
