import Link from 'next/link'
import React from 'react'

export default function page() {
  return (
    <div>
      <Link href={"/login"}
      
          className="w-full bg-[#2E4D3B] text-white font-semibold py-3 rounded-lg hover:bg-[#3b6a50] transition-all duration-300 shadow-md"
        >
          Login 
        
          </Link>
          
          <Link href={"/homework"}
      
          className="w-full bg-[#2E4D3B] text-white font-semibold py-3 rounded-lg hover:bg-[#3b6a50] transition-all duration-300 shadow-md"
        >
          Homework
        
          </Link>
        
    </div>
  )
}
