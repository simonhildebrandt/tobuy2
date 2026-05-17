import { useEffect } from "react";
import { Provider } from "./components/ui/provider";
import { ColorModeProvider } from "./components/ui/color-mode";
import { RepoContext } from "@automerge/react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router";

import { repo } from "./repo";
import Lists from "./lists";
import { List } from "./list";
import { getLastList } from "./state";

function LastRouteRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const lastList = getLastList();

    if (lastList) {
      navigate(`/list/${lastList}`);
    } else {
      navigate("/");
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <Provider>
      <ColorModeProvider>
        <RepoContext.Provider value={repo}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Lists />} />
              <Route path="/list/:id" element={<List />} />
              <Route path="/last-list" element={<LastRouteRedirect />} />
            </Routes>
          </BrowserRouter>
        </RepoContext.Provider>
      </ColorModeProvider>
    </Provider>
  );
}
