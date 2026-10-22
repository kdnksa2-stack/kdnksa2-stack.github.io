# Turn BeamCast into a free app that updates itself

## How it works
The app is a small shell (the files in the `app` folder) that you host for free on GitHub Pages.
Each time someone opens the app, it downloads the newest BeamCast page from **your Google Apps Script**.
When you change the script and deploy a new version, every installed app shows **"A new version of BeamCast is ready → Update"**.
The app keeps a copy, so it also opens without internet.

Bonus: the app is not inside Google's frame, so screen sharing, fullscreen and the floating view work there even if the Google page blocks them.

---

## Part 1: Get your Apps Script link (once)
1. In the Apps Script editor, click **Deploy → Manage deployments**.
2. Make sure **Who has access** is **Anyone**. The app can't connect otherwise.
3. Copy the **Web app URL**. It ends with `/exec`.

## Part 2: Put the app online for free (GitHub Pages)
1. Create a free account at **github.com**.
2. Click **+ → New repository**. Name it exactly **`YOUR-USERNAME.github.io`** (your GitHub username). Choose **Public** and click **Create**.
   *This exact name puts the app at `https://YOUR-USERNAME.github.io/`, which Part 4 needs.*
3. Open `app\index.html` in Notepad and find this line:
   `var EXEC_URL = 'PASTE_YOUR_EXEC_URL_HERE';`
   Replace `PASTE_YOUR_EXEC_URL_HERE` with your `/exec` link (keep the quotes) and save.
4. In the repository, click **Add file → Upload files** and drag in **all 6 files** from the `app` folder:
   `index.html`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`.
   Click **Commit changes**.
5. Go to **Settings → Pages**. Under **Branch**, choose **main** and **/ (root)**, then **Save**.
6. Wait 1–2 minutes, then open `https://YOUR-USERNAME.github.io/`. BeamCast should appear.

## Part 3: Install it (free, every device)
| Device | How to install |
|---|---|
| **Android** (Samsung, Xiaomi, Honor, Pixel, …) | Open the link in **Chrome** › menu **⋮** › **Install app** / **Add to Home screen** |
| **iPhone / iPad** | Open the link in **Safari** › **Share** › **Add to Home Screen** |
| **Windows / Mac / Chromebook** | Open in **Chrome or Edge** › click the **install icon** in the address bar |

Optional: show a **"Get the app"** button on your Apps Script site.
In Apps Script › **Project Settings** › **Script Properties**, add `APP_URL` = `https://YOUR-USERNAME.github.io/`.

## Part 4 (optional): A real Android app file (APK) for free
1. Go to **pwabuilder.com**, paste `https://YOUR-USERNAME.github.io/` and click **Start**.
2. Click **Package for stores → Android → Generate**. Download the zip.
3. Inside the zip:
   - The **`.apk`** file installs directly on Android phones. Send it to the phone and open it; Android will ask you to allow installing from that source.
   - **`assetlinks.json`**: in your repository, create a folder **`.well-known`** and upload this file into it. Also upload an empty file named **`.nojekyll`** to the main folder. This hides the browser address bar inside the app.
   - **Keep the signing key files safe.** You need them to publish updates of the APK.
4. You **don't** need a new APK when you update BeamCast. It loads the newest version from Apps Script by itself.

**Costs to know:** GitHub Pages, installing from the browser, and the APK are **free**.
Publishing to the **Google Play Store** costs a one-time $25 developer fee. The **Apple App Store** costs $99 per year, so on iPhone use "Add to Home Screen" instead (free).

---

## Updating later
- **Changed `Code.gs` or `Index.html`?** In Apps Script: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.
  Don't create a *new deployment*, because that changes the `/exec` link. Apps update the next time they open.
- **Changed a file in the `app` folder?** Upload it to GitHub again. Rarely needed.

## Troubleshooting
- **"Could not reach the BeamCast server"**: the `/exec` link in `index.html` is wrong, or the deployment isn't set to **Anyone**.
- **"Setup needed"**: you didn't paste the `/exec` link into `index.html`.
- **No update appears**: you created a new deployment instead of editing the existing one, or the app hasn't been reopened yet.
