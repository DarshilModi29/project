import { useRoutes } from "react-router-dom";
import UserRoutes from "./routes/Router";
import AdminRouter from "./admin/routes/Router";
import Cookies from "js-cookie";

function App() {
  const role = Cookies.get("role");
  const admin = role && (role === "admin" || role === "sub-admin") ? true : false;
  const routes = admin ? AdminRouter : UserRoutes;
  const routing = useRoutes(routes);

  return (
    <div className="dark">
      {routing}
    </div>
  );
}

export default App;
