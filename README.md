# 🚀 AI Ad Resizer Demo Guide

This guide will walk you through how to run this demo locally and deploy it to Google Cloud Run to showcase its capabilities for personalizing client demos and scaling ad generation.

---

## 💻 📂 1. Running Locally (Development Mode)

Perfect for quick tests and local development.

### Prerequisites
-   Node.js (v18 or higher)
-   Google Cloud SDK (`gcloud`) installed and authenticated.

### Steps
1.  **Clone / Open the Workspace:**
    Ensure you are in the `/Users/girishnair/Desktop/GGN/POC/marketingdemo` directory.

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

4.  **Access the App:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> When running locally, the app will default to `"default-secret-key"` for the `x-api-key` header. Make sure you don't have a mismatch if you've set a custom key in your local `.env`.

---

## ☁️ 🚀 2. Deploying to Google Cloud Run (Production Mode)

Deploy to the cloud to share with clients or use the API programmatically!

### Steps
1.  **Run Deploy Script:**
    Execute the provided automated deployment script:
    ```bash
    ./deploy.sh
    ```

2.  **Follow Prompts:**
    -   **Project ID:** Hit enter to use your default `ggn-non-prod-462303`, or enter a new one.
    -   **Region:** Hit enter to use `us-central1`.
    -   **API Key:** Hit enter to generate a random secure key (e.g., `3e13c8143f7bfa993ab3c05606f0e127`). **Save this key!**

3.  **Access Your Service:**
    Once complete, click the Service URL provided in the output (e.g., `https://iab-resizer-service-xxxxxxxx.a.run.app`).

---

## 🎨 🎯 3. How to Run the Demo (The Use Case)

Here is how to use it to **WOW** a prospect in a meeting:

### Scenario: Personalizing a Demo for a Brand

1.  **Find a Brand Asset:**
    Go to a prospect's website or Twitter profile. Download their header image, a screenshot of their homepage, or a product poster.

2.  **Upload to the App:**
    -   Open the App (Local or Cloud URL).
    -   Click the **Upload Box** and select the image.

3.  **Choose Targets:**
    -   Click **"Select All"** in the "IAB Standard Resolutions" panel.
    -   (Optional) Add a custom resolution like `1200x628` for Facebook Ads.

4.  **Generate:**
    -   Click **Generate Resized Ads**.
    -   Watch the visual progress bars create standard banners out of their single image using Imagen 3 intelligent outpainting!

5.  **Deliver:**
    -   Click **Download All** to grab the ZIP/Batch of images.
    -   Present them to the client to prove "We can run your ads in *any* format, instantly."

---

## 🔌 🛠️ 4. Using the API (For Scaling)

Developers can trigger this programmatically to scale automation.

### Sample Curl Request
```bash
curl -X POST https://YOUR_SERVICE_URL/api/resize \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_SAVED_API_KEY" \
  -d '{
    "image": "BASE64_ENCODED_IMAGE_STRING",
    "mimeType": "image/jpeg",
    "width": 300,
    "height": 250
  }'
```

---

*This tool removes the design bottleneck, letting you scrape a website and pitch personalized ad formats in 60 seconds.*
