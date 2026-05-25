
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router";




const CommonLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="grow-1"> <Outlet /></div>
            <Footer />
        </div>
    );
};

export default CommonLayout;
