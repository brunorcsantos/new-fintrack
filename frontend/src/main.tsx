/**
 * src/main.tsx
 *
 * Ponto de entrada da aplicação React.
 * BrowserRouter fica aqui para que os testes possam envolver o App
 * com um MemoryRouter customizado.
 *
 * Hierarquia de providers (de fora para dentro):
 *   BrowserRouter → ThemeProvider → AuthProvider → Routes
 *
 * ThemeProvider não depende de router.
 * AuthProvider depende de useNavigate → precisa estar dentro do BrowserRouter.
 * Ambos ficam no App.tsx para manter o main.tsx limpo.
 */

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { App } from "./App"
import "./styles/globals.css"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Elemento #root não encontrado no DOM. Verifique o index.html.")
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
