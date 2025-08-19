import React from 'react'

const Navbar = () => {
    return (
        <>
            <nav className="relative bg-gray-800/50 after:pointer-events-none after:absolute border-amber-300 border-4 rounded-2xl after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                    <div className="relative flex h-16 items-center justify-between">
                        
                        <div className="flex flex-1 items-center justify-center rounded-2xl sm:items-stretch sm:justify-start">
                           
                            <div className="hidden sm:ml-6 sm:block ">
                                <div className="flex space-x-4">
                                    <a href="/counter" aria-current="page" className="rounded-md bg-gray-950/50 px-3 py-2 text-sm font-medium text-white">Counter Application</a>
                                    <a href="/challenge_tracker" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">Challange Tracker Application</a>

                                </div>
                            </div>
                        </div>
                       
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar