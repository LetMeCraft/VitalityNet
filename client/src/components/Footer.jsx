import { Link } from 'react-router-dom';
import logo from "../assets/vitalitynet-logo.svg";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-start items-start px-4 md:px-15 lg:px-100 space-y-8 md:space-y-0">
        <div className="w-full md:w-2/3 space-x-4 flex flex-col md:flex-row items-start md:items-center mb-8 md:mb-0">
          <Link to="/" className="cursor-pointer">
            <img
              src={logo}
              alt="VitalityNet Logo"
              className="w-16 h-16 md:w-20 md:h-20 mr-4 drop-shadow-[0_10px_24px_rgba(129,140,248,0.28)]"
            />
          </Link>
          <div>
            <Link to="/" className="text-2xl font-semibold mb-2 hover:text-gray-400 transition-colors duration-300">
              VitalityNet
            </Link>
            <p className="text-gray-400 text-lg mb-4">This website provides a platform for users to predict their likelihood of developing diabetes based on various factors..</p>
          </div>
        </div>

        <div className="w-full md:w-1/3 mb-8 md:mb-0">
          <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2 text-lg">
            <li><Link to="/" className="text-white hover:text-gray-400 transition-colors duration-300">Home</Link></li>
            <li><Link to="/FAQ" className="text-white hover:text-gray-400 transition-colors duration-300">FAQ</Link></li>
            <li><Link to="/prediction" className="text-white hover:text-gray-400 transition-colors duration-300">Prediction</Link></li>
            <li><Link to="/contact" className="text-white hover:text-gray-400 transition-colors duration-300">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center px-6 md:px-12 lg:px-20">
        <div className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
          <p>&copy; 2024 VitalityNet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
