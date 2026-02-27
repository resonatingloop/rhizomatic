import "./storage-polyfill.js";
import { createRoot } from "react-dom/client";
import RhizomeConversations from "./rhizome.jsx";

createRoot(document.getElementById("root")).render(<RhizomeConversations />);
