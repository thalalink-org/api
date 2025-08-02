# 🩸 BloodBridge WhatsApp Bot

A serverless WhatsApp bot that connects blood donors with patients in need, built with Node.js and hosted on Vercel.

The bot allows users to register as donors with their blood type and location. When a patient makes a request, the bot automatically finds and notifies compatible donors in the database.

---

### Core Features

-   **✅ Donor Registration:** Users can easily register their details via WhatsApp.
-   **🩸 Blood Requests:** Patients can request a specific blood type, marking it as urgent if needed.
-   **🤖 Automated Matching:** Instantly finds compatible donors based on standard blood type compatibility rules.
-   **🔔 Donor Notifications:** Automatically sends out alerts to up to 3 matching donors.
-   **💬 Interactive Responses:** Guides users with clear commands and feedback.

### Architecture

The bot uses a simple, robust, and scalable serverless architecture.

`User (WhatsApp)  ->  Twilio API  ->  Vercel Serverless Function  ->  Supabase DB`

---

## 🚀 Getting Started

Follow these instructions to set up, run, and deploy your own instance of the BloodBridge bot.

### 1. Prerequisites

Before you begin, you will need free accounts for the following services:
-   [**Vercel**](https://vercel.com/signup): For hosting the bot's backend logic.
-   [**Supabase**](https://supabase.com/sign-up): For the PostgreSQL database.
-   [**Twilio**](https://www.twilio.com/try-twilio): For the WhatsApp messaging API.

### 2. Database Setup

1.  **Create a Supabase Project:**
    -   Go to your Supabase dashboard and click "New project".
    -   Give it a name (e.g., `bloodbridge-db`) and a secure database password.
    -   Wait for the project to be created.

2.  **Run the Database Migration:**
    -   Once your project is ready, navigate to the **SQL Editor** in the left-hand menu.
    -   Click **"New query"**.
    -   Open the file `/api/migrations/supabase/create_tables.sql` in this repository.
    -   Copy the entire contents of the SQL file and paste it into the Supabase SQL Editor.
    -   Click **"RUN"**. This will create the `donors`, `patients`, and `matches` tables your bot needs.

### 3. Local Development Setup

Follow these steps to run the bot on your local machine for testing.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/ThalaLink-org.git
    cd ThalaLink-org
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    -   Create a new file in the root of your project named `.env.local`.
    -   Copy the content below into this file and fill in the values for each variable.

    ```dotenv
    # 🔑 Get these from your Supabase Project -> Settings -> API
    SUPABASE_URL=https://your-project-ref.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=your-super-long-service-role-key

    # 🔑 Get these from your Twilio Console Dashboard
    TWILIO_ACCOUNT_SID=your_twilio_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token

    # 🔑 This is your Twilio Sandbox Number
    TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

    # 💻 This is for local development only
    VERCEL_URL=http://localhost:3000
    ```

4.  **Run the Development Server:**
    ```bash
    vercel dev
    ```
    Your bot is now running locally on `http://localhost:3000`.

5.  **Connect Twilio to Your Local Server:**
    -   Twilio needs a public URL to send messages to. We'll use `ngrok` to create a secure tunnel to your local server.
    -   Open a **new, separate terminal window**.
    -   Run the following command:
        ```bash
        npx ngrok http 3000
        ```
    -   `ngrok` will give you a public "Forwarding" URL (e.g., `https://random-string.ngrok.io`).
    -   Go to your **Twilio Console → Messaging → Try it out → WhatsApp Sandox Settings**.
    -   In the **"When a message comes in"** box, paste your `ngrok` Forwarding URL and add `/api/webhook` to the end.
    -   The final URL should look like: `https://random-string.ngrok.io/api/webhook`
    -   Set the method to **HTTP POST** and click **Save**.

You can now send commands to your Twilio number on WhatsApp and test your bot's functionality locally!

### 4. Deploying to Production

1.  **Commit and Push to Git:**
    Make sure all your latest code is pushed to your GitHub repository.

2.  **Add Secrets to Vercel:**
    -   Go to your Vercel dashboard and import your project from GitHub.
    -   In your Vercel project's settings, go to the **Environment Variables** section.
    -   Add all the secrets from your `.env.local` file (**except for `VERCEL_URL`**, Vercel adds this automatically). Add them one by one.

3.  **Deploy:**
    Trigger a deployment from the Vercel dashboard or by running the following command from your terminal:
    ```bash
    vercel --prod
    ```

4.  **Final Twilio Configuration:**
    -   Your Vercel deployment will give you a final production URL (e.g., `https://thala-link-org.vercel.app`).
    -   Go back to your **Twilio WhatsApp Sandbox Settings**.
    -   Replace the `ngrok` URL with your production URL, ensuring `/api/webhook` is at the end:
        `https://thala-link-org.vercel.app/api/webhook`
    -   Save the changes.

Your bot is now live and fully operational!

---

## 💬 Bot Commands

Interact with the bot on WhatsApp using the following commands.

| Command             | Description                  | Example                               |
| ------------------- | ---------------------------- | ------------------------------------- |
| `JOIN <name> <bt> <loc>` | Register as a new donor      | `JOIN John Doe A+ Mumbai`             |
| `NEED <bt> [URGENT]`     | Request blood for a patient  | `NEED O- URGENT` or `NEED B+`         |
| `HELP`              | Show the list of all commands | `HELP`                                |

## Compatibility Rules

The bot uses standard blood type compatibility for matching.

-   **O-**: Can donate to all types.
-   **O+**: Can donate to `A+`, `B+`, `AB+`, `O+`.
-   **A-**: Can donate to `A+`, `A-`, `AB+`, `AB-`.
-   **A+**: Can donate to `A+`, `AB+`.
-   **B-**: Can donate to `B+`, `B-`, `AB+`, `AB-`.
-   **B+**: Can donate to `B+`, `AB+`.
-   **AB-**: Can donate to `AB+`, `AB-`.
-   **AB+**: Can only donate to `AB+`.