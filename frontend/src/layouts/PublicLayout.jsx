import { Outlet } from "react-router-dom";
import HrNavbar from "../components/layout/HrNavbar";
import StudentNavbar from "../components/layout/StudentNavbar";


// App layout for logged-in pages — no marketing footer inside the workspace.
const PublicLayout = () => {
  const role = localStorage.getItem("role");

  return (
    <div>
      {role === "hr" ? <HrNavbar /> : <StudentNavbar />}
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}


export default PublicLayout;