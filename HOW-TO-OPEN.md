# How to open the Spending Analyzer app

You don’t need to be a developer. Just follow these steps in order.

## 1. Install Node.js (one-time setup)

1. Open your browser and go to: https://nodejs.org
2. Click the big green **LTS** button to download
3. Open the downloaded file and click **Next** through the installer (keep the defaults)
4. When it’s done, restart your computer (or at least close and reopen any open apps)

This installs a small tool the app needs to run. You only do this once.

## 2. Open the app folder

1. Find the `budget-app` folder on your computer
2. Open that folder so you can see files like `package.json` and `sample-statement.csv`

## 3. Open a terminal in that folder (Windows)

1. In the folder window, click the address bar at the top (where the folder path is shown)
2. Type `cmd` and press **Enter**
3. A black window will open — that’s normal. Leave it open.

## 4. Start the app

In that black window, copy and paste this, then press **Enter**:

```text
npm install
```

Wait until it finishes (it may take a minute the first time).

Then copy and paste this, and press **Enter**:

```text
npm run dev
```

You should see something like:

`Local: http://localhost:5173`

## 5. Open it in your browser

1. Open Chrome, Edge, or any browser
2. Go to: **http://localhost:5173**
3. The app should load

**Important:** Keep the black window open while you use the app. Closing it will stop the app.

## 6. Try it with sample data

1. In the app, go to **Upload**
2. Upload the file `sample-statement.csv` from the `budget-app` folder
3. Then check **Overview**, **Transactions**, and **Goals**

## To stop the app

Click the black window, then press **Ctrl + C**.  
(If it asks to confirm, type `Y` and press Enter.)

## Next time you want to use it

You only need steps 2–5 again. Skip installing Node.js.

Shortcut:

1. Open the `budget-app` folder
2. Click the address bar → type `cmd` → Enter
3. Paste `npm run dev` → Enter
4. Open **http://localhost:5173**
