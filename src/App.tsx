/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import MainShell from "./components/MainShell";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Toaster position="top-center" />
          <MainShell />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

