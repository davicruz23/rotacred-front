import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Providers } from "./redux/provider.tsx";
import "react-datepicker/dist/react-datepicker.css";
import "overlayscrollbars/overlayscrollbars.css";
import "react-toastify/dist/ReactToastify.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/tabler-icons/tabler-icons.min.css";
import "./styles/fontawesome/all.min.css";
import "./styles/fontawesome/sharp-solid.min.css";
import "./styles/fontawesome/sharp-regular.min.css";
import "./styles/tailwind.css";
import "./styles/scss/style.scss";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primeicons/primeicons.css";
import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Providers>
    <App />
    <ToastContainer />
  </Providers>
);
