import React, { Suspense } from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "jotai"

import App from "./App.tsx"

import "./index.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider>
      <Suspense fallback={<div>loading</div>}>
        <App />
      </Suspense>
    </Provider>
  </React.StrictMode>
)
