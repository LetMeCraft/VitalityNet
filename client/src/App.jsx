import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StarCursor from "./components/StarCursor";
import Helmet from "react-helmet";
import Home from "./pages/Home";
import Prediction from "./pages/Prediction";
import DataInfo from "./pages/DataInfo";
import Visualization from "./pages/Visualization";
import ContactUs from "./pages/contact";
import FAQ from "./pages/FAQ";
import AuthPage from "./pages/Auth";
import ProfilePage from "./pages/Profile";

const App = () => {
  return (
    <>
      <Helmet>
        <script src="https://cdn.botpress.cloud/webchat/v2/inject.js"></script>
        <script src="https://mediafiles.botpress.cloud/308f960c-95e7-4cc1-aa6a-f1c653965b80/webchat/v2/config.js"></script>
      </Helmet>
      <Router>
        <StarCursor />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/data-info" element={<DataInfo />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="/visualization" element={<Visualization />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/FAQ" element={<FAQ />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </>
  );
};

export default App;
