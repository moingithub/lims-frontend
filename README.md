
  # Laboratory Information Management System

  This is a code bundle for Laboratory Information Management System. The original project is available at https://www.figma.com/design/p1WB3n1UBqPeq5Aq1DOUS0/Laboratory-Information-Management-System.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Production API URL

  - **Dev:** `npm run dev` uses `/api` and the proxy in `vite.config.mts`.
  - **Build:** set `VITE_API_BASE_URL` in `.env.production` (e.g. `http://your-server:5000/api`), then run `npm run build` and deploy the `build/` folder.
  - The Vite proxy does **not** apply to static hosting on port 8088; the built app must call the backend URL directly or use a reverse proxy for `/api`.
  