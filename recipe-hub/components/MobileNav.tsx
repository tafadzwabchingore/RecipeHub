'use client';
import { useState } from 'react';
import { Menu, X, Search, UserCircle, LogIn, LogOut } from 'lucide-react';
import Hamburger from 'hamburger-react';
import Link from 'next/link';

interface MobileNavProps {
    user: any;
    signOut: () => void;
    className?: string;
}

export default function MobileNav({ user, signOut, className }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={className}>
            
            <Hamburger toggled={isOpen} toggle={setIsOpen} />

            {isOpen && (                                                                                             
                  <div                                                                                                 
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"                                    
                      onClick={() => setIsOpen(false)}                                                                 
                  />                                                                                                   
              )}  
            
                <div className={`absolute w-full left-0 flex flex-col justify-between align-self-center bg-white text-2xl p-2 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                
                <div className="flex flex-col gap-2">
                <Link href="/recipes" className="flex items-center gap-2" onClick={() => setIsOpen(false)}> <Search /> Browse
                </Link>

                {user && (
                    <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}> <UserCircle /> Dashboard
                    </Link>
                )}
                </div>
                
                {!user ? (
                    <Link href="/login" className="flex items-center gap-2 mt-4" onClick={() => setIsOpen(false)}> <LogIn /> Login
                    </Link>
                ) : (
                    <form action={signOut}>
                        <button type="submit" className="flex items-center gap-2 mt-4" onClick={() => setIsOpen(false)}>
                            <LogOut /> Logout
                        </button>
                    </form>
                )}
                
                </div>
        </div>
    );
}