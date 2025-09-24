import React from "react";
import {BrowserRouter,Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AlumniRegistrationForm from "./pages/AlumniRegistrationForm";
import UserHome from "./pages/UserHome";
import InstitutionalDashboard from "./pages/InstitutionalDashboard";
import Message from "./pages/Message";
import JobPortal from "./pages/JobPortal";
import AlumniProfile from "./pages/AlumniProfile";
export default function App() {
  return <BrowserRouter>
    <Header/>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/signin" element={<Login/>} />
      <Route path="/alumniform" element={<AlumniRegistrationForm/>} />
      <Route path="/userhome" element={<UserHome/>} />
      <Route path="/clghome" element={<InstitutionalDashboard/>} />
      <Route path="/message" element={<Message/>} />
      <Route path="/refer" element={<Message/>} />
      <Route path="/jobalumni" element={<JobPortal/>} />
       <Route path="/alumniprofile" element={<AlumniProfile/>} />
    </Routes>
  </BrowserRouter>;
}
