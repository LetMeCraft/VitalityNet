import { Link } from 'react-router-dom';
import logo from "../assets/vitalitynet-logo.svg";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-8 pb-3">
      <div className="w-full flex flex-col md:flex-row md:justify-between items-start px-5 md:px-12 lg:px-16 gap-8">
        <div className="w-full md:max-w-4xl flex flex-col md:flex-row items-start md:items-center gap-4">
          <Link to="/" className="cursor-pointer">
            <img
              src={logo}
              alt="VitalityNet Logo"
              className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_10px_24px_rgba(129,140,248,0.28)]"
            />
          </Link>
          <div>
            <Link to="/" className="text-2xl font-semibold mb-2 hover:text-gray-400 transition-colors duration-300">
              VitalityNet
            </Link>
            <p className="text-gray-400 text-lg mb-4">This website provides a platform for users to predict their likelihood of developing diabetes based on various factors..</p>
          </div>
        </div>

        <div className="w-full md:w-auto md:min-w-[13rem]">
          <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2 text-lg">
            <li><Link to="/" className="text-white hover:text-gray-400 transition-colors duration-300">Home</Link></li>
            <li><Link to="/FAQ" className="text-white hover:text-gray-400 transition-colors duration-300">FAQ</Link></li>
            <li><Link to="/prediction" className="text-white hover:text-gray-400 transition-colors duration-300">Prediction</Link></li>
            <li><Link to="/contact" className="text-white hover:text-gray-400 transition-colors duration-300">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-4 pt-3 px-5 md:px-12 lg:px-16">
        <div className="text-gray-400 text-left">
          <p>&copy; 2024 VitalityNet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
