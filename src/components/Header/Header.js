"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const LiGroup = ({ isOpen, setIsOpen, isChange }) => (
  <li
    className="relative group"
    onMouseEnter={() => setIsOpen(true)}
    onMouseLeave={() => setIsOpen(false)}
  >
    {/* Gatilho: No desktop é Hover, no Mobile pode ser Clique */}
    <button
      className={`${isChange ? "text-[var(--logo2)]" : "text-white"} flex items-center gap-1 hover:text-[var(--logo1)] transition-colors py-2`}
      onClick={() => setIsOpen(!isOpen)}
    >
      Produtos
      <svg
        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <div
      className={`
        absolute left-[-10px] w-48 pt-2
        ${isOpen ? "block" : "hidden"} 
        md:group-hover:block
        shadow-md
      `}
    >
      <ul className="bg-[var(--background)] border border-gray-100 rounded-lg shadow-xl overflow-hidden">
        <li>
          <Link
            href="#Velas"
            className="block px-4 py-3 text-sm text-[var(--logo2)]  hover:text-black"
          >
            Velas
          </Link>
        </li>
        <li>
          <Link
            href="#Sabonetes"
            className="block px-4 py-3 text-sm text-[var(--logo2)]  hover:text-black"
          >
            Sabonetes
          </Link>
        </li>
        <li>
          <Link
            href="#Incenso"
            className="block px-4 py-3 text-sm text-[var(--logo2)]  hover:text-black"
          >
            Incenso
          </Link>
        </li>
      </ul>
    </div>
  </li>
);

export const Header = ({disable = false}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [isChange, setIsChange] = useState(disable);

  useEffect(() => {
    const handleScroll = () => {
      if(window.scrollY > 602){
        setIsChange(true)
      } else {
        setIsChange(false)
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 z-50 w-full text-xs md:text-base absolute ${isChange ? "bg-[var(--background)] shadow-md" : "bg-gradient-to-b from-black/70 to-black/0"} transition-all`}>
      <nav className="container mx-auto flex items-center justify-center w-full ">
        <ul className="flex items-center space-x-6 fade">
          <li>
            <Link
              href="/"
              className={`${isChange ? "text-[var(--logo2)]" : "text-white"} hover:text-[var(--logo1)] transition-all fadeDown`}
            >
              Inicio
            </Link>
          </li>
          <LiGroup isOpen={isOpen} isChange={isChange} setIsOpen={setIsOpen} />
          <li>
            <Link href="/">
              <Image
                src="/logo.jpg"
                alt="logo"
                width={40}
                height={20}
                priority
                className="w-full md:h-auto object-cover rounded-sm my-2"
              />
            </Link>
          </li>
          <li>
            
            <Link
              href="https://www.instagram.com/decor.artearomas"
              className={`${isChange ? "text-[var(--logo2)]" : "text-white"} hover:text-[var(--logo1)] transition-all`}
            >
              Instagram
            </Link>
          </li>
          <li>
            <Link
              href="/contato"
              className={`${isChange ? "text-[var(--logo2)]" : "text-white"} hover:text-[var(--logo1)] transition-all`}
            >
              Contato
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
