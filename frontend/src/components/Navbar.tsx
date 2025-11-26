import { IoLogInOutline } from "react-icons/io5";
import { CiCirclePlus } from "react-icons/ci";
import Link from "next/link";


export default function Navbar() {
    return (
        <nav className="bg-white w-full">
            <div className="flex justify-between max-w-6xl p-5 items-center mx-auto">
                <div className="text-black font-bold text-2xl">
                    <span className="text-shadow-md inline-block">
                        Evoria
                    </span>
                </div>
                <div className="flex flex-row gap-6 items-center text-sm">
                    <Link 
                    href={'/create-event'}
                    className="flex items-center gap-1 hover:text-blue-700 hover:border-blue-500">
                        <CiCirclePlus size={18}/>
                        Create Event
                    </Link>
                    <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-3xl hover:bg-gray-800 transition text-sm font-semibold cursor-pointer hover:shadow-xl">
                        <IoLogInOutline size={18} />
                        <Link href={'/login'}>
                            Login / Register
                        </Link>
                    </button>

                </div>
            </div>
        </nav>
    )
}
