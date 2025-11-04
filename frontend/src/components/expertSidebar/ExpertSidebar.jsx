import React from "react";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import AddIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LogoutIcon from "@mui/icons-material/ExitToAppOutlined";
import "./ExpertSidebar.scss";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/logo.png';
import newRequest from "../../utils/newRequest";

const ExpertSidebar = ({ setUserRole, activeSection, setActiveSection }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await newRequest.post("/api/auth/signout");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
      setUserRole(null);
      navigate('/');
    } catch (err) {
      console.error("Error logging out", err);
    }
  };

  return (
    <div className="sidebar">
      <div className="top">
        <img src={logo} width={30} height={30} alt="Logo" />
        <span className="logo">AgriConnect</span>
      </div>
      <hr />
      <div className="bottom">
        <div className="card-container">
          <div 
            className={`card ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <DashboardIcon className="icon" />
            <span>Dashboard</span>
          </div>
          <div 
            className={`card ${activeSection === 'addCrop' ? 'active' : ''}`}
            onClick={() => setActiveSection('addCrop')}
          >
            <AddIcon className="icon" />
            <span>Add Crop</span>
          </div>
          <div 
            className={`card ${activeSection === 'updateCrop' ? 'active' : ''}`}
            onClick={() => setActiveSection('updateCrop')}
          >
            <EditIcon className="icon" />
            <span>Update Crop</span>
          </div>
          <div 
            className={`card ${activeSection === 'deleteCrop' ? 'active' : ''}`}
            onClick={() => setActiveSection('deleteCrop')}
          >
            <DeleteIcon className="icon" />
            <span>Delete Crop</span>
          </div>
        </div>

        <div className="profile-actions">
          <div onClick={handleLogout} className="action">
            <LogoutIcon className="icon" />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertSidebar;
