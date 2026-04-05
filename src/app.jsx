import { Provider } from "./components/ui/provider";
import { ColorModeProvider } from "./components/ui/color-mode";
import { RepoContext } from "@automerge/react";
import { BrowserRouter, Routes, Route } from "react-router";

import { repo } from "./repo";
import Lists from "./lists";
import { List } from "./List";

export default function App() {
  return (
    <Provider>
      <ColorModeProvider>
        <RepoContext.Provider value={repo}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Lists />} />
              <Route path="/list/:id" element={<List />} />
            </Routes>
          </BrowserRouter>
        </RepoContext.Provider>
      </ColorModeProvider>
    </Provider>
  );
}
